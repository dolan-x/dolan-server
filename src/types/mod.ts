export type SupportedStorage = "leancloud";
export type User = {
  username: string;
  displayName: string;
  // avatar: string;
  password: string;
  type: "admin" | "guest";
};
