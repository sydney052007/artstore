import { Supplier } from "./supplier_models ";

export interface Product {
    id?: number;
    name: string;
    description: string;
    available: boolean;
    photo_URL?: string;

    sale: boolean;
    sale_price?: number;
    rent: boolean;
    rent_price?: number;
    rent_date?: string;

    category?: Category;
    supplier?: Supplier;
}

export interface Category{
    id?: number;
    name: string;
}

export interface ProductQueryParameters{
    pageSize?: number;
    page?: number;
    category?: number;
    searchTerm?: string;
}

export interface ProductQueryResult{
    products: Product[];
    totalCount: number;
    categories: Category[];
}