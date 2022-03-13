export type User = {
  username: string;
  displayName: string;
  // avatar: string;
  password: string;
  type: "admin" | "guest";
};

export type Config = Record<string, unknown>;
