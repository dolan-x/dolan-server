export const jwtKey = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

const exportedKey = await crypto.subtle.exportKey("jwk", key);
Deno.writeFileSync(
  "./key.json",
  new TextEncoder().encode(JSON.stringify(exportedKey)),
);
