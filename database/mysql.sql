-- ============================================================
-- PrintForge — Hostinger MySQL Schema
-- ============================================================
-- Import this file via phpMyAdmin or the MySQL CLI on your
-- Hostinger MySQL database. The DigitalOcean API server
-- connects to this database remotely (enable Remote MySQL on
-- Hostinger and whitelist the DO droplet IP).
--
-- Authentication is handled by Firebase. We DO NOT store
-- passwords here — only the Firebase UID, profile, and roles.
-- STL files live in DigitalOcean Spaces; we only store URLs.
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
CREATE TABLE products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  tagline       VARCHAR(255) NULL,
  description   TEXT NULL,
  price         DECIMAL(10,2) NOT NULL,
  category_id   INT NULL,
  image_url     VARCHAR(500) NULL,
  materials     VARCHAR(120) DEFAULT 'PLA',  -- comma list e.g. "PLA,ABS,Resin"
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
  payment_ref     VARCHAR(120) NULL,           -- UPI txn id or Razorpay payment id
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

-- ------------------------ STL / QUOTES ----------------------
CREATE TABLE stl_uploads (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NULL,
  filename     VARCHAR(255) NOT NULL,
  file_url     VARCHAR(500) NOT NULL,    -- DigitalOcean Spaces URL
  size_bytes   BIGINT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

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
-- Used by the admin Settings page. The UPI ID + payee name
-- are stored here so the checkout can build the upi:// URL.
CREATE TABLE settings (
  setting_key    VARCHAR(80) PRIMARY KEY,
  setting_value  TEXT NULL,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO settings (setting_key, setting_value) VALUES
  ('upi_id',          '22rupeshthakur@oksbi'),
  ('upi_payee_name',  'Rupesh Thakur'),
  ('store_name',      'PrintForge'),
  ('store_currency',  'INR'),
  ('contact_email',   'support@printforge.example'),
  ('contact_phone',   '+91-0000000000');

-- --------------------------- SEED DATA ----------------------
INSERT INTO categories (name, slug, description) VALUES
  ('Home',     'home',     'Decorative & functional household items'),
  ('Toys',     'toys',     'Articulated and print-in-place toys'),
  ('Office',   'office',   'Desk accessories and gadgets'),
  ('Custom',   'custom',   'Personalised prints from your STL'),
  ('Tech',     'tech',     'Drone frames, mounts, technical parts'),
  ('Cosplay',  'cosplay',  'Wearables, props and helmets');

INSERT INTO products (name, tagline, price, category_id, image_url, materials, stock, rating) VALUES
  ('Voronoi Lamp Shade',     'Algorithmic lighting sculpture', 899.00, 1, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',  'PLA,Resin', 24, 4.8),
  ('Articulated Dragon',     'Print-in-place flex toy',        349.00, 2, 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800', 'PLA,ABS',   58, 4.9),
  ('Hex Planter Pro',        'Modular geometric vessel',       249.00, 1, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800', 'PLA,ABS',  120, 4.7),
  ('Mechanical Phone Stand', 'Industrial desk piece',          429.00, 3, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800', 'ABS,Resin', 36, 4.6);
