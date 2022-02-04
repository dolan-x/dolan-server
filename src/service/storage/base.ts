// deno-lint-ignore-file no-explicit-any
// TODO(@so1ve): 找个时间把any删掉，细化类型
export type Where = Record<string, any>;
export type SelectOptions = {
  limit?: number;
  offset?: number;
  desc?: string;
  fields?: string[];
};
export type Access = {
  read: boolean;
  write: boolean;
};

/**
 * You have to implement this class
 * to add more storage supports
 * @abstract
 */
export default abstract class BaseStorage {
  constructor(public tableName: string) {}
  abstract select<T = any>(where: Where, options?: SelectOptions): Promise<T>;
  abstract count(where: Where, options?: any): Promise<number>;
  abstract add<T, U = any>(
    data: T,
    access?: Access,
  ): Promise<U>;
  abstract update<T>(data: T, where: Where): Promise<any>;
  abstract delete(where: Where): Promise<any>;
}
