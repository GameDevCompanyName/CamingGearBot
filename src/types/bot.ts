import { Context } from 'telegraf';

/**
 * Интерфейс для хранения данных сессии пользователя
 */
export interface SessionData {
    /** ID списка, который редактируется в данный момент */
    editingListId?: number;
    /** Текущий режим редактирования */
    editingMode?: 'name' | 'people' | 'days' | 'conditions';
    /** Индекс приема пищи, который редактируется */
    editingMealIndex?: number;
}

/**
 * Расширенный интерфейс контекста Telegraf с данными сессии
 */
export interface MyContext extends Context {
    /** Данные сессии пользователя */
    session: SessionData;
}
