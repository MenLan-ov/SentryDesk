"""
从官方 tauri-bundler 模板生成 SentryDesk 的 installer.nsi。

原则：只改「看得见的」——欢迎页排版、文案、品牌图、语言选择；
安装逻辑（注册表、WebView2、快捷方式、/S /P /UPDATE 参数、升级与卸载）一律不动。

用法：python build_template.py <官方模板> <输出路径>
"""
import io
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/tauri_installer_template.nsi"
DST = sys.argv[2] if len(sys.argv) > 2 else "installer.nsi"

raw = io.open(SRC, encoding="utf-8-sig").read()


def sub1(old, new, what):
    """锚点必须唯一，否则说明模板结构变了，立刻报错而不是悄悄改错地方"""
    global raw
    assert raw.count(old) == 1, f"锚点不唯一：{what}"
    raw = raw.replace(old, new)


# ---------------------------------------------------------------- 1. 品牌栏
sub1(
    'BrandingText "${COPYRIGHT}"',
    '; 底部品牌栏：产品名 + 版本。欢迎页是全屏页，MUI 会自动隐藏它，其它页可见\n'
    'BrandingText "${PRODUCTNAME} ${VERSION}"',
    "BrandingText",
)

# ---------------------------------------------------------------- 2. 文件属性
sub1(
    'VIAddVersionKey "ProductVersion" "${VERSION}"',
    'VIAddVersionKey "ProductVersion" "${VERSION}"\n'
    'VIAddVersionKey "CompanyName" "${MANUFACTURER}"\n'
    'VIAddVersionKey "Comments" "${PRODUCTNAME} ${VERSION} - local-first vulnerability learning desk"',
    "VIAddVersionKey",
)

# ---------------------------------------------------------------- 3. 语言选择框
LANGDLL_DEFS = """; 语言选择框的标题/说明在 MUI 里是写死的英文，换成双语一行，第一屏不别扭
!define MUI_LANGDLL_WINDOWTITLE "${PRODUCTNAME}"
!define MUI_LANGDLL_INFO "选择安装语言 / Choose setup language"

"""
sub1("; 1. Welcome Page", LANGDLL_DEFS + "; 1. Welcome Page", "欢迎页注释")

DETECT_ANCHOR = """  !if "${DISPLAYLANGUAGESELECTOR}" == "true"
    !insertmacro MUI_LANGDLL_DISPLAY
  !endif"""
DETECT = """  ; 按系统界面语言预置 $LANGUAGE：语言框打开时就停在这一项上；语言选择器被关掉时
  ; 也保证页面文案跟系统语言一致（否则会落到列表第一个语言，跟系统无关）。
  ; 实测：LangDLL 的 OK/Cancel 是插件内置英文，NSIS 侧没有开关可改，属正常现象。
  System::Call 'kernel32::GetUserDefaultUILanguage() i .r0'
  ${If} $0 == 2052
    StrCpy $LANGUAGE ${LANG_SIMPCHINESE}
  ${Else}
    StrCpy $LANGUAGE ${LANG_ENGLISH}
  ${EndIf}

""" + DETECT_ANCHOR
sub1(DETECT_ANCHOR, DETECT, "语言选择调用")

# ---------------------------------------------------------------- 4. 欢迎页：换成自绘
OLD_WELCOME = """; 1. Welcome Page
!define MUI_PAGE_CUSTOMFUNCTION_PRE SkipIfPassive
!insertmacro MUI_PAGE_WELCOME"""

