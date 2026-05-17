#!/usr/bin/env bash
set -euo pipefail

if [ "$EUID" -eq 0 ]; then
  echo "Refusing to run as root. Run without sudo."
  exit 1
fi

echo "==> Setting up backend"
cd backend
[ -f .env ] || cp .env.example .env
npm install
npx prisma generate
echo ""
echo "Run 'cd backend && npx prisma migrate dev --name init' once your DATABASE_URL is filled in."
cd ..

echo ""
echo "==> Setting up frontend"
cd frontend
[ -f .env.local ] || cp .env.example .env.local
npm install
cd ..

echo ""
echo "==> Installing root deps"
npm install

echo ""
echo "================================================================"
echo " Setup complete."
echo ""
echo " Next steps:"
echo "   1. Fill in backend/.env  (DATABASE_URL, JWT_ACCESS_SECRET, NEWSAPI_KEY)"
echo "   2. cd backend && npx prisma migrate dev --name init"
echo "   3. npm run dev    (from project root, starts both servers)"
echo "================================================================"
