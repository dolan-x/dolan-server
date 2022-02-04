export function getIncrementId<T extends { id: number }>(objs: T[]) { // 给所有包含ID字段的数据用，比如Post、Tag、Category
  let ids = objs.map((obj) => obj.id).filter(Boolean); // 获取所有存在的ID值并且将空值剔除
  if (ids.length === 0) ids = [0]; // 如果没有ID值，则设置为0
  const currentId = Math.max(...ids) + 1; // TODO(@so1ve): 救命 我不熟悉SQL啊喂 在用户不去手动设置自增字段的情况下有没有更高效的办法实现ID自增！！
  return currentId;
}
