import { Context } from 'telegraf';

export interface SessionData {
    editingListId?: string;
    editingMode?: 'name' | 'people' | 'days' | 'conditions';
}

export interface BotContext extends Context {
    session: SessionData;
}
