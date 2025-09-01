import { Gear } from './gear';
import { Product } from './product';

export interface Dish {
    id: string;
    name: string;
    emoji: string;
    gear: Gear[];
    products: Product[];
}
