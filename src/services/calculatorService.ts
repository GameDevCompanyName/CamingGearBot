import { CampingList, Gear, Product, DefaultGear, Unit, GearSet, DefaultGearItem } from '../types';
import defaultGearData from '../data/defaultGear.json';

/**
 * Сервис для расчета необходимого снаряжения и продуктов
 * на основе условий похода и базового набора
 */
class CalculatorService {
    /** Базовый набор снаряжения и продуктов с учетом условий */
    private defaultGear: DefaultGear = {
        baseGear: {
            gear: defaultGearData.baseGear.gear,
            products: defaultGearData.baseGear.products as Product[]
        },
        conditionalGear: {
            rain: defaultGearData.conditionalGear.rain,
            swimming: defaultGearData.conditionalGear.swimming
        },
        temperatureGear: {
            cold: {
                gear: defaultGearData.temperatureGear.cold.gear,
                products: defaultGearData.temperatureGear.cold.products as Product[]
            },
            cool: {
                gear: defaultGearData.temperatureGear.cool.gear,
                products: defaultGearData.temperatureGear.cool.products as Product[]
            },
            warm: {
                gear: defaultGearData.temperatureGear.warm.gear,
                products: defaultGearData.temperatureGear.warm.products as Product[]
            },
            hot: {
                gear: defaultGearData.temperatureGear.hot.gear,
                products: defaultGearData.temperatureGear.hot.products as Product[]
            }
        }
    };

    /**
     * Рассчитывает финальный список снаряжения и продуктов для похода
     * @param list - Список похода с условиями и участниками
     * @returns Объект с массивами снаряжения и продуктов
     */
    calculateFinalList(list: CampingList): { gear: Gear[], products: Product[] } {
        const gear: Gear[] = [];
        const products: Product[] = [];

        // Базово необходимые вещи и продукты для любого похода
        this.addDefaultGear(list, gear, this.defaultGear.baseGear.gear);
        this.addProducts(list, products, this.defaultGear.baseGear.products);

        // Вещи необходимые для определенных условий
        this.addConditionItems(list, gear, products);

        // Вещи специфичные для температуры
        this.addTemperatureItems(list, gear, products);

        // Добавляем все снаряжение и продукты для блюд
        this.addDishes(list, gear, products);

        return { gear, products };
    }

    /**
     * Добавляет снаряжение и продукты в зависимости от условий похода
     * @param list - Список похода
     * @param finalGear - Массив снаряжения для дополнения
     * @param finalProducts - Массив продуктов для дополнения
     */
    private addConditionItems(list: CampingList, finalGear: Gear[], finalProducts: Product[]): void {
        if (list.conditions.rain) {
            this.addDefaultGear(list, finalGear, this.defaultGear.conditionalGear.rain.gear);
            this.addProducts(list, finalProducts, this.defaultGear.conditionalGear.rain.products);
        }

        if (list.conditions.swimming) {
            this.addDefaultGear(list, finalGear, this.defaultGear.conditionalGear.swimming.gear);
            this.addProducts(list, finalProducts, this.defaultGear.conditionalGear.swimming.products);
        }
    }

    /**
     * Добавляет снаряжение и продукты в зависимости от температурных условий
     * @param list - Список похода
     * @param finalGear - Массив снаряжения для дополнения
     * @param finalProducts - Массив продуктов для дополнения
     */
    private addTemperatureItems(list: CampingList, finalGear: Gear[], finalProducts: Product[]): void {
        // Добавляем снаряжение для текущей температуры
        this.addDefaultGear(list, finalGear, this.defaultGear.temperatureGear[list.conditions.temperature].gear);
        this.addProducts(list, finalProducts, this.defaultGear.temperatureGear[list.conditions.temperature].products);
    }

    /**
     * Добавляет снаряжение и продукты для всех запланированных блюд
     * @param list - Список похода
     * @param finalGear - Массив снаряжения для дополнения
     * @param finalProducts - Массив продуктов для дополнения
     */
    private addDishes(list: CampingList, finalGear: Gear[], finalProducts: Product[]): void {
        for (const meal of list.meals) {
            this.addGear(list, finalGear, meal.dish.gear);
            this.addProducts(list, finalProducts, meal.dish.products);
        }
    }

    /**
     * Форматирует финальный список снаряжения и продуктов в текстовое сообщение
     * @param list - Список похода
     * @returns Отформатированный текст сообщения в формате Markdown
     */
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

    /**
     * Добавляет базовое снаряжение с учетом зависимости от количества людей
     * @param list - Список похода
     * @param finalGear - Массив снаряжения для дополнения
     * @param defaultGearToAdd - Массив базового снаряжения для добавления
     */
    private addDefaultGear(
        list: CampingList,
        finalGear: Gear[],
        defaultGearToAdd: DefaultGearItem[]
    ): void {
        for (const gearItem of defaultGearToAdd) {
            const qty = gearItem.dependantOnPeople ? gearItem.item.qty * list.people : gearItem.item.qty;
            const existingGear = finalGear.find(g => g.name === gearItem.item.name);

            if (existingGear) {
                existingGear.qty = Math.max(existingGear.qty, qty);
            } else {
                finalGear.push({ ...gearItem.item, qty });
            }
        }
    }

    /**
     * Добавляет снаряжение из блюд с суммированием количества
     * @param list - Список похода
     * @param finalGear - Массив снаряжения для дополнения
     * @param gearToAdd - Массив снаряжения для добавления
     */
    private addGear(
        list: CampingList,
        finalGear: Gear[],
        gearToAdd: Gear[]
    ): void {
        for (const gearItem of gearToAdd) {
            const qty = gearItem.qty;
            const existingGear = finalGear.find(g => g.name === gearItem.name);

            if (existingGear) {
                existingGear.qty = Math.max(existingGear.qty, qty);
            } else {
                finalGear.push({ ...gearItem, qty });
            }
        }
    }

    private addProducts(
        list: CampingList,
        finalProducts: Product[],
        productsToAdd: Product[]
    ): void {

        // Add products
        for (const product of productsToAdd) {
            const qty = product.qty * list.people;

            const existingProduct = finalProducts.find(p =>
                p.name === product.name &&
                p.unit === product.unit
            );

            if (existingProduct) {
                existingProduct.qty += qty;
            } else {
                finalProducts.push({ ...product, qty });
            }
        }
    }

}

export const calculatorService = new CalculatorService();
