import { Context } from 'telegraf';

export interface SessionData {
    editingListId?: number;
    editingMode?: 'name' | 'people' | 'days' | 'conditions';
    editingMealIndex?: number;
}

export interface MyContext extends Context {
    session: SessionData;
}
