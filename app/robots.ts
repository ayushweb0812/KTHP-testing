import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/reserve", "/privacy", "/terms"],
      disallow: [
        "/login",
        "/profile/",
        "/payment/",
        "/book/",
      ],
    },
    sitemap: "https://kilatheheritagepalace.vercel.app/sitemap.xml",
  };
}
