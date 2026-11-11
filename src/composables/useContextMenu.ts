// 右键菜单状态与打开逻辑
import { reactive } from "vue";
import { openUrl } from "@tauri-apps/plugin-opener";
import { api, errMsg } from "../api";
import { showToast } from "../store";

export interface MenuItem {
  key: string;
  label: string;
  hint?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
  action: () => void | Promise<void>;
}

export const menuState = reactive<{
  open: boolean;
  x: number;
  y: number;
  items: MenuItem[];
}>({ open: false, x: 0, y: 0, items: [] });

export function openMenu(e: MouseEvent, items: MenuItem[]) {
  e.preventDefault();
  e.stopPropagation();
  menuState.items = items.filter((i) => i.separator || i.label);
  menuState.x = e.clientX;
  menuState.y = e.clientY;
  menuState.open = true;
}

export function closeMenu() {
  menuState.open = false;
}

/** 复制文本到剪贴板 */
export async function copyText(text: string, what = "") {
  try {
    await navigator.clipboard.writeText(text);
    showToast((what ? what + " " : "") + "已复制");
  } catch {
    // 剪贴板不可用时退化为选中
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("已复制");
    } catch {
      showToast("复制失败");
    }
  }
}

/** 导出单个条目为备忘 */
export const SEP: MenuItem = { key: "sep", label: "", separator: true, action: () => {} };

/** 打开外部链接 */
export async function openExternal(url: string) {
  try {
    await openUrl(url);
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

export { showToast, api };
