// 一页式学习报告：canvas 渲染成 PNG，可放进答辩材料或分享给他人。
// 零依赖、纯本地渲染，不引入任何图表库。
import { save } from "@tauri-apps/plugin-dialog";
import { api } from "./api";
import type { LearnOverview } from "./types";

const W = 1200;
const H = 760;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function exportLearnReportPng(ov: LearnOverview, zh: boolean): Promise<string | null> {
  const path = await save({
    defaultPath: zh ? "SentryDesk-学习报告.png" : "sentrydesk-learn-report.png",
    filters: [{ name: "PNG", extensions: ["png"] }],
  });
  if (!path) return null;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  // 背景
  ctx.fillStyle = "#0f141b";
  ctx.fillRect(0, 0, W, H);
  // 顶部色带
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, "#3d7bd9");
  grad.addColorStop(1, "#35b599");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 6);

  const fg = "#e8edf3";
  const dim = "#93a1b3";
  const accent = "#5b97f0";

  // 标题
  ctx.fillStyle = fg;
  ctx.font = "700 40px 'Segoe UI', 'Microsoft YaHei', sans-serif";
  ctx.fillText("SentryDesk", 56, 84);
  ctx.font = "500 22px 'Segoe UI', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = dim;
  ctx.fillText(zh ? "学习报告" : "Learning Report", 246, 82);
  ctx.textAlign = "right";
  ctx.font = "400 16px 'Segoe UI', 'Microsoft YaHei', sans-serif";
  ctx.fillText(new Date().toLocaleDateString(zh ? "zh-CN" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  }), W - 56, 82);
  ctx.textAlign = "left";

  // 指标卡
  const kpis: { v: string; k: string; c?: string }[] = [
    {
      v: `${ov.mastered_count}/${ov.total_cards}`,
      k: zh ? "已掌握教学卡" : "Cards mastered",
      c: accent,
    },
    { v: String(ov.read_count), k: zh ? "已读卡片" : "Cards read" },
    {
      v: ov.quizzed_count ? `${Math.round(ov.avg_score)}%` : "—",
      k: zh ? "自测平均正确率" : "Avg quiz score",
      c: ov.avg_score >= 80 ? "#4fc38a" : undefined,
    },
    {
      v: `${ov.streak_days}`,
      k: zh ? "连续学习（天）" : "Day streak",
      c: ov.streak_days > 0 ? "#4fc38a" : undefined,
    },
    {
      v: String(ov.wrong_pending),
      k: zh ? "待复习错题" : "Wrong answers due",
      c: ov.wrong_pending > 0 ? "#e0a044" : "#4fc38a",
    },
  ];

  const cw = (W - 56 * 2 - 4 * 20) / 5;
  kpis.forEach((k, i) => {
    const x = 56 + i * (cw + 20);
    ctx.fillStyle = "#1a2230";
    roundRect(ctx, x, 116, cw, 118, 10);
    ctx.fill();
    ctx.fillStyle = k.c ?? fg;
    ctx.font = "700 34px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    ctx.fillText(k.v, x + 20, 172);
    ctx.fillStyle = dim;
    ctx.font = "400 14px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    ctx.fillText(k.k, x + 20, 208);
  });

  // 分类掌握情况（横向条）
  ctx.fillStyle = fg;
  ctx.font = "600 20px 'Segoe UI', 'Microsoft YaHei', sans-serif";
  ctx.fillText(zh ? "分类掌握情况" : "Mastery by category", 56, 292);

  const cats = ov.by_category.slice(0, 10);
  const barX = 300;
  const barW = W - barX - 120;
  let y = 322;
  for (const c of cats) {
    const pct = c.total ? c.mastered / c.total : 0;
    ctx.fillStyle = fg;
    ctx.font = "500 15px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    ctx.fillText(c.category, 56, y + 14);
    // 底槽
    ctx.fillStyle = "#242f42";
    roundRect(ctx, barX, y, barW, 18, 9);
    ctx.fill();
    // 填充
    if (pct > 0) {
      ctx.fillStyle = pct >= 1 ? "#4fc38a" : accent;
      roundRect(ctx, barX, y, Math.max(18, barW * pct), 18, 9);
      ctx.fill();
    }
    ctx.fillStyle = dim;
    ctx.font = "400 14px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    ctx.fillText(`${c.mastered}/${c.total}`, barX + barW + 14, y + 14);
    y += 40;
  }

  // 页脚
  ctx.fillStyle = dim;
  ctx.font = "400 13px 'Segoe UI', 'Microsoft YaHei', sans-serif";
  ctx.fillText(
    zh
      ? "由 SentryDesk 本地生成 · 全部数据存于本机，不上传 · sentrydesk"
      : "Generated locally by SentryDesk · All data stays on this machine",
    56, H - 32,
  );

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) throw new Error("PNG encode failed");
  const buf = new Uint8Array(await blob.arrayBuffer());
  return await api.saveReportPng(path, Array.from(buf));
}
