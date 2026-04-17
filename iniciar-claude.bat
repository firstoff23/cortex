@echo off
cd /d "C:\Users\Alexandre\Desktop\Computador Inteligência Adaptativa"
set ANTHROPIC_BASE_URL=http://localhost:11434
set ANTHROPIC_AUTH_TOKEN=ollama
claude --model qwen2.5-coder:1.5b
pause
