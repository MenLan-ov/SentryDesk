// 窗口生命周期：恢复位置尺寸、就绪后再显示、退出前保存状态
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";
import { api } from "../api";

export async function initWindow() {
  const win = getCurrentWindow();

  // 1) 恢复上次的位置与尺寸
  try {
    const s = await api.windowState();
    if (s.width > 800 && s.height > 600) {
      await win.setSize(new LogicalSize(s.width, s.height));
      if (s.x !== 0 || s.y !== 0) {
        await win.setPosition(new LogicalPosition(s.x, s.y));
      }
      if (s.maximized) await win.maximize();
    }
  } catch {
    /* 首次启动没有记录，用默认值 */
  }

  // 2) 防抖保存窗口状态
  let timer: number | undefined;
  const save = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(async () => {
      try {
        const size = await win.innerSize();
        const pos = await win.outerPosition();
        const maximized = await win.isMaximized();
        await api.saveWindowState({
          x: Math.round(pos.x),
          y: Math.round(pos.y),
          width: Math.round(size.width),
          height: Math.round(size.height),
          maximized,
        });
      } catch {
        /* 退出过程中可能失败，忽略 */
      }
    }, 600);
  };
  await win.onResized(save);
  await win.onMoved(save);

  // 3) 保证窗口可见并获得焦点（若被最小化则恢复）
  try {
    if (await win.isMinimized()) await win.unminimize();
    await win.show();
    await win.setFocus();
  } catch {
    /* ignore */
  }
}
