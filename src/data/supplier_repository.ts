import { Supplier } from "./supplier_models ";
import { Address } from "./order_models";

export interface SupplierRepository {
    getSupplier(id: number) : Promise<Supplier | null>;

    getAllSuppliers(): Promise<Supplier[]>;

    getSupplierByFederatedId(id: string) : Promise<Supplier| null>;

    getSupplierByEmail(email: string): Promise<Supplier | null>;

    storeSupplier(supplier: Supplier) : Promise<Supplier>;

    updateSupplier(id: number, updateData: Partial<Supplier>) : Promise<Supplier | null>;
}