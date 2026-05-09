/**
 * PrintForge API — DigitalOcean Express server
 * ============================================
 * Connects to Hostinger MySQL and exposes a REST API consumed
 * by the Lovable frontend. Admin routes are protected by
 * Firebase ID-token verification + a hardcoded admin UID list.
 *
 * Run:  node index.js
 * Env:  see .env.example
 */
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const mysql   = require('mysql2/promise');
const admin   = require('firebase-admin');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');
let Razorpay  = null;
try { Razorpay = require('razorpay'); } catch { console.warn('razorpay package not installed yet'); }

// ─── Firebase Admin init ───────────────────────────────────
function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  throw new Error('Firebase service account not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.');
}
admin.initializeApp({ credential: admin.credential.cert(loadServiceAccount()) });

// ─── MySQL pool (Hostinger) ────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT || 3306),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Allow large STL/image BLOB payloads
  // (Hostinger may also need max_allowed_packet bumped)
});

// ─── App ───────────────────────────────────────────────────
const app = express();

const ORIGINS = (process.env.CORS_ORIGINS || '*')
  .split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ORIGINS.includes('*') || ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for image + STL uploads (BLOBs)
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

const ADMIN_UIDS = (process.env.ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);

// ─── Auth middleware ───────────────────────────────────────
async function authOptional(req, _res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (token) {
    try { req.user = await admin.auth().verifyIdToken(token); } catch { /* ignore */ }
  }
  next();
}
async function authRequired(req, res, next) {
  await authOptional(req, res, () => {});
  if (!req.user) return res.status(401).json({ error: 'Auth required' });
  next();
}
function adminRequired(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Auth required' });
  if (!ADMIN_UIDS.includes(req.user.uid)) return res.status(403).json({ error: 'Admin only' });
  next();
}

app.use(authOptional);

// Strip BLOB columns from product rows in list responses
function stripBlobs(row) {
  if (!row) return row;
  const { image_blob, ...rest } = row;
  return { ...rest, image_url: `/products/${row.id}/image` };
}

// ─── Health ────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// ════════════════════════════════════════════════════════════
//                       PRODUCTS
// ════════════════════════════════════════════════════════════
app.get('/products', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id,p.name,p.tagline,p.description,p.price,p.category_id,c.name AS category_name,
            p.image_mime,p.materials,p.colors,p.stock,p.rating,p.is_active,p.created_at,p.updated_at
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_active=1
      ORDER BY p.id DESC`
  );
  res.json(rows.map(stripBlobs));
});

app.get('/products/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id,p.name,p.tagline,p.description,p.price,p.category_id,c.name AS category_name,
            p.image_mime,p.materials,p.colors,p.stock,p.rating,p.is_active,p.created_at,p.updated_at
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id=?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(stripBlobs(rows[0]));
});

// ─── Categories ────────────────────────────────────────────
app.get('/categories', async (_req, res) => {
  const [rows] = await pool.query('SELECT id,name,slug,description FROM categories ORDER BY name ASC');
  res.json(rows);
});
app.post('/admin/categories', authRequired, adminRequired, async (req, res) => {
  const { name, slug, description } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const safeSlug = slug || String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const [r] = await pool.query(
    'INSERT INTO categories (name,slug,description) VALUES (?,?,?)',
    [name, safeSlug, description || null]
  );
  res.json({ id: r.insertId, name, slug: safeSlug });
});

// Stream the product image BLOB
app.get('/products/:id/image', async (req, res) => {
  const [rows] = await pool.query('SELECT image_blob, image_mime FROM products WHERE id=?', [req.params.id]);
  const r = rows[0];
  if (!r || !r.image_blob) return res.status(404).end();
  res.setHeader('Content-Type', r.image_mime || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.end(r.image_blob);
});

// Admin: create product (multipart with `image` file field)
app.post('/admin/products', authRequired, adminRequired, upload.single('image'), async (req, res) => {
  const { name, tagline, description, price, category_id, materials, colors, stock, rating } = req.body;
  const blob = req.file ? req.file.buffer : null;
  const mime = req.file ? req.file.mimetype : null;
  const [r] = await pool.query(
    `INSERT INTO products (name,tagline,description,price,category_id,image_blob,image_mime,materials,colors,stock,rating)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [name, tagline || null, description || null, price, category_id || null, blob, mime, materials || 'PLA', colors || null, stock || 0, rating || 0]
  );
  res.json({ id: r.insertId });
});

