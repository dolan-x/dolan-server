import { Model } from "dittorm";

export async function checkExists(
  storage: Model,
  slugOrObject: string | Record<string, any>,
) {
  const object = typeof slugOrObject === "string"
    ? { slug: slugOrObject }
    : slugOrObject;
  const exists = (await storage.select(object))[0];
  return !!exists;
}
