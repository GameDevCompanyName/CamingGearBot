import { Dish } from './dish';

export interface CampingConditions {
    rain: boolean;
    swimming: boolean;
    minimizeWeight: boolean;
    temperature: 'cold' | 'cool' | 'warm' | 'hot';
}

export interface CampingList {
    id: string;
    userId: string;
    name: string;
    conditions: CampingConditions;
    people: number;
    days: number;
    dishes: Dish[];
    createdAt: Date;
    updatedAt: Date;
}
