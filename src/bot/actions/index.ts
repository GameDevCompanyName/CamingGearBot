import { Telegraf } from 'telegraf';
import { BotContext } from '../types';
import { listService } from '../../services/listService';
import { calculatorService } from '../../services/calculatorService';
import { getListKeyboard, getConditionsKeyboard } from '../keyboards/listKeyboard';

export function setupActions(bot: Telegraf<BotContext>) {
    // Open list
    bot.action(/^open_list:(.+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = ctx.match[1];
        const list = await listService.getList(userId, listId);

        if (!list) {
            await ctx.reply('Список не найден. Возможно, он был удален.');
            return;
        }

        const message = `*${list.name}*

👥 Количество людей: ${list.people}
📅 Дней: ${list.days}
🌦️ Условия:
${list.conditions.rain ? '☔ Дождь' : ''}
${list.conditions.swimming ? '🏊‍♂️ Купание' : ''}
${list.conditions.minimizeWeight ? '⚖️ Минимизация веса' : ''}
🌡️ Температура: ${list.conditions.temperature}

🍳 Блюда: ${list.dishes.length}`;

        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: getListKeyboard(list.id)
        });
    });

    // Edit name
    bot.action(/^edit_name:(.+)$/, async (ctx) => {
        const listId = ctx.match[1];
        ctx.session.editingListId = listId;
        ctx.session.editingMode = 'name';
        await ctx.reply('Введите новое название для списка:');
    });

    // Edit people count
    bot.action(/^edit_people:(.+)$/, async (ctx) => {
        const listId = ctx.match[1];
        ctx.session.editingListId = listId;
        ctx.session.editingMode = 'people';
        await ctx.reply('Введите количество человек (число больше 0):');
    });

    // Edit days
    bot.action(/^edit_days:(.+)$/, async (ctx) => {
        const listId = ctx.match[1];
        ctx.session.editingListId = listId;
        ctx.session.editingMode = 'days';
        await ctx.reply('Введите количество дней (число больше 0):');
    });

    // Edit conditions
    bot.action(/^edit_conditions:(.+)$/, async (ctx) => {
        const listId = ctx.match[1];
        await ctx.editMessageReplyMarkup(getConditionsKeyboard(listId));
    });

    // Toggle conditions
    bot.action(/^toggle_rain:(.+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = ctx.match[1];
        const list = await listService.getList(userId, listId);
        
        if (list) {
            await listService.updateListConditions(userId, listId, {
                rain: !list.conditions.rain
            });
            await ctx.answerCbQuery(list.conditions.rain ? 'Дождь ☔️ выключен' : 'Дождь ☔️ включен');
        }
    });

    // Generate list
    bot.action(/^generate:(.+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = ctx.match[1];
        const list = await listService.getList(userId, listId);

        if (!list) {
            await ctx.reply('Список не найден');
            return;
        }

        const formattedList = calculatorService.formatFinalList(list);
        await ctx.reply(formattedList, { parse_mode: 'Markdown' });
    });

    // Delete list
    bot.action(/^delete:(.+)$/, async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const listId = ctx.match[1];
        await listService.deleteList(userId, listId);
        await ctx.reply('Список удален');
        await ctx.deleteMessage();
    });

    // Back to lists
    bot.action('back_to_lists', async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const lists = await listService.getUserLists(userId);

        if (lists.length === 0) {
            await ctx.editMessageText('У тебя пока нет списков. Создай новый с помощью /newlist');
            return;
        }

        const message = '*Твои списки:*\n\n' + 
            lists.map((list, i) => `${i + 1}. ${list.name}`).join('\n');

        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: lists.map(list => [{
                    text: `Открыть "${list.name}"`,
                    callback_data: `open_list:${list.id}`
                }])
            }
        });
    });

    // Handle text input for editing
    bot.on('text', async (ctx) => {
        const userId = ctx.from.id.toString();
        const text = ctx.message.text;

        if (!ctx.session.editingListId || !ctx.session.editingMode) {
            return;
        }

        const listId = ctx.session.editingListId;
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
