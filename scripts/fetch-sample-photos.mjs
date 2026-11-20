import { execFileSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const folder = path.join(root, "src", "assets", "samples");
mkdirSync(folder, { recursive: true });

const searches = [
  ["sample-product-market.jpg", ["fruit market stall", "outdoor fruit market"]],
  ["sample-nuvora-print.jpg", ["letterpress printing", "printing press"]],
  ["sample-velora-pack.jpg", ["glass bottles", "wine bottles shelf"]],
  ["sample-pulse-poster.jpg", ["street posters wall", "wheatpaste posters"]],
  ["sample-essay-desk.jpg", ["writing in a notebook", "desk notebook pen"]],
  ["sample-copy-paper.jpg", ["printed paper desk", "typewriter paper"]],
  ["sample-edit-marks.jpg", ["editing a manuscript", "proofreading paper"]],
  ["sample-language-books.jpg", ["stacked books", "bookshelf close up"]],
  ["sample-brand-type.jpg", ["letterpress type", "metal type sorts"]],
  ["sample-brand-color.jpg", ["paint color swatches", "colour sample cards"]],
];

const films = [
  ["sample-video-bunny.jpg", "aqz-KE-bpKQ"],
  ["sample-video-sintel.jpg", "eRsGyueVLvQ"],
  ["sample-video-tears.jpg", "OHOpb2fS-cM"],
  ["sample-video-spring.jpg", "WhWc3b3KhnY"],
  ["sample-video-cosmos.jpg", "Y-rmzh0PI3c"],
  ["sample-video-sprite.jpg", "_cMxraX_5RE"],
  ["sample-video-agent.jpg", "mN0zPOpADL4"],
];

function strip(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const headers = {
  "User-Agent": "BndlabsPortfolioSampleBot/1.0 (local sample assets; hello@getbndlabs.com)",
  Accept: "application/json,image/*",
};

async function commonsFile(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", `${query} filetype:bitmap`);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "8");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|size|extmetadata");
  url.searchParams.set("iiurlwidth", "1600");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`commons ${response.status}`);
  const payload = await response.json();
  const pages = Object.values(payload.query?.pages || {});
  const match = pages
    .map((page) => ({ page, info: page.imageinfo?.[0] }))
    .find(({ info }) => {
      const licence = info?.extmetadata?.LicenseShortName?.value || "";
      const allowed = /^(CC0|CC BY( [0-9.]+)?|Public domain)/i.test(licence) && !/SA|NC/i.test(licence);
      return info?.thumburl && /jpe?g|png|webp/i.test(info.mime || "") && allowed;
    });
  if (!match) throw new Error(`no photo for ${query}`);
  const meta = match.info.extmetadata || {};
  return {
    url: match.info.thumburl,
    photographer: strip(meta.Artist?.value) || "Unknown",
    source: meta.LicenseUrl?.value || match.info.descriptionurl || "",
    page: match.info.descriptionurl || "",
    licence: strip(meta.LicenseShortName?.value),
  };
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function save(name, url) {
  let response;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await wait(1500 * (attempt + 1));
    response = await fetch(url, { headers });
    if (response.ok) break;
    if (response.status !== 429) break;
  }
  if (!response.ok) throw new Error(`${name} ${response.status} ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const destination = path.join(folder, name);
  writeFileSync(destination, bytes);
  return bytes.length;
}

function shrink(name) {
  const destination = path.join(folder, name);
  if (statSync(destination).size <= 300_000) return statSync(destination).size;
  const script = `
Add-Type -AssemblyName System.Drawing
$path = '${destination.replace(/'/g, "''")}'
$image = [System.Drawing.Image]::FromFile($path)
$width = [Math]::Min(1600, $image.Width)
$height = [Math]::Max(1, [int]($image.Height * ($width / $image.Width)))
$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($image, 0, 0, $width, $height)
$image.Dispose()
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]68)
$bitmap.Save($path, $codec, $params)
$bitmap.Dispose()
$graphics.Dispose()
`;
  execFileSync("powershell", ["-NoProfile", "-Command", script], { stdio: "pipe" });
  return statSync(destination).size;
}

async function firstPhoto(queries) {
  let lastError;
  for (const query of queries) {
    try {
      return await commonsFile(query);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

const credits = ["# Sample image credits", "", "These files are demonstration photographs and video posters. They are not client work.", ""];

for (const [name, queries] of searches) {
  const found = await firstPhoto(queries);
  await save(name, found.url);
  const size = shrink(name);
  credits.push(`- ${name}: ${found.photographer}. Source: ${found.page}. Licence: ${found.licence}. ${size} bytes.`);
  console.log(name, size, found.licence);
}

for (const [name, id] of films) {
  const url = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  let size = 0;
  try {
    size = await save(name, url);
  } catch {
    size = await save(name, `https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
  }
  credits.push(`- ${name}: poster for the official Blender YouTube upload https://www.youtube.com/watch?v=${id}. The film is © Blender Foundation, CC BY 3.0. ${size} bytes.`);
  console.log(name, size);
}

writeFileSync(path.join(root, "CREDITS.md"), `${credits.join("\n")}\n`);
