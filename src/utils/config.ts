import { getStorage } from "../lib/mod.ts";

const configStorage = getStorage("Config");
export async function getConfig(name: string) {
  const configObj = (await configStorage.select({ name }))[0];
  return configObj.value;
}
