@echo off
chcp 65001 >nul
echo ============================================
echo   电竞考核匹配平台 - GitHub 推送脚本
echo ============================================
echo.

set /p username="请输入你的 GitHub 用户名: "
if "%username%"=="" (
  echo 错误：用户名不能为空
  pause
  exit /b 1
)

echo.
echo 正在关联远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/%username%/esport-assessment.git

echo 正在推送代码到 GitHub...
git push -u origin main

if %errorlevel%==0 (
  echo.
  echo ============================================
  echo   推送成功！
  echo   仓库地址: https://github.com/%username%/esport-assessment
  echo ============================================
  echo.
  echo 下一步：打开 https://render.com 部署
) else (
  echo.
  echo 推送失败，请检查：
  echo 1. 是否已在 GitHub 创建仓库 esport-assessment
  echo 2. 是否使用了 Personal Access Token 作为密码
  echo 3. 网络是否正常
)
pause
