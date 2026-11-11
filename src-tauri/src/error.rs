//! 统一错误类型：所有 command 返回 Result<T, AppError>，可直接序列化给前端。
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("数据库错误：{0}")]
    Db(#[from] rusqlite::Error),

    #[error("网络请求失败：{0}")]
    Http(String),

    #[error("解析失败：{0}")]
    Parse(String),

    #[error("配置错误：{0}")]
    Config(String),

    #[error("IO 错误：{0}")]
    Io(#[from] std::io::Error),

    #[error("序列化错误：{0}")]
    Serde(#[from] serde_json::Error),

    #[error("{0}")]
    Other(String),
}

impl AppError {
    /// 错误归类码，前端可据此做不同提示
    pub fn code(&self) -> &'static str {
        match self {
            AppError::Db(_) => "db",
            AppError::Http(_) => "http",
            AppError::Parse(_) => "parse",
            AppError::Config(_) => "config",
            AppError::Io(_) => "io",
            AppError::Serde(_) => "serde",
            AppError::Other(_) => "other",
        }
    }
}

impl Serialize for AppError {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        use serde::ser::SerializeStruct;
        let mut st = s.serialize_struct("AppError", 2)?;
        st.serialize_field("code", self.code())?;
        st.serialize_field("message", &self.to_string())?;
        st.end()
    }
}

impl From<reqwest::Error> for AppError {
    fn from(e: reqwest::Error) -> Self {
        AppError::Http(e.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
