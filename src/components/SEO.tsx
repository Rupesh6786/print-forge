import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article" | "product";
  canonical?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noIndex?: boolean;
}

const SITE = "https://printforge.space";

export const SEO = ({
  title, description, image, type = "website", canonical, jsonLd, noIndex,
}: SEOProps) => {
  const { pathname } = useLocation();
  const url = canonical ?? `${SITE}${pathname}`;
  const fullTitle = title.includes("PrintForge") ? title : `${title} · PrintForge`;
  const img = image ?? `${SITE}/og-image.jpg`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:site_name" content="PrintForge" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export const SITE_URL = SITE;
