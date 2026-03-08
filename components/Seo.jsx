import Head from "next/head";
import { useRouter } from "next/router";

const SITE_URL = "https://www.oggoair.com";
const SITE_NAME = "OggoAir";
const DEFAULT_DESCRIPTION =
  "Book cheap flights, hotels, and bus tickets worldwide. Compare prices from hundreds of airlines and travel providers to find the best deals on OggoAir.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  children,
}) {
  const router = useRouter();
  const canonical = `${SITE_URL}${router.asPath.split("?")[0]}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {children}
    </Head>
  );
}
