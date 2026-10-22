#!/bin/zsh
cd -- "${0:A:h}" || exit 1
if ! command -v node >/dev/null 2>&1; then
  print 'Cần cài Node.js 22.12+ hoặc 24 để mở Little Coast.'
  read '?Nhấn Enter để đóng…'
  exit 1
fi
if [[ ! -d node_modules ]]; then
  npm install || exit 1
fi
print 'Little Coast đang mở. Nhấn Ctrl+C để dừng máy chủ.'
npm run dev -- --open --port 5173 --strictPort
