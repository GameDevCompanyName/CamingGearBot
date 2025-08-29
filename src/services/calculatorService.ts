import { CampingList, Gear, Product, DefaultGear, Unit } from '../types';
import defaultGearData from '../data/defaultGear.json';

// Helper function to ensure type safety for units
function ensureUnit(unit: string): Unit {
    if (unit === "ШТ" || unit === "КГ" || unit === "Л") {
        return unit;
    }
    throw new Error(`Invalid unit: ${unit}`);
}

class CalculatorService {
    private defaultGear: DefaultGear = {
        gear: defaultGearData.gear,
        products: defaultGearData.products.map(p => ({
            ...p,
            item: {
                ...p.item,
                unit: ensureUnit(p.item.unit)
            }
        }))
    };

    calculateFinalList(list: CampingList): { gear: Gear[], products: Product[] } {
        const gear: Gear[] = [];
        const products: Product[] = [];

        // Add base gear and products
        this.addDefaultItems(list.people, gear, products);

        // Add condition-specific items
        this.addConditionItems(list, gear);

        // Add gear from dishes (no duplicates)
        this.addDishGear(list, gear);

        // Add products from dishes (sum quantities)
        this.addDishProducts(list, products);

        return { gear, products };
    }

    private addDefaultItems(people: number, gear: Gear[], products: Product[]): void {
        // Add default gear
        for (const gearItem of this.defaultGear.gear) {
            const qty = gearItem.dependantOnPeople ? gearItem.item.qty * people : gearItem.item.qty;
            gear.push({ ...gearItem.item, qty });
        }

        // Add default products
        for (const productItem of this.defaultGear.products) {
            const qty = productItem.dependantOnPeople ? productItem.item.qty * people : productItem.item.qty;
            products.push({ ...productItem.item, qty });
        }
    }

    private addConditionItems(list: CampingList, gear: Gear[]): void {
        if (list.conditions.rain) {
            gear.push({
                name: "Дождевик",
                qty: list.people,
                emoji: "☔"
            });
            gear.push({
                name: "Тент",
                qty: 1,
                emoji: "⛺"
            });
        }

        if (list.conditions.swimming) {
            gear.push({
                name: "Полотенце",
                qty: list.people,
                emoji: "🧻"
            });
        }

        if (list.conditions.temperature === 'cold' || list.conditions.temperature === 'cool') {
            gear.push({
                name: "Тёплая куртка",
                qty: list.people,
                emoji: "🧥"
            });
        }
    }

    private addDishGear(list: CampingList, gear: Gear[]): void {
        const uniqueGear = new Map<string, Gear>();
        
        for (const dish of list.dishes) {
            for (const dishGear of dish.gear) {
                if (!uniqueGear.has(dishGear.name)) {
                    uniqueGear.set(dishGear.name, { ...dishGear });
                }
            }
        }

        gear.push(...Array.from(uniqueGear.values()));
    }

    private addDishProducts(list: CampingList, products: Product[]): void {
        const productMap = new Map<string, Product>();

        for (const dish of list.dishes) {
            for (const dishProduct of dish.products) {
                const key = `${dishProduct.name}-${dishProduct.unit}`;
                const existingProduct = productMap.get(key);

                if (existingProduct) {
                    existingProduct.qty += dishProduct.qty * list.people;
                } else {
                    productMap.set(key, {
                        ...dishProduct,
                        qty: dishProduct.qty * list.people
                    });
                }
            }
        }

        products.push(...Array.from(productMap.values()));
    }

    formatFinalList(list: CampingList): string {
        const { gear, products } = this.calculateFinalList(list);
        
        let output = `*${list.name}*\n\n`;
        
        output += "*Снаряжение:*\n";
        for (const item of gear) {
            output += `${item.emoji} ${item.name}: ${item.qty} шт.\n`;
        }

        output += "\n*Продукты:*\n";
        for (const item of products) {
            output += `${item.emoji} ${item.name}: ${item.qty} ${item.unit}\n`;
        }

        return output;
    }
}

export const calculatorService = new CalculatorService();
