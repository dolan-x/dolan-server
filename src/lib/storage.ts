// @deno-types="npm:dittorm@1.0.0-beta.0/dist/src/index.d.ts"
import Dittorm from "dittorm";
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
  cloudbase: {
    env: config.cloudbaseEnv,
    secretId: config.cloudbaseSecretId,
    secretKey: config.cloudbaseSecretKey,
  },
};

// export const getStorage = (tableName: string) =>
//   dittorm(config.storageType)(
//     tableName,
//     configMapping[config.storageType] as ConfigMapping[
//       typeof config.storageType
//     ],
//   );

export const getStorage = (tableName: string) =>
  Dittorm(config.storageType)(
    tableName,
    configMapping[config.storageType as keyof typeof configMapping],
  );
