<script setup lang="ts">
// 看板：纯 CSS 图表，零依赖，包体积不增加
import { computed, onMounted, ref } from "vue";
import type { DashboardData, LearnOverview } from "../types";
import { api, errMsg } from "../api";
import { jumpToCwe, showToast, theme } from "../store";

const zh = computed(() => theme.lang === "zh-CN");
const data = ref<DashboardData | null>(null);
const learn = ref<LearnOverview | null>(null);
const loading = ref(true);
const range = ref(30);
const tab = ref<"trend" | "severity" | "source" | "product" | "cwe">("trend");

async function load() {
  loading.value = true;
  try {
    const [d, l] = await Promise.all([api.dashboard(range.value), api.learnOverview()]);
    data.value = d;
    learn.value = l;
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    loading.value = false;
  }
}
onMounted(load);

/** 平均正确率：quiz_score 是 0–100 的分值 */
const avgScorePct = computed(() => Math.round(learn.value?.avg_score ?? 0));

/** 导出一页式学习报告 PNG（可放进答辩材料） */
const exporting = ref(false);
async function exportReport() {
  if (!learn.value || exporting.value) return;
  exporting.value = true;
  try {
    const { exportLearnReportPng } = await import("../report");
    const saved = await exportLearnReportPng(learn.value, zh.value);
    if (saved) showToast((zh.value ? "报告已保存：" : "Report saved: ") + saved);
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    exporting.value = false;
  }
}

/** 趋势图：把 daily 补全为连续日期 */
const trend = computed(() => {
  if (!data.value) return [];
  const map = new Map(data.value.daily.map((d) => [d.date, d.count]));
  const out: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = range.value - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
});

const maxDaily = computed(() => Math.max(1, ...trend.value.map((d) => d.count)));
/** 峰值与总量：空库时不再显示「峰值 1」这种假数据（v0.8.1 修） */
const trendPeak = computed(() => Math.max(0, ...trend.value.map((d) => d.count)));
const trendTotal = computed(() => trend.value.reduce((a, d) => a + d.count, 0));

/** 严重等级：按固定顺序 + 占比 */
const sevOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"];
const sevData = computed(() => {
  if (!data.value) return [];
  const map = new Map(data.value.severity.map((s) => [s.severity, s.count]));
  const total = data.value.total || 1;
  return sevOrder.map((k) => ({
    key: k,
    count: map.get(k) ?? 0,
    pct: Math.round(((map.get(k) ?? 0) / total) * 100),
  }));
});

