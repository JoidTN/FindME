FindMe - Minimal fullstack prototype
===================================

This repository contains a minimal backend (Node + Express) and frontend (Vite + React)
for a prototype that generates NFC links for medical profiles and can write them
to NFC tags using the Web NFC API (on supported Android browsers).

How to run:
- Setup a Postgres database, run backend/schema.sql
- Create .env from backend/.env.example and set DATABASE_URL and JWT_SECRET
- Start backend: cd backend && npm install && npm start
- Start frontend: cd frontend && npm install && VITE_API_URL=http://localhost:4000 npm run dev

Security:
- This is a demo scaffold. Do not use in production without adding proper validation,
  rate limiting, secure secrets management and TLS.
