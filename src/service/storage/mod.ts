import { config } from "../../../deps.ts";
import { SupportedStorage } from "../../types/mod.ts";
import BaseStorage from "./base.ts";
import LeancloudStorage from "./leancloud.ts";

const storages = {
  leancloud: LeancloudStorage,
};

type GetStorageArguments = {
  tableName: string;
  storage?: SupportedStorage;
};
/**
 * By default, this function loads
 * storage name from config.ts
 */
export const getStorage = ({ // TODO(@so1ve): 艹了 硬编码好难受 如果可以的话就提取一个`getService`的函数吧
  tableName,
  storage,
}: GetStorageArguments): BaseStorage | undefined => {
  const { storageType } = config;
  storage = storage! || storageType;
  if (!storage) throw new Error("storageType is not specified");

  return new storages[storage](tableName);
};
