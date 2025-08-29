import { Gear } from './gear';
import { Product } from './product';

export interface Dish {
    name: string;
    gear: Gear[];
    products: Product[];
}
