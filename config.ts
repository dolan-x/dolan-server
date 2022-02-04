import { SupportedStorage } from "./src/types/mod.ts";

export type Config = {
  maxPageSize: number;
  storageType: SupportedStorage;
  leanAppId?: string;
  leanAppKey?: string;
  leanMasterKey?: string;
  leanServer?: string;
};
const definedConfig: Config = {
  maxPageSize: 10, // TODO(@so1ve): 之后要从数据库获取，记得删掉这一行和下面的
  storageType: "", // SupportedStorage
  leanAppId: "" // Your app ID,
  leanAppKey: "" // Your app key,
  leanMasterKey: "" // Your master key,
  // leanServer: "" // Your server URL,
};
const envConfig = {
  maxPageSize: Number(Deno.env.get("MAX_PAGE_SIZE")),
  storageType: Deno.env.get("STORAGE_TYPE"), // SupportedStorage
  leanAppId: Deno.env.get("LEAN_APP_ID"),
  leanAppKey: Deno.env.get("LEAN_APP_KEY"),
  leanMasterKey: Deno.env.get("LEAN_MASTER_KEY"),
  // leanServer: Deno.env.get("LEAN_SERVER"),
};
const validEnvConfig: Record<string, number | string> = {}; // 有设定值的Environment Variables
for (const [key, value] of Object.entries(envConfig)) {
  if (value) {
    validEnvConfig[key] = value;
  }
}
const config: Config = Object.assign(definedConfig, validEnvConfig); // 合并（环境变量优先级高于定义的变量）
export { config };
