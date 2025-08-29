import * as dotenv from 'dotenv';
import { setupBot } from './bot';

// Load environment variables
dotenv.config();

async function main() {
    try {
        const bot = await setupBot();
        await bot.launch();

        console.log('Bot started successfully');

        // Enable graceful stop
        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));
    } catch (error) {
        console.error('Error starting bot:', error);
        process.exit(1);
    }
}

main();