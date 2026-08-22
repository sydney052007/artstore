export interface Supplier {
    id?: number;
    name: string;
    email: string;
    password?: string;
    avatar?: string;

    federatedId?: string;
}