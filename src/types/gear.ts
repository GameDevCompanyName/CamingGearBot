import { Product } from './product';

export interface Gear {
    name: string;
    qty: number;
    emoji: string;
}

export interface DefaultGearItem {
    dependantOnPeople: boolean;
    item: Gear;
}

export interface DefaultGear {
    gear: DefaultGearItem[];
    products: {
        dependantOnPeople: boolean;
        item: Product;
    }[];
}
