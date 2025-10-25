FindME prototype - Ready to upload
Backend: /backend (Node + Express)
Frontend: /frontend (Vite + React)

Steps:
1) In Render create a Web Service pointing to /backend, set DATABASE_URL env to your Postgres connection.
2) In Vercel create a project pointing to /frontend, set VITE_API_URL env to your backend public URL.
3) Deploy backend, then frontend. Use register -> login -> manage profiles -> upload.

Note: Passwords are stored in plain text for this prototype.
