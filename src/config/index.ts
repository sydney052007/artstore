import { readFile, readFileSync } from "fs";
import { getEnvironment, Env } from "./environment";
import { merge } from "./merge";
import { config as dotenvconfig} from "dotenv";

dotenvconfig({ path: "overrides.env", override: false});

let file = process.env.SERVER_CONFIG ?? "server.config.json"
if(getEnvironment() == Env.Production){
    file = "production.server.config.json"
}
let data = JSON.parse(readFileSync(file).toString());

console.log(process.env.SERVER_CONFIG,data )
dotenvconfig({
    path: getEnvironment().toString() + ".env"
})

try {
    const envFile = getEnvironment().toString() + "." + file;
    const envData = JSON.parse(readFileSync(envFile).toString());
    merge(data, envData)
} catch {

}

export const getConfig = (path: string, defaultVal: any = undefined) : any => {
    const paths = path.split(":");
    let val = data;
    paths.forEach(p => val = val[p]);
    return val?? defaultVal;
}

export const getSecret = (name:string) => {
    const secret = process.env[name];
    if(secret === undefined){
        throw new Error(`Undefined secret: ${name}`);
    }
    return secret;
}

export { getEnvironment, Env };