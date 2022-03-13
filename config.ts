import { envConfig, SupportedStorages } from "./deps.ts";

try {
  await envConfig({ export: true });
} catch {}
const e = (key: string) => Deno.env.get(key);
type Config = {
  storageType: SupportedStorages;
  leanAppId?: string;
  leanAppKey?: string;
  leanMasterKey?: string;
  leanServer?: string;
  detaProjectKey?: string;
};
const config: Config = {
  storageType: e("STORAGE_TYPE") as SupportedStorages, // SupportedStorage
  leanAppId: e("LEAN_APP_ID"),
  leanAppKey: e("LEAN_APP_KEY"),
  leanMasterKey: e("LEAN_MASTER_KEY"),
  leanServer: e("LEAN_SERVER"),
  detaProjectKey: e("DETA_PROJECT_KEY"),
};

export { config };
