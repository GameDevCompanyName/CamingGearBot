import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export function getListKeyboard(listId: number): InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            [
                { text: "✏️ Изменить название", callback_data: `edit_name:${listId}` },
                { text: "👥 Изменить кол-во людей", callback_data: `edit_people:${listId}` }
            ],
            [
                { text: "📅 Изменить дни", callback_data: `edit_days:${listId}` },
                { text: "🌦️ Изменить условия", callback_data: `edit_conditions:${listId}` }
            ],
            [
                { text: "🍳 Изменить блюда", callback_data: `edit_dishes:${listId}` },
                { text: "📝 Сгенерировать список", callback_data: `generate:${listId}` }
            ],
            [
                { text: "❌ Удалить список", callback_data: `delete:${listId}` },
                { text: "⬅️ К списку походов", callback_data: "back_to_lists" }
            ]
        ]
    };
}

export function getConditionsKeyboard(listId: number): InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            [
                { text: "☔ Дождь", callback_data: `toggle_rain:${listId}` },
                { text: "🏊‍♂️ Купание", callback_data: `toggle_swimming:${listId}` }
            ],
            [
                { text: "⚖️ Минимизация веса", callback_data: `toggle_weight:${listId}` }
            ],
            [
                { text: "❄️ Холодно", callback_data: `set_temp:cold:${listId}` },
                { text: "🌡️ Прохладно", callback_data: `set_temp:cool:${listId}` }
            ],
            [
                { text: "☀️ Тепло", callback_data: `set_temp:warm:${listId}` },
                { text: "🔥 Жарко", callback_data: `set_temp:hot:${listId}` }
            ],
            [
                { text: "⬅️ Назад", callback_data: `back_to_list:${listId}` }
            ]
        ]
    };
}
