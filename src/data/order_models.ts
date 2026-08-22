import { Product } from "./catalog_models";
import { Customer } from "./customer_models";

export interface Order{
    id?: number;
    customer?: Customer;
    selections?: ProductSelection[];
    address?: Address;

    shipped: boolean;
}

export interface ProductSelection {
    id?: number;
    productId?: number;
    supplierId?: number;
    quantity: number;
    type: string;
    price: number;
    rent_date: string;
}

export interface Address {
    id?: number;
    street: string;
    city: string;
    zip: string;
} 