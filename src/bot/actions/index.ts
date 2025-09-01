import { Telegraf } from 'telegraf';
import { MyContext } from '../../types/bot';
import { listService } from '../../services/listService';
import { displayListsMessage } from '../commands';
import { calculatorService } from '../../services/calculatorService';
import { getListKeyboard, getConditionsKeyboard } from '../keyboards/listKeyboard';
import { getMealsKeyboard, getDishesKeyboard } from '../keyboards/dishesKeyboard';
import { formatListMessage } from '../../utils/messageFormatters';

export function setupActions(bot: Telegraf<MyContext>) {
    // Create new list
    bot.action('create_new_list', async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const list = await listService.createNewList(userId);
        
        if (!list) {
            await ctx.reply('У вас уже максимальное количество списков (10). Удалите неиспользуемые списки через /mylists');
            return;
        }

        await ctx.editMessageText(
            `Создан новый список *${list.name}*\\!\n\nТеперь ты можешь настроить его параметры:`,
            { 
                parse_mode: 'MarkdownV2',
                reply_markup: getListKeyboard(list.id)
            }
        );
    });

    // Open list
    bot.action(/^open_list:(\d+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = parseInt(ctx.match[1]);
        const list = await listService.getList(userId, listId);

        if (!list) {
            await ctx.reply('Список не найден. Возможно, он был удален.');
            return;
        }

        const message = formatListMessage(list);
        await ctx.editMessageText(message, {
            parse_mode: 'MarkdownV2',
            reply_markup: getListKeyboard(list.id)
        });
    });

    // Edit name
    bot.action(/^edit_name:(\d+)$/, async (ctx) => {
        const listId = parseInt(ctx.match[1]);
        ctx.session.editingListId = listId;
        ctx.session.editingMode = 'name';
        await ctx.reply('Введите новое название для списка:');
    });

    // Edit people count
    bot.action(/^edit_people:(\d+)$/, async (ctx) => {
        const listId = parseInt(ctx.match[1]);
        ctx.session.editingListId = listId;
        ctx.session.editingMode = 'people';
        await ctx.reply('Введите количество человек (число больше 0):');
    });

    // Edit days
    bot.action(/^edit_days:(\d+)$/, async (ctx) => {
        const listId = parseInt(ctx.match[1]);
        ctx.session.editingListId = listId;
        ctx.session.editingMode = 'days';
        await ctx.reply('Введите количество дней (число больше 0):');
    });

    // Edit conditions
    bot.action(/^edit_conditions:(\d+)$/, async (ctx) => {
        const listId = parseInt(ctx.match[1]);
        await ctx.editMessageReplyMarkup(getConditionsKeyboard(listId));
    });

    // Edit dishes
    bot.action(/^edit_dishes:(\d+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = parseInt(ctx.match[1]);
        const list = await listService.getList(userId, listId);

        if (list) {
            await ctx.editMessageText('Выберите прием пищи для изменения:', {
                reply_markup: getMealsKeyboard(listId, list.meals)
            });
        }
    });

    // Select meal to edit
    bot.action(/^select_meal:(\d+):(\d+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = parseInt(ctx.match[1]);
        const mealIndexStr = ctx.match[2];
        const mealIndex = parseInt(mealIndexStr);
        
        ctx.session.editingListId = listId;
        ctx.session.editingMealIndex = mealIndex;

        const availableDishes = listService.getAvailableDishes();

        await ctx.editMessageText('Выберите новое блюдо:', {
            reply_markup: getDishesKeyboard(listId, mealIndex, availableDishes)
        });
    });

    // Select dish for meal
    bot.action(/^select_dish:(\d+):(\d+):(.+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = parseInt(ctx.match[1]);
        const mealIndexStr = ctx.match[2];
        const dishId = ctx.match[3];
        const mealIndex = parseInt(mealIndexStr);
        
        await listService.updateMealDish(userId, listId, mealIndex, dishId);
        
        // Clear editing state
        ctx.session.editingListId = undefined;
        ctx.session.editingMealIndex = undefined;

        const list = await listService.getList(userId, listId);
        if (list) {
            await ctx.editMessageText('Выберите прием пищи для изменения:', {
                reply_markup: getMealsKeyboard(listId, list.meals)
            });
        }
    });

    // Back to meals
    bot.action(/^back_to_meals:(\d+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = parseInt(ctx.match[1]);
        const list = await listService.getList(userId, listId);

        if (list) {
            await ctx.editMessageText('Выберите прием пищи для изменения:', {
                reply_markup: getMealsKeyboard(listId, list.meals)
            });
        }
    });

    // Toggle conditions
    bot.action(/^toggle_rain:(\d+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = parseInt(ctx.match[1]);
        const list = await listService.getList(userId, listId);
        
        if (list) {
            const newValue = !list.conditions.rain;
            await listService.updateListConditions(userId, listId, {
                rain: newValue
            });
            await ctx.answerCbQuery(newValue ? 'Дождь ☔️ включен' : 'Дождь ☔️ выключен');
            await updateConditionsMessage(ctx, userId, listId);
        }
    });

    bot.action(/^toggle_swimming:(\d+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = parseInt(ctx.match[1]);
        const list = await listService.getList(userId, listId);
        
        if (list) {
            const newValue = !list.conditions.swimming;
            await listService.updateListConditions(userId, listId, {
                swimming: newValue
            });
            await ctx.answerCbQuery(newValue ? 'Купание 🏊‍♂️ включено' : 'Купание 🏊‍♂️ выключено');
            await updateConditionsMessage(ctx, userId, listId);
        }
    });

    bot.action(/^toggle_weight:(\d+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = parseInt(ctx.match[1]);
        const list = await listService.getList(userId, listId);
        
        if (list) {
            const newValue = !list.conditions.minimizeWeight;
            await listService.updateListConditions(userId, listId, {
                minimizeWeight: newValue
            });
            await ctx.answerCbQuery(newValue ? 'Минимизация веса ⚖️ включена' : 'Минимизация веса ⚖️ выключена');
            await updateConditionsMessage(ctx, userId, listId);
        }
    });

    bot.action(/^set_temp:(\w+):(\d+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const temp = ctx.match[1];
        const listId = parseInt(ctx.match[2]);
        const list = await listService.getList(userId, listId);
        
        if (list) {
            const tempEmoji = {
                cold: '❄️',
                cool: '🌡️',
                warm: '☀️',
                hot: '🔥'
            };
            
            await listService.updateListConditions(userId, listId, {
                temperature: temp as 'cold' | 'cool' | 'warm' | 'hot'
            });
            await ctx.answerCbQuery(`Установлена температура: ${tempEmoji[temp as keyof typeof tempEmoji]}`);
            await updateConditionsMessage(ctx, userId, listId);
        }
    });

    // Функция для обновления сообщения с условиями
    async function updateConditionsMessage(ctx: MyContext, userId: string, listId: number) {
        const list = await listService.getList(userId, listId);
        if (!list) return;

        const message = formatListMessage(list);
        
        await ctx.editMessageText(message, {
            parse_mode: 'MarkdownV2',
            reply_markup: getConditionsKeyboard(listId)
        });
    }

    // Generate list
    bot.action(/^generate:(\d+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = parseInt(ctx.match[1]);
        const list = await listService.getList(userId, listId);

        if (!list) {
            await ctx.reply('Список не найден');
            return;
        }

        const formattedList = calculatorService.formatFinalList(list);
        await ctx.reply(formattedList, { parse_mode: 'Markdown' });
    });

    // Delete list
    bot.action(/^delete:(\d+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = parseInt(ctx.match[1]);
        await listService.deleteList(userId, listId);
        await ctx.reply('Список удален');
        await ctx.deleteMessage();
    });

    // Back to list from conditions
    bot.action(/^back_to_list:(\d+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = parseInt(ctx.match[1]);
        const list = await listService.getList(userId, listId);
        
        if (list) {
            const message = formatListMessage(list);
            await ctx.editMessageText(message, {
                parse_mode: 'MarkdownV2',
                reply_markup: getListKeyboard(listId)
            });
        }
    });

    // Back to lists
    bot.action('back_to_lists', async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const lists = await listService.getUserLists(userId);
        // При возврате к списку используем редактирование сообщения
        await displayListsMessage(ctx, lists, false);
    });

    // Handle text input for editing
    bot.on('text', async (ctx) => {
        const userId = ctx.from.id.toString();
        const text = ctx.message.text;

        if (!ctx.session.editingListId || !ctx.session.editingMode) {
            return;
        }

        const listId = parseInt(ctx.session.editingListId.toString());
        const mode = ctx.session.editingMode;

        try {
            switch (mode) {
                case 'name':
                    await listService.updateListName(userId, listId, text);
                    await ctx.reply('Название обновлено');
                    break;

                case 'people':
                    const people = parseInt(text);
                    if (isNaN(people) || people <= 0) {
                        await ctx.reply('Пожалуйста, введите корректное число больше 0');
                        return;
                    }
                    await listService.updatePeopleCount(userId, listId, people);
                    await ctx.reply('Количество человек обновлено');
                    break;

                case 'days':
                    const days = parseInt(text);
                    if (isNaN(days) || days <= 0) {
                        await ctx.reply('Пожалуйста, введите корректное число больше 0');
                        return;
                    }
                    await listService.updateDays(userId, listId, days);
                    await ctx.reply('Количество дней обновлено');
                    break;
            }
        } finally {
            // Clear editing state
            ctx.session.editingListId = undefined;
            ctx.session.editingMode = undefined;
        }
    });
}
