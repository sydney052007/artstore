import { Order } from "./order_models";

export interface OrderRepository {
    getOrder(id: number): Promise<Order | null>;

    getOrders(excludeShipped: boolean): Promise<Order[]>;

    getOrderById(id: number): Promise<Order[] | null>;

    storeOrder(order: Order): Promise<Order>;
}