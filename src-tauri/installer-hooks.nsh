; ============================================================================
; SentryDesk —— NSIS 安装钩子（installerHooks）
;
; 为什么需要它
;   NSIS 的 File 是编译期指令，运行时写不进去就只能弹系统默认的
;   「无法打开要写入的文件 / 中止·重试·忽略」——没有上下文，用户无从下手。
;   而且这个框一旦弹出，安装就卡在那里，没有任何补救路径。
;
; 判断顺序（v0.8.7 重写）
;   ① taskkill 清场（没命中返回非 0，无副作用）
;   ② 目标 exe 若已存在，先改名成 .old 让位 —— 运行中的 exe 也能改名，
;      这是不动杀软就能继续装的唯一办法；取消时再改回来
;   ③ 用「最终文件名」真的写一个字节再删掉，作为可写探测（轮询 20×300ms）
;      —— 必须用 .exe 名：v0.8.6 探的是 sd_write_test.tmp，
;         安全软件不拦 .tmp 却拦 .exe，于是探测说可写、File 立刻失败，
;         用户看到的就是系统裸错误框。这是上一版失败的真正原因。
;   ④ 目录本身不可写且可改道 → 换成 $LOCALAPPDATA\PRODUCTNAME 再走一轮
;   ⑤ 仍失败 → 自己的对话框（重试 / 取消），连试两轮后允许「跳过检查继续装」
;
; 判定口径（重要）
;   **只看 FileOpen 的错误标志，不看 GetLastError。**
;   v0.8.6 加过一条"错误码为 0 就当作可写"的保险，结果把真实失败
;   （杀软拦写，minifilter 拦下后错误码被吃成 0）误判成可写，直接放行给 File，
;   于是又弹回系统裸框。错误码只用来写日志和给用户看，不参与判断。
;
; 寄存器：$R0 目录可写 / $R1 exe 可写 / $R2 目录错误码 / $R3 exe 错误码
;         $R4 原始目录 / $R5 是否已改道 / $R6 推荐目录 / $R7 镜像名
;         $R8 是否全新安装 / $R9 用户轮次 / $2 探测轮次 / $1 句柄 / $4 日志路径
;
; NSIS 档案（防止再踩）
;   · 本文件在 installer.nsi 第 36 行被 !include，早于 !define PRODUCTNAME，
;     函数体里不能用该宏 —— 镜像名与推荐目录由宏压栈传入。
;   · MessageBox 没有独立标题参数，标题并进正文首行。
;   · MessageBox 的 /SD 必须写在文本之后。
;   · MessageBox 的 IDRETRY 不展开 ${__LINE__}，重试循环用普通标签。
;   · File 写的是 $OUTDIR 而不是 $INSTDIR，改目录后必须 SetOutPath。
;   · nsExec 不覆盖 $R0-$R9。
; ============================================================================

!ifndef SENTRYDESK_HOOKS_NSH
!define SENTRYDESK_HOOKS_NSH

!define SD_PROBE_MAX      20    ; 单轮可写探测次数
!define SD_PROBE_GAP      300   ; 间隔（ms），20×300 ≈ 6 秒
!define SD_KILL_GRACE     800   ; taskkill 后等句柄释放（ms）
!define SD_USER_RETRY_MAX 2     ; 弹窗轮次上限，超过则问「是否跳过检查」

; ---------------------------------------------------------------- 日志
; 全程只保留一个句柄：受限环境下每次 open/close 的追加写入会静默失败，
; 文件被创建出来却是 0 字节（v0.8.6 实测）。路径三级回退。
!macro sdLog line
  ${If} $3 != ""
    FileWrite $3 "${line}$\r$\n"
  ${EndIf}
!macroend

