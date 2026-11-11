// 主题与语言状态。
//
// 独立成模块的原因：这个状态被 store、i18n 词表、格式化函数、以及多个组件同时依赖。
// 如果放在 store.ts 里，i18n/format 导入 store、store 又 re-export i18n/format，
// 就会形成循环依赖——ES module 靠提升能跑，但一旦有模块在顶层读取这些值就会拿到 undefined。
// 把主题单独下沉一层，依赖方向变成单向：theme ← store / i18n / format。
import { reactive, ref } from "vue";
// 静态导入而非动态：useWindow.ts 已经静态引入同一模块，动态引入只会多一个 chunk；
// 且 setTheme 可能瞬间 reject，统一在调用处 catch 更直观。
import { getCurrentWindow } from "@tauri-apps/api/window";
import { api } from "../api";
import type { ThemeConfig } from "../types";

export const theme = reactive<ThemeConfig>({
  mode: "light",
  accent: "#0f766e",
  density: "comfortable",
  radius: "md",
  lang: "zh-CN",
});

/** v0.7.1 起的默认主色：深青绿。为了让它跟随主题（浅色深青 / 深色薄荷），
 *  当主色等于默认值时不下发内联变量，交给 tokens.css 按主题决定。 */
export const DEFAULT_ACCENT = "#0f766e";
/** 旧版默认主色，读到就迁移，避免升级后仍停留在蓝色 */
const LEGACY_ACCENT = "#2563eb";

/** 字号档位（无障碍）：md 默认 / lg 大 / xl 特大。本地存储，不进 ThemeConfig。 */
export type FontTier = "md" | "lg" | "xl";
export const fontTier = ref<FontTier>((localStorage.getItem("sd_font_tier") as FontTier) || "md");

export function setFontTier(t: FontTier) {
  fontTier.value = t;
  localStorage.setItem("sd_font_tier", t);
  document.documentElement.setAttribute("data-fontsize", t);
}

/** 把主题写到 <html> 的 data-* 上，由 CSS 变量表接管 */
export function applyTheme() {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme.mode);
  html.setAttribute("data-density", theme.density);
  html.setAttribute("data-radius", theme.radius);
  if (theme.accent && theme.accent !== DEFAULT_ACCENT) {
    html.style.setProperty("--color-accent", theme.accent);
    html.style.setProperty("--color-accent-hover", lighten(theme.accent, 0.14));
    html.style.setProperty("--color-accent-soft", hexToSoft(theme.accent, 0.1));
    html.style.setProperty("--color-accent-soft-strong", hexToSoft(theme.accent, 0.18));
    html.style.setProperty("--color-accent-line", hexToSoft(theme.accent, 0.4));
  } else {
    // 默认主色交给 CSS：浅色深青、深色薄荷，各自对比度都够
    for (const k of [
      "--color-accent", "--color-accent-hover", "--color-accent-soft",
      "--color-accent-soft-strong", "--color-accent-line",
    ]) {
      html.style.removeProperty(k);
    }
  }
  html.setAttribute("lang", theme.lang);
  html.setAttribute("data-fontsize", fontTier.value);
  syncWindowTheme();
}

/** 让系统标题栏跟着应用主题走，避免「浅色界面 + 深色标题栏」的割裂感。
 *  非 Tauri 环境（浏览器预览）下调用会 reject，静默吞掉即可。 */
function syncWindowTheme() {
  const want = theme.mode === "dark" ? "dark" : "light";
  try {
    getCurrentWindow().setTheme(want).catch(() => {});
  } catch {
    /* 浏览器预览：没有窗口对象 */
  }
}

/** 提亮一个十六进制颜色（0–1），用于 hover 态 */
function lighten(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(rgb[0]), mix(rgb[1]), mix(rgb[2])]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

function parseHex(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** 主色转成低透明度底色，用于选中态背景 */
function hexToSoft(hex: string, alpha = 0.12): string {
  const rgb = parseHex(hex);
  if (!rgb) return `rgba(15, 118, 110, ${alpha})`;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/** 启动时读本地配置；首次无配置文件则用默认值 */
export async function loadTheme() {
  try {
    const cfg = await api.getTheme();
    Object.assign(theme, cfg);
    if (theme.accent === LEGACY_ACCENT) {
      theme.accent = DEFAULT_ACCENT;
      persistTheme();
    }
  } catch {
    // 首次启动没有 theme.json，静默使用默认值
  }
  applyTheme();
}

let saveTimer: number | undefined;

/** 变更后写回本地；300ms 去抖，避免拖动颜色时狂写磁盘 */
export function persistTheme() {
  applyTheme();
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    api.setTheme({ ...theme }).catch(() => {});
  }, 300);
}

/** 当前是否中文界面 */
export function isZh(): boolean {
  return theme.lang === "zh-CN";
}
