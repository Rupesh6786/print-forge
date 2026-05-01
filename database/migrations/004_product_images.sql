-- ============================================================
-- 004 — Product images gallery (multiple images per product)
-- ============================================================
-- The existing products.image_blob remains the "primary" image.
-- This table stores any number of additional gallery images.
-- ============================================================

USE printforge;

CREATE TABLE IF NOT EXISTS product_images (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  image_blob  LONGBLOB NOT NULL,
  image_mime  VARCHAR(80) NOT NULL DEFAULT 'image/jpeg',
  sort_order  INT NOT NULL DEFAULT 0,
  is_primary  TINYINT(1) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_sort (product_id, sort_order)
) ENGINE=InnoDB;
