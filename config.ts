import { config as envConfig } from "$dotenv";
import { SupportedStorages } from "dittorm";

try {
  await envConfig({ export: true });
} catch { /* Make linter happy */ }
const e = (key: string) => Deno.env.get(key);
type Config = {
  jwtKey: string;
  storageType: SupportedStorages;
  leanAppId?: string;
  leanAppKey?: string;
  leanMasterKey?: string;
  leanServer?: string;
  detaProjectKey?: string;
};
const config: Config = {
  jwtKey: e("JWT_KEY")!,
  storageType: e("STORAGE_TYPE") as SupportedStorages,
  leanAppId: e("LEAN_APP_ID"),
  leanAppKey: e("LEAN_APP_KEY"),
  leanMasterKey: e("LEAN_MASTER_KEY"),
  leanServer: e("LEAN_SERVER"),
  detaProjectKey: e("DETA_PROJECT_KEY"),
};

export { config };
