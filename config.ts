import { config as envConfig } from "$dotenv";

try {
  await envConfig({ export: true });
} catch { /* Make linter happy */ }
const e = (key: string) => Deno.env.get(key);
type Config = {
  jwtKey: string;
  storageType: string;
  leanAppId?: string;
  leanAppKey?: string;
  leanMasterKey?: string;
  leanServer?: string;
  detaProjectKey?: string;
  cloudbaseEnv?: string;
  cloudbaseSecretId?: string;
  cloudbaseSecretKey?: string;
};
const config: Config = {
  jwtKey: e("JWT_KEY")!,
  storageType: e("STORAGE_TYPE")!,
  leanAppId: e("LEAN_APP_ID"),
  leanAppKey: e("LEAN_APP_KEY"),
  leanMasterKey: e("LEAN_MASTER_KEY"),
  leanServer: e("LEAN_SERVER"),
  detaProjectKey: e("DETA_PROJECT_KEY"),
  cloudbaseEnv: e("CLOUDBASE_ENV"),
  cloudbaseSecretId: e("CLOUDBASE_SECRET_ID"),
  cloudbaseSecretKey: e("CLOUDBASE_SECRET_KEY"),
};

export { config };
