#!/usr/bin/env python3
# 一次性发布脚本：创建 GitHub Release v1.0.5 并上传资产。
# 凭据从环境变量 GH_TOKEN 读取（由调用方注入，不落盘）。
import json, os, re, sys, urllib.request, urllib.error

REPO = "MenLan-ov/SentryDesk"
TAG = "v1.0.5"
BASE = r"C:\Users\17638\Desktop\One\sentrydesk"
NSIS = BASE + r"\src-tauri\target\release\bundle\nsis"

TOKEN = os.environ["GH_TOKEN"]
HDRS = {
    "Authorization": "Bearer " + TOKEN,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

def api(method, url, data=None, ctype="application/json"):
    body = None
    if data is not None:
        body = data if isinstance(data, bytes) else json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method=method)
    for k, v in HDRS.items():
        req.add_header(k, v)
    req.add_header("Content-Type", ctype)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            raw = r.read()
            return r.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read()[:400])
        sys.exit(1)

# 1) latest.json
sig = open(NSIS + r"\SentryDesk_1.0.5_x64-setup.exe.sig", encoding="utf-8").read().strip()
latest = {
    "version": "1.0.5",
    "notes": "参赛版：种子情报库首启导入 2979 条、首启引导、学习报告 PNG、安装目录自选、检查更新、CWE Top 25 全覆盖、中英双语 100%。",
    "pub_date": "2026-11-11T16:25:00Z",
    "platforms": {
        "windows-x86_64": {
            "signature": sig,
            "url": "https://github.com/MenLan-ov/SentryDesk/releases/download/v1.0.5/SentryDesk_1.0.5_x64-setup.exe",
        }
    },
}
lj_path = NSIS + r"\latest.json"
with open(lj_path, "w", encoding="utf-8") as f:
    json.dump(latest, f, ensure_ascii=False, indent=2)
print("latest.json written,", len(sig), "bytes of signature")

# 2) Release notes = CHANGELOG v1.0.5 节正文
ch = open(BASE + r"\CHANGELOG.md", encoding="utf-8").read()
m = re.search(r"## \[1\.0\.5\][^\n]*\n(.*?)\n---", ch, re.S)
notes = m.group(1).strip()

# 3) 创建 Release（幂等：已存在则复用）
status, rel = api("GET", "https://api.github.com/repos/%s/releases/tags/%s" % (REPO, TAG)) \
    if False else (0, {})
try:
    req = urllib.request.Request("https://api.github.com/repos/%s/releases/tags/%s" % (REPO, TAG))
    for k, v in HDRS.items():
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=60) as r:
        rel = json.loads(r.read())
    print("release exists, id:", rel["id"])
except urllib.error.HTTPError:
    st, rel = api("POST", "https://api.github.com/repos/%s/releases" % REPO, {
        "tag_name": TAG,
        "target_commitish": "main",
        "name": "SentryDesk v1.0.5 · 参赛版",
        "body": notes,
        "draft": False,
        "prerelease": False,
    })
    print("release created, id:", rel["id"])

upload_base = rel["upload_url"].split("{")[0]

# 4) 上传资产（已存在则先删再传）
st, assets = api("GET", "https://api.github.com/repos/%s/releases/%s/assets" % (REPO, rel["id"]))
existing = {a["name"]: a["id"] for a in assets}

FILES = [
    (NSIS + r"\SentryDesk_1.0.5_x64-setup.exe", "SentryDesk_1.0.5_x64-setup.exe"),
    (NSIS + r"\SentryDesk_1.0.5_x64-setup.exe.sig", "SentryDesk_1.0.5_x64-setup.exe.sig"),
    (NSIS + r"\SentryDesk_1.0.5_portable.zip", "SentryDesk_1.0.5_portable.zip"),
    (lj_path, "latest.json"),
]
for path, name in FILES:
    if name in existing:
        api("DELETE", "https://api.github.com/repos/%s/releases/assets/%s" % (REPO, existing[name]))
        print("replaced:", name)
    data = open(path, "rb").read()
    st, up = api("POST", upload_base + "?name=" + name, data, "application/octet-stream")
    print("uploaded:", up["name"], up["size"], "bytes")

print("DONE:", rel["html_url"])
