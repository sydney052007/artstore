import { BaseRepo } from "./core";
import { AddUpdate } from "./update";
import { AddQueries } from "./queries";
import { AddStorage } from "./storage";
import { AddOrderQueries } from "./order_queries";
import { AddOrderStorage } from "./order_storage";
import { AddCustomers } from "./customers";
import { AddSupplier } from "./supplier";

const CatalogRepo = AddUpdate(AddStorage(AddQueries(BaseRepo)));
const RepoWithOrders = AddOrderStorage(AddOrderQueries(CatalogRepo));
const RepoWithCustomers = AddCustomers(RepoWithOrders);
const RepoWithSuppliers = AddSupplier(RepoWithOrders);

export const CatalogRepoImpl = RepoWithCustomers;
export const CatalogRepoWithSuppliers = RepoWithSuppliers;