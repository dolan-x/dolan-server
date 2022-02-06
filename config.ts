import { loadEnv } from "./deps.ts";
import { SupportedStorage } from "./src/types/mod.ts";

try {
  await loadEnv();
} catch {}
type Config = {
  storageType: SupportedStorage;
  leanAppId?: string;
  leanAppKey?: string;
  leanMasterKey?: string;
  leanServer?: string;
};
const config: Config = {
  storageType: Deno.env.get("STORAGE_TYPE") as SupportedStorage, // SupportedStorage
  leanAppId: Deno.env.get("LEAN_APP_ID"),
  leanAppKey: Deno.env.get("LEAN_APP_KEY"),
  leanMasterKey: Deno.env.get("LEAN_MASTER_KEY"),
  // leanServer: Deno.env.get("LEAN_SERVER"),
};

export { config };
