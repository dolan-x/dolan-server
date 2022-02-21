import { config } from "../../../config.ts";
import BaseStorage from "./base.ts";

// TODO(@so1ve):  如果可以的话就提取一个`getService`的函数吧
/**
 * By default, this function loads
 * storage name from config.ts
 */
export const getStorage = async (tableName: string): Promise<BaseStorage> => {
  const { storageType } = config;
  if (!storageType) throw new Error("storageType is not specified");
  const Storage = (await import(`./${storageType}.ts`)).default;
  return new Storage(tableName);
};