NEW_WELCOME = r"""; 1. Welcome Page（自绘：MUI 默认版只有 195 单位窄栏 + 8pt 小字，排不出层级）
; 全屏模式的两个函数本来由 MUI_PAGE_WELCOME 内部插入，这里自己插一次
!insertmacro MUI_PAGE_FUNCTION_FULLWINDOW
Page custom sdWelcomeCreate sdWelcomeLeave

Var sdWpPage
Var sdWpImage
Var sdWpBitmap
Var sdFName
Var sdFSub
Var sdFBody
Var sdFSmall

Function sdWelcomeCreate
  ; /P 被动模式下不显示界面
  Call SkipIfPassive

  InitPluginsDir
  File /oname=$PLUGINSDIR\sd-welcome.bmp "${SIDEBARIMAGE}"

  ; 1044 = MUI 全屏页模板（左侧预留 109u 放侧栏图）
  nsDialogs::Create 1044
  Pop $sdWpPage
  SetCtlColors $sdWpPage "" "FFFFFF"

  ${NSD_CreateBitmap} 0u 0u 109u 193u ""
  Pop $sdWpImage
  ${NSD_SetImage} $sdWpImage "$PLUGINSDIR\sd-welcome.bmp" $sdWpBitmap

  ; 字体：中文用雅黑（Win10/11 自带），英文环境同理，不会掉成宋体
  CreateFont $sdFName  "Microsoft YaHei UI" "19" "700"
  CreateFont $sdFSub   "Microsoft YaHei UI" "9"  "400"
  CreateFont $sdFBody  "Microsoft YaHei UI" "9"  "400"
  CreateFont $sdFSmall "Microsoft YaHei UI" "8"  "400"

  ; 应用名
  ${NSD_CreateLabel} 118u 22u 196u 24u "${PRODUCTNAME}"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $sdFName 1
  SetCtlColors $0 "0F766E" "FFFFFF"

  ; 一句话定位
  ${NSD_CreateLabel} 118u 48u 196u 12u "$(sdTagline)"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $sdFSub 1
  SetCtlColors $0 "1F2937" "FFFFFF"

  ; 应用信息：版本 / 发布者 / 安装范围与体积
  ${NSD_CreateLabel} 118u 70u 196u 42u "$(sdInfo)"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $sdFBody 1
  SetCtlColors $0 "6B7280" "FFFFFF"

  ; 细线分隔：信息是"是什么"，要点是"好在哪"，分组更清楚
  ${NSD_CreateHLine} 118u 118u 196u 1u ""
  Pop $0
  SetCtlColors $0 "E5E7EB" "FFFFFF"

  ; 三条一眼能看懂的价值点
  ${NSD_CreateLabel} 118u 128u 196u 42u "$(sdBullets)"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $sdFBody 1
  SetCtlColors $0 "1F2937" "FFFFFF"

  ; 底部提示
  ${NSD_CreateLabel} 118u 176u 196u 10u "$(sdNextHint)"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $sdFSmall 1
  SetCtlColors $0 "6B7280" "FFFFFF"

  Call muiPageLoadFullWindow
  nsDialogs::Show
  Call muiPageUnloadFullWindow
  ${NSD_FreeImage} $sdWpBitmap
FunctionEnd

Function sdWelcomeLeave
FunctionEnd"""

sub1(OLD_WELCOME, NEW_WELCOME, "欢迎页")

# ---------------------------------------------------------------- 5. 目录页
DIR_ANCHOR = "; 5. Choose install directory page"
DIR_DEFS = """; 目录页顶部说明：默认位置最省事，换目录不影响已有数据
!define MUI_DIRECTORYPAGE_TEXT_TOP "$(sdDirTop)"

"""
sub1(DIR_ANCHOR, DIR_DEFS + DIR_ANCHOR, "目录页")

# ---------------------------------------------------------------- 6. 完成页
FINISH_ANCHOR = "; 8. Finish page"
FINISH_DEFS = """; 完成页：告诉用户装完在哪、数据在哪
!define MUI_FINISHPAGE_TITLE_3LINES
!define MUI_FINISHPAGE_TITLE "$(sdFinishTitle)"
!define MUI_FINISHPAGE_TEXT "$(sdFinishText)"

"""
sub1(FINISH_ANCHOR, FINISH_DEFS + FINISH_ANCHOR, "完成页")

