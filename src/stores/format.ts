// 纯格式化函数：不依赖任何响应式状态（语言例外，见下）。
//
// 放在独立文件的原因：这些是被多个组件复用的纯函数，
// 和"应用状态"没有关系，混进 store 会让模块职责变模糊。
import { theme } from "./theme";

/** 字节数转可读大小 */
export function fmtBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/** ISO 时间转本地日期；无法解析时退化为截取前 10 位 */
export function fmtDate(s: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0, 10);
  return d.toLocaleDateString(theme.lang, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** ISO 时间转相对时间（刚刚 / N 分钟前 / N 小时前 / N 天前） */
export function fmtRelative(s: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const zh = theme.lang === "zh-CN";
  if (mins < 1) return zh ? "刚刚" : "just now";
  if (mins < 60) return zh ? `${mins} 分钟前` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return zh ? `${hours} 小时前` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return zh ? `${days} 天前` : `${days}d ago`;
  return fmtDate(s);
}

/** CVSS 分级对应的 CSS 类名 */
export function severityClass(s: string | null | undefined): string {
  return `sev-${s ?? "UNKNOWN"}`;
}
