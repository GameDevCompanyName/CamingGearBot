import { Product } from './product';

/**
 * Базовый интерфейс для описания единицы снаряжения
 */
export interface Gear {
    /** Название предмета */
    name: string;
    /** Количество */
    qty: number;
    /** Эмодзи для отображения */
    emoji: string;
}

/**
 * Интерфейс для описания снаряжения с условием зависимости от количества людей
 */
export interface DefaultGearItem {
    /** Если true, количество умножается на число участников */
    dependantOnPeople: boolean;
    /** Базовый предмет снаряжения */
    item: Gear;
}

/**
 * Интерфейс для описания продукта с условием зависимости от количества людей
 */
export interface DefaultProductItem {
    /** Если true, количество умножается на число участников */
    dependantOnPeople: boolean;
    /** Базовый продукт */
    item: Gear;
}

/**
 * Интерфейс для набора снаряжения и продуктов
 */
export interface GearSet {
    /** Список снаряжения */
    gear: DefaultGearItem[];
    /** Список продуктов */
    products: Product[];
}

/**
 * Основной интерфейс конфигурации снаряжения
 */
export interface DefaultGear {
    /** Базовый набор снаряжения и продуктов */
    baseGear: GearSet;
    /** Условные наборы снаряжения */
    conditionalGear: {
        /** Набор для дождливой погоды */
        rain: GearSet;
        /** Набор для похода с плаванием */
        swimming: GearSet;
    };
    temperatureGear: {
        cold: GearSet;
        cool: GearSet;
        warm: GearSet;
        hot: GearSet;
    };
}
