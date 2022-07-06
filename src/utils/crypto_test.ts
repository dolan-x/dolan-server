import { assert } from "../../deps.test.ts";

import { argon2id, argon2Verify } from "./crypto.ts";

Deno.test({
  name: "Utils(Crypto): Argon2id",
  async fn() {
    const PSWD = "test";
    const hash = await argon2id(PSWD);
    assert(argon2Verify({
      password: PSWD,
      hash,
    }));
  },
});
