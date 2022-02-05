import { YAML } from "./deps.ts";
import { SupportedStorage } from "./src/types/mod.ts";

type Config = {
  storageType: SupportedStorage;
  leanAppId?: string;
  leanAppKey?: string;
  leanMasterKey?: string;
  leanServer?: string;
};
// 从dolanConfig.yml中读取配置
let definedConfig: Partial<Config> = {};
const decoder = new TextDecoder("utf-8");
try {
  const data = await Deno.readFile("dolanConfig.yml");
  const yaml = decoder.decode(data);
  definedConfig = YAML.parse(yaml) as Partial<Config>;
} catch { /* noop */ }
const envConfig = {
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
const config: Config = Object.assign(definedConfig, validEnvConfig) as Config; // 合并（环境变量优先级高于定义的变量）
export { config };
