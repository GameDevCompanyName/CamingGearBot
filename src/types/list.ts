import { Meal } from './meal';

export interface CampingConditions {
    rain: boolean;
    swimming: boolean;
    minimizeWeight: boolean;
    temperature: 'cold' | 'cool' | 'warm' | 'hot';
}

export interface CampingList {
    id: number;
    userId: string;
    name: string;
    conditions: CampingConditions;
    people: number;
    days: number;
    meals: Meal[];
    createdAt: Date;
    updatedAt: Date;
}