// Admin: update product (image optional)
app.put('/admin/products/:id', authRequired, adminRequired, upload.single('image'), async (req, res) => {
  const { name, tagline, description, price, category_id, materials, colors, stock, rating, is_active } = req.body;
  const fields = [];
  const vals   = [];
  const set = (k, v) => { if (v !== undefined) { fields.push(`${k}=?`); vals.push(v); } };
  set('name', name); set('tagline', tagline); set('description', description);
  set('price', price); set('category_id', category_id); set('materials', materials); set('colors', colors);
  set('stock', stock); set('rating', rating); set('is_active', is_active);
  if (req.file) { fields.push('image_blob=?', 'image_mime=?'); vals.push(req.file.buffer, req.file.mimetype); }
  if (!fields.length) return res.json({ ok: true });
  vals.push(req.params.id);
  await pool.query(`UPDATE products SET ${fields.join(',')} WHERE id=?`, vals);
  res.json({ ok: true });
});

app.delete('/admin/products/:id', authRequired, adminRequired, async (req, res) => {
  await pool.query('DELETE FROM products WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ─── Product gallery images (multi-image) ───────────────────
// Public: list gallery image metadata for a product
app.get('/products/:id/images', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, product_id, image_mime, sort_order, is_primary, created_at FROM product_images WHERE product_id=? ORDER BY sort_order ASC, id ASC',
    [req.params.id]
  );
  res.json(rows.map(r => ({ ...r, image_url: `/product-images/${r.id}` })));
});

// Public: stream a gallery image
app.get('/product-images/:imgId', async (req, res) => {
  const [rows] = await pool.query('SELECT image_blob, image_mime FROM product_images WHERE id=?', [req.params.imgId]);
  const r = rows[0];
  if (!r || !r.image_blob) return res.status(404).end();
  res.setHeader('Content-Type', r.image_mime || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.end(r.image_blob);
});

// Admin: upload one OR many gallery images (`images` field, repeated)
app.post('/admin/products/:id/images', authRequired, adminRequired, upload.array('images', 12), async (req, res) => {
  const productId = req.params.id;
  if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files' });
  const [[{ maxOrder }]] = await pool.query(
    'SELECT COALESCE(MAX(sort_order),0) AS maxOrder FROM product_images WHERE product_id=?',
    [productId]
  );
  const inserted = [];
  let order = Number(maxOrder) || 0;
  for (const f of req.files) {
    order += 1;
    const [r] = await pool.query(
      'INSERT INTO product_images (product_id, image_blob, image_mime, sort_order) VALUES (?,?,?,?)',
      [productId, f.buffer, f.mimetype || 'image/jpeg', order]
    );
    inserted.push({ id: r.insertId, image_url: `/product-images/${r.insertId}` });
  }
  res.json({ ok: true, inserted });
});

// Admin: delete a single gallery image
app.delete('/admin/product-images/:imgId', authRequired, adminRequired, async (req, res) => {
  await pool.query('DELETE FROM product_images WHERE id=?', [req.params.imgId]);
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════
//                       ORDERS
// ════════════════════════════════════════════════════════════
app.post('/orders', async (req, res) => {
  const { customer_name, customer_email, customer_phone, shipping_address, total_amount, payment_method = 'upi_qr', items = [], notes } = req.body;
  const order_number = 'PF-' + Date.now();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      `INSERT INTO orders (order_number,customer_name,customer_email,customer_phone,shipping_address,total_amount,payment_method,notes)
       VALUES (?,?,?,?,?,?,?,?)`,
      [order_number, customer_name, customer_email, customer_phone || null, shipping_address || null, total_amount, payment_method, notes || null]
    );
    const orderId = r.insertId;
    for (const it of items) {
      await conn.query(
        `INSERT INTO order_items (order_id,product_id,product_name,material,quantity,unit_price,subtotal)
         VALUES (?,?,?,?,?,?,?)`,
        [orderId, it.product_id || null, it.product_name, it.material || null, it.quantity, it.unit_price, it.unit_price * it.quantity]
      );
    }
    await conn.commit();
    res.json({ id: orderId, order_number });
  } catch (e) { await conn.rollback(); res.status(500).json({ error: e.message }); }
  finally { conn.release(); }
});

app.get('/admin/orders', authRequired, adminRequired, async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  res.json(rows);
});

app.patch('/admin/orders/:id/status', authRequired, adminRequired, async (req, res) => {
  await pool.query('UPDATE orders SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.json({ ok: true });
});

app.patch('/admin/orders/:id/paid', authRequired, adminRequired, async (req, res) => {
  await pool.query("UPDATE orders SET payment_status='paid', payment_ref=? WHERE id=?", [req.body.payment_ref || null, req.params.id]);
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════
//                       RAZORPAY
// ════════════════════════════════════════════════════════════
const RZP_KEY_ID     = process.env.RAZORPAY_KEY_ID || '';
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const rzp = (Razorpay && RZP_KEY_ID && RZP_KEY_SECRET)
  ? new Razorpay({ key_id: RZP_KEY_ID, key_secret: RZP_KEY_SECRET })
  : null;

// Public key for the frontend Razorpay checkout widget
app.get('/payments/razorpay/key', (_req, res) => {
  res.json({ keyId: RZP_KEY_ID || null });
});

// Create a Razorpay order. Amount in INR (rupees).
app.post('/payments/razorpay/order', async (req, res) => {
  if (!rzp) return res.status(500).json({ error: 'Razorpay not configured on server' });
  const { amount, receipt, notes } = req.body || {};
  const amt = Math.round(Number(amount));
  if (!amt || amt < 1) return res.status(400).json({ error: 'Invalid amount' });
  try {
    const order = await rzp.orders.create({
      amount: amt * 100,            // paise
      currency: 'INR',
      receipt: receipt || ('PF-' + Date.now()),
      notes: notes || {},
    });
    res.json({ id: order.id, amount: order.amount, currency: order.currency, keyId: RZP_KEY_ID });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Verify Razorpay signature after checkout — frontend cannot proceed without 200 OK.
app.post('/payments/razorpay/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return res.status(400).json({ error: 'Missing payment fields' });
  if (!RZP_KEY_SECRET) return res.status(500).json({ error: 'Razorpay not configured' });
  const expected = crypto
    .createHmac('sha256', RZP_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  if (expected !== razorpay_signature) return res.status(400).json({ ok: false, error: 'Signature mismatch' });
  res.json({ ok: true, payment_id: razorpay_payment_id, order_id: razorpay_order_id });
});

// ════════════════════════════════════════════════════════════
//                STL UPLOADS  +  QUOTES
// ════════════════════════════════════════════════════════════
// Upload STL as BLOB
app.post('/stl/upload', authRequired, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const [r] = await pool.query(
    `INSERT INTO stl_uploads (user_id, filename, mime_type, size_bytes, file_blob)
     VALUES (NULL, ?, ?, ?, ?)`,
    [req.file.originalname, req.file.mimetype || 'model/stl', req.file.size, req.file.buffer]
  );
  res.json({ id: r.insertId, filename: req.file.originalname, size_bytes: req.file.size });
});

// Download/stream STL
app.get('/stl/:id/file', async (req, res) => {
  const [rows] = await pool.query('SELECT filename, mime_type, file_blob FROM stl_uploads WHERE id=?', [req.params.id]);
  const r = rows[0];
  if (!r) return res.status(404).end();
  res.setHeader('Content-Type', r.mime_type || 'model/stl');
  res.setHeader('Content-Disposition', `attachment; filename="${r.filename}"`);
  res.end(r.file_blob);
});

// Naive quote estimator (replace with real slicer logic later)
app.post('/stl/quote', authRequired, async (req, res) => {
  const { sizeBytes = 0, material = 'PLA', infill = 20 } = req.body;
  const weightGrams = Math.max(5, sizeBytes / 1024 / 50); // dummy
  const matFactor   = material === 'Resin' ? 4.0 : material === 'ABS' ? 2.2 : 1.8;
  const price       = Math.round(weightGrams * matFactor * (1 + infill / 200));
  const printHours  = +(weightGrams / 18).toFixed(2);
  res.json({ price, weightGrams: +weightGrams.toFixed(2), printHours });
});

app.post('/quotes', async (req, res) => {
  const { user_id = null, stl_upload_id = null, customer_name, customer_email, customer_phone,
          material, infill, weight_grams, print_hours, estimated_price, notes } = req.body;
  const [r] = await pool.query(
    `INSERT INTO quotes (user_id,stl_upload_id,customer_name,customer_email,customer_phone,material,infill,weight_grams,print_hours,estimated_price,notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [user_id, stl_upload_id, customer_name, customer_email, customer_phone || null, material, infill, weight_grams, print_hours, estimated_price, notes || null]
  );
  res.json({ id: r.insertId });
});

app.get('/admin/quotes', authRequired, adminRequired, async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM quotes ORDER BY created_at DESC');
  res.json(rows);
});

// Admin: list all STL uploads (custom STL print orders) with optional quote info
app.get('/admin/stl-uploads', authRequired, adminRequired, async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT s.id, s.filename, s.mime_type, s.size_bytes, s.user_id, s.created_at,
            q.id AS quote_id, q.customer_name, q.customer_email, q.customer_phone,
            q.material, q.estimated_price, q.status AS quote_status, q.notes,
            u.email AS user_email, u.display_name AS user_display_name
       FROM stl_uploads s
       LEFT JOIN quotes q ON q.stl_upload_id = s.id
       LEFT JOIN users  u ON u.id = s.user_id
      ORDER BY s.created_at DESC`
  );
  res.json(rows);
});

// ════════════════════════════════════════════════════════════
//                       ENQUIRIES
// ════════════════════════════════════════════════════════════
app.post('/enquiries', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const [r] = await pool.query(
    'INSERT INTO enquiries (name,email,phone,subject,message) VALUES (?,?,?,?,?)',
    [name, email, phone || null, subject || null, message]
  );
  res.json({ id: r.insertId });
});

app.get('/admin/enquiries', authRequired, adminRequired, async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM enquiries ORDER BY created_at DESC');
  res.json(rows);
});

// ════════════════════════════════════════════════════════════
//                       USERS / STATS
// ════════════════════════════════════════════════════════════
// Sync Firebase user → MySQL `users` (called after sign-in / sign-up)
app.post('/users/sync', authRequired, async (req, res) => {
  const { display_name, phone } = req.body || {};
  const role = ADMIN_UIDS.includes(req.user.uid) ? 'admin' : 'user';
  await pool.query(
    `INSERT INTO users (firebase_uid,email,display_name,phone,role)
     VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       email=VALUES(email),
       display_name=COALESCE(VALUES(display_name), display_name),
       phone=COALESCE(VALUES(phone), phone),
       role=VALUES(role)`,
    [req.user.uid, req.user.email || '', display_name || req.user.name || null, phone || null, role]
  );
  res.json({ ok: true, role });
});

app.get('/admin/users', authRequired, adminRequired, async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  res.json(rows);
});

app.get('/admin/stats', authRequired, adminRequired, async (_req, res) => {
  const [[rev]]   = await pool.query("SELECT COALESCE(SUM(total_amount),0) AS revenue FROM orders WHERE payment_status='paid'");
  const [[ord]]   = await pool.query('SELECT COUNT(*) AS c FROM orders');
  const [[prod]]  = await pool.query('SELECT COUNT(*) AS c FROM products WHERE is_active=1');
  const [[usr]]   = await pool.query('SELECT COUNT(*) AS c FROM users');
  res.json({ revenue: Number(rev.revenue), orders: ord.c, products: prod.c, users: usr.c });
});

// Revenue grouped by day for the last 7 days (paid orders only).
app.get('/admin/revenue/weekly', authRequired, adminRequired, async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT DATE(created_at) AS day, COALESCE(SUM(total_amount),0) AS revenue
       FROM orders
      WHERE payment_status='paid'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY day ASC`
  );
  // Build a continuous 7-day series so the chart never has gaps.
  const map = new Map(rows.map(r => [new Date(r.day).toISOString().slice(0, 10), Number(r.revenue)]));
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({
      d: d.toLocaleDateString('en-US', { weekday: 'short' }),
      v: map.get(key) || 0,
    });
  }
  res.json(out);
});

// ════════════════════════════════════════════════════════════
//                       SERVICES
// ════════════════════════════════════════════════════════════
app.get('/services', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id,name,price_label,description,is_active,sort_order,created_at FROM services WHERE is_active=1 ORDER BY sort_order ASC, id ASC'
  );
  res.json(rows);
});

app.post('/admin/services', authRequired, adminRequired, async (req, res) => {
  const { name, price_label, description, is_active = 1, sort_order = 0 } = req.body || {};
  if (!name || !price_label) return res.status(400).json({ error: 'name and price_label required' });
  const [r] = await pool.query(
    'INSERT INTO services (name, price_label, description, is_active, sort_order) VALUES (?,?,?,?,?)',
    [name, price_label, description || null, is_active ? 1 : 0, Number(sort_order) || 0]
  );
  res.json({ id: r.insertId });
});

app.put('/admin/services/:id', authRequired, adminRequired, async (req, res) => {
  const { name, price_label, description, is_active, sort_order } = req.body || {};
  const fields = []; const vals = [];
  const set = (k, v) => { if (v !== undefined) { fields.push(`${k}=?`); vals.push(v); } };
  set('name', name); set('price_label', price_label); set('description', description);
  set('is_active', is_active); set('sort_order', sort_order);
  if (!fields.length) return res.json({ ok: true });
  vals.push(req.params.id);
  await pool.query(`UPDATE services SET ${fields.join(',')} WHERE id=?`, vals);
  res.json({ ok: true });
});

app.delete('/admin/services/:id', authRequired, adminRequired, async (req, res) => {
  await pool.query('DELETE FROM services WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════
//                       SETTINGS
// ════════════════════════════════════════════════════════════
app.get('/settings', async (_req, res) => {
  const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
  const out = {};
  rows.forEach(r => { out[r.setting_key] = r.setting_value; });
  res.json(out);
});

app.put('/admin/settings', authRequired, adminRequired, async (req, res) => {
  const entries = Object.entries(req.body || {});
  for (const [k, v] of entries) {
    await pool.query(
      'INSERT INTO settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',
      [k, v]
    );
  }
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════
//                       LITHOPHANES
// ════════════════════════════════════════════════════════════
// Public: submit a lithophane request (multipart with `image`)
app.post('/lithophanes', upload.single('image'), async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, color, size, notes } = req.body || {};
    if (!customer_name || !customer_email) return res.status(400).json({ error: 'name and email required' });
    if (!req.file) return res.status(400).json({ error: 'image required' });
    const [r] = await pool.query(
      `INSERT INTO lithophanes
         (customer_name, customer_email, customer_phone, color, size, notes, image_blob, image_mime)
       VALUES (?,?,?,?,?,?,?,?)`,
      [customer_name, customer_email, customer_phone || null,
       color || 'white', size || 'medium', notes || null,
       req.file.buffer, req.file.mimetype || 'image/jpeg']
    );
    res.json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Stream the uploaded image (admin uses this in dashboard)
app.get('/lithophanes/:id/image', async (req, res) => {
  const [rows] = await pool.query('SELECT image_blob, image_mime FROM lithophanes WHERE id=?', [req.params.id]);
  const r = rows[0];
  if (!r || !r.image_blob) return res.status(404).end();
  res.setHeader('Content-Type', r.image_mime || 'image/jpeg');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.end(r.image_blob);
});

app.get('/admin/lithophanes', authRequired, adminRequired, async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id,user_id,customer_name,customer_email,customer_phone,color,size,notes,status,image_mime,created_at,updated_at
       FROM lithophanes ORDER BY created_at DESC`
  );
  res.json(rows);
});

app.patch('/admin/lithophanes/:id/status', authRequired, adminRequired, async (req, res) => {
  await pool.query('UPDATE lithophanes SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.json({ ok: true });
});

// ─── Error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => console.log(`PrintForge API listening on :${PORT}`));
