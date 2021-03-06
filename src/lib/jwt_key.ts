import { config } from "../../config.ts";

const JSONKey = JSON.parse(config.jwtKey);

export const jwtKey = await crypto.subtle.importKey(
  "jwk",
  JSONKey,
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

// export const jwtKey = await crypto.subtle.generateKey(
//   { name: "HMAC", hash: "SHA-512" },
//   true,
//   ["sign", "verify"],
// );

/*
import { prepareLocalFile } from "../../deps.ts";

// Workaround timonson/djwt#73
await prepareLocalFile("./key.json");

console.log(Deno.readTextFileSync("./key.json"));

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

const exportedKey = await crypto.subtle.exportKey("jwk", key);
Deno.writeTextFileSync(
  "./key.json",
  JSON.stringify(exportedKey),
);

console.log(Deno.readTextFileSync("./key.json"));

export const jwtKey = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);
*/
