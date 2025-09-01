import { CampingList, Gear, Product, DefaultGear, Unit, GearSet } from '../types';
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
        baseGear: {
            gear: defaultGearData.baseGear.gear,
            products: defaultGearData.baseGear.products.map(p => ({
                ...p,
                item: {
                    ...p.item,
                    unit: ensureUnit(p.item.unit)
                }
            }))
        },
        conditionalGear: {
            rain: defaultGearData.conditionalGear.rain,
            swimming: defaultGearData.conditionalGear.swimming
        },
        temperatureGear: {
            cold: {
                gear: defaultGearData.temperatureGear.cold.gear,
                products: defaultGearData.temperatureGear.cold.products || []
            },
            cool: {
                gear: defaultGearData.temperatureGear.cool.gear,
                products: defaultGearData.temperatureGear.cool.products || []
            },
            warm: {
                gear: defaultGearData.temperatureGear.warm.gear,
                products: defaultGearData.temperatureGear.warm.products.map(p => ({
                    ...p,
                    item: {
                        ...p.item,
                        unit: ensureUnit(p.item.unit)
                    }
                }))
            },
            hot: {
                gear: defaultGearData.temperatureGear.hot.gear,
                products: defaultGearData.temperatureGear.hot.products.map(p => ({
                    ...p,
                    item: {
                        ...p.item,
                        unit: ensureUnit(p.item.unit)
                    }
                }))
            }
        }
    };

    calculateFinalList(list: CampingList): { gear: Gear[], products: Product[] } {
        const gear: Gear[] = [];
        const products: Product[] = [];

        // Add base gear and products
        this.addItems(this.defaultGear.baseGear, list.people, gear, products);

        // Add condition-specific items
        this.addConditionItems(list, gear, products);

        // Add temperature-specific items
        this.addTemperatureItems(list, gear, products);

        // Add gear from dishes (no duplicates)
        this.addDishGear(list, gear);

        // Add products from dishes (sum quantities)
        this.addDishProducts(list, products);

        return { gear, products };
    }

    private addItems(gearSet: GearSet, people: number, gear: Gear[], products: Product[]): void {
        // Add gear
        for (const gearItem of gearSet.gear) {
            const qty = gearItem.dependantOnPeople ? gearItem.item.qty * people : gearItem.item.qty;
            const existingGear = gear.find(g => g.name === gearItem.item.name);
            
            if (existingGear) {
                existingGear.qty += qty;
            } else {
                gear.push({ ...gearItem.item, qty });
            }
        }

        // Add products
        for (const productItem of gearSet.products) {
            const qty = productItem.dependantOnPeople ? productItem.item.qty * people : productItem.item.qty;
            const existingProduct = products.find(p => 
                p.name === productItem.item.name && 
                p.unit === productItem.item.unit
            );
            
            if (existingProduct) {
                existingProduct.qty += qty;
            } else {
                products.push({ ...productItem.item, qty });
            }
        }
    }

    private addConditionItems(list: CampingList, gear: Gear[], products: Product[]): void {
        if (list.conditions.rain) {
            this.addItems(this.defaultGear.conditionalGear.rain, list.people, gear, products);
        }

        if (list.conditions.swimming) {
            this.addItems(this.defaultGear.conditionalGear.swimming, list.people, gear, products);
        }
    }

    private addTemperatureItems(list: CampingList, gear: Gear[], products: Product[]): void {
        // Добавляем снаряжение для текущей температуры
        this.addItems(this.defaultGear.temperatureGear[list.conditions.temperature], list.people, gear, products);

        // Если холодно, добавляем также снаряжение для прохладной погоды
        if (list.conditions.temperature === 'cold') {
            this.addItems(this.defaultGear.temperatureGear.cool, list.people, gear, products);
        }
    }

    private addDishGear(list: CampingList, gear: Gear[]): void {
        const uniqueGear = new Map<string, Gear>();
        
        for (const meal of list.meals) {
            for (const dishGear of meal.dish.gear) {
                if (!uniqueGear.has(dishGear.name)) {
                    uniqueGear.set(dishGear.name, { ...dishGear });
                }
            }
        }

        gear.push(...Array.from(uniqueGear.values()));
    }

    private addDishProducts(list: CampingList, products: Product[]): void {
        for (const meal of list.meals) {
            for (const dishProduct of meal.dish.products) {
                const existingProduct = products.find(p => 
                    p.name === dishProduct.name && 
                    p.unit === dishProduct.unit
                );

                const qty = dishProduct.qty * list.people;
                
                if (existingProduct) {
                    existingProduct.qty += qty;
                } else {
                    products.push({
                        ...dishProduct,
                        qty
                    });
                }
            }
        }
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
