// deno-lint-ignore no-explicit-any
export function prettyJSON(v: any) {
  return JSON.stringify(v, null, 2);
}
