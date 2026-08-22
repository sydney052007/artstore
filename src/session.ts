import { Express } from "express";
import { Sequelize } from "sequelize";
// see src/data/orm/core.ts for why this explicit import is needed
import "pg";
import { getConfig, getSecret } from "./config";
import session from "express-session";
import sessionStore from "connect-session-sequelize";

const config = getConfig("sessions");

const secret = getSecret("COOKIE_SECRET");

const logging = config.orm.logging 
    ? {logging: console.log, logQueryParameters: true} : { logging: false };

export const createSessions = (app: Express) => {
    const databaseUrl = process.env.DATABASE_URL;
    const serverlessPool = { pool: { max: 3, min: 0, idle: 10000, acquire: 10000 } };
    const sequelize = databaseUrl
        ? new Sequelize(databaseUrl, { ...config.orm.settings, ...logging, ...serverlessPool })
        : new Sequelize({ ...config.orm.settings, ...logging });

    const store = new (sessionStore(session.Store))({
        db: sequelize
    })

    if (config.reset_db === true){
        sequelize.drop().then(() => store.sync());
    } else {
        store.sync();
    }

    app.use(session({
        secret, store, resave: false, saveUninitialized: true,
        cookie: { maxAge: config.maxAgeHrs * 60 * 60 * 1000,
            sameSite: false, httpOnly: false, secure: false
        }
    }))
}