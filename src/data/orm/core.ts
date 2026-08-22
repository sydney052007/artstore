import { Sequelize } from "sequelize";
// Sequelize loads its Postgres dialect via a dynamic require() based on the
// `dialect` config string, which Vercel's function bundler can't trace
// statically — without this explicit import, the pg package silently isn't
// included in the deployed bundle ("Please install pg package manually").
import "pg";
import { getConfig } from "../../config";
import { initializeModels, CategoryModel, 
    ProductModel} from "./models";
import { SupplierModel } from "./models/supplier_models";
import { readFileSync } from "fs";

const config = getConfig("catalog:orm_repo");
const logging = config.logging? { logging: console.log, logQueryParameters: true}:
                { logging: false };

export class BaseRepo {
    sequelize: Sequelize;

    constructor(){
        const databaseUrl = process.env.DATABASE_URL;
        // Serverless functions can run many concurrent instances, each
        // opening its own pool; keep it small so a burst of cold starts
        // doesn't exhaust the database's connection limit.
        const serverlessPool = { pool: { max: 3, min: 0, idle: 10000, acquire: 10000 } };
        this.sequelize = databaseUrl
            ? new Sequelize(databaseUrl, { ...config.settings, ...logging, ...serverlessPool })
            : new Sequelize({ ...config.settings, ...logging });
        this.initModelsAndDatabase();
    }

    async initModelsAndDatabase() : Promise<void> {
        initializeModels(this.sequelize);
        if(config.rest_db){
            await this.sequelize.drop();
            await this.sequelize.sync();
            await this.addSeedData();
        } else {
            await this.sequelize.sync();
        }
    }

    async addSeedData() {
        const data = JSON.parse(readFileSync(config.seed_file).toString());
        await this.sequelize.transaction(async (transaction) => {
            await SupplierModel.bulkCreate(data.suppliers, { transaction });
            await CategoryModel.bulkCreate(data.categories, { transaction });
            await ProductModel.bulkCreate(data.products, { transaction });
        })
    }
}

export type Constructor<T = {}> = new(...args: any[]) => T;