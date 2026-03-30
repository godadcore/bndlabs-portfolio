import { publishedPostsQuery } from "../../src/lib/sanity/queries.js";
import { hasSanityServerConfig, sanityServerClient } from "./client.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  if (!hasSanityServerConfig || !sanityServerClient) {
    res.status(500).json({ error: "Sanity server configuration is missing." });
    return;
  }

  try {
    const posts = await sanityServerClient.fetch(publishedPostsQuery);

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      source: "sanity",
      posts: Array.isArray(posts) ? posts : [],
    });
  } catch (error) {
    console.error("SANITY_POSTS_API_ERROR", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(502).json({ error: "Unable to load Sanity posts." });
  }
}
