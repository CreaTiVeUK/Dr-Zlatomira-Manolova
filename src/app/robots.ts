import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getSiteUrl();

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin",
                    "/admin/",
                    "/api/",
                    "/auth/",
                    "/profile",
                    "/my-appointments",
                    "/messages",
                    "/book",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