; ------------------------------------------------- 函数：确保目标文件可写入
; 栈参数：先 Push 镜像名，再 Push 推荐目录
Function sdEnsureWritable
  Pop $R6                       ; 推荐目录
  Pop $R7                       ; 镜像名 sentrydesk.exe
  StrCpy $R9 0
  StrCpy $R5 0
  StrCpy $R4 "$INSTDIR"

  StrCpy $4 "$TEMP\SentryDesk-setup.log"
  ClearErrors
  FileOpen $3 "$4" w
  ${If} ${Errors}
    StrCpy $4 "$EXEDIR\SentryDesk-setup.log"
    ClearErrors
    FileOpen $3 "$4" w
  ${EndIf}
  ${If} ${Errors}
    StrCpy $4 "$LOCALAPPDATA\Temp\SentryDesk-setup.log"
    ClearErrors
    FileOpen $3 "$4" w
  ${EndIf}
  !insertmacro sdLog "==== SentryDesk setup ===="
  !insertmacro sdLog "INSTDIR=[$INSTDIR] IMG=[$R7] REC=[$R6] OUTDIR=[$OUTDIR]"

  ${If} ${FileExists} "$INSTDIR\$R7"
    !insertmacro sdLog "target-exists=1 (upgrade)"
    StrCpy $R8 0
  ${Else}
    !insertmacro sdLog "target-exists=0 (fresh)"
    StrCpy $R8 1
  ${EndIf}

  sd_retry:
    ; ① 清场
    nsExec::ExecToLog '"$SYSDIR\taskkill.exe" /F /IM "$R7"'
    Pop $0
    !insertmacro sdLog "taskkill rc=$0"
    ${If} $0 == 0
      DetailPrint "$(sdLockKilled)"
      Sleep ${SD_KILL_GRACE}
    ${EndIf}

    ; ② 让位：目标存在则改名。改名只需要 DELETE 权限，对正在运行的 exe 也有效，
    ;    这样后面的探测可以放心地以「最终文件名」真实写入。
    StrCpy $R2 0                ; $R2 = 1 表示这次为了探测挪走过旧 exe
    ${If} ${FileExists} "$INSTDIR\$R7"
      ClearErrors
      Delete /REBOOTOK "$INSTDIR\$R7.old"
      ClearErrors
      Rename "$INSTDIR\$R7" "$INSTDIR\$R7.old"
      ${If} ${Errors}
        !insertmacro sdLog "rename-to-old failed"
      ${Else}
        StrCpy $R2 1
        !insertmacro sdLog "renamed old exe -> .old"
      ${EndIf}
    ${EndIf}

    ; ③ 真实写入探测：最终文件名 + 真写一个字节 + 删掉
    StrCpy $R1 0
    StrCpy $R3 0
    StrCpy $2 0
    sd_probe:
      ClearErrors
      FileOpen $1 "$INSTDIR\$R7" w
      ${If} ${Errors}
        System::Call 'kernel32::GetLastError() i .r3'
      ${Else}
        FileWriteByte $1 0
        FileClose $1
        Delete "$INSTDIR\$R7"
        StrCpy $R1 1
      ${EndIf}
      ${If} $R1 == 1
        Goto sd_probe_done
      ${EndIf}
      IntOp $2 $2 + 1
      ${If} $2 < ${SD_PROBE_MAX}
        Sleep ${SD_PROBE_GAP}
        Goto sd_probe
      ${EndIf}
    sd_probe_done:
    !insertmacro sdLog "exe-probe writable=$R1 tries=$2 lasterr=$R3 path=[$INSTDIR\$R7]"

    ${If} $R1 == 1
      !insertmacro sdLog "=> writable, go ahead"
      Delete /REBOOTOK "$INSTDIR\$R7.old"
      FileClose $3
      Return
    ${EndIf}

    ; ④ 目录本身可写吗（只用于决定要不要改道）
    StrCpy $R0 0
    ClearErrors
    FileOpen $1 "$INSTDIR\sd_write_test.tmp" w
    ${If} ${Errors}
      StrCpy $R0 0
    ${Else}
      StrCpy $R0 1
      FileClose $1
      Delete "$INSTDIR\sd_write_test.tmp"
    ${EndIf}
    !insertmacro sdLog "dir-probe writable=$R0 dir=[$INSTDIR]"

    ; ⑤ 目录不可写 + 还没改道过 → 换推荐位置再走一轮
    ${If} $R0 == 0
    ${AndIf} $R5 == 0
    ${AndIf} "$INSTDIR" != "$R6"
      StrCpy $R5 1
      StrCpy $R4 "$INSTDIR"
      StrCpy $INSTDIR "$R6"
      CreateDirectory "$INSTDIR"
      SetOutPath "$INSTDIR"
      ${If} ${FileExists} "$INSTDIR\$R7"
        StrCpy $R8 0
      ${EndIf}
      DetailPrint "$(sdRedirect)"
      !insertmacro sdLog "=> redirected to [$INSTDIR]"
      Goto sd_retry
    ${EndIf}

    ; ⑥ 确实写不进去。先给重试机会，试满之后问要不要跳过检查继续装
    IntOp $R9 $R9 + 1
    ${If} $R9 > ${SD_USER_RETRY_MAX}
      !insertmacro sdLog "=> ask user to skip check (round $R9)"
      MessageBox MB_ICONEXCLAMATION|MB_YESNO "$(sdLockSkip)" /SD IDNO IDYES sd_skip
      Goto sd_giveup
    ${EndIf}
    !insertmacro sdLog "=> dialog (round $R9)"
    MessageBox MB_ICONSTOP|MB_RETRYCANCEL "$(sdLockBody)" /SD IDCANCEL IDRETRY sd_retry
    Goto sd_giveup

    sd_skip:
      !insertmacro sdLog "=> user chose to skip check, hand over to File"
      FileClose $3
      Return

    sd_giveup:
      !insertmacro sdLog "=> give up after $R9 rounds"
      MessageBox MB_ICONSTOP|MB_OK "$(sdLockGiveUp)" /SD IDOK
      ; 升级时把挪走的旧 exe 还回去，别把已有安装搞坏
      ${If} $R2 == 1
      ${AndIf} ${FileExists} "$INSTDIR\$R7.old"
        Rename "$INSTDIR\$R7.old" "$INSTDIR\$R7"
      ${EndIf}
      ${If} $R8 == 1
        Delete "$INSTDIR\$R7"
        Delete "$INSTDIR\sd_write_test.tmp"
        RMDir "$INSTDIR"
      ${EndIf}
      Quit
FunctionEnd

; --------------------------------------------------- 安装前：确保可写再拷贝
!macro NSIS_HOOK_PREINSTALL
  Push "${MAINBINARYNAME}.exe"
  Push "$LOCALAPPDATA\${PRODUCTNAME}"
  Call sdEnsureWritable
!macroend

; --------------------------------------------------- 卸载前：先结束进程
!macro NSIS_HOOK_PREUNINSTALL
  nsExec::ExecToLog '"$SYSDIR\taskkill.exe" /F /IM "${MAINBINARYNAME}.exe"'
  Pop $0
  ${If} $0 == 0
    Sleep ${SD_KILL_GRACE}
  ${EndIf}
!macroend

!endif ; SENTRYDESK_HOOKS_NSH
