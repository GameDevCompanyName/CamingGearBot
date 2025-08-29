import { Telegraf, Context, session } from 'telegraf';
import { storageService } from '../services/storage';
import { setupCommands } from './commands';
import { setupActions } from './actions';

interface SessionData {
    editingListId?: string;
    editingMode?: 'name' | 'people' | 'days' | 'conditions';
}

interface BotContext extends Context {
    session: SessionData;
}

export async function setupBot() {
    const token = process.env.BOT_TOKEN;
    if (!token) {
        throw new Error('BOT_TOKEN must be provided in environment variables');
    }

    const bot = new Telegraf<BotContext>(token);

    // Middleware
    bot.use(session());

    // Initialize storage
    await storageService.init();

    // Setup commands and actions
    setupCommands(bot);
    setupActions(bot);

    // Error handling
    bot.catch((err, ctx) => {
        console.error(`Error for ${ctx.updateType}`, err);
        ctx.reply('Произошла ошибка. Попробуйте еще раз или обратитесь к администратору.');
    });

    return bot;
}
