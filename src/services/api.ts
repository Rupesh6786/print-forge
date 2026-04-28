/**
 * Nexus3D API Service Layer
 * Designed for a REST backend hosted on DigitalOcean (Node/Express)
 * with a Hostinger MySQL database. STL files are uploaded to
 * DigitalOcean Spaces and only the URL is persisted.
 *
 * Configure via:
 *   VITE_API_URL=https://api.your-domain.com
 *   VITE_RAZORPAY_KEY=rzp_test_xxx
 */

const API_URL = import.meta.env.VITE_API_URL || "https://api.nexus3d.example.com";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOpts {
  method?: Method;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
}

const TOKEN_KEY = "nexus_jwt";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers ?? {}),
  };
  if (opts.auth) {
    const token = getToken();
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

/* ───────────── Auth ───────────── */
export interface AuthResponse { token: string; user: { id: string; email: string; name: string; role: "user" | "admin" } }

export const auth = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: { email, password } }),
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: { name, email, password } }),
  me: () => request<AuthResponse["user"]>("/auth/me", { auth: true }),
};

/* ───────────── Products ───────────── */
export const productsApi = {
  list: () => request<unknown[]>("/products"),
  get: (id: string) => request<unknown>(`/products/${id}`),
  create: (data: unknown) => request("/admin/products", { method: "POST", body: data, auth: true }),
  update: (id: string, data: unknown) => request(`/admin/products/${id}`, { method: "PUT", body: data, auth: true }),
  remove: (id: string) => request(`/admin/products/${id}`, { method: "DELETE", auth: true }),
};

/* ───────────── Orders / Razorpay ───────────── */
export interface RazorpayOrder { orderId: string; amount: number; currency: string; key: string }

export const orders = {
  createRazorpay: (amount: number, currency = "INR") =>
    request<RazorpayOrder>("/orders/create-razorpay-order", { method: "POST", body: { amount, currency }, auth: true }),
  list: () => request<unknown[]>("/admin/orders", { auth: true }),
  updateStatus: (id: string, status: "pending" | "printing" | "shipped" | "delivered") =>
    request(`/admin/orders/${id}/status`, { method: "PATCH", body: { status }, auth: true }),
};

/* ───────────── STL Upload ───────────── */
export const stl = {
  // Server returns a presigned URL to upload directly to DigitalOcean Spaces
  presign: (filename: string, sizeBytes: number) =>
    request<{ uploadUrl: string; fileUrl: string }>("/stl/presign", {
      method: "POST",
      body: { filename, sizeBytes },
      auth: true,
    }),
  quote: (fileUrl: string, material: string, infill: number) =>
    request<{ price: number; weightGrams: number; printHours: number }>("/stl/quote", {
      method: "POST",
      body: { fileUrl, material, infill },
      auth: true,
    }),
};

export const adminApi = {
  users: () => request<unknown[]>("/admin/users", { auth: true }),
};
