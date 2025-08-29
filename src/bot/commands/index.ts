import { Telegraf } from 'telegraf';
import { BotContext } from '../types';
import { formatBold, formatListItem } from '../../utils/formatters';
import { listService } from '../../services/listService';
import { getListKeyboard } from '../keyboards/listKeyboard';

export function setupCommands(bot: Telegraf<BotContext>) {
    bot.command('start', async (ctx) => {
        const message = `Привет! Я помогу тебе составить список снаряжения для похода. 🏕️

Основные команды:
/newlist - Создать новый список
/mylists - Посмотреть твои списки
/help - Помощь

Создай свой первый список с помощью /newlist`;

        await ctx.reply(message);
    });

    bot.command('help', async (ctx) => {
        const message = `🏕️ *Camping List Bot* - твой помощник в подготовке к походу!

Доступные команды:
/newlist - Создать новый список снаряжения
/mylists - Показать все твои списки
/help - Показать это сообщение

Как пользоваться:
1. Создай новый список через /newlist
2. Настрой параметры похода (количество людей, дней и т.д.)
3. Выбери блюда для каждого дня
4. Получи готовый список снаряжения и продуктов!`;

        await ctx.reply(message, { parse_mode: 'Markdown' });
    });

    bot.command('newlist', async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const list = await listService.createNewList(userId);
        
        if (!list) {
            await ctx.reply('У вас уже максимальное количество списков (10). Удалите неиспользуемые списки через /mylists');
            return;
        }

        await ctx.reply(
            `Создан новый список ${formatBold(list.name)}\\!\n\nТеперь ты можешь настроить его параметры:`,
            { 
                parse_mode: 'MarkdownV2',
                reply_markup: getListKeyboard(list.id)
            }
        );
    });

    bot.command('mylists', async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        const lists = await listService.getUserLists(userId);

        if (lists.length === 0) {
            await ctx.reply('У тебя пока нет списков. Создай новый с помощью /newlist');
            return;
        }

        const message = '*Твои списки:*\n\n' + 
            lists.map((list, i) => `${i + 1}. ${list.name}`).join('\n');

        await ctx.reply(message, { 
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: lists.map(list => [{
                    text: `Открыть "${list.name}"`,
                    callback_data: `open_list:${list.id}`
                }])
            }
        });
    });
}
