const headers = {
  "User-Agent": "BndlabsPortfolioSampleBot/1.0 (local sample assets; hello@getbndlabs.com)",
};

const pages = [
  "https://github.com/react/react",
  "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=aqz-KE-bpKQ&format=json",
  "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=eRsGyueVLvQ&format=json",
  "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=OHOpb2fS-cM&format=json",
  "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=WhWc3b3KhnY&format=json",
  "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=Y-rmzh0PI3c&format=json",
  "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=_cMxraX_5RE&format=json",
  "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=mN0zPOpADL4&format=json",
];

for (const url of pages) {
  const response = await fetch(url, { headers, redirect: "follow" });
  const body = response.headers.get("content-type")?.includes("json") ? await response.json() : null;
  console.log(JSON.stringify({
    status: response.status,
    final: response.url,
    title: body?.title || "",
    author: body?.author_name || "",
  }));
}

const films = [
  "Big Buck Bunny",
  "Sintel",
  "Tears of Steel",
  "Spring Blender",
  "Cosmos Laundromat",
  "Sprite Fright",
  "Agent 327",
];

for (const title of films) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", `${title} filetype:video`);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "3");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|extmetadata");
  url.searchParams.set("format", "json");
  const response = await fetch(url, { headers });
  const payload = await response.json();
  const pagesFound = Object.values(payload.query?.pages || {}).map((page) => ({
    title: page.title,
    licence: page.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value || "",
    page: page.imageinfo?.[0]?.descriptionurl || "",
  }));
  console.log(JSON.stringify({ query: title, status: response.status, pages: pagesFound }));
}
