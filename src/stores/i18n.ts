// 分类名与标签的英译表 + 语言相关的格式化。
//
// 为什么单独放一个文件：这两张表是纯数据（130+ 条目），
// 混在 store.ts 里会让「状态逻辑」和「词表」互相淹没。
// CVE 编号、产品名、CWE 编号按项目约定一律不翻译，因此这里只处理
// 知识库作者手写的中文分类/标签。
/** 分类名英译 */
export const CATEGORY_EN: Record<string, string> = {
  "Web 安全": "Web",
  "信息暴露": "Info exposure",
  "内存安全": "Memory safety",
  "凭据管理": "Credential mgmt",
  "反序列化": "Deserialization",
  "密码学": "Cryptography",
  "并发与时序": "Concurrency",
  "应急响应": "Incident response",
  "数值处理": "Numeric handling",
  "文件与上传": "Files & uploads",
  "注入类": "Injection",
  "类型系统": "Type system",
  "认证与会话": "Auth & sessions",
  "访问控制": "Access control",
  "语言特性": "Language quirks",
  "资源管理": "Resource mgmt",
  "输入校验": "Input validation",
  "配置与解析": "Config & parsing",
  "API 安全": "API security",
  "供应链安全": "Supply chain",
  "基础必修": "Fundamentals",
  "处置流程": "Response process",
  "威胁情报": "Threat intel",
  "安全运营": "Security ops",
  "安全自测": "Self check",
  "工程实践": "Engineering",
  "思维方法": "Methodology",
  "数据来源": "Data sources",
  "漏洞情报": "Vuln intel",
  "代码审计": "Code audit",
  "桌面与云原生": "Desktop & cloud",
  "认证与凭据": "Auth & credentials",
  "配置加固": "Hardening",
  "评估方法": "Assessment",
};

/** 标签英译；未收录的原样输出 */
export const TAG_EN: Record<string, string> = {
  "认证": "auth", "应急响应": "incident response", "实战": "hands-on", "方法论": "method",
  "供应链": "supply chain", "注入": "injection", "内存": "memory", "会话": "session",
  "威胁情报": "threat intel", "凭据": "credentials", "密码学": "crypto", "架构": "architecture",
  "授权": "authorization", "越权": "broken access", "配置": "config", "审计": "audit",
  "流程": "process", "加固": "hardening", "前端": "frontend", "文件": "files",
  "访问控制": "access control", "信息泄露": "info leak", "权限": "privilege", "处置": "response",
  "安全运营": "security ops", "合规": "compliance", "加密": "encryption", "优先级": "priority",
  "数据库": "database", "系统": "system", "反序列化": "deserialization", "基础": "basics",
  "内网": "internal network", "上传": "upload", "运维": "operations", "可用性": "availability",
  "钓鱼": "phishing", "日志": "logging", "令牌": "token", "评估": "assessment",
  "自测": "self check", "取证": "forensics", "云安全": "cloud security", "漏洞评估": "vuln assessment",
  "数据源": "data source", "输入校验": "input validation", "解析": "parsing",
  "文件读取": "file read", "并发": "concurrency", "业务逻辑": "business logic", "数值": "numeric",
  "稳定性": "stability", "类型": "types", "暴力破解": "brute force", "随机数": "randomness",
  "正则": "regex", "框架": "framework", "存储": "storage", "传输": "transport",
  "跨源": "cross-origin", "原理": "principle", "原则": "principles", "工程": "engineering",
  "情报源": "intel source", "复盘": "postmortem", "持久化": "persistence", "后门": "backdoor",
  "沟通": "communication", "勒索软件": "ransomware", "运营": "operations", "威胁建模": "threat modeling",
  "补丁": "patching", "检测": "detection", "基线": "baseline", "组件清单": "component list",
  "构建安全": "build security", "依赖混淆": "dependency confusion", "包管理": "package manager",
  "依赖管理": "dependency mgmt", "传递依赖": "transitive deps", "签名": "signing",
  "完整性": "integrity", "桌面应用": "desktop app", "攻击面": "attack surface",
  "本地安全": "local security", "凭据存储": "credential store", "隐私": "privacy",
  "元数据": "metadata", "最小权限": "least privilege", "容器": "container", "镜像": "image",
  "云原生": "cloud native", "密钥": "keys", "轮换": "rotation", "离线": "offline",
  "本地优先": "local first", "评分": "scoring", "标准": "standards", "漏洞库": "vuln feed",
  "误报治理": "false positives", "检测工程": "detection engineering", "映射": "mapping",
  "情报": "intelligence", "可信度": "reliability", "交叉验证": "cross-verification",
  "数据建模": "data modeling", "生命周期": "lifecycle", "降噪": "noise reduction",
  "指标": "metrics", "批量赋值": "mass assignment", "数据暴露": "data exposure",
  "限流": "rate limiting", "资源": "resources", "成本": "cost", "资产清单": "inventory",
  "影子接口": "shadow API", "治理": "governance", "业务安全": "business security",
  "自动化": "automation", "风控": "abuse control", "网关": "gateway", "口令": "password",
  "哈希": "hashing", "回调": "redirect",
};

/** 按当前语言取分类显示名 */
export function categoryLabel(name: string, zh: boolean): string {
  return zh ? name : (CATEGORY_EN[name] ?? name);
}

/** 按当前语言取标签显示名 */
export function tagLabel(tag: string, zh: boolean): string {
  return zh ? tag : (TAG_EN[tag] ?? tag);
}
