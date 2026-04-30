import { useEffect, useState } from "react";
import { productsApi } from "@/services/api";

const SITE = "https://printforge.space";

const staticUrls: { loc: string; changefreq: string; priority: string }[] = [
  { loc: "/",          changefreq: "daily",   priority: "1.0" },
  { loc: "/shop",      changefreq: "daily",   priority: "0.9" },
  { loc: "/upload",    changefreq: "weekly",  priority: "0.8" },
  { loc: "/materials", changefreq: "monthly", priority: "0.7" },
  { loc: "/about",     changefreq: "monthly", priority: "0.6" },
  { loc: "/careers",   changefreq: "weekly",  priority: "0.6" },
  { loc: "/contact",   changefreq: "monthly", priority: "0.6" },
  { loc: "/privacy",   changefreq: "yearly",  priority: "0.3" },
  { loc: "/terms",     changefreq: "yearly",  priority: "0.3" },
];

const buildXml = (extra: { loc: string; lastmod?: string }[]) => {
  const urls = [
    ...staticUrls.map((u) => ({ ...u, lastmod: undefined as string | undefined })),
    ...extra.map((e) => ({ loc: e.loc, lastmod: e.lastmod, changefreq: "weekly", priority: "0.7" })),
  ];
  const body = urls.map((u) => `  <url>
    <loc>${SITE}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
};

const Sitemap = () => {
  const [xml, setXml] = useState<string>("");
  useEffect(() => {
    productsApi.list()
      .then((rows) => setXml(buildXml(rows.map((r) => ({
        loc: `/shop/${r.id}`,
        lastmod: (r as any).updated_at ? new Date((r as any).updated_at).toISOString().slice(0, 10) : undefined,
      })))))
      .catch(() => setXml(buildXml([])));
  }, []);

  if (!xml) return null;
  return (
    <pre style={{
      whiteSpace: "pre-wrap", wordBreak: "break-word",
      fontFamily: "ui-monospace, monospace", fontSize: 12, padding: 16, margin: 0,
    }}>{xml}</pre>
  );
};
export default Sitemap;
