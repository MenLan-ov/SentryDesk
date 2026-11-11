//! 按域名独立限速。硬性下限 MIN_INTERVAL_FLOOR_MS，配置更小也强制抬到下限。
use crate::collect::sources::MIN_INTERVAL_FLOOR_MS;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{sleep, Duration, Instant};

#[derive(Clone)]
pub struct RateLimiter {
    inner: Arc<Mutex<HashMap<String, Instant>>>,
}

impl RateLimiter {
    pub fn new() -> Self {
        Self { inner: Arc::new(Mutex::new(HashMap::new())) }
    }

    /// 取出一道令牌；未到间隔则等待
    pub async fn acquire(&self, domain: &str, min_interval_ms: u64) {
        let interval = min_interval_ms.max(MIN_INTERVAL_FLOOR_MS);
        let wait = {
            let mut map = self.inner.lock().await;
            let now = Instant::now();
            match map.get(domain) {
                Some(last) => {
                    let elapsed = now.saturating_duration_since(*last).as_millis() as u64;
                    if elapsed >= interval {
                        map.insert(domain.to_string(), now);
                        0
                    } else {
                        let w = interval - elapsed;
                        map.insert(domain.to_string(), now + Duration::from_millis(w));
                        w
                    }
                }
                None => {
                    map.insert(domain.to_string(), now);
                    0
                }
            }
        };
        if wait > 0 {
            sleep(Duration::from_millis(wait)).await;
        }
    }
}

impl Default for RateLimiter {
    fn default() -> Self {
        Self::new()
    }
}

/// 从 URL 取域名
pub fn domain_of(url: &str) -> String {
    url::Url::parse(url)
        .ok()
        .and_then(|u| u.host_str().map(|h| h.to_string()))
        .unwrap_or_else(|| "unknown".to_string())
}
