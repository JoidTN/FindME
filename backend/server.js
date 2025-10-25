require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_URL || ''
});

// init DB: users and profiles
async function initDb(){
  try{
    const client = await pool.connect();
    try{
      await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    }catch(e){}
    try{
      await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
      await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT,
        allergies TEXT,
        emergency_number TEXT,
        emergency_email TEXT,
        hospital TEXT,
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    }catch(e){ console.error('table err', e.message) }
    client.release();
  }catch(e){
    console.error('initDb err', e.message)
  }
}

// routes
app.get('/', (req,res)=> res.send('FindME backend running'));

// register
app.post('/api/register', async (req,res)=>{
  const { name, email, password } = req.body || {};
  if(!email || !password) return res.status(400).json({ error: 'missing' });
  const client = await pool.connect();
  try{
    const q = `INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id,name,email`;
    const r = await client.query(q, [name||'', email, password]);
    res.json({ ok: true, user: r.rows[0] });
  }catch(err){
    console.error(err);
    if(err.code === '23505') return res.status(400).json({ error: 'email_exists' });
    res.status(500).json({ error: 'server' });
  }finally{ client.release(); }
});

// login
app.post('/api/login', async (req,res)=>{
  const { email, password } = req.body || {};
  if(!email || !password) return res.status(400).json({ error: 'missing' });
  const client = await pool.connect();
  try{
    const r = await client.query('SELECT id,name,email,password FROM users WHERE email=$1', [email]);
    const row = r.rows[0];
    if(!row) return res.status(401).json({ error: 'invalid' });
    if(row.password !== password) return res.status(401).json({ error: 'invalid' });
    const token = Buffer.from(`${row.id}:${Date.now()}`).toString('base64');
    res.json({ token, user: { id: row.id, name: row.name, email: row.email } });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'server' });
  }finally{ client.release(); }
});

async function auth(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({ error: 'noauth' });
  const parts = h.split(' ');
  if(parts.length!==2) return res.status(401).json({ error: 'bad' });
  const token = parts[1];
  try{
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [userId, ts] = decoded.split(':');
    const r = await pool.query('SELECT id,name,email FROM users WHERE id=$1', [userId]);
    if(!r.rows[0]) return res.status(401).json({ error: 'invalid' });
    req.user = r.rows[0];
    next();
  }catch(e){
    return res.status(401).json({ error: 'invalid' });
  }
}

// profiles
app.get('/api/profiles', auth, async (req,res)=>{
  const client = await pool.connect();
  try{
    const r = await client.query('SELECT * FROM profiles WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(r.rows);
  }catch(e){ console.error(e); res.status(500).json({ error: 'server' }) }finally{ client.release(); }
});

app.post('/api/profiles', auth, async (req,res)=>{
  const { name, allergies, emergency_number, emergency_email, hospital, note } = req.body || {};
  const client = await pool.connect();
  try{
    const q = `INSERT INTO profiles (user_id,name,allergies,emergency_number,emergency_email,hospital,note)
               VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const r = await client.query(q, [req.user.id, name||'', allergies||'', emergency_number||'', emergency_email||'', hospital||'', note||'']);
    res.json(r.rows[0]);
  }catch(e){ console.error(e); res.status(500).json({ error: 'server' }) }finally{ client.release(); }
});

app.put('/api/profiles/:id', auth, async (req,res)=>{
  const id = req.params.id;
  const { name, allergies, emergency_number, emergency_email, hospital, note } = req.body || {};
  const client = await pool.connect();
  try{
    const q = `UPDATE profiles SET name=$1, allergies=$2, emergency_number=$3, emergency_email=$4, hospital=$5, note=$6
               WHERE id=$7 AND user_id=$8 RETURNING *`;
    const r = await client.query(q, [name||'', allergies||'', emergency_number||'', emergency_email||'', hospital||'', note||'', id, req.user.id]);
    if(!r.rows[0]) return res.status(404).json({ error: 'not_found' });
    res.json(r.rows[0]);
  }catch(e){ console.error(e); res.status(500).json({ error: 'server' }) }finally{ client.release(); }
});

app.delete('/api/profiles/:id', auth, async (req,res)=>{
  const id = req.params.id;
  const client = await pool.connect();
  try{
    await client.query('DELETE FROM profiles WHERE id=$1 AND user_id=$2', [id, req.user.id]);
    res.json({ ok: true });
  }catch(e){ console.error(e); res.status(500).json({ error: 'server' }) }finally{ client.release(); }
});

app.post('/api/upload-nfc/:id', auth, async (req,res)=>{
  const id = req.params.id;
  const client = await pool.connect();
  try{
    const r = await client.query('SELECT * FROM profiles WHERE id=$1 AND user_id=$2', [id, req.user.id]);
    if(!r.rows[0]) return res.status(404).json({ error: 'not_found' });
    await new Promise(s=>setTimeout(s,600));
    res.json({ ok: true, profile: r.rows[0] });
  }catch(e){ console.error(e); res.status(500).json({ error: 'server' }) }finally{ client.release(); }
});

(async ()=>{
  await initDb();
  app.listen(PORT, ()=> console.log('Server listening on', PORT));
})();