# ---------------------------------------------------------------- 7. 卸载确认页
sub1(
    "!insertmacro MUI_UNPAGE_CONFIRM",
    '!define MUI_UNTEXT_CONFIRM_TITLE "$(sdUnTitle)"\n'
    '!define MUI_UNTEXT_CONFIRM_TEXT "$(sdUnText)"\n'
    "!insertmacro MUI_UNPAGE_CONFIRM",
    "卸载确认页",
)

# ---------------------------------------------------------------- 8. 双语词条
STRINGS = r"""; ---- SentryDesk 双语文案 ----
; 欢迎页正文宽约 192 单位（≈325px），中文一行不超过 16 字，避免词被折断。
!ifdef LANG_SIMPCHINESE
  LangString sdTagline     ${LANG_SIMPCHINESE} "本地优先的漏洞情报学习工作台"
  LangString sdInfo        ${LANG_SIMPCHINESE} "版本 ${VERSION}$\r$\n发布者 ${MANUFACTURER}$\r$\n仅当前用户 · 约 9 MB · 无需管理员权限"
  LangString sdBullets     ${LANG_SIMPCHINESE} "· 5 个公开情报源，一键采集$\r$\n· 107 张教学卡，329 道自测题$\r$\n· 数据全部留在本机"
  LangString sdNextHint    ${LANG_SIMPCHINESE} "点击「下一步」选择安装位置"
  LangString sdDirTop      ${LANG_SIMPCHINESE} "默认文件夹最省事；换目录也不会动到已有的学习数据。"
  LangString sdFinishTitle ${LANG_SIMPCHINESE} "SentryDesk 已准备就绪"
  LangString sdFinishText  ${LANG_SIMPCHINESE} "点击「完成」退出安装向导。$\r$\n$\r$\n学习数据在你的用户目录，卸载不会删除。"
  LangString sdUnTitle     ${LANG_SIMPCHINESE} "卸载 SentryDesk"
  LangString sdUnText      ${LANG_SIMPCHINESE} "这会移除 SentryDesk 的程序文件。$\r$\n$\r$\n学习进度与情报库保存在用户数据目录，默认不删除；想彻底清干净，请勾选下面的「同时删除应用数据」。"
!endif
!ifdef LANG_ENGLISH
  LangString sdTagline     ${LANG_ENGLISH} "Local-first vulnerability learning desk"
  LangString sdInfo        ${LANG_ENGLISH} "Version ${VERSION}$\r$\nPublisher ${MANUFACTURER}$\r$\nPer-user install · ~9 MB · no admin rights"
  LangString sdBullets     ${LANG_ENGLISH} "· 5 public feeds, one-click collection$\r$\n· 107 lesson cards, 329 quiz questions$\r$\n· Everything stays on this machine"
  LangString sdNextHint    ${LANG_ENGLISH} "Click Next to choose where to install"
  LangString sdDirTop      ${LANG_ENGLISH} "The default folder is the easiest choice - changing it won't touch your existing study data."
  LangString sdFinishTitle ${LANG_ENGLISH} "SentryDesk is ready"
  LangString sdFinishText  ${LANG_ENGLISH} "Click Finish to exit Setup.$\r$\n$\r$\nYour study data lives in your user folder and survives upgrades."
  LangString sdUnTitle     ${LANG_ENGLISH} "Uninstall SentryDesk"
  LangString sdUnText      ${LANG_ENGLISH} "This removes SentryDesk's program files.$\r$\n$\r$\nYour progress and intel database stay in the user data folder. Tick delete-application-data below to wipe them too."
!endif

"""
sub1("{{#each language_files}}", STRINGS + "{{#each language_files}}", "语言文件列表")

# 输出不要 BOM：Tauri 自己会补，两个 BOM 会让 makensis 把 \ufeffUnicode 当成命令名
io.open(DST, "w", encoding="utf-8", newline="\r\n").write(raw)
print("written", DST, len(raw), "bytes,", raw.count("\n"), "lines")
