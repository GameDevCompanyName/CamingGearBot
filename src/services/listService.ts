import { CampingList, CampingConditions, Dish, Unit } from '../types';
import { storageService } from './storage';
import defaultGearData from '../data/defaultGear.json';
import dishesData from '../data/dishes.json';
import { v4 as uuidv4 } from 'uuid';

class ListService {
    private readonly MAX_LISTS_PER_USER = 10;

    async createNewList(userId: string): Promise<CampingList | null> {
        const listCount = await storageService.getUserListCount(userId);
        if (listCount >= this.MAX_LISTS_PER_USER) {
            return null;
        }

        const defaultList: CampingList = {
            id: uuidv4(),
            userId,
            name: `Поход №${listCount + 1}`,
            conditions: {
                rain: false,
                swimming: false,
                minimizeWeight: false,
                temperature: 'cool'
            },
            people: 1,
            days: 1,
            dishes: this.getDefaultDishes(1),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await storageService.createList(defaultList);
        return defaultList;
    }

    private getDefaultDishes(days: number): Dish[] {
        const dishesPerDay = 3;
        const requiredDishes = days * dishesPerDay;
        const availableDishes = dishesData.dishes;
        const selectedDishes: Dish[] = [];

        // For simplicity, we'll just repeat dishes if we don't have enough unique ones
        for (let i = 0; i < requiredDishes; i++) {
            const sourceDish = availableDishes[i % availableDishes.length];
            // Convert the dish data ensuring proper typing
            const dish: Dish = {
                name: sourceDish.name,
                gear: sourceDish.gear,
                products: sourceDish.products.map(p => ({
                    ...p,
                    unit: p.unit as Unit // Type assertion since we know the values are correct
                }))
            };
            selectedDishes.push(dish);
        }

        return selectedDishes;
    }

    async updateListConditions(userId: string, listId: string, conditions: Partial<CampingConditions>): Promise<void> {
        const list = await storageService.getList(userId, listId);
        if (list) {
            await storageService.updateList(userId, listId, {
                conditions: { ...list.conditions, ...conditions }
            });
        }
    }

    async updateListName(userId: string, listId: string, name: string): Promise<void> {
        await storageService.updateList(userId, listId, { name });
    }

    async updatePeopleCount(userId: string, listId: string, people: number): Promise<void> {
        if (people <= 0) throw new Error('Количество людей должно быть больше 0');
        await storageService.updateList(userId, listId, { people });
    }

    async updateDays(userId: string, listId: string, days: number): Promise<void> {
        if (days <= 0) throw new Error('Количество дней должно быть больше 0');
        
        const list = await storageService.getList(userId, listId);
        if (list) {
            const newDishes = this.getDefaultDishes(days);
            await storageService.updateList(userId, listId, { 
                days,
                dishes: newDishes
            });
        }
    }

    async deleteList(userId: string, listId: string): Promise<void> {
        await storageService.deleteList(userId, listId);
    }

    async getUserLists(userId: string): Promise<CampingList[]> {
        return storageService.getLists(userId);
    }

    async getList(userId: string, listId: string): Promise<CampingList | undefined> {
        return storageService.getList(userId, listId);
    }
}

export const listService = new ListService();
