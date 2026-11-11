//! 内置教学知识库。
//! 内容随程序打包，运行时从 exe 同目录的 knowledge/*.json 读取，全程离线。
//! 所有教学卡均由本项目自行撰写，参考来源在 refs 字段中标注。
use crate::error::{AppError, AppResult};
use crate::models::*;
use std::path::PathBuf;
use std::sync::OnceLock;

static CACHE: OnceLock<Vec<LessonCard>> = OnceLock::new();

/// 从若干路径中定位 knowledge 目录
fn knowledge_dir(data_dir: &std::path::Path) -> Option<PathBuf> {
    // 1) 程序同目录（普通安装布局）
    if let Ok(exe) = std::env::current_exe()
        && let Some(dir) = exe.parent() {
            for cand in ["knowledge", "_up_/knowledge"] {
                let p = dir.join(cand);
                if p.join("cwe.json").exists() {
                    return Some(p);
                }
            }
            // 开发期：target/debug 回到源码目录
            let dev = dir.join("../../../knowledge");
            if dev.join("cwe.json").exists() {
                return Some(dev);
            }
        }
    // 2) 数据目录（便于用户自行扩充）
    let p = data_dir.join("knowledge");
    if p.join("cwe.json").exists() {
        return Some(p);
    }
    // 3) 传入的路径本身就是 knowledge 目录
    if data_dir.join("cwe.json").exists() {
        return Some(data_dir.to_path_buf());
    }
    None
}

/// 加载全部教学卡（进程内只加载一次）
pub fn all_cards(data_dir: &std::path::Path) -> AppResult<&'static Vec<LessonCard>> {
    if let Some(v) = CACHE.get() {
        return Ok(v);
    }
    let dir = knowledge_dir(data_dir)
        .ok_or_else(|| AppError::Config("找不到内置教学库 knowledge/ 目录".into()))?;

    let mut out: Vec<LessonCard> = Vec::new();
    for f in [
        "cwe.json",
        "more_cwe.json",
        "lessons.json",
        "labs.json",
        "ir.json",
        "ops.json",
        "supply.json",
        "cloud.json",
        "intel.json",
        "api.json",
        "auth.json",
    ] {
        let path = dir.join(f);
        if !path.exists() {
            continue;
        }
        let txt = std::fs::read_to_string(&path)?;
        let mut cards: Vec<LessonCard> = serde_json::from_str(&txt)
            .map_err(|e| AppError::Parse(format!("教学库 {} 解析失败：{}", f, e)))?;
        out.append(&mut cards);
    }
    if out.is_empty() {
        return Err(AppError::Config("教学库为空".into()));
    }
    // 排序：CWE 卡在前，按分类与等级
    out.sort_by(|a, b| {
        let rank = |k: &str| match k {
            "cwe" => 0,
            "lesson" => 1,
            _ => 2,
        };
        rank(&a.kind)
            .cmp(&rank(&b.kind))
            .then_with(|| a.category.cmp(&b.category))
            .then_with(|| a.title.cmp(&b.title))
    });
    let _ = CACHE.set(out);
    Ok(CACHE.get().unwrap())
}

/// 按条件检索教学卡
pub fn search(
    data_dir: &std::path::Path,
    f: &LessonFilter,
) -> AppResult<Vec<LessonCard>> {
    let cards = all_cards(data_dir)?;
    let q = f.query.trim().to_lowercase();
    let out = cards
        .iter()
        .filter(|c| {
            if let Some(k) = &f.kind
                && !k.is_empty() && k != "all" && &c.kind != k {
                    return false;
                }
            if let Some(cat) = &f.category
                && !cat.is_empty() && cat != "all" && &c.category != cat {
                    return false;
                }
            if let Some(lv) = &f.level
                && !lv.is_empty() && lv != "all" && &c.level != lv {
                    return false;
                }
            if !q.is_empty() {
                let hay = format!(
                    "{} {} {} {} {}",
                    c.title,
                    c.title_en.clone().unwrap_or_default(),
                    c.summary,
                    c.summary_en.clone().unwrap_or_default(),
                    c.tags.join(" ")
                )
                .to_lowercase();
                let cwe_hit = c.cwe.as_ref().map(|x| x.to_lowercase().contains(&q)).unwrap_or(false);
                if !hay.contains(&q) && !cwe_hit && !c.id.contains(&q) {
                    return false;
                }
            }
            true
        })
        .cloned()
        .collect();
    Ok(out)
}

/// 按 id 取单张卡
pub fn get(data_dir: &std::path::Path, id: &str) -> AppResult<Option<LessonCard>> {
    Ok(all_cards(data_dir)?.iter().find(|c| c.id == id).cloned())
}

/// 按 CWE 编号取对应的教学卡（CWE-79 → 标题含 CWE-79 的卡）
pub fn by_cwe(data_dir: &std::path::Path, cwe: &str) -> Option<LessonCard> {
    let target = crate::parse::norm_cwe(cwe)?;
    let cards = all_cards(data_dir).ok()?;
    cards
        .iter()
        .find(|c| {
            c.cwe
                .as_ref()
                .and_then(|x| crate::parse::norm_cwe(x))
                .map(|x| x == target)
                .unwrap_or(false)
        })
        .cloned()
}

