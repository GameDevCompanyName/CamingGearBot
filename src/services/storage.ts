import { promises as fs } from 'fs';
import { join } from 'path';
import { CampingList } from '../types';

/**
 * Схема базы данных для хранения списков походов
 */
interface DbSchema {
    /** Массив списков походов */
    lists: CampingList[];
    /** Последний использованный ID для генерации новых */
    lastId: number;
}

/**
 * Сервис для работы с хранилищем данных
 * Обеспечивает персистентность данных в JSON файле
 */
class StorageService {
    /** Путь к файлу базы данных */
    private dbPath: string;
    /** Текущие данные в памяти */
    private data: DbSchema;

    /**
     * Создает новый экземпляр сервиса хранилища
     * Инициализирует путь к БД и пустую структуру данных
     */
    constructor() {
        this.dbPath = join(__dirname, '../../data/db.json');
        this.data = { lists: [], lastId: 0 };
    }

    /**
     * Читает данные из файла БД и обновляет их в памяти
     * Также проверяет и исправляет lastId если он отсутствует
     */
    private async readDb(): Promise<void> {
        try {
            const content = await fs.readFile(this.dbPath, 'utf-8');
            this.data = JSON.parse(content);
            // Ensure lastId exists
            if (typeof this.data.lastId !== 'number') {
                this.data.lastId = this.data.lists.length > 0 
                    ? Math.max(...this.data.lists.map(l => l.id))
                    : 0;
            }
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                // File doesn't exist, use default empty data
                this.data = { lists: [], lastId: 0 };
            } else {
                throw error;
            }
        }
    }

    /**
     * Записывает текущие данные в файл БД
     * Создает директорию если она не существует
     */
    private async writeDb(): Promise<void> {
        // Ensure the directory exists
        const dir = join(__dirname, '../../data');
        await fs.mkdir(dir, { recursive: true });
        
        // Write the file
        await fs.writeFile(
            this.dbPath,
            JSON.stringify(this.data, (key, value) => {
                // Convert Date objects to ISO strings
                if (value instanceof Date) {
                    return value.toISOString();
                }
                return value;
            }, 2)
        );
    }

    /**
     * Инициализирует сервис, загружая данные из файла
     */
    async init(): Promise<void> {
        await this.readDb();
    }

    /**
     * Получает все списки походов для указанного пользователя
     * @param userId - ID пользователя в Telegram
     * @returns Массив списков походов
     */
    async getLists(userId: string): Promise<CampingList[]> {
        await this.readDb();
        return this.data.lists
            .filter(list => list.userId === userId)
            .map(list => ({
                ...list,
                createdAt: new Date(list.createdAt),
                updatedAt: new Date(list.updatedAt)
            }));
    }

    /**
     * Получает конкретный список похода по ID
     * @param userId - ID пользователя в Telegram
     * @param listId - ID списка похода
     * @returns Список похода или undefined если не найден
     */
    async getList(userId: string, listId: number): Promise<CampingList | undefined> {
        await this.readDb();
        const list = this.data.lists.find(list => list.userId === userId && list.id === listId);
        if (list) {
            return {
                ...list,
                createdAt: new Date(list.createdAt),
                updatedAt: new Date(list.updatedAt)
            };
        }
        return undefined;
    }

    /**
     * Создает новый список похода
     * Автоматически генерирует ID для списка
     * @param list - Новый список похода
     */
    async createList(list: CampingList): Promise<void> {
        await this.readDb();
        this.data.lastId++;
        list.id = this.data.lastId;
        this.data.lists.push(list);
        await this.writeDb();
    }

    /**
     * Обновляет существующий список похода
     * @param userId - ID пользователя в Telegram
     * @param listId - ID списка похода
     * @param updates - Частичные обновления для списка
     */
    async updateList(userId: string, listId: number, updates: Partial<CampingList>): Promise<void> {
        await this.readDb();
        const index = this.data.lists.findIndex(list => list.userId === userId && list.id === listId);
        if (index !== -1) {
            this.data.lists[index] = {
                ...this.data.lists[index],
                ...updates,
                updatedAt: new Date()
            };
            await this.writeDb();
        }
    }

    /**
     * Удаляет список похода
     * @param userId - ID пользователя в Telegram
     * @param listId - ID списка похода для удаления
     */
    async deleteList(userId: string, listId: number): Promise<void> {
        await this.readDb();
        this.data.lists = this.data.lists.filter(
            list => !(list.userId === userId && list.id === listId)
        );
        await this.writeDb();
    }

    async getUserListCount(userId: string): Promise<number> {
        await this.readDb();
        return this.data.lists.filter(list => list.userId === userId).length;
    }
}

export const storageService = new StorageService();

// Ensure proper JSON serialization of dates
export function serializeList(list: CampingList): CampingList {
    return {
        ...list,
        createdAt: list.createdAt instanceof Date ? list.createdAt : new Date(list.createdAt),
        updatedAt: list.updatedAt instanceof Date ? list.updatedAt : new Date(list.updatedAt)
    };
}
