#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""知识库内容校验（CI 用）：
- 每个 JSON 可解析；
- 教学卡必填字段齐全、双语成对；
- 自测题答案索引在选项范围内；
- 学习路径引用的卡片 id 全部存在；
- 种子库条目数达标（KEV > 1000）。
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
K = ROOT / "knowledge"

CARD_FILES = [
    "lessons.json", "labs.json", "cwe.json", "more_cwe.json",
    "intel.json", "api.json", "auth.json", "cloud.json",
    "ir.json", "ops.json", "supply.json",
]

errors: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def main() -> int:
    ids: set[str] = set()
    card_total = 0
    quiz_total = 0

    for name in CARD_FILES:
        p = K / name
        if not p.exists():
            err(f"{name} 不存在")
            continue
        try:
            cards = json.loads(p.read_text(encoding="utf-8"))
        except Exception as e:  # noqa: BLE001
            err(f"{name} JSON 解析失败：{e}")
            continue
        if not isinstance(cards, list):
            err(f"{name} 顶层不是数组")
            continue
        for c in cards:
            cid = c.get("id")
            if not cid:
                err(f"{name} 存在无 id 的卡片")
                continue
            if cid in ids:
                err(f"卡片 id 重复：{cid}")
            ids.add(cid)
            card_total += 1

            for field in ("title", "title_en", "summary", "sections", "refs"):
                if field not in c:
                    err(f"{cid} 缺字段 {field}")
            for i, q in enumerate(c.get("quiz", [])):
                opts = q.get("options", [])
                if not (0 <= q.get("answer", -1) < len(opts)):
                    err(f"{cid} 第 {i + 1} 题答案索引越界")
                if "q_en" not in q or "options_en" not in q:
                    err(f"{cid} 第 {i + 1} 题缺英文")
                quiz_total += 1

    # 路径引用
    paths = json.loads((K / "paths.json").read_text(encoding="utf-8"))
    for lp in paths:
        for step in lp.get("steps", []):
            if step not in ids:
                err(f"路径 {lp['id']} 引用了不存在的卡 {step}")

    # 术语表
    glossary = json.loads((K / "glossary.json").read_text(encoding="utf-8"))
    if len(glossary) < 80:
        err(f"术语表过少：{len(glossary)}")

    # 种子库
    seed = K / "seed" / "kev.json"
    if seed.exists():
        kev = json.loads(seed.read_text(encoding="utf-8"))
        n = len(kev.get("vulnerabilities", []))
        if n < 1000:
            err(f"KEV 种子条目过少：{n}")
    else:
        err("knowledge/seed/kev.json 缺失")

    print(f"卡片 {card_total} 张 / 题目 {quiz_total} 道 / 术语 {len(glossary)} 条 / 路径 {len(paths)} 条")
    if errors:
        print(f"\n{len(errors)} 个问题：")
        for e in errors[:50]:
            print(" -", e)
        return 1
    print("内容校验全部通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