// ==================== 术语表 ====================
static GLOSSARY: OnceLock<Vec<GlossaryTerm>> = OnceLock::new();

pub fn glossary(data_dir: &std::path::Path) -> AppResult<&'static Vec<GlossaryTerm>> {
    if let Some(v) = GLOSSARY.get() {
        return Ok(v);
    }
    let dir = knowledge_dir(data_dir)
        .ok_or_else(|| AppError::Config("找不到内置教学库目录".into()))?;
    let path = dir.join("glossary.json");
    if !path.exists() {
        let _ = GLOSSARY.set(Vec::new());
        return Ok(GLOSSARY.get().unwrap());
    }
    let txt = std::fs::read_to_string(&path)?;
    let terms: Vec<GlossaryTerm> = serde_json::from_str(&txt)
        .map_err(|e| AppError::Parse(format!("术语表解析失败：{}", e)))?;
    let _ = GLOSSARY.set(terms);
    Ok(GLOSSARY.get().unwrap())
}

// ==================== 学习路径 ====================
static PATHS: OnceLock<Vec<LearningPath>> = OnceLock::new();

pub fn paths(data_dir: &std::path::Path) -> AppResult<&'static Vec<LearningPath>> {
    if let Some(v) = PATHS.get() {
        return Ok(v);
    }
    let dir = knowledge_dir(data_dir)
        .ok_or_else(|| AppError::Config("找不到内置教学库目录".into()))?;
    let path = dir.join("paths.json");
    if !path.exists() {
        let _ = PATHS.set(Vec::new());
        return Ok(PATHS.get().unwrap());
    }
    let txt = std::fs::read_to_string(&path)?;
    let ps: Vec<LearningPath> = serde_json::from_str(&txt)
        .map_err(|e| AppError::Parse(format!("学习路径解析失败：{}", e)))?;
    let _ = PATHS.set(ps);
    Ok(PATHS.get().unwrap())
}

/// 按分类归集卡片 id（用于学习总览的分类进度）
///
/// 返回「分类名 -> 该分类下全部 lesson_id」。
/// 只返回数量是不够的：判断某分类已掌握几张卡，必须拿 id 与进度表求交。
pub fn categories(data_dir: &std::path::Path) -> Vec<(String, Vec<String>)> {
    let mut m: std::collections::BTreeMap<String, Vec<String>> = Default::default();
    if let Ok(cards) = all_cards(data_dir) {
        for c in cards {
            m.entry(c.category.clone()).or_default().push(c.id.clone());
        }
    }
    m.into_iter().collect()
}

/// 按 CWE 找卡片，并在正文中找到可用于术语高亮的词（返回 id 列表）
pub fn related_of(data_dir: &std::path::Path, id: &str) -> Vec<LessonCard> {
    let Ok(cards) = all_cards(data_dir) else { return Vec::new() };
    let Some(me) = cards.iter().find(|c| c.id == id) else { return Vec::new() };
    let my_cat = me.category.clone();
    let my_kind = me.kind.clone();
    cards
        .iter()
        .filter(|c| c.id != id)
        .filter(|c| c.category == my_cat || (c.kind != my_kind && c.level == me.level))
        .take(6)
        .cloned()
        .collect()
}

/// 教学库统计
pub fn stats(data_dir: &std::path::Path) -> AppResult<LessonStats> {
    let cards = all_cards(data_dir)?;
    let mut by_kind: std::collections::BTreeMap<String, usize> = Default::default();
    let mut by_category: std::collections::BTreeMap<String, usize> = Default::default();
    let mut by_level: std::collections::BTreeMap<String, usize> = Default::default();
    for c in cards {
        *by_kind.entry(c.kind.clone()).or_default() += 1;
        *by_category.entry(c.category.clone()).or_default() += 1;
        *by_level.entry(c.level.clone()).or_default() += 1;
    }
    Ok(LessonStats {
        total: cards.len(),
        by_kind: by_kind.into_iter().map(|(key, count)| CountPair { key, count }).collect(),
        by_category: by_category.into_iter().map(|(key, count)| CountPair { key, count }).collect(),
        by_level: by_level.into_iter().map(|(key, count)| CountPair { key, count }).collect(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn norm_cwe_works() {
        assert_eq!(crate::parse::norm_cwe("CWE-79").as_deref(), Some("CWE-79"));
        assert_eq!(crate::parse::norm_cwe("cwe-89").as_deref(), Some("CWE-89"));
        assert_eq!(crate::parse::norm_cwe("CWE-502:2020").as_deref(), Some("CWE-502"));
        assert_eq!(crate::parse::norm_cwe("NVD-CWE-Other"), None);
    }

    #[test]
    fn by_cwe_matches() {
        let dir = std::path::Path::new("C:/Users/17638/Desktop/knowledge");
        if !dir.exists() {
            return;
        }
        let card = by_cwe(dir, "CWE-79");
        assert!(card.is_some(), "CWE-79 应能匹配到教学卡");
        assert_eq!(card.unwrap().cwe.as_deref(), Some("CWE-79"));
    }
}

