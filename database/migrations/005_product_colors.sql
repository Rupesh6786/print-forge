-- ============================================================
-- 005 — Product colors
-- ============================================================
-- Adds an optional CSV `colors` column on products so the admin
-- can offer multiple printing colors per product. Mirrors the
-- existing `materials` CSV pattern (e.g. "Black,White,Red").
-- ============================================================

USE printforge;

ALTER TABLE products
  ADD COLUMN colors VARCHAR(255) NULL DEFAULT NULL AFTER materials;