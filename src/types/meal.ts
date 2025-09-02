import { Dish } from './dish';

/** Тип приема пищи в течение дня */
export type TimeOfDay = 'breakfast' | 'lunch' | 'dinner';

/**
 * Интерфейс для описания приема пищи в походе
 */
export interface Meal {
    /** Номер дня похода */
    dayNumber: number;
    /** Время приема пищи */
    timeOfDay: TimeOfDay;
    /** Блюдо на прием пищи */
    dish: Dish;
}