const sevLabel = (k: string) =>
  zh.value
    ? { CRITICAL: "严重", HIGH: "高危", MEDIUM: "中危", LOW: "低危", UNKNOWN: "未评级" }[k] ?? k
    : { CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low", UNKNOWN: "Unrated" }[k] ?? k;

const sourceData = computed(() => {
  if (!data.value) return [];
  const total = data.value.sources.reduce((a, b) => a + b.count, 0) || 1;
  return data.value.sources.map((s) => ({ ...s, pct: Math.round((s.count / total) * 100) }));
});

const maxProduct = computed(() =>
  Math.max(1, ...(data.value?.top_products.map((p) => p.count) ?? [1]))
);
const maxCwe = computed(() => Math.max(1, ...(data.value?.top_cwe.map((p) => p.count) ?? [1])));

const kevPct = computed(() => {
  if (!data.value?.total) return 0;
  return Math.round((data.value.kev_count / data.value.total) * 100);
});
const ratedPct = computed(() => {
  if (!data.value?.total) return 0;
  return Math.round((data.value.rated_count / data.value.total) * 100);
});

const tabs = computed(() => [
  { k: "trend", label: zh.value ? "时间趋势" : "Trend" },
  { k: "severity", label: zh.value ? "严重分级" : "Severity" },
  { k: "source", label: zh.value ? "来源占比" : "Sources" },
  { k: "product", label: zh.value ? "受影响产品" : "Products" },
  { k: "cwe", label: zh.value ? "缺陷类型" : "CWE" },
] as const);

function pickCwe(cwe: string) {
  jumpToCwe(cwe);
}
</script>

<template>
  <div class="dash">
    <header class="dh">
      <div>
        <h1 class="dh-title">{{ zh ? '数据看板' : 'Dashboard' }}</h1>
        <p class="dh-sub">
          {{ zh ? '本地情报库的分布与趋势，全部数据来自本机' : 'Distribution and trends from your local database' }}
        </p>
      </div>
      <div class="dh-actions">
        <button :disabled="exporting || !learn" @click="exportReport">
          {{ exporting ? (zh ? '生成中…' : 'Rendering…') : (zh ? '导出学习报告' : 'Export report') }}
        </button>
        <select v-model.number="range" @change="load">
          <option :value="7">{{ zh ? '近 7 天' : '7 days' }}</option>
          <option :value="30">{{ zh ? '近 30 天' : '30 days' }}</option>
          <option :value="90">{{ zh ? '近 90 天' : '90 days' }}</option>
        </select>
        <button @click="load">{{ zh ? '刷新' : 'Refresh' }}</button>
      </div>
    </header>

    <!-- 学习成果：这是「工作台」的核心指标，放第一排 -->
    <section v-if="learn" class="kpis learn-kpis">
      <div class="kpi">
        <span class="kpi-v mono accent">{{ learn.mastered_count }}<small>/{{ learn.total_cards }}</small></span>
        <span class="kpi-k">{{ zh ? '已掌握教学卡' : 'Cards mastered' }}</span>
      </div>
      <div class="kpi">
        <span class="kpi-v mono">{{ learn.read_count }}</span>
        <span class="kpi-k">{{ zh ? '已读卡片' : 'Cards read' }}</span>
      </div>
      <div class="kpi">
        <span class="kpi-v mono" :class="avgScorePct >= 80 ? 'ok' : avgScorePct >= 60 ? '' : 'warn'">
          {{ learn.quizzed_count ? avgScorePct + '%' : '—' }}
        </span>
        <span class="kpi-k">{{ zh ? '自测平均正确率' : 'Avg quiz score' }}</span>
      </div>
      <div class="kpi">
        <span class="kpi-v mono" :class="learn.streak_days > 0 ? 'ok' : ''">{{ learn.streak_days }}</span>
        <span class="kpi-k">{{ zh ? '连续学习（天）' : 'Day streak' }}</span>
      </div>
      <div class="kpi">
        <span class="kpi-v mono" :class="learn.wrong_pending > 0 ? 'warn' : 'ok'">{{ learn.wrong_pending }}</span>
        <span class="kpi-k">{{ zh ? '待复习错题' : 'Wrong answers due' }}</span>
      </div>
    </section>

    <!-- 情报库指标 -->
    <section v-if="data" class="kpis">
      <div class="kpi">
        <span class="kpi-v mono">{{ data.total }}</span>
        <span class="kpi-k">{{ zh ? '情报总数' : 'Total items' }}</span>
      </div>
      <div class="kpi">
        <span class="kpi-v mono">{{ data.recent_30d }}</span>
        <span class="kpi-k">{{ zh ? '近 30 天新增' : 'Added in 30d' }}</span>
      </div>
      <div class="kpi">
        <span class="kpi-v mono danger">{{ data.kev_count }}</span>
        <span class="kpi-k">{{ zh ? '在野利用' : 'Known exploited' }} · {{ kevPct }}%</span>
      </div>
      <div class="kpi">
        <span class="kpi-v mono">{{ ratedPct }}%</span>
        <span class="kpi-k">{{ zh ? '已有 CVSS 评分' : 'Rated' }}</span>
      </div>
      <div class="kpi">
        <span class="kpi-v mono" :class="data.collect_fail > 0 ? 'warn' : 'ok'">
          {{ data.collect_ok }}/{{ data.collect_ok + data.collect_fail }}
        </span>
        <span class="kpi-k">{{ zh ? '近 7 天采集成功率' : 'Collect success 7d' }}</span>
      </div>
    </section>

    <!-- 图表区 -->
    <section class="charts">
      <nav class="tabs">
        <button
          v-for="t in tabs"
          :key="t.k"
          :class="['tb', { active: tab === t.k }]"
          @click="tab = t.k"
        >{{ t.label }}</button>
      </nav>

      <div v-if="loading" class="loading">
        <div class="skeleton" style="height: 220px; width: 100%"></div>
      </div>

      <!-- 时间趋势：柱状图 -->
      <div v-else-if="tab === 'trend'" class="chart-box fill">
        <div v-if="trendTotal === 0" class="empty">
          {{ zh ? '这段时间还没有新条目。去左侧点「立即采集」，或把时间窗切到 30 / 90 天。' : 'No new items in this window. Run Collect, or widen the window to 30 / 90 days.' }}
        </div>
        <div v-else class="bars">
          <div
            v-for="(d, i) in trend"
            :key="i"
            class="bar-wrap"
            :title="d.date + ' · ' + d.count"
          >
            <div class="bar" :style="{ height: (d.count / maxDaily) * 100 + '%' }"></div>
          </div>
        </div>
        <div class="axis">
          <span v-for="(d, i) in trend" :key="i" class="axis-l">
            <template v-if="i % Math.ceil(trend.length / 6) === 0">{{ d.date.slice(5) }}</template>
          </span>
        </div>
        <p class="chart-note">
          {{ zh ? '纵轴为当日新增条目数' : 'Bars show items added per day' }}
          · {{ zh ? '峰值' : 'peak' }} {{ trendPeak }}
          · {{ zh ? '合计' : 'total' }} {{ trendTotal }}
        </p>
      </div>

      <!-- 严重分级：横向条 -->
      <div v-else-if="tab === 'severity'" class="chart-box">
        <div v-if="!data?.total" class="empty">{{ zh ? '暂无条目，无法统计分级' : 'No items to grade yet' }}</div>
        <div v-for="s in sevData" :key="s.key" v-show="data?.total" class="hrow">
          <span :class="['sev-dot', 'sev-' + s.key]"></span>
          <span class="hl">{{ sevLabel(s.key) }}</span>
          <div class="hbar"><div :class="['hfill', 'f-' + s.key]" :style="{ width: s.pct + '%' }"></div></div>
          <span class="hv mono">{{ s.count }}</span>
          <span class="hp mono">{{ s.pct }}%</span>
        </div>
      </div>

      <!-- 来源占比 -->
      <div v-else-if="tab === 'source'" class="chart-box">
        <div v-if="!sourceData.length" class="empty">{{ zh ? '暂无来源数据' : 'No source data' }}</div>
        <div v-for="s in sourceData" :key="s.source_key" class="hrow">
          <span class="hl w2">{{ s.name }}</span>
          <div class="hbar"><div class="hfill f-src" :style="{ width: s.pct + '%' }"></div></div>
          <span class="hv mono">{{ s.count }}</span>
          <span class="hp mono">{{ s.pct }}%</span>
        </div>
      </div>

      <!-- 受影响产品 -->
      <div v-else-if="tab === 'product'" class="chart-box">
        <div v-if="!data?.top_products.length" class="empty">{{ zh ? '暂无产品数据' : 'No product data' }}</div>
        <div v-for="p in data?.top_products" :key="p.key" class="hrow">
          <span class="hl w3" :title="p.key">{{ p.key }}</span>
          <div class="hbar"><div class="hfill f-prod" :style="{ width: (p.count / maxProduct) * 100 + '%' }"></div></div>
          <span class="hv mono">{{ p.count }}</span>
        </div>
      </div>

      <!-- CWE 分布（可点击跳转） -->
      <div v-else-if="tab === 'cwe'" class="chart-box">
        <div v-if="!data?.top_cwe.length" class="empty">{{ zh ? '暂无 CWE 数据' : 'No CWE data' }}</div>
        <button
          v-for="c in data?.top_cwe"
          :key="c.key"
          class="hrow clickable"
          @click="pickCwe(c.key)"
        >
          <span class="hl mono w1">{{ c.key }}</span>
          <div class="hbar"><div class="hfill f-cwe" :style="{ width: (c.count / maxCwe) * 100 + '%' }"></div></div>
          <span class="hv mono">{{ c.count }}</span>
        </button>
      </div>
    </section>

    <p class="foot-note">
      {{ zh
        ? '所有图表由本地 SQLite 实时聚合生成，无外部图表库、无网络请求。'
        : 'All charts are aggregated locally from SQLite. No chart library, no network calls.' }}
    </p>
  </div>
</template>

<style scoped>
.dash { flex: 1; overflow-y: auto; background: var(--color-bg-elevated); padding: var(--space-6) var(--space-6) var(--space-7); display: flex; flex-direction: column; }

.dh { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-5); }
.dh-title { margin: 0 0 2px; font-size: 21px; font-weight: 650; color: var(--color-text-primary); letter-spacing: -0.02em; }
.dh-sub { margin: 0; font-size: var(--font-xs); color: var(--color-text-tertiary); }
.dh-actions { display: flex; gap: var(--space-2); align-items: center; }

