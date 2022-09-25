import { argon2id as _argon2id } from "hash-wasm";
export { argon2Verify, md5 } from "hash-wasm";

// TODO(@so1ve): 他妈的没网络时候写的，看下deno-argon2的配置
export async function argon2id(password: string) {
  return await _argon2id({
    password,
    salt: crypto.getRandomValues(new Uint8Array(20)),
    iterations: 10,
    parallelism: 10,
    hashLength: 1024,
    memorySize: 1024 * 8,
    outputType: "encoded",
  });
}
