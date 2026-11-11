//! HTTP 采集：固定 UA、超时、重试（最多 2 次指数退避）、响应体上限、日志留痕。
use crate::collect::sources::USER_AGENT;
use crate::error::{AppError, AppResult};
use std::time::{Duration, Instant};

/// 单次响应体上限 2MB
pub const MAX_BODY_BYTES: usize = 2 * 1024 * 1024;
/// 超时 15s
pub const TIMEOUT_SECS: u64 = 15;
/// 重试最多 2 次
pub const MAX_RETRIES: u32 = 2;

#[derive(Debug, Clone)]
pub struct FetchOutcome {
    pub body: Vec<u8>,
    pub http_status: Option<u16>,
    pub elapsed_ms: u64,
    pub attempts: u32,
}

pub fn build_client() -> AppResult<reqwest::Client> {
    reqwest::Client::builder()
        .user_agent(USER_AGENT)
        .timeout(Duration::from_secs(TIMEOUT_SECS))
        .redirect(reqwest::redirect::Policy::limited(5))
        .build()
        .map_err(|e| AppError::Http(e.to_string()))
}

/// 采集一个 URL。失败自动重试，指数退避 1s / 3s。
pub async fn fetch(client: &reqwest::Client, url: &str, extra_headers: &[(&str, &str)]) -> AppResult<FetchOutcome> {
    let mut last_err: Option<String> = None;
    let t_all = Instant::now();

    for attempt in 0..=MAX_RETRIES {
        let t0 = Instant::now();
        let mut req = client.get(url).header("User-Agent", USER_AGENT);
        for (k, v) in extra_headers {
            req = req.header(*k, *v);
        }
        match req.send().await {
            Ok(resp) => {
                let status = resp.status();
                if status.is_success() {
                    let bytes = resp.bytes().await.map_err(|e| AppError::Http(e.to_string()))?;
                    if bytes.len() > MAX_BODY_BYTES {
                        return Err(AppError::Http(format!(
                            "响应体 {} 字节，超过上限 {} 字节，已中止",
                            bytes.len(),
                            MAX_BODY_BYTES
                        )));
                    }
                    return Ok(FetchOutcome {
                        body: bytes.to_vec(),
                        http_status: Some(status.as_u16()),
                        elapsed_ms: t_all.elapsed().as_millis() as u64,
                        attempts: attempt + 1,
                    });
                }
                // 4xx 不重试（重试也没用，且不礼貌）；429/5xx 重试
                let code = status.as_u16();
                last_err = Some(format!("HTTP {}", code));
                if (400..500).contains(&code) && code != 429 {
                    break;
                }
            }
            Err(e) => {
                last_err = Some(e.to_string());
            }
        }
        let _ = t0;
        if attempt < MAX_RETRIES {
            let backoff = if attempt == 0 { 1000 } else { 3000 };
            tokio::time::sleep(Duration::from_millis(backoff)).await;
        }
    }

    Err(AppError::Http(format!(
        "{}（已重试 {} 次，耗时 {}ms）",
        last_err.unwrap_or_else(|| "未知错误".into()),
        MAX_RETRIES,
        t_all.elapsed().as_millis()
    )))
}