.kpis { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--space-3); margin-bottom: var(--space-5); }
@media (max-width: 1050px) { .kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.kpi {
  display: flex; flex-direction: column; gap: 2px;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.kpi-v { font-size: 24px; font-weight: 700; line-height: 1.1; color: var(--color-text-primary); }
.kpi-v small { font-size: 13px; font-weight: 500; color: var(--color-text-tertiary); }
.kpi-v.danger { color: var(--color-sev-critical); }
.kpi-v.warn { color: var(--color-sev-high); }
.kpi-v.ok { color: var(--color-sev-low); }
.kpi-v.accent { color: var(--color-accent); }
.learn-kpis .kpi { border-color: var(--color-accent); border-left-width: 3px; }
.kpi-k { font-size: 11px; color: var(--color-text-tertiary); }

.charts {
  flex: 1; min-height: 300px;
  display: flex; flex-direction: column;
  border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden;
}
.tabs { display: flex; border-bottom: 1px solid var(--color-border); background: var(--color-bg-subtle); flex-shrink: 0; }
.tb {
  border: none; border-radius: 0; background: transparent;
  padding: 8px var(--space-4);
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
}
.tb:hover { background: transparent; color: var(--color-text-primary); }
.tb.active { color: var(--color-accent); border-bottom-color: var(--color-accent); font-weight: 600; }

.loading { padding: var(--space-4); }
.chart-box { flex: 1; padding: var(--space-4); display: flex; flex-direction: column; justify-content: space-evenly; }
.chart-box.fill { justify-content: flex-start; }

/* 柱状图 */
.bars { display: flex; align-items: flex-end; gap: 2px; height: 200px; flex: 1; min-height: 150px; }
.bar-wrap { flex: 1; display: flex; align-items: flex-end; height: 100%; min-width: 2px; }
.bar {
  width: 100%;
  background: var(--color-accent);
  border-radius: 1px 1px 0 0;
  min-height: 1px;
  opacity: 0.85;
  transition: opacity var(--duration-fast) ease;
}
.bar-wrap:hover .bar { opacity: 1; }
.axis { display: flex; margin-top: 4px; }
.axis-l { flex: 1; font-size: 9px; color: var(--color-text-tertiary); font-family: var(--font-mono); }
.chart-note { margin: var(--space-2) 0 0; font-size: 11px; color: var(--color-text-tertiary); }

/* 横向条 */
.hrow {
  display: flex; align-items: center; gap: var(--space-2);
  padding: 5px 0;
  font-size: var(--font-xs);
  width: 100%; border: none; background: transparent; text-align: left;
  border-radius: var(--radius-sm);
}
.hrow.clickable { cursor: pointer; }
.hrow.clickable:hover { background: var(--color-bg-hover); }
.hl { width: 96px; flex-shrink: 0; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hl.w1 { width: 74px; }
.hl.w2 { width: 170px; }
.hl.w3 { width: 210px; }
.hbar { flex: 1; height: 8px; background: var(--color-bg-subtle); border-radius: 4px; overflow: hidden; }
.hfill { height: 100%; border-radius: 4px; min-width: 2px; }
.f-CRITICAL { background: var(--color-sev-critical); }
.f-HIGH { background: var(--color-sev-high); }
.f-MEDIUM { background: var(--color-sev-medium); }
.f-LOW { background: var(--color-sev-low); }
.f-UNKNOWN { background: var(--color-text-tertiary); }
.f-src { background: var(--color-accent); }
.f-prod { background: #4a8fb5; }
.f-cwe { background: #b5843d; }
.hv { width: 48px; text-align: right; color: var(--color-text-primary); }
.hp { width: 40px; text-align: right; color: var(--color-text-tertiary); }
.empty { color: var(--color-text-tertiary); font-size: var(--font-sm); padding: var(--space-6); text-align: center; }

.foot-note { margin: var(--space-4) 0 0; font-size: 11px; color: var(--color-text-tertiary); }
</style>
