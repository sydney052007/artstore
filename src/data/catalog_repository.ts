import { Category, Product,
    ProductQueryParameters, ProductQueryResult } from "./catalog_models";
import { ProductModel } from "./orm/models";
import { Supplier } from "./supplier_models ";

export interface CatalogRepository{
    getProducts(params?: ProductQueryParameters): Promise<ProductQueryResult>;

    getProductDetails(ids: number[]): Promise<Product[]>;

    storeProduct(p: Product): Promise<Product>;

    getCategories(): Promise<Category[]>;

    storeCategory(c: Category): Promise<Category>;

    getSuppliers(): Promise<Supplier[]>;

    storeSupplier(s: Supplier): Promise<Supplier>;

    updateRentDate(id: number,d: string): Promise<ProductModel| null>;
}