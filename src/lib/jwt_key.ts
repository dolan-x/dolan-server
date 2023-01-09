import { config } from "../../config.ts";

const JSONKey = JSON.parse(config.jwtKey);

export const jwtKey = await crypto.subtle.importKey(
  "jwk",
  JSONKey,
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);
