import { promises as fs } from 'fs';
import { join } from 'path';
import { CampingList } from '../types';

interface DbSchema {
    lists: CampingList[];
}

class StorageService {
    private dbPath: string;
    private data: DbSchema;

    constructor() {
        this.dbPath = join(__dirname, '../../data/db.json');
        this.data = { lists: [] };
    }

    private async readDb(): Promise<void> {
        try {
            const content = await fs.readFile(this.dbPath, 'utf-8');
            this.data = JSON.parse(content);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                // File doesn't exist, use default empty data
                this.data = { lists: [] };
            } else {
                throw error;
            }
        }
    }

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

    async init(): Promise<void> {
        await this.readDb();
    }

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

    async getList(userId: string, listId: string): Promise<CampingList | undefined> {
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

    async createList(list: CampingList): Promise<void> {
        await this.readDb();
        this.data.lists.push(list);
        await this.writeDb();
    }

    async updateList(userId: string, listId: string, updates: Partial<CampingList>): Promise<void> {
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

    async deleteList(userId: string, listId: string): Promise<void> {
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
