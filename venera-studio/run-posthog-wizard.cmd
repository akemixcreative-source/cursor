@echo off
cd /d "%~dp0"
echo Running PostHog Wizard...
echo.
"%ProgramFiles%\nodejs\npx.cmd" -y @posthog/wizard@latest
pause
