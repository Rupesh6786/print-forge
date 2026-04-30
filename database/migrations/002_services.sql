-- ===========================================================
-- PrintForge migration 002 — Services CRUD
-- Run on the Hostinger MySQL DB once. Safe to re-run.
-- ===========================================================
USE printforge;

CREATE TABLE IF NOT EXISTS services (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(160) NOT NULL,
  price_label  VARCHAR(80)  NOT NULL,           -- e.g. "From ₹150"
  description  TEXT NULL,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO services (name, price_label, description, sort_order) VALUES
  ('Custom STL print',  'From ₹150', 'Upload an STL, we quote, print, and ship.', 1),
  ('3D model design',   'From ₹999', 'We design custom 3D models from your sketch.', 2),
  ('Lithophane',        '₹599',      'Photo-to-light keepsake printing.', 3),
  ('Bulk B2B printing', 'Custom',    'Volume pricing for production runs.', 4)
ON DUPLICATE KEY UPDATE name = VALUES(name);
