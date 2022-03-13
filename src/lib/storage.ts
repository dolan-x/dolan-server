import { ConfigMapping, dittorm } from "../../deps.ts";
import { config } from "../../config.ts";

const configMapping = {
  leancloud: {
    appId: config.leanAppId,
    appKey: config.leanAppKey,
    masterKey: config.leanMasterKey,
  },
  deta: {
    projectKey: config.detaProjectKey,
  },
};

export const getStorage = (tableName: string) =>
  dittorm(config.storageType)(
    tableName,
    configMapping[config.storageType] as ConfigMapping[
      typeof config.storageType
    ],
  );
