/**
 * PrintForge API Service Layer
 * Designed for a REST backend hosted on DigitalOcean (Node/Express)
 * that connects to the Hostinger MySQL database (see database/mysql.sql).
 * STL files upload directly to DigitalOcean Spaces; only URLs are stored.
 *
 * Authentication: Firebase Auth on the client. The frontend sends the
 * Firebase ID token as Authorization: Bearer <token>; the DO server
 * verifies it with firebase-admin and looks up role in MySQL `users`.
 *
 * Configure via .env:
 *   VITE_API_URL=https://api.printforge.example.com
 */
import { auth } from "@/lib/firebase";

const API_URL = import.meta.env.VITE_API_URL || "https://api.printforge.example.com";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOpts {
  method?: Method;
  body?: unknown;
  authed?: boolean;
  headers?: Record<string, string>;
}

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers ?? {}),
  };
  if (opts.authed) {
    const token = await auth.currentUser?.getIdToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Legacy token helpers retained so existing imports compile.
const TOKEN_KEY = "printforge_jwt";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

/* ──────────── Products ──────────── */
export interface ApiProduct {
  id: number; name: string; tagline: string; description: string;
  price: number; image_url: string; category_id: number | null;
  materials: string; stock: number; rating: number; is_active: number;
}
export const productsApi = {
  list:    ()                       => request<ApiProduct[]>("/products"),
  get:     (id: number | string)    => request<ApiProduct>(`/products/${id}`),
  create:  (data: Partial<ApiProduct>) => request<ApiProduct>("/admin/products", { method: "POST", body: data, authed: true }),
  update:  (id: number, data: Partial<ApiProduct>) => request<ApiProduct>(`/admin/products/${id}`, { method: "PUT", body: data, authed: true }),
  remove:  (id: number)             => request<void>(`/admin/products/${id}`, { method: "DELETE", authed: true }),
};

/* ──────────── Orders ──────────── */
export interface ApiOrder {
  id: number; order_number: string; customer_name: string; customer_email: string;
  total_amount: number; payment_status: "pending" | "paid" | "failed" | "refunded";
  status: "pending" | "printing" | "shipped" | "delivered" | "cancelled";
  payment_method: "upi_qr" | "razorpay" | "cod"; created_at: string;
}
export const orders = {
  create: (data: unknown) => request<ApiOrder>("/orders", { method: "POST", body: data }),
  list:   () => request<ApiOrder[]>("/admin/orders", { authed: true }),
  updateStatus: (id: number, status: ApiOrder["status"]) =>
    request<ApiOrder>(`/admin/orders/${id}/status`, { method: "PATCH", body: { status }, authed: true }),
  markPaid: (id: number, payment_ref: string) =>
    request<ApiOrder>(`/admin/orders/${id}/paid`, { method: "PATCH", body: { payment_ref }, authed: true }),
};

/* ──────────── Quotes / STL ──────────── */
export const stl = {
  presign: (filename: string, sizeBytes: number) =>
    request<{ uploadUrl: string; fileUrl: string }>("/stl/presign", {
      method: "POST", body: { filename, sizeBytes }, authed: true,
    }),
  quote: (fileUrl: string, material: string, infill: number) =>
    request<{ price: number; weightGrams: number; printHours: number }>("/stl/quote", {
      method: "POST", body: { fileUrl, material, infill }, authed: true,
    }),
};
export const quotesApi = {
  list: () => request<unknown[]>("/admin/quotes", { authed: true }),
  create: (data: unknown) => request("/quotes", { method: "POST", body: data }),
};

/* ──────────── Enquiries ──────────── */
export const enquiriesApi = {
  list: () => request<unknown[]>("/admin/enquiries", { authed: true }),
  create: (data: unknown) => request("/enquiries", { method: "POST", body: data }),
};

/* ──────────── Users (admin) ──────────── */
export const adminApi = {
  users: () => request<unknown[]>("/admin/users", { authed: true }),
  stats: () => request<{ revenue: number; orders: number; products: number; users: number }>("/admin/stats", { authed: true }),
};

/* ──────────── Settings (admin) ──────────── */
export interface AppSettings {
  upi_id: string; upi_payee_name: string; store_name: string;
  store_currency: string; contact_email: string; contact_phone: string;
}
export const settingsApi = {
  get:    () => request<AppSettings>("/settings"),
  update: (data: Partial<AppSettings>) =>
    request<AppSettings>("/admin/settings", { method: "PUT", body: data, authed: true }),
};
