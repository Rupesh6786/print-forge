-- ============================================================
-- PrintForge — Hostinger MySQL Schema (BLOB edition)
-- ============================================================
-- Authentication is handled by Firebase. We DO NOT store
-- passwords here — only the Firebase UID, profile, and roles.
--
-- Product images are stored as BLOB (LONGBLOB) directly in
-- the DB per request. STL files are also stored as LONGBLOB
-- in the `stl_uploads` table.
--
-- The DigitalOcean Node/Express server (server/index.js)
-- connects to this DB remotely. Enable "Remote MySQL" in
-- Hostinger and whitelist the DO droplet IP.
-- ============================================================

CREATE DATABASE IF NOT EXISTS printforge
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE printforge;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS enquiries;
DROP TABLE IF EXISTS stl_uploads;
DROP TABLE IF EXISTS product_analytics;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------- USERS ------------------------
CREATE TABLE users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid    VARCHAR(128) NOT NULL UNIQUE,
  email           VARCHAR(191) NOT NULL UNIQUE,
  display_name    VARCHAR(120) NULL,
  phone           VARCHAR(20)  NULL,
  role            ENUM('user','admin') NOT NULL DEFAULT 'user',
  avatar_url      VARCHAR(500) NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- --------------------------- CATEGORIES ---------------------
CREATE TABLE categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(80) NOT NULL UNIQUE,
  slug        VARCHAR(80) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------- PRODUCTS ----------------------
-- image_blob holds the binary image. image_mime stores the
-- content-type (e.g. 'image/jpeg') so the API can serve it
-- back with the correct header.
CREATE TABLE products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  tagline       VARCHAR(255) NULL,
  description   TEXT NULL,
  price         DECIMAL(10,2) NOT NULL,
  category_id   INT NULL,
  image_blob    LONGBLOB NULL,
  image_mime    VARCHAR(80) NULL,
  materials     VARCHAR(120) DEFAULT 'PLA',
  stock         INT NOT NULL DEFAULT 0,
  rating        DECIMAL(2,1) DEFAULT 0,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_active (is_active),
  INDEX idx_category (category_id)
) ENGINE=InnoDB;

