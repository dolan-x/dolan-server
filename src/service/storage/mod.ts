import { config } from "../../../config.ts";
import BaseStorage from "./base.ts";
import LeancloudStorage from "./leancloud.ts";

// TODO(@so1ve):  如果可以的话就提取一个`getService`的函数吧
/**
 * By default, this function loads
 * storage name from config.ts
 */
export const getStorage = (tableName: string): BaseStorage => {
  const { storageType } = config;
  switch (storageType) {
    case "leancloud":
      return new LeancloudStorage(tableName);
    default:
      throw new Error("storageType is not specified or not supported");
  }
};
