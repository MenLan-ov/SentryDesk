// 检查更新：tauri-plugin-updater 前端封装。
// 设计原则：手动触发（设置页按钮）、失败静默降级为提示、绝不自动重启。
import { check } from "@tauri-apps/plugin-updater";

export interface UpdateResult {
  kind: "none" | "available" | "error";
  version?: string;
  message?: string;
}

/** 检查更新。有更新时直接下载安装（被动模式，下次启动生效）。 */
export async function checkForUpdate(): Promise<UpdateResult> {
  try {
    const update = await check();
    if (!update) {
      return { kind: "none" };
    }
    // 下载并安装；installMode=passive 下不打扰用户，下次启动生效
    await update.downloadAndInstall();
    return { kind: "available", version: update.version };
  } catch (e) {
    return { kind: "error", message: String(e) };
  }
}
