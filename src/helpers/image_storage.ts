import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { getEnvironment, Env } from "../config";

// Vercel Functions have a read-only filesystem (only /tmp, and it isn't
// persisted between invocations), so uploaded images can't be written to
// disk in production the way they are in local dev.
export const storeImageBuffer = async (
    buffer: Buffer,
    filename: string,
    localDir: string
): Promise<string> => {
    if (getEnvironment() === Env.Production) {
        const blob = await put(filename, buffer, {
            access: "public",
            addRandomSuffix: true
        });
        return blob.url;
    }

    if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
    }
    fs.writeFileSync(path.join(localDir, filename), buffer);
    return `/uploads/${filename}`;
};
