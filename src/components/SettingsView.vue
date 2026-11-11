<script setup lang="ts">
import { APP_VERSION_LABEL } from "../version";

/** 检查更新（tauri-plugin-updater，端点在 tauri.conf.json 配置） */
const checkingUpdate = ref(false);
const updateMsg = ref("");
async function doCheckUpdate() {
  if (checkingUpdate.value) return;
  checkingUpdate.value = true;
  updateMsg.value = "";
  try {
    const { checkForUpdate } = await import("../updater");
    const r = await checkForUpdate();
    updateMsg.value =
      r.kind === "none"
        ? (zh.value ? "已是最新版本" : "You are up to date")
        : r.kind === "available"
          ? (zh.value ? `新版本 v${r.version} 已下载，下次启动生效` : `v${r.version} downloaded — takes effect on next launch`)
          : (zh.value ? "检查失败（暂时连不上更新源，可直接用新版安装包覆盖安装）" : "Check failed (update source unreachable — just run a newer installer)");
  } catch {
    updateMsg.value = zh.value ? "检查失败，可直接用新版安装包覆盖安装" : "Check failed — run a newer installer instead";
  } finally {
    checkingUpdate.value = false;
  }
}
// 设置页：合规信息、数据管理、主题、快捷键、关于
import { computed, onMounted, ref } from "vue";
import { open } from "@tauri-apps/plugin-dialog";
import { fontTier, setFontTier,  fmtBytes, persistTheme, showToast, theme, t } from "../store";
import { api, errMsg } from "../api";
import type { BackupResult, ComplianceInfo, ItemExportResult } from "../types";

const zh = computed(() => theme.lang === "zh-CN");
const info = ref<ComplianceInfo | null>(null);
const loading = ref(true);
const busy = ref("");
const lastBackup = ref<BackupResult | null>(null);
const lastExport = ref<ItemExportResult | null>(null);
const restorePath = ref("");
const tab = ref<"compliance" | "data" | "collect" | "theme" | "keys" | "about">("compliance");

/** 采集日志行（后端 collect_logs 返回的扁平 JSON） */
interface CollectLog {
  source_key: string;
  url: string;
  http_status: number | null;
  elapsed_ms: number | null;
  ok: boolean;
  reason: string;
  started_at: string;
}
const logs = ref<CollectLog[]>([]);
const logsLoading = ref(false);

async function loadLogs() {
  logsLoading.value = true;
  try {
    logs.value = (await api.collectLogs(120)) as unknown as CollectLog[];
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    logsLoading.value = false;
  }
}

/** 采集整体健康度：成功率与平均耗时比单条记录更能说明问题 */
const logStats = computed(() => {
  const n = logs.value.length;
  if (!n) return null;
  const ok = logs.value.filter((l) => l.ok).length;
  const avg = Math.round(logs.value.reduce((sum, l) => sum + (l.elapsed_ms ?? 0), 0) / n);
  return { n, ok, fail: n - ok, rate: Math.round((ok / n) * 100), avg };
});

/** 按源聚合：最近一次结果、成功率、连续失败次数（连续失败才值得处理） */
const bySource = computed(() => {
  const m = new Map<
    string,
    { key: string; ok: number; fail: number; latestOk: boolean; latestAt: string; sum: number; n: number; avg: number; streak: number }
  >();
  for (const l of logs.value) {
    let e = m.get(l.source_key);
    if (!e) {
      e = { key: l.source_key, ok: 0, fail: 0, latestOk: l.ok, latestAt: l.started_at, sum: 0, n: 0, avg: 0, streak: 0 };
      m.set(l.source_key, e);
    }
    if (l.ok) e.ok++;
    else e.fail++;
    e.n++;
    e.sum += l.elapsed_ms ?? 0;
  }
  for (const e of m.values()) {
    e.avg = Math.round(e.sum / Math.max(1, e.n));
    let streak = 0;
    for (const l of logs.value) {
      if (l.source_key !== e.key) continue;
      if (l.ok) break;
      streak++;
    }
    e.streak = streak;
  }
  return [...m.values()].sort((a, b) => b.streak - a.streak || a.key.localeCompare(b.key));
});

/** 切 tab 时按需拉数据，避免每次进设置都查库 */
function pickTab(k: typeof tab.value) {
  tab.value = k;
  if (k === "collect" && !logs.value.length) loadLogs();
}

