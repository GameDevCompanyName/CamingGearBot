import { Meal } from './meal';

/**
 * Интерфейс для описания условий похода
 */
export interface CampingConditions {
    /** Ожидается ли дождь */
    rain: boolean;
    /** Планируется ли плавание */
    swimming: boolean;
    /** Нужно ли минимизировать вес */
    minimizeWeight: boolean;
    /** Ожидаемая температура */
    temperature: 'cold' | 'cool' | 'warm' | 'hot';
}

/**
 * Основной интерфейс списка похода
 */
export interface CampingList {
    /** Уникальный идентификатор списка */
    id: number;
    /** Идентификатор пользователя-владельца */
    userId: string;
    /** Название похода */
    name: string;
    /** Условия похода */
    conditions: CampingConditions;
    /** Количество участников */
    people: number;
    /** Продолжительность в днях */
    days: number;
    /** Список приемов пищи */
    meals: Meal[];
    /** Дата создания */
    createdAt: Date;
    /** Дата последнего обновления */
    updatedAt: Date;
}
