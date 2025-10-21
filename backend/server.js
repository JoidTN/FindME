require('dotenv').config(); // 👈 solo esta línea, no uses "import dotenv" también
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 Conexión a PostgreSQL (Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 🔽 Crear tablas automáticamente si no existen
async function ensureTables() {
  const createTablesSQL = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TIMESTAMP DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT,
      allergies TEXT,
      contact_number TEXT,
      email TEXT,
      blood_type TEXT,
      medical_notes TEXT,
      emergency_contact TEXT,
      last_lat DOUBLE PRECISION,
      last_lng DOUBLE PRECISION,
      updated_at TIMESTAMP DEFAULT now(),
      created_at TIMESTAMP DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS nfc_tokens (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      uses INT DEFAULT 0,
      max_uses INT DEFAULT 1,
      expire_at TIMESTAMP,
      revoked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT now()
    );
  `;

  try {
    await pool.query(createTablesSQL);
    console.log("✅ Tablas verificadas o creadas correctamente");
  } catch (error) {
    console.error("❌ Error creando tablas:", error);
  }
}

// 👇 Asegura que se ejecuta al iniciar el servidor
ensureTables();

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

// ✅ Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor corriendo correctamente ✅');
});

// -------------------------
// 🔐 AUTH MIDDLEWARE
// -------------------------
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).send({ error: 'no token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).send({ error: 'invalid token' });
  }
}

// -------------------------
// 🧍 REGISTRO
// -------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).send({ error: 'email and password required' });

    const hash = await bcrypt.hash(password, 10);
    const q =
      'INSERT INTO users(email, password_hash, name) VALUES($1,$2,$3) RETURNING id,email,name';
    const r = await pool.query(q, [email, hash, name]);
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'server error' });
  }
});

// -------------------------
// 🔑 LOGIN
// -------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const r = await pool.query(
      'SELECT id, password_hash, name FROM users WHERE email=$1',
      [email]
    );
    if (!r.rows[0]) return res.status(401).send({ error: 'invalid' });

    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).send({ error: 'invalid' });

    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, {
      expiresIn: '8h',
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'server error' });
  }
});

// -------------------------
// 👤 PERFIL, NFC, UBICACIÓN
// -------------------------
app.post('/api/users/:userId/profiles', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId)
      return res.status(403).send({ error: 'forbidden' });

    const {
      full_name,
      allergies,
      contact_number,
      email,
      emergency_contact,
    } = req.body;

    const q = `INSERT INTO profiles(owner_id, full_name, allergies, contact_number, email, emergency_contact)
               VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;
    const r = await pool.query(q, [
      userId,
      full_name,
      allergies,
      contact_number,
      email,
      emergency_contact,
    ]);
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'server error' });
  }
});

app.get('/api/users/:userId/profiles', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId)
      return res.status(403).send({ error: 'forbidden' });

    const r = await pool.query(
      'SELECT id, full_name, allergies, contact_number, email, last_lat, last_lng FROM profiles WHERE owner_id=$1',
      [userId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'server error' });
  }
});

app.post('/api/profiles/:id/nfc', authMiddleware, async (req, res) => {
  try {
    const profileId = req.params.id;
    const check = await pool.query('SELECT owner_id FROM profiles WHERE id=$1', [
      profileId,
    ]);
    if (!check.rows[0])
      return res.status(404).send({ error: 'profile not found' });
    if (check.rows[0].owner_id !== req.user.id)
      return res.status(403).send({ error: 'forbidden' });

    const token = uuidv4() + '-' + Math.random().toString(36).slice(2, 10);
    const expireAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 días
    const q = `INSERT INTO nfc_tokens(profile_id, token, max_uses, expire_at) VALUES($1,$2,$3,$4) RETURNING token,expire_at`;
    const r = await pool.query(q, [
      profileId,
      token,
      1,
      expireAt.toISOString(),
    ]);
    res.json({ token: r.rows[0].token, expire_at: r.rows[0].expire_at });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'server error' });
  }
});

app.get('/api/nfc/:token', async (req, res) => {
  const token = req.params.token;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tQ = 'SELECT * FROM nfc_tokens WHERE token=$1 FOR UPDATE';
    const tr = await client.query(tQ, [token]);
    if (!tr.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).send({ error: 'token not found' });
    }
    const trow = tr.rows[0];
    if (
      trow.revoked ||
      (trow.expire_at && new Date(trow.expire_at) < new Date()) ||
      trow.uses >= trow.max_uses
    ) {
      await client.query('ROLLBACK');
      return res.status(410).send({ error: 'token expired or used' });
    }
    await client.query('UPDATE nfc_tokens SET uses = uses + 1 WHERE id=$1', [
      trow.id,
    ]);
    const pQ =
      'SELECT id, full_name, allergies, contact_number, email, blood_type, medical_notes, last_lat, last_lng, emergency_contact FROM profiles WHERE id=$1';
    const pr = await client.query(pQ, [trow.profile_id]);
    await client.query('COMMIT');
    if (!pr.rows[0]) return res.status(404).send({ error: 'profile gone' });
    res.json(pr.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send({ error: 'server error' });
  } finally {
    client.release();
  }
});

app.put('/api/profiles/:id/location', authMiddleware, async (req, res) => {
  try {
    const profileId = req.params.id;
    const { lat, lng } = req.body;
    const check = await pool.query('SELECT owner_id FROM profiles WHERE id=$1', [
      profileId,
    ]);
    if (!check.rows[0])
      return res.status(404).send({ error: 'profile not found' });
    if (check.rows[0].owner_id !== req.user.id)
      return res.status(403).send({ error: 'forbidden' });
    await pool.query(
      'UPDATE profiles SET last_lat=$1, last_lng=$2, updated_at=now() WHERE id=$3',
      [lat, lng, profileId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'server error' });
  }
});

// -------------------------
// 🚀 INICIO DEL SERVIDOR
// -------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Servidor escuchando en puerto ${PORT}`));
