import { Dish } from './dish';

export type TimeOfDay = 'breakfast' | 'lunch' | 'dinner';

export interface Meal {
    dayNumber: number;
    timeOfDay: TimeOfDay;
    dish: Dish;
}