const statusText = (l: CollectLog) => (l.ok ? (zh.value ? '成功' : 'OK') : l.reason || (zh.value ? '失败' : 'Failed'));

/** 采集记录看的是「什么时候跑的」，日期不够用，补到分钟（本地时区） */
const fmtTime = (raw: string) => {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.slice(0, 16).replace("T", " ");
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

async function load() {
  loading.value = true;
  try {
    info.value = await api.complianceInfo();
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function doBackup() {
  if (busy.value) return;
  busy.value = zh.value ? "正在备份…" : "Backing up…";
  try {
    lastBackup.value = await api.backupDatabase();
    showToast(zh.value ? "备份完成" : "Backup complete");
    await load();
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    busy.value = "";
  }
}

async function pickRestoreFile() {
  try {
    const picked = await open({
      multiple: false,
      title: zh.value ? "选择备份文件" : "Choose a backup file",
      filters: [
        { name: zh.value ? "数据库备份" : "Database backup", extensions: ["db"] },
        { name: zh.value ? "所有文件" : "All files", extensions: ["*"] },
      ],
    });
    if (typeof picked === "string" && picked) restorePath.value = picked;
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

async function doRestore() {
  if (!restorePath.value.trim()) {
    showToast(zh.value ? "请填写备份文件完整路径" : "Enter the backup file path");
    return;
  }
  busy.value = zh.value ? "正在恢复…" : "Restoring…";
  try {
    const msg = await api.restoreDatabase(restorePath.value.trim());
    showToast(msg);
    restorePath.value = "";
    await load();
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    busy.value = "";
  }
}

async function doExportItems() {
  if (busy.value) return;
  busy.value = zh.value ? "正在导出…" : "Exporting…";
  try {
    lastExport.value = await api.exportItemsJson();
    showToast(
      (zh.value ? "已导出 " : "Exported ") + lastExport.value.count + (zh.value ? " 条" : " items")
    );
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    busy.value = "";
  }
}

async function openDir() {
  try {
    await api.openDataDir();
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

async function exportTheme() {
  try {
    const json = await api.exportTheme();
    await navigator.clipboard.writeText(json);
    showToast(zh.value ? "主题配置已复制到剪贴板" : "Theme config copied to clipboard");
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

async function importTheme() {
  try {
    const txt = await navigator.clipboard.readText();
    if (!txt.trim()) {
      showToast(zh.value ? "剪贴板为空" : "Clipboard is empty");
      return;
    }
    const cfg = await api.importTheme(txt);
    Object.assign(theme, cfg);
    persistTheme();
    showToast(zh.value ? "主题配置已导入" : "Theme imported");
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

/** 每个来源覆盖哪些内容 —— 用户关心「这条知识从哪来」，不关心接口类型 */
const coversLabel = (key: string) => {
  const m: Record<string, [string, string]> = {
    nvd: ["漏洞编号、评分与描述", "CVE IDs, scores, descriptions"],
    ghsa: ["开源组件安全公告", "Open-source advisories"],
    cisa_kev: ["在野利用清单", "Known-exploited list"],
    cisa_news: ["官方安全公告", "Official announcements"],
    ncsc_uk: ["国家级安全公告", "National advisories"],
    nscsc_uk: ["国家级安全公告", "National advisories"],
  };
  const hit = m[key];
  return hit ? (zh.value ? hit[0] : hit[1]) : key;
};

const tabs = computed(() => [
  { k: "compliance", label: zh.value ? "内容来源" : "Content sources" },
  { k: "data", label: zh.value ? "数据" : "Data" },
  { k: "collect", label: zh.value ? "更新记录" : "Update log" },
  { k: "theme", label: zh.value ? "外观" : "Appearance" },
  { k: "keys", label: zh.value ? "快捷键" : "Shortcuts" },
  { k: "about", label: zh.value ? "关于" : "About" },
] as const);

const shortcuts = computed(() => [
  { k: "Ctrl / Cmd + K", d: zh.value ? "聚焦搜索框" : "Focus search" },
  { k: "Ctrl / Cmd + 1", d: zh.value ? "学习首页" : "Learn home" },
  { k: "Ctrl / Cmd + 2", d: zh.value ? "学习路径" : "Learning paths" },
  { k: "Ctrl / Cmd + 3", d: zh.value ? "情报检索" : "Intel search" },
  { k: "Ctrl / Cmd + 4", d: zh.value ? "数据看板" : "Dashboard" },
  { k: "Ctrl / Cmd + 5", d: zh.value ? "错题本" : "Mistakes" },
  { k: "Ctrl / Cmd + 6", d: zh.value ? "设置" : "Settings" },
  { k: "Esc", d: zh.value ? "清空搜索 / 关闭弹窗" : "Clear search / close popover" },
  { k: "↑ / ↓", d: zh.value ? "切换列表选中项" : "Move list selection" },
  { k: "Enter / Space", d: zh.value ? "选中聚焦的条目" : "Select focused item" },
]);
</script>

<template>
  <div class="settings">
    <header class="sh">
      <h1 class="sh-title">{{ zh ? '设置' : 'Settings' }}</h1>
      <p class="sh-sub">
        {{ zh ? '合规边界、数据管理与外观配置。所有设置只保存在本机。' : 'Compliance boundaries, data management, and appearance. Everything stays local.' }}
      </p>
    </header>

    <nav class="tabs">
      <button
        v-for="x in tabs"
        :key="x.k"
        :class="['tb', { active: tab === x.k }]"
        @click="pickTab(x.k)"
      >{{ x.label }}</button>
    </nav>

    <div v-if="loading" class="skeleton" style="height: 300px"></div>

    <!-- ========== 合规 ========== -->
    <section v-else-if="tab === 'compliance' && info" class="pane">
      <div class="card offline">
        <span class="badge-ok">✓ {{ zh ? '仅本地运行' : 'Local only' }}</span>
        <p class="offline-text">
          {{ zh
            ? '安装包就是一份完整应用：语言本体（界面与逻辑）+ 内容（知识点、题目与条目）。不联网也能用，不上传任何数据、无账号、无遥测。'
            : 'The installer is the whole app: the program itself plus all content (cards, questions, records). Works with no network, uploads nothing, no accounts, no telemetry.' }}
        </p>
      </div>

      <h2 class="sec">{{ zh ? '内容来源' : 'Content sources' }}</h2>
      <p class="hint" style="margin-bottom:10px">
        {{ zh
          ? '知识点、题目和条目都随安装包分发，每条内容标注它来自哪里。下表是内置内容的来源与收录量。'
          : 'Cards, questions and records ship with the installer, each labeled with where it comes from. Below are the bundled sources and how many items each contributes.' }}
      </p>
      <table class="tbl" v-if="info.sources && info.sources.length">
        <thead>
          <tr>
            <th>{{ zh ? '来源' : 'Source' }}</th>
            <th>{{ zh ? '覆盖内容' : 'Covers' }}</th>
            <th class="num">{{ zh ? '条目' : 'Items' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in info.sources" :key="s.key">
            <td>
              <div class="src-name">{{ s.name }}</div>
            </td>
            <td class="small">{{ coversLabel(s.key) }}</td>
            <td class="num mono">{{ s.item_count }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="hint">{{ zh ? '数据源列表为空' : 'Source list is empty' }}</div>
    </section>

    <!-- ========== 数据 ========== -->
    <section v-else-if="tab === 'data' && info" class="pane">
      <h2 class="sec">{{ zh ? '数据位置' : 'Data location' }}</h2>
      <div class="path-box">
        <div class="path-row"><span>{{ zh ? '数据目录' : 'Data dir' }}</span><code class="mono">{{ info.data_dir }}</code></div>
        <div class="path-row"><span>{{ zh ? '数据库' : 'Database' }}</span><code class="mono">{{ info.db_path }}</code></div>
        <div class="path-row"><span>{{ zh ? '库体积' : 'DB size' }}</span><b class="mono">{{ fmtBytes(info.db_bytes) }}</b></div>
      </div>
      <div class="row-btns">
        <button @click="openDir">{{ zh ? '打开数据目录' : 'Open data folder' }}</button>
        <button @click="load">{{ zh ? '刷新' : 'Refresh' }}</button>
      </div>

      <h2 class="sec">{{ zh ? '备份' : 'Backup' }}</h2>
      <p class="hint">
        {{ zh
          ? '备份会先做 WAL checkpoint 再拷贝整库，导出一个完整的 .db 文件到数据目录。'
          : 'A WAL checkpoint runs before copying the whole database into a complete .db file in the data dir.' }}
      </p>
      <div class="row-btns">
        <button class="primary" :disabled="!!busy" @click="doBackup">
          {{ busy || (zh ? '立即备份' : 'Back up now') }}
        </button>
      </div>
      <div v-if="lastBackup" class="result">
        <div class="ok">✓ {{ zh ? '备份完成' : 'Backup done' }}</div>
        <div class="mono small">{{ lastBackup.path }}</div>
        <div class="small">
          {{ fmtBytes(lastBackup.bytes) }} ·
          {{ lastBackup.items }} {{ zh ? '条目' : 'items' }} ·
          {{ lastBackup.notes }} {{ zh ? '笔记' : 'notes' }} ·
          {{ lastBackup.progress }} {{ zh ? '学习记录' : 'progress' }}
        </div>
      </div>

      <h2 class="sec">{{ zh ? '恢复' : 'Restore' }}</h2>
      <p class="hint">
        {{ zh
          ? '点「选择文件」挑备份，或粘贴完整路径。恢复前会自动把当前库另存一份，避免误操作丢数据。恢复后需重启生效。'
          : 'Click "Choose file" to pick a backup, or paste the full path. The current DB is saved first to avoid data loss. Restart after restoring.' }}
      </p>
      <div class="restore-row">
        <input v-model="restorePath" :placeholder="zh ? 'C:\...\sentrydesk-backup-xxxx.db' : 'C:\\...\\sentrydesk-backup-xxxx.db'" />
        <button :disabled="!!busy" @click="pickRestoreFile">{{ zh ? '选择文件' : 'Choose file' }}</button>
        <button class="primary" :disabled="!!busy" @click="doRestore">{{ zh ? '恢复' : 'Restore' }}</button>
      </div>

      <h2 class="sec">{{ zh ? '导出条目（JSON）' : 'Export items (JSON)' }}</h2>
      <p class="hint">
        {{ zh
          ? '导出为纯元数据 JSON：CVE 编号、标题、摘要、CVSS、受影响产品、发布时间、来源链接。不含任何第三方原文全文。'
          : 'Exports metadata-only JSON: CVE ID, title, summary, CVSS, products, publish time, source link. No third-party full text.' }}
      </p>
      <div class="row-btns">
        <button :disabled="!!busy" @click="doExportItems">{{ zh ? '导出 JSON' : 'Export JSON' }}</button>
      </div>
      <div v-if="lastExport" class="result">
        <div class="ok">✓ {{ zh ? '导出完成' : 'Export done' }}</div>
        <div class="mono small">{{ lastExport.path }}</div>
        <div class="small">{{ lastExport.count }} {{ zh ? '条 · ' : 'items · ' }}{{ fmtBytes(lastExport.bytes) }}</div>
      </div>
    </section>

    <!-- ========== 采集记录 ========== -->
    <section v-else-if="tab === 'collect'" class="pane">
      <p class="hint">
        {{ zh
          ? '每次采集的每个源都留一行记录：状态码、耗时、失败原因。采集失败不会弹系统窗口，只会出现在这里——这是排查「为什么没新条目」的唯一入口。'
          : 'One row per source per run: status code, latency, failure reason. Failures never pop a system dialog, they land here - the only place to answer "why no new items".' }}
      </p>

      <div class="row-btns">
        <button class="primary" :disabled="logsLoading" @click="loadLogs">
          {{ logsLoading ? (zh ? '读取中…' : 'Loading…') : (zh ? '刷新记录' : 'Refresh') }}
        </button>
        <span v-if="logStats" class="log-sum small mono">
          {{ zh
            ? `${logStats.n} 次 · 成功率 ${logStats.rate}% · 平均 ${logStats.avg} ms`
            : `${logStats.n} runs · ${logStats.rate}% ok · ${logStats.avg} ms avg` }}
        </span>
      </div>

      <div v-if="bySource.length" class="src-grid">
        <div v-for="sp in bySource" :key="sp.key" :class="['src-card', { bad: sp.streak > 0 }]">
          <div class="src-top">
            <b class="mono">{{ sp.key }}</b>
            <span :class="['pill', sp.latestOk ? 'pill-ok' : 'pill-bad']">
              {{ sp.latestOk ? (zh ? '正常' : 'OK') : (zh ? '失败' : 'Fail') }}
            </span>
          </div>
          <div class="small mono src-nums">
            {{ zh ? `成功 ${sp.ok} · 失败 ${sp.fail} · 均 ${sp.avg} ms` : `${sp.ok} ok · ${sp.fail} fail · ${sp.avg} ms` }}
          </div>
          <div v-if="sp.streak > 0" class="src-warn small">
            {{ zh ? `连续失败 ${sp.streak} 次` : `${sp.streak} failures in a row` }}
          </div>
          <div class="small src-time">{{ fmtTime(sp.latestAt) }}</div>
        </div>
      </div>

      <table class="tbl log-tbl" v-if="logs.length">
        <thead>
          <tr>
            <th style="width: 130px">{{ zh ? '时间' : 'Time' }}</th>
            <th style="width: 110px">{{ zh ? '源' : 'Source' }}</th>
            <th style="width: 70px" class="num">{{ zh ? '状态' : 'Status' }}</th>
            <th style="width: 70px" class="num">{{ zh ? '耗时' : 'ms' }}</th>
            <th>{{ zh ? '结果' : 'Result' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(l, i) in logs.slice(0, 60)" :key="i" :class="{ 'log-bad': !l.ok }">
            <td class="mono small">{{ fmtTime(l.started_at) }}</td>
            <td class="mono small">{{ l.source_key }}</td>
            <td class="num mono small">{{ l.http_status ?? '—' }}</td>
            <td class="num mono small">{{ l.elapsed_ms ?? '—' }}</td>
            <td class="small" :class="l.ok ? 'ok-cell' : 'bad-cell'" :title="l.url">{{ statusText(l) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="!logsLoading" class="empty-log">
        <p class="el-t">{{ zh ? '还没有采集记录' : 'No collection runs yet' }}</p>
        <p class="el-h">
          {{ zh
            ? '点左下角「立即采集」跑一次，之后这里会显示每个源的结果。'
            : 'Hit Collect in the sidebar once; per-source results will show up here.' }}
        </p>
      </div>
    </section>

    <!-- ========== 外观 ========== -->
    <section v-else-if="tab === 'theme'" class="pane">
      <h2 class="sec">{{ zh ? '主题' : 'Theme' }}</h2>
      <div class="row-btns">
        <button :class="{ primary: theme.mode === 'light' }" @click="theme.mode = 'light'; persistTheme()">{{ t('theme.light') }}</button>
        <button :class="{ primary: theme.mode === 'dark' }" @click="theme.mode = 'dark'; persistTheme()">{{ t('theme.dark') }}</button>
        <button :class="{ primary: theme.mode === 'eyecare' }" @click="theme.mode = 'eyecare'; persistTheme()">{{ t('theme.eyecare') }}</button>
      </div>

      <h2 class="sec">{{ zh ? '主色' : 'Accent color' }}</h2>
      <div class="row-btns">
        <input type="color" v-model="theme.accent" @change="persistTheme()" class="color" />
        <code class="mono">{{ theme.accent }}</code>
      </div>

      <h2 class="sec">{{ zh ? '密度' : 'Density' }}</h2>
      <div class="row-btns">
        <button :class="{ primary: theme.density === 'comfortable' }" @click="theme.density = 'comfortable'; persistTheme()">{{ zh ? '舒适' : 'Comfortable' }}</button>
        <button :class="{ primary: theme.density === 'compact' }" @click="theme.density = 'compact'; persistTheme()">{{ zh ? '紧凑' : 'Compact' }}</button>
      </div>

      <h2 class="sec">{{ zh ? '圆角' : 'Radius' }}</h2>
      <div class="row-btns">
        <button :class="{ primary: theme.radius === 'sm' }" @click="theme.radius = 'sm'; persistTheme()">SM</button>
        <button :class="{ primary: theme.radius === 'md' }" @click="theme.radius = 'md'; persistTheme()">MD</button>
        <button :class="{ primary: theme.radius === 'lg' }" @click="theme.radius = 'lg'; persistTheme()">LG</button>
      </div>

      <h2 class="sec">{{ zh ? '字号' : 'Font size' }}</h2>
      <div class="row-btns">
        <button :class="{ primary: fontTier === 'md' }" @click="setFontTier('md')">{{ zh ? '标准' : 'Standard' }}</button>
        <button :class="{ primary: fontTier === 'lg' }" @click="setFontTier('lg')">{{ zh ? '大' : 'Large' }}</button>
        <button :class="{ primary: fontTier === 'xl' }" @click="setFontTier('xl')">{{ zh ? '特大' : 'Extra large' }}</button>
      </div>

      <h2 class="sec">{{ zh ? '配置文件' : 'Config file' }}</h2>
      <p class="hint">{{ zh ? '导出把当前配置写入剪贴板；导入从剪贴板读取 JSON。' : 'Export copies config to clipboard; import reads JSON from clipboard.' }}</p>
      <div class="row-btns">
        <button @click="exportTheme">{{ zh ? '导出到剪贴板' : 'Export to clipboard' }}</button>
        <button @click="importTheme">{{ zh ? '从剪贴板导入' : 'Import from clipboard' }}</button>
      </div>
    </section>

    <!-- ========== 快捷键 ========== -->
    <section v-else-if="tab === 'keys'" class="pane">
      <h2 class="sec">{{ zh ? '键盘快捷键' : 'Keyboard shortcuts' }}</h2>
      <div class="keys">
        <div v-for="s in shortcuts" :key="s.k" class="key-row">
          <kbd class="mono">{{ s.k }}</kbd>
          <span>{{ s.d }}</span>
        </div>
      </div>
    </section>

    <!-- ========== 关于 ========== -->
    <section v-else-if="tab === 'about'" class="pane">
      <div class="about-head">
        <div class="logo">◆</div>
        <div>
          <h2 class="about-name">SentryDesk</h2>
          <p class="about-ver mono">{{ APP_VERSION_LABEL }}</p>
        </div>
      </div>
      <p class="about-desc">
        {{ zh
          ? '离线优先的漏洞知识库与安全学习工作台：情报、教学卡、自测、错题复习全部随包分发，断网可用；无账号、无遥测，数据不出本机。'
          : 'An offline-first vulnerability knowledge base and study workbench: intel, lesson cards, quizzes and review all ship in the installer and work offline. No accounts, no telemetry — data never leaves this machine.' }}
      </p>

      <h2 class="sec">{{ zh ? '技术栈' : 'Stack' }}</h2>
      <div class="grid2">
        <div class="kv"><span>{{ zh ? '应用外壳' : 'Shell' }}</span><b>Tauri 2</b></div>
        <div class="kv"><span>{{ zh ? '内核' : 'Core' }}</span><b>Rust</b></div>
        <div class="kv"><span>{{ zh ? '数据层' : 'Data' }}</span><b>SQLite + FTS5</b></div>
        <div class="kv"><span>{{ zh ? '前端' : 'Frontend' }}</span><b>Vue 3 + TypeScript</b></div>
      </div>

      <h2 class="sec">{{ zh ? '内容规模' : 'Content' }}</h2>
      <div class="grid2">
        <div class="kv"><span>{{ zh ? '情报条目（随包）' : 'Intel records (bundled)' }}</span><b class="mono">2900+</b></div>
        <div class="kv"><span>{{ zh ? '教学卡' : 'Lesson cards' }}</span><b class="mono">110</b></div>
        <div class="kv"><span>{{ zh ? '自测题' : 'Quiz questions' }}</span><b class="mono">338</b></div>
        <div class="kv"><span>{{ zh ? '术语' : 'Glossary terms' }}</span><b class="mono">91</b></div>
        <div class="kv"><span>{{ zh ? '学习路径' : 'Paths' }}</span><b class="mono">14</b></div>
      </div>

      <h2 class="sec">{{ zh ? '数据来源' : 'Data sources' }}</h2>
      <div class="grid2">
        <div class="kv"><span>CISA KEV</span><b>{{ zh ? '公有领域（美国政府作品）' : 'Public domain (US Gov)' }}</b></div>
        <div class="kv"><span>NVD / NIST</span><b>{{ zh ? '公开数据' : 'Public data' }}</b></div>
        <div class="kv"><span>GitHub Advisories</span><b>CC-BY-4.0</b></div>
        <div class="kv"><span>{{ zh ? '教学内容' : 'Lesson content' }}</span><b>{{ zh ? '本项目原创（MIT）' : 'Original (MIT)' }}</b></div>
      </div>
      <p class="hint">
        {{ zh
          ? '教学内容为本项目根据公开标准自行撰写，参考：MITRE CWE · OWASP · NIST SP 800 系列 · FIRST CVSS/EPSS · SLSA · CIS Benchmarks。'
          : 'Lesson text is original work based on public standards: MITRE CWE, OWASP, NIST SP 800 series, FIRST CVSS/EPSS, SLSA, CIS Benchmarks.' }}
      </p>

      <h2 class="sec">{{ zh ? '更新' : 'Updates' }}</h2>
      <div class="row-btns">
        <button :disabled="checkingUpdate" @click="doCheckUpdate">
          {{ checkingUpdate ? (zh ? '检查中…' : 'Checking…') : (zh ? '检查更新' : 'Check for updates') }}
        </button>
        <span v-if="updateMsg" class="hint" style="align-self:center">{{ updateMsg }}</span>
      </div>
      <p class="hint">
        {{ zh
          ? '也可以直接下载新版安装包覆盖安装，效果相同。更新只替换程序与内容，学习数据不受影响。'
          : 'You can also just run a newer installer over the current one. Updates replace program and content only — your study data is untouched.' }}
      </p>

      <h2 class="sec">{{ zh ? '许可与反馈' : 'License & feedback' }}</h2>
      <div class="grid2">
        <div class="kv"><span>{{ zh ? '代码许可' : 'Code license' }}</span><b>MIT</b></div>
        <div class="kv"><span>{{ zh ? '第三方组件' : 'Third-party' }}</span><b>Tauri · Vue · rusqlite · serde（MIT/Apache-2.0）</b></div>
      </div>
      <p class="hint">
        {{ zh
          ? '发现问题或有建议：请在项目仓库提交 issue，或邮件联系作者。完整数据合规说明见仓库 docs/数据来源与合规.md。'
          : 'Found a bug or have a suggestion? File an issue in the project repository. Full data-compliance notes: docs/数据来源与合规.md.' }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.settings { flex: 1; overflow-y: auto; background: var(--color-bg-elevated); padding: var(--space-6) var(--space-6) var(--space-7); }
.sh { margin-bottom: var(--space-4); }
.sh-title { margin: 0 0 2px; font-size: 21px; font-weight: 650; color: var(--color-text-primary); letter-spacing: -0.02em; }
.sh-sub { margin: 0; font-size: var(--font-xs); color: var(--color-text-tertiary); }

.tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--color-border); margin-bottom: var(--space-4); }
.tb { border: none; border-radius: 0; background: transparent; padding: 8px var(--space-4); font-size: var(--font-xs); color: var(--color-text-secondary); border-bottom: 2px solid transparent; }
.tb:hover { background: transparent; color: var(--color-text-primary); }
.tb.active { color: var(--color-accent); border-bottom-color: var(--color-accent); font-weight: 600; }

.pane { max-width: 900px; display: flex; flex-direction: column; gap: var(--space-3); }

.card { border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); }
.card.offline { background: var(--color-accent-soft); border-color: var(--color-accent-line); }
.badge-ok { display: inline-block; font-size: 11px; font-weight: 600; color: var(--color-accent); margin-bottom: 6px; }
.offline-text { margin: 0; font-size: var(--font-sm); line-height: 1.75; color: var(--color-accent); }

.sec { margin: var(--space-4) 0 var(--space-2); font-size: var(--font-md); font-weight: 600; color: var(--color-text-primary); }
.hint { margin: 0; font-size: var(--font-xs); line-height: 1.7; color: var(--color-text-tertiary); }
.ua { margin: 0; padding: var(--space-3); background: var(--color-bg-subtle); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 12px; color: var(--color-text-primary); overflow-x: auto; white-space: pre-wrap; word-break: break-all; }

.grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2); }
@media (max-width: 800px) { .grid2 { grid-template-columns: 1fr; } }
.kv { display: flex; justify-content: space-between; gap: var(--space-3); padding: 7px var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--font-xs); }
.kv span { color: var(--color-text-tertiary); }
.kv b { color: var(--color-text-primary); font-weight: 600; }

.tbl { width: 100%; border-collapse: collapse; font-size: var(--font-xs); table-layout: auto; }
.tbl { display: block; overflow-x: auto; }
.tbl thead, .tbl tbody { display: table; width: 100%; table-layout: fixed; }
.tbl th { text-align: left; padding: 6px var(--space-2); border-bottom: 1px solid var(--color-border-strong); color: var(--color-text-tertiary); font-weight: 600; }
.tbl td { padding: 8px var(--space-2); border-bottom: 1px solid var(--color-border); vertical-align: top; }
.tbl .num { text-align: right; }

/* ---- 采集记录 ---- */
.log-sum { color: var(--color-text-tertiary); margin-left: var(--space-2); }
.src-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-2); margin: var(--space-3) 0; }
.src-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  display: flex; flex-direction: column; gap: 3px;
  background: var(--color-bg-base);
}
.src-card.bad { border-color: #f5c6c0; background: #fdf1f0; }
.src-top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
.src-top b { font-size: var(--font-2xs); color: var(--color-text-primary); font-weight: 600; }
.pill { font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: var(--radius-full); }
.pill-ok { color: var(--color-sev-low); background: var(--color-ok-soft); }
.pill-bad { color: #c0392b; background: #fde0dd; }
.src-nums { color: var(--color-text-tertiary); }
.src-warn { color: #b45309; font-weight: 600; }
.src-time { color: var(--color-text-tertiary); }
.log-tbl td { padding: 6px var(--space-2); }
.log-bad { background: #fdf7f6; }
.ok-cell { color: var(--color-sev-low); }
.bad-cell { color: #c0392b; }
.empty-log {
  display: flex; flex-direction: column; gap: var(--space-2);
  padding: 48px var(--space-6); text-align: center;
  border: 1px dashed var(--color-border); border-radius: var(--radius-md);
  margin-top: var(--space-3);
}
.el-t { margin: 0; font-size: var(--font-md); color: var(--color-text-secondary); }
.el-h { margin: 0; font-size: var(--font-xs); line-height: 1.7; color: var(--color-text-tertiary); }
.src-name { font-size: var(--font-sm); color: var(--color-text-primary); }
.src-url { font-size: 10px; color: var(--color-text-tertiary); }
.small { font-size: 11px; }
.floor { color: var(--color-sev-medium); font-weight: 700; margin-left: 2px; }
.rob { font-size: 10px; padding: 1px 6px; border-radius: 10px; }
.r-allowed { background: var(--color-accent-line); color: var(--color-accent); }
.r-disallowed { background: #fde0dd; color: #c0392b; }
.r-not_found, .r-unknown { background: var(--color-bg-subtle); color: var(--color-text-tertiary); }

.path-box { display: flex; flex-direction: column; gap: 6px; }
.path-row { display: flex; gap: var(--space-3); font-size: var(--font-xs); align-items: baseline; }
.path-row span { width: 88px; flex-shrink: 0; color: var(--color-text-tertiary); }
.path-row code { flex: 1; font-size: 11px; color: var(--color-text-secondary); word-break: break-all; }

.row-btns { display: flex; gap: var(--space-2); flex-wrap: wrap; align-items: center; }
.restore-row { display: flex; gap: var(--space-2); }
.restore-row input { flex: 1; }
.color { width: 40px; height: 28px; padding: 2px; cursor: pointer; }

.result { display: flex; flex-direction: column; gap: 3px; padding: var(--space-3); background: var(--color-accent-soft); border: 1px solid var(--color-accent-line); border-radius: var(--radius-sm); }
.ok { font-size: var(--font-xs); font-weight: 600; color: var(--color-accent); }

.keys { display: flex; flex-direction: column; gap: 2px; }
.key-row { display: flex; gap: var(--space-4); align-items: center; padding: 7px var(--space-3); border-bottom: 1px solid var(--color-border); font-size: var(--font-sm); color: var(--color-text-secondary); }
kbd { min-width: 140px; font-size: 11px; padding: 2px 8px; border: 1px solid var(--color-border-strong); border-radius: 4px; background: var(--color-bg-subtle); color: var(--color-text-primary); }

.about-head { display: flex; align-items: center; gap: var(--space-3); }
.logo { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--color-accent); background: var(--color-accent-soft); border-radius: var(--radius-md); }
.about-name { margin: 0; font-size: var(--font-lg); font-weight: 700; }
.about-ver { margin: 0; font-size: 11px; color: var(--color-text-tertiary); }
.about-desc { margin: 0; font-size: var(--font-sm); line-height: 1.8; color: var(--color-text-secondary); }
.about-refs { margin: 0; font-size: var(--font-xs); line-height: 1.8; color: var(--color-text-tertiary); }
</style>