import { CampingList, CampingConditions, Dish, Unit, Meal, TimeOfDay } from '../types';
import { storageService } from './storage';
import dishesData from '../data/dishes.json';


/**
 * Сервис для управления списками походов
 * Обеспечивает создание, редактирование и валидацию списков
 */
class ListService {
    /** Максимальное количество списков для одного пользователя */
    private readonly MAX_LISTS_PER_USER = 10;
    /** Максимальная продолжительность похода в днях */
    private readonly MAX_DAYS = 14;
    /** Максимальное количество участников */
    private readonly MAX_PEOPLE = 30;

    async createNewList(userId: string): Promise<CampingList | null> {
        const listCount = await storageService.getUserListCount(userId);
        if (listCount >= this.MAX_LISTS_PER_USER) {
            return null;
        }

        const defaultList: CampingList = {
            id: 0, // Will be set by storage service
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
            meals: this.generateInitialMeals(1),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await storageService.createList(defaultList);
        return defaultList;
    }

    private generateInitialMeals(days: number): Meal[] {
        const meals: Meal[] = [];
        const availableDishes = this.getAvailableDishes();
        
        for (let day = 1; day <= days; day++) {
            (['breakfast', 'lunch', 'dinner'] as TimeOfDay[]).forEach(timeOfDay => {
                meals.push({
                    dayNumber: day,
                    timeOfDay,
                    dish: this.getRandomDish(availableDishes)
                });
            });
        }
        return meals;
    }

    private getRandomDish(dishes: Dish[]): Dish {
        return dishes[Math.floor(Math.random() * dishes.length)];
    }

    getAvailableDishes(): Dish[] {
        return dishesData.dishes.map(d => ({
            ...d,
            products: d.products.map(p => ({ ...p, unit: p.unit as Unit }))
        }));
    }

    async updateListConditions(userId: string, listId: number, conditions: Partial<CampingConditions>): Promise<void> {
        const list = await storageService.getList(userId, listId);
        if (list) {
            await storageService.updateList(userId, listId, {
                conditions: { ...list.conditions, ...conditions }
            });
        }
    }

    async updateListName(userId: string, listId: number, name: string): Promise<void> {
        await storageService.updateList(userId, listId, { name });
    }

    async updatePeopleCount(userId: string, listId: number, people: number): Promise<void> {
        if (people <= 0) throw new Error('Количество людей должно быть больше 0');
        if (people > this.MAX_PEOPLE) throw new Error(`Максимальное количество людей: ${this.MAX_PEOPLE}`);
        await storageService.updateList(userId, listId, { people });
    }

    async updateDays(userId: string, listId: number, days: number): Promise<void> {
        if (days <= 0) throw new Error('Количество дней должно быть больше 0');
        if (days > this.MAX_DAYS) throw new Error(`Максимальное количество дней: ${this.MAX_DAYS}`);
        
        const list = await storageService.getList(userId, listId);
        if (list) {
            const newMeals = this.generateInitialMeals(days);
            await storageService.updateList(userId, listId, { 
                days,
                meals: newMeals
            });
        }
    }

    async updateMealDish(userId: string, listId: number, mealIndex: number, dishId: string): Promise<void> {
        const list = await storageService.getList(userId, listId);
        const dish = this.getAvailableDishes().find(d => d.id === dishId);
        if (list && dish) {
            list.meals[mealIndex].dish = dish;
            await storageService.updateList(userId, listId, { meals: list.meals });
        }
    }

    async deleteList(userId: string, listId: number): Promise<void> {
        await storageService.deleteList(userId, listId);
    }

    async getUserLists(userId: string): Promise<CampingList[]> {
        return storageService.getLists(userId);
    }

    async getList(userId: string, listId: number): Promise<CampingList | undefined> {
        return storageService.getList(userId, listId);
    }
}

export const listService = new ListService();
