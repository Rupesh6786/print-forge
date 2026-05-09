/**
 * PrintForge API service — talks to the DigitalOcean Express server
 * which is backed by Hostinger MySQL. Configure via VITE_API_URL.
 */
import { auth } from "@/lib/firebase";

export const API_URL = (import.meta.env.VITE_API_URL || "https://api.printforge.space").replace(/\/$/, "");

/** Absolute URL for a product image streamed by the API. */
export const productImageUrl = (id: number | string) => `${API_URL}/products/${id}/image`;
/** Absolute URL for an additional gallery image streamed by the API. */
export const productGalleryImageUrl = (imgId: number | string) => `${API_URL}/product-images/${imgId}`;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function authHeader(): Promise<Record<string, string>> {
  try {
    const t = await auth.currentUser?.getIdToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch { return {}; }
}

async function request<T>(path: string, opts: { method?: Method; body?: unknown; authed?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.authed) Object.assign(headers, await authHeader());
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  // Some endpoints return empty bodies
  const ct = res.headers.get("content-type") || "";
  return (ct.includes("application/json") ? res.json() : (undefined as unknown)) as T;
}

async function multipart<T>(path: string, form: FormData, method: Method = "POST"): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method, body: form, headers: { ...(await authHeader()) },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text().catch(() => res.statusText)}`);
  return res.json() as Promise<T>;
}

/* ────────── Products ────────── */
export interface ApiProduct {
  id: number;
  name: string;
  tagline: string | null;
  description: string | null;
  price: number;
  category_id: number | null;
  image_mime: string | null;
  image_url?: string;     // server returns "/products/:id/image"
  materials: string;       // CSV: "PLA,ABS"
  colors?: string | null;  // CSV of available colors, e.g. "Black,White"
  stock: number;
  rating: number;
  is_active: number;
}

export const productsApi = {
  list: () => request<ApiProduct[]>("/products"),
  get:  (id: number | string) => request<ApiProduct>(`/products/${id}`),
  create: (form: FormData) => multipart<{ id: number }>("/admin/products", form, "POST"),
  update: (id: number | string, form: FormData) => multipart<{ ok: true }>(`/admin/products/${id}`, form, "PUT"),
  remove: (id: number | string) => request<void>(`/admin/products/${id}`, { method: "DELETE", authed: true }),
  /** List extra gallery images for a product. */
  images: (id: number | string) =>
    request<{ id: number; product_id: number; image_url: string; image_mime: string; sort_order: number; is_primary: number }[]>(
      `/products/${id}/images`
    ),
  /** Upload one or more gallery images. `images` is a FormData with field name "images" (repeated). */
  uploadImages: (id: number | string, form: FormData) =>
    multipart<{ ok: true; inserted: { id: number; image_url: string }[] }>(`/admin/products/${id}/images`, form, "POST"),
  /** Delete a single gallery image. */
  removeImage: (imgId: number | string) =>
    request<{ ok: true }>(`/admin/product-images/${imgId}`, { method: "DELETE", authed: true }),
};

/* ────────── Orders ────────── */
export interface ApiOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string | null;
  total_amount: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_ref: string | null;
  status: "pending" | "printing" | "shipped" | "delivered" | "cancelled";
  payment_method: "upi_qr" | "razorpay" | "cod";
  notes: string | null;
  created_at: string;
}
export const ordersApi = {
  create: (data: unknown) => request<{ id: number; order_number: string }>("/orders", { method: "POST", body: data }),
  list:   () => request<ApiOrder[]>("/admin/orders", { authed: true }),
  updateStatus: (id: number, status: ApiOrder["status"]) =>
    request<{ ok: true }>(`/admin/orders/${id}/status`, { method: "PATCH", body: { status }, authed: true }),
  markPaid: (id: number, payment_ref?: string) =>
    request<{ ok: true }>(`/admin/orders/${id}/paid`, { method: "PATCH", body: { payment_ref }, authed: true }),
};

/* ────────── STL ────────── */
export const stl = {
  upload: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return multipart<{ id: number; filename: string; size_bytes: number }>("/stl/upload", fd, "POST");
  },
  fileUrl: (id: number | string) => `${API_URL}/stl/${id}/file`,
  quote: (sizeBytes: number, material: string, infill: number) =>
    request<{ price: number; weightGrams: number; printHours: number }>("/stl/quote", {
      method: "POST", body: { sizeBytes, material, infill }, authed: true,
    }),
  listAdmin: () => request<ApiStlUpload[]>("/admin/stl-uploads", { authed: true }),
};

export interface ApiStlUpload {
  id: number;
  filename: string;
  mime_type: string;
  size_bytes: number;
  user_id: number | null;
  created_at: string;
  quote_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  material: string | null;
  estimated_price: number | null;
  quote_status: string | null;
  notes: string | null;
  user_email: string | null;
  user_display_name: string | null;
}

export const quotesApi = {
  list:   () => request<any[]>("/admin/quotes", { authed: true }),
  create: (data: unknown) => request("/quotes", { method: "POST", body: data }),
};

/* ────────── Enquiries ────────── */
export const enquiriesApi = {
  list:   () => request<any[]>("/admin/enquiries", { authed: true }),
  create: (data: unknown) => request("/enquiries", { method: "POST", body: data }),
};

/* ────────── Users / stats ────────── */
export interface ApiUser {
  id: number; firebase_uid: string; email: string; display_name: string | null;
  phone: string | null; role: "admin" | "user"; created_at: string;
}
export const usersApi = {
  /** Sync the current Firebase user into MySQL. Call once after login. */
  sync: (data?: { display_name?: string; phone?: string }) =>
    request<{ ok: true; role: "admin" | "user" }>("/users/sync", { method: "POST", body: data ?? {}, authed: true }),
  list: () => request<ApiUser[]>("/admin/users", { authed: true }),
};

export const adminApi = {
  stats: () => request<{ revenue: number; orders: number; products: number; users: number }>("/admin/stats", { authed: true }),
  revenueWeekly: () =>
    request<{ d: string; v: number }[]>("/admin/revenue/weekly", { authed: true }),
};

/* ────────── Services ────────── */
export interface ApiService {
  id: number;
  name: string;
  price_label: string;
  description: string | null;
  is_active: number;
  sort_order: number;
  created_at?: string;
}
export const servicesApi = {
  list:   () => request<ApiService[]>("/services"),
  create: (data: Partial<ApiService>) => request<{ id: number }>("/admin/services", { method: "POST", body: data, authed: true }),
  update: (id: number, data: Partial<ApiService>) => request<{ ok: true }>(`/admin/services/${id}`, { method: "PUT", body: data, authed: true }),
  remove: (id: number) => request<{ ok: true }>(`/admin/services/${id}`, { method: "DELETE", authed: true }),
};

/* ────────── Categories ────────── */
export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}
export const categoriesApi = {
  list:   () => request<ApiCategory[]>("/categories"),
  create: (data: { name: string; slug?: string; description?: string }) =>
    request<{ id: number; name: string; slug: string }>("/admin/categories", { method: "POST", body: data, authed: true }),
};

/* ────────── Settings ────────── */
export interface AppSettings {
  upi_id: string;
  upi_payee_name: string;
  store_name: string;
  store_currency: string;
  contact_email: string;
  contact_phone: string;
}
export const settingsApi = {
  get:    () => request<Partial<AppSettings>>("/settings"),
  update: (data: Partial<AppSettings>) =>
    request<{ ok: true }>("/admin/settings", { method: "PUT", body: data, authed: true }),
};

/* ────────── Razorpay ────────── */
export interface RazorpayOrderResp {
  id: string;
  amount: number;     // paise
  currency: string;
  keyId: string;
}
export const paymentsApi = {
  getKey: () => request<{ keyId: string | null }>("/payments/razorpay/key"),
  createOrder: (amount: number, receipt?: string, notes?: Record<string, string>) =>
    request<RazorpayOrderResp>("/payments/razorpay/order", {
      method: "POST", body: { amount, receipt, notes },
    }),
  verify: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    request<{ ok: true; payment_id: string; order_id: string }>("/payments/razorpay/verify", {
      method: "POST", body: data,
    }),
};

/* ────────── Lithophane ────────── */
export interface ApiLithophane {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  color: string;
  size: string;
  notes: string | null;
  status: "pending" | "approved" | "printing" | "shipped" | "completed" | "cancelled";
  image_mime: string | null;
  created_at: string;
}
export const lithophaneImageUrl = (id: number | string) => `${API_URL}/lithophanes/${id}/image`;
export const lithophaneApi = {
  create: (form: FormData) => multipart<{ id: number }>("/lithophanes", form, "POST"),
  list:   () => request<ApiLithophane[]>("/admin/lithophanes", { authed: true }),
  updateStatus: (id: number, status: ApiLithophane["status"]) =>
    request<{ ok: true }>(`/admin/lithophanes/${id}/status`, { method: "PATCH", body: { status }, authed: true }),
};

/* ────────── Legacy token shims (kept so old imports compile) ────────── */
const TOKEN_KEY = "printforge_jwt";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); };
export const orders = ordersApi; // back-compat alias
