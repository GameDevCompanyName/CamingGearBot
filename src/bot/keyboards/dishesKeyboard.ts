import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { Meal, Dish } from '../../types';

function getTimeOfDayEmoji(timeOfDay: 'breakfast' | 'lunch' | 'dinner'): string {
    switch (timeOfDay) {
        case 'breakfast': return '🍳';
        case 'lunch': return '🥘';
        case 'dinner': return '🍖';
    }
}

export function getMealsKeyboard(listId: number, meals: Meal[]): InlineKeyboardMarkup {
    const buttons = meals.map((meal, index) => {
        return [{
            text: `День ${meal.dayNumber} - ${getTimeOfDayEmoji(meal.timeOfDay)} - ${meal.dish.name} ${meal.dish.emoji}`,
            callback_data: `select_meal:${listId}:${index}`
        }];
    });

    buttons.push([{ text: '⬅️ Назад', callback_data: `back_to_list:${listId}` }]);

    return { inline_keyboard: buttons };
}

export function getDishesKeyboard(listId: number, mealIndex: number, dishes: Dish[]): InlineKeyboardMarkup {
    const buttons = dishes.map(dish => {
        return [{
            text: `${dish.emoji} ${dish.name}`,
            callback_data: `select_dish:${listId}:${mealIndex}:${dish.id}`
        }];
    });

    buttons.push([{ text: '⬅️ Назад к приемам пищи', callback_data: `back_to_meals:${listId}` }]);

    return { inline_keyboard: buttons };
}
