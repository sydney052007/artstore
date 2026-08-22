import { Customer } from "./customer_models";
import { Address } from "./order_models";

export interface CustomerRepository {
    getCustomer(id: number) : Promise<Customer | null>;

    getAllCustomers(): Promise<Customer[]>;

    getCustomerByFederatedId(id: string) : Promise<Customer | null>;

    getCustomerAddress(id: number) : Promise<Address | null>;

    getCustomerByEmail(email: string): Promise<Customer | null>;

    storeCustomer(customer: Customer) : Promise<Customer>;

    updateCustomer(id: number, updateData: Partial<Customer>) : Promise<Customer | null>;
}