import type { MetadataRoute } from "next";

/** A personal app: nothing here should be crawled. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
