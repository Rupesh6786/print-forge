-- ============================================================
-- PrintForge — Lithophane requests
-- ============================================================
-- Stores user-submitted photo lithophane requests. The original
-- image is kept as a LONGBLOB so the API can stream it directly
-- (same approach as the products table).
-- Run on Hostinger MySQL with: mysql ... < 003_lithophanes.sql
-- ============================================================

USE printforge;

CREATE TABLE IF NOT EXISTS lithophanes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NULL,
  customer_name   VARCHAR(120) NOT NULL,
  customer_email  VARCHAR(191) NOT NULL,
  customer_phone  VARCHAR(20)  NULL,
  color           VARCHAR(40)  NOT NULL DEFAULT 'white',
  size            VARCHAR(40)  NOT NULL DEFAULT 'medium',
  notes           TEXT NULL,
  status          ENUM('pending','approved','printing','shipped','completed','cancelled')
                    NOT NULL DEFAULT 'pending',
  image_blob      LONGBLOB NULL,
  image_mime      VARCHAR(80)  NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_email  (customer_email),
  CONSTRAINT fk_litho_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;