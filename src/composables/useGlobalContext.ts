// 全局右键兜底：可编辑区域保留系统菜单，其余给应用菜单
import { openMenu, copyText, SEP } from "./useContextMenu";
import { refreshCurrentView, theme } from "../store";

export function installGlobalContextMenu() {
  // 注意：必须用冒泡阶段（默认），且放在最后注册，
  // 这样组件自身的 @contextmenu 先执行并 stopPropagation，
  // 全局兜底才不会把组件的菜单覆盖掉。
  window.addEventListener("contextmenu", (e) => {
    const el = e.target as HTMLElement;
    // 输入类控件保留浏览器原生菜单（粘贴/拼写检查）
    if (el.closest("input, textarea, [contenteditable='true']")) return;
    // 组件已自带菜单的区域：组件自己处理，这里只做「无菜单时的兜底」
    if (el.closest("[data-ctx]")) {
      // 组件未处理（没 stopPropagation）时才补充最少操作
      openMenu(e, [
        {
          key: "copy-page",
          label: theme.lang === "zh-CN" ? "复制可见文本" : "Copy visible text",
          action: () => copyText(el.innerText || el.textContent || ""),
        },
      ]);
      return;
    }

    const sel = window.getSelection()?.toString().trim() ?? "";
    const zh = theme.lang === "zh-CN";
    const items = [];
    if (sel) {
      items.push({
        key: "copy-sel",
        label: zh ? "复制选中内容" : "Copy selection",
        hint: "Ctrl+C",
        action: () => copyText(sel),
      });
      items.push(SEP);
    }
    items.push({
      key: "copy-all",
      label: zh ? "复制整页文本" : "Copy page text",
      action: () => {
        const main = document.querySelector(".learn, .dash, .wrong, .paths, .home, .list-col, .detail");
        copyText(main?.textContent ?? document.body.innerText);
      },
    });
    items.push(SEP);
    items.push({
      key: "reload",
      label: zh ? "刷新当前界面" : "Refresh this view",
      // 不能整页 reload：那会把 view 重置回 home，等于把用户踢回主页。
      // 这里只重取当前视图需要的数据，界面停在原地。
      action: () => {
        void refreshCurrentView();
      },
    });
    openMenu(e, items);
  });
}
