export type Unit = "ШТ" | "КГ" | "Л";

export interface Product {
    name: string;
    qty: number;
    unit: Unit;
    emoji: string;
}
