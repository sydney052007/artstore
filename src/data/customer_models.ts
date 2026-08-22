export interface Customer {
    id?: number;
    name: string;
    email: string;
    password?: string;
    avatar?: string;

    federatedId?: string;
}