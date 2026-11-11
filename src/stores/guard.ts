// 请求竞态守卫。
//
// 问题：快速输入或连续点击会并发发出多个请求，
// 先发的请求可能后返回，把新结果覆盖成旧结果。
// 现象很难复现（网络越快越难），但反过来一旦出现就是"界面显示的内容和输入不符"。
//
// 方案：每次发起请求前取一个递增序号，返回后比对；
// 序号已变则丢弃本次结果。不需要 AbortController——
// 本地 SQLite 查询本身很快，丢弃结果比中断请求更简单，也不会引入取消语义的复杂性。
export interface Guard {
  /** 取一个新的请求序号 */
  next(): number;
  /** 该序号是否仍是最新一次请求 */
  isCurrent(token: number): boolean;
}

export function makeGuard(): Guard {
  let seq = 0;
  return {
    next() {
      return ++seq;
    },
    isCurrent(token: number) {
      return token === seq;
    },
  };
}

/** 情报检索：关键词/筛选变化时用 */
export const searchGuard = makeGuard();
/** 教学卡列表：筛选与搜索共用 */
export const lessonGuard = makeGuard();
/** 详情类：条目详情、教学卡详情（快速连点会共用） */
export const detailGuard = makeGuard();
