import * as schema from "./schema";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import path from "path";

const DB_PATH = path.resolve(__dirname, "../../data/qwerty.db");

const client = createClient({
  url: `file:${DB_PATH}`,
});

export const db = drizzle(client, { schema });
export { schema };
