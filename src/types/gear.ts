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

export interface DefaultProductItem {
    dependantOnPeople: boolean;
    item: Gear;
}

export interface GearSet {
    gear: DefaultGearItem[];
    products: Product[];
}

export interface DefaultGear {
    baseGear: GearSet;
    conditionalGear: {
        rain: GearSet;
        swimming: GearSet;
    };
    temperatureGear: {
        cold: GearSet;
        cool: GearSet;
        warm: GearSet;
        hot: GearSet;
    };
}
