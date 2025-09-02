import { Gear } from './gear';
import { Product } from './product';

/**
 * Интерфейс для описания блюда
 */
export interface Dish {
    /** Уникальный идентификатор блюда */
    id: string;
    /** Название блюда */
    name: string;
    /** Эмодзи для отображения */
    emoji: string;
    /** Необходимое снаряжение для приготовления */
    gear: Gear[];
    /** Необходимые продукты */
    products: Product[];
}
