import { Model } from "dittorm";

export async function checkExists(storage: Model, slug: string) {
  const exists = (await storage.select({ slug }))[0];
  return !!exists;
}