-- ----------------------------- ORDERS -----------------------
CREATE TABLE orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_number    VARCHAR(32) NOT NULL UNIQUE,
  user_id         INT NULL,
  customer_name   VARCHAR(120) NOT NULL,
  customer_email  VARCHAR(191) NOT NULL,
  customer_phone  VARCHAR(20)  NULL,
  shipping_address TEXT NULL,
  total_amount    DECIMAL(10,2) NOT NULL,
  payment_method  ENUM('upi_qr','razorpay','cod') NOT NULL DEFAULT 'upi_qr',
  payment_status  ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  payment_ref     VARCHAR(120) NULL,
  status          ENUM('pending','printing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  notes           TEXT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_payment (payment_status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NULL,
  product_name VARCHAR(160) NOT NULL,
  material    VARCHAR(40) NULL,
  quantity    INT NOT NULL DEFAULT 1,
  unit_price  DECIMAL(10,2) NOT NULL,
  subtotal    DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------ STL UPLOADS -----------------------
-- The STL file itself is stored as LONGBLOB. Note: LONGBLOB
-- supports up to 4 GB but in practice keep individual files
-- under ~50 MB to stay friendly with PHP/MySQL packet limits
-- (raise max_allowed_packet on Hostinger if needed).
CREATE TABLE stl_uploads (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NULL,
  filename     VARCHAR(255) NOT NULL,
  mime_type    VARCHAR(80)  NOT NULL DEFAULT 'model/stl',
  size_bytes   BIGINT NOT NULL,
  file_blob    LONGBLOB NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------- QUOTES -----------------------
CREATE TABLE quotes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NULL,
  stl_upload_id INT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(191) NOT NULL,
  customer_phone VARCHAR(20) NULL,
  material      VARCHAR(40) NOT NULL DEFAULT 'PLA',
  infill        INT NOT NULL DEFAULT 20,
  weight_grams  DECIMAL(10,2) NULL,
  print_hours   DECIMAL(6,2) NULL,
  estimated_price DECIMAL(10,2) NULL,
  status        ENUM('new','reviewed','approved','rejected','converted') NOT NULL DEFAULT 'new',
  notes         TEXT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (stl_upload_id) REFERENCES stl_uploads(id) ON DELETE SET NULL,
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ---------------------------- ENQUIRIES ---------------------
CREATE TABLE enquiries (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(120) NOT NULL,
  email     VARCHAR(191) NOT NULL,
  phone     VARCHAR(20)  NULL,
  subject   VARCHAR(200) NULL,
  message   TEXT NOT NULL,
  status    ENUM('new','responded','closed') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ----------------------- PRODUCT ANALYTICS ------------------
CREATE TABLE product_analytics (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  date        DATE NOT NULL,
  views       INT NOT NULL DEFAULT 0,
  add_to_cart INT NOT NULL DEFAULT 0,
  purchases   INT NOT NULL DEFAULT 0,
  revenue     DECIMAL(10,2) NOT NULL DEFAULT 0,
  UNIQUE KEY uniq_product_date (product_id, date),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------- SETTINGS (KV) --------------------
CREATE TABLE settings (
  setting_key    VARCHAR(80) PRIMARY KEY,
  setting_value  TEXT NULL,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
--                      SEED / INITIAL DATA
-- ============================================================

-- Settings (UPI ID + payee name used by /checkout QR)
INSERT INTO settings (setting_key, setting_value) VALUES
  ('upi_id',          '22rupeshthakur@oksbi'),
  ('upi_payee_name',  'Rupesh Thakur'),
  ('store_name',      'PrintForge'),
  ('store_currency',  'INR'),
  ('contact_email',   'support@printforge.example'),
  ('contact_phone',   '+91-0000000000');

-- Categories
INSERT INTO categories (id, name, slug, description) VALUES
  (1, 'Home',    'home',    'Decorative & functional household items'),
  (2, 'Toys',    'toys',    'Articulated and print-in-place toys'),
  (3, 'Office',  'office',  'Desk accessories and gadgets'),
  (4, 'Custom',  'custom',  'Personalised prints from your STL'),
  (5, 'Tech',    'tech',    'Drone frames, mounts, technical parts'),
  (6, 'Cosplay', 'cosplay', 'Wearables, props and helmets');

-- Admin user (Firebase UID provided)
INSERT INTO users (firebase_uid, email, display_name, role) VALUES
  ('PjWhpms7NWRueIymevyWcAnXr9f2', 'admin@printforge.example', 'PrintForge Admin', 'admin');

-- Products — image_blob is left NULL here; the admin uploads
-- the actual image bytes via the API (POST /admin/products
-- with multipart/form-data) which fills image_blob + image_mime.
-- These INSERTs match the 8 demo products visible on the site.
INSERT INTO products (name, tagline, description, price, category_id, materials, stock, rating) VALUES
  ('Voronoi Lamp Shade',     'Algorithmic lighting sculpture', 'A parametric voronoi lamp generated from a fractal seed. Cast cathedral-like patterns on any wall.', 899.00, 1, 'PLA,Resin', 24, 4.8),
  ('Articulated Dragon',     'Print-in-place flex toy',        'Fully articulated, no assembly. Snake-like spine with 24 segments. The viral sensation of print farms.', 349.00, 2, 'PLA,ABS', 58, 4.9),
  ('Hex Planter Pro',        'Modular geometric vessel',       'Stackable hex planters with integrated drainage. Build your own vertical garden.', 249.00, 1, 'PLA,ABS', 120, 4.7),
  ('Mechanical Phone Stand', 'Industrial desk piece',          'Brutalist phone stand with cable routing. Engineered for both portrait and landscape.', 429.00, 3, 'ABS,Resin', 36, 4.6),
  ('Lithophane Frame',       'Photo-to-light conversion',      'Upload a photo, we print a backlit lithophane. Heirloom-quality keepsake.', 559.00, 4, 'PLA', 18, 5.0),
  ('Drone Frame X4',         'Carbon-loaded racing chassis',   '5-inch racing drone frame, carbon-fiber-loaded nylon. Tested to 120kph impacts.', 1299.00, 5, 'ABS', 12, 4.9),
  ('Topographic Coaster Set','Mountain-inspired drinkware',    'Set of 4 resin coasters featuring iconic mountain topographies.', 289.00, 1, 'Resin', 80, 4.7),
  ('Cyberpunk Helmet Kit',   'Wearable cosplay shell',         'Multi-part helmet kit with LED channels. Snap-fit assembly, paintable surface.', 2199.00, 6, 'PLA,ABS', 6, 4.8);

-- Sample enquiries
INSERT INTO enquiries (name, email, phone, subject, message, status) VALUES
  ('Aarav Mehta',  'aarav@example.com',  '+91-9000000001', 'Bulk order',         'Looking for 50 hex planters for an office.', 'new'),
  ('Priya Nair',   'priya@example.com',  '+91-9000000002', 'Custom helmet',      'Can you do a Mandalorian helmet in matte black?', 'responded'),
  ('Rohit Sharma', 'rohit@example.com',  '+91-9000000003', 'Material question',  'Is your nylon UV resistant for outdoor use?', 'new');

-- Sample orders
INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, total_amount, payment_method, payment_status, status) VALUES
  ('PF-1001', 'Aarav Mehta',  'aarav@example.com',  '+91-9000000001',  898.00, 'upi_qr', 'paid',    'shipped'),
  ('PF-1002', 'Priya Nair',   'priya@example.com',  '+91-9000000002', 2199.00, 'upi_qr', 'pending', 'pending'),
  ('PF-1003', 'Rohit Sharma', 'rohit@example.com',  '+91-9000000003', 1299.00, 'upi_qr', 'paid',    'printing');

INSERT INTO order_items (order_id, product_id, product_name, material, quantity, unit_price, subtotal) VALUES
  (1, 3, 'Hex Planter Pro',     'PLA',  2,  249.00,  498.00),
  (1, 7, 'Topographic Coaster Set','Resin', 1, 289.00, 289.00),
  (2, 8, 'Cyberpunk Helmet Kit','PLA',  1, 2199.00, 2199.00),
  (3, 6, 'Drone Frame X4',      'ABS',  1, 1299.00, 1299.00);

-- Sample analytics for the last few days
INSERT INTO product_analytics (product_id, date, views, add_to_cart, purchases, revenue) VALUES
  (1, CURDATE() - INTERVAL 2 DAY,  120, 14, 2,  1798.00),
  (2, CURDATE() - INTERVAL 2 DAY,   95, 22, 5,  1745.00),
  (3, CURDATE() - INTERVAL 1 DAY,  210, 30, 6,  1494.00),
  (6, CURDATE() - INTERVAL 1 DAY,   60,  8, 1,  1299.00),
  (8, CURDATE(),                    44,  6, 1,  2199.00);
