import { Supplier } from "../supplier_models ";
import { SupplierRepository } from "../supplier_repository";
import { BaseRepo, Constructor } from "./core";
import { SupplierModel } from "./models/supplier_models";

export function AddSupplier<TBase extends Constructor<BaseRepo>>(Base: TBase) {
    return class extends Base implements SupplierRepository{
        getSupplier(id: number): Promise<Supplier | null> {
            return SupplierModel.findByPk(id, {
                raw: true
            })
        }

        getAllSuppliers(): Promise<Supplier[]>{
            return SupplierModel.findAll({
                raw:true
            })
        }

        getSupplierByFederatedId(id: string): Promise<Supplier | null> {
            return SupplierModel.findOne({
                where: { federatedId: id },
                raw: true
            })
        }

        getSupplierByEmail(email: string): Promise<Supplier | null> {
            return SupplierModel.findOne({
                where: { email: email },
                raw: true
            })
        }

        async updateSupplier(id: number, updateData: Partial<Supplier>): Promise<Supplier | null> {
            const customer = await SupplierModel.findByPk(id);
            if(!customer) return null;
            await customer.update(updateData);
            return customer;
        }

        async storeSupplier(customer: Supplier): Promise<Supplier> {
            const [data, created] = await SupplierModel.findOrCreate({
                where: { email: customer.email },
                defaults: customer,
            });
            if(!created) {
                data.name = customer.name;
                data.email = customer.email;
                data.avatar = customer.avatar;
                data.password = customer.password;
                data.federatedId = customer.federatedId;
                await data.save();
            }
            return data;
        }
    }
}