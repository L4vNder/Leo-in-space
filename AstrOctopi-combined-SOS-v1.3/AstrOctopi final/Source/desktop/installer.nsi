; Cross-platform NSIS 3.12 installer. Compiled on Linux without running Windows
; code: WriteUninstaller executes on the user's Windows computer at install time.
Unicode true
!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"
!include "WinVer.nsh"

!ifndef APP_VERSION
  !error "Build through node desktop/build-windows.cjs."
!endif

Name "AstrOctopi"
OutFile "${SETUP_OUT}"
InstallDir "$LOCALAPPDATA\Programs\AstrOctopi"
InstallDirRegKey HKCU "Software\AstrOctopi" "InstallLocation"
RequestExecutionLevel user
SetCompressor /SOLID lzma
SetCompressorDictSize 64
SetDatablockOptimize on
BrandingText "AstrOctopi — a little space for wellbeing"
ShowInstDetails show
ShowUninstDetails show

VIProductVersion "${APP_VERSION_QUAD}"
VIAddVersionKey /LANG=1033 "ProductName" "AstrOctopi"
VIAddVersionKey /LANG=1033 "FileDescription" "AstrOctopi Setup"
VIAddVersionKey /LANG=1033 "FileVersion" "${APP_VERSION}"
VIAddVersionKey /LANG=1033 "ProductVersion" "${APP_VERSION}"
VIAddVersionKey /LANG=1033 "LegalCopyright" "AstrOctopi contributors"

!define MUI_ICON "${APP_ICON}"
!define MUI_UNICON "${APP_ICON}"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Welcome to AstrOctopi"
!define MUI_WELCOMEPAGE_TEXT "Your wellbeing, in orbit.$\r$\n$\r$\nThis wizard installs AstrOctopi for your Windows account. Administrator access is not required.$\r$\n$\r$\nClose AstrOctopi before installing an update. Your local crew records are preserved."
!define MUI_FINISHPAGE_RUN "$INSTDIR\AstrOctopi.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Open AstrOctopi"
!define MUI_UNCONFIRMPAGE_TEXT_TOP "Remove AstrOctopi from this Windows account? Your local crew records and preferences will be kept in your application-data folder."

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH
!insertmacro MUI_LANGUAGE "English"

Function .onInit
  ${IfNot} ${RunningX64}
    MessageBox MB_ICONSTOP "This AstrOctopi edition requires 64-bit Windows 10 or Windows 11."
    Abort
  ${EndIf}
  ${IfNot} ${AtLeastWin10}
    MessageBox MB_ICONSTOP "AstrOctopi requires Windows 10 or Windows 11."
    Abort
  ${EndIf}
FunctionEnd

Section "AstrOctopi" SEC_APP
  SetShellVarContext current
  SetOutPath "$INSTDIR"
  File /r "${APP_DIR}/*"
  WriteUninstaller "$INSTDIR\Uninstall AstrOctopi.exe"

  CreateDirectory "$SMPROGRAMS\AstrOctopi"
  CreateShortCut "$SMPROGRAMS\AstrOctopi\AstrOctopi.lnk" "$INSTDIR\AstrOctopi.exe" "" "$INSTDIR\AstrOctopi.exe" 0
  CreateShortCut "$SMPROGRAMS\AstrOctopi\Uninstall AstrOctopi.lnk" "$INSTDIR\Uninstall AstrOctopi.exe"
  CreateShortCut "$DESKTOP\AstrOctopi.lnk" "$INSTDIR\AstrOctopi.exe" "" "$INSTDIR\AstrOctopi.exe" 0

  WriteRegStr HKCU "Software\AstrOctopi" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AstrOctopi" "DisplayName" "AstrOctopi"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AstrOctopi" "DisplayVersion" "${APP_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AstrOctopi" "DisplayIcon" "$INSTDIR\AstrOctopi.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AstrOctopi" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AstrOctopi" "UninstallString" '$\"$INSTDIR\Uninstall AstrOctopi.exe$\"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AstrOctopi" "QuietUninstallString" '$\"$INSTDIR\Uninstall AstrOctopi.exe$\" /S'
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AstrOctopi" "EstimatedSize" ${PACKAGE_KB}
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AstrOctopi" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AstrOctopi" "NoRepair" 1
SectionEnd

Section "Uninstall"
  SetShellVarContext current
  Delete "$DESKTOP\AstrOctopi.lnk"
  Delete "$SMPROGRAMS\AstrOctopi\AstrOctopi.lnk"
  Delete "$SMPROGRAMS\AstrOctopi\Uninstall AstrOctopi.lnk"
  RMDir "$SMPROGRAMS\AstrOctopi"
  ; Only delete known application files. Never recursively delete the install
  ; directory, which could contain unrelated files, and never remove AppData.
  !include "${UNINSTALL_COMMANDS}"
  Delete /REBOOTOK "$INSTDIR\Uninstall AstrOctopi.exe"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "Software\AstrOctopi"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AstrOctopi"
SectionEnd
