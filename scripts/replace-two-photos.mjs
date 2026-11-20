import { execFileSync } from "node:child_process";
import { statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const folder = path.join(root, "src", "assets", "samples");
const headers = {
  "User-Agent": "BndlabsPortfolioSampleBot/1.0 (local sample assets; hello@getbndlabs.com)",
};

function strip(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function commonsFile(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", `${query} filetype:bitmap`);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "12");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|extmetadata");
  url.searchParams.set("iiurlwidth", "1600");
  url.searchParams.set("format", "json");
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`commons ${response.status}`);
  const payload = await response.json();
  const pages = Object.values(payload.query?.pages || {});
  const match = pages
    .map((page) => ({ info: page.imageinfo?.[0], title: page.title }))
    .find(({ info, title }) => {
      const licence = info?.extmetadata?.LicenseShortName?.value || "";
      const allowed = /^(CC0|CC BY( [0-9.]+)?|Public domain)/i.test(licence) && !/SA|NC/i.test(licence);
      const titleText = `${title} ${info?.extmetadata?.ImageDescription?.value || ""}`;
      const blocked = /coca|cola|drawing|illustration|diagram/i.test(titleText);
      return info?.thumburl && /jpe?g|png|webp/i.test(info.mime || "") && allowed && !blocked;
    });
  if (!match) throw new Error(`no photo for ${query}`);
  const meta = match.info.extmetadata || {};
  return {
    url: match.info.thumburl,
    photographer: strip(meta.Artist?.value) || "Unknown",
    page: match.info.descriptionurl || "",
    licence: strip(meta.LicenseShortName?.value),
    title: match.title,
  };
}

function shrink(name) {
  const destination = path.join(folder, name);
  const script = `
Add-Type -AssemblyName System.Drawing
$path = '${destination.replace(/'/g, "''")}'
$image = [System.Drawing.Image]::FromFile($path)
$width = [Math]::Min(1400, $image.Width)
$height = [Math]::Max(1, [int]($image.Height * ($width / $image.Width)))
$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($image, 0, 0, $width, $height)
$image.Dispose()
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]55)
$bitmap.Save($path, $codec, $params)
$bitmap.Dispose()
$graphics.Dispose()
`;
  execFileSync("powershell", ["-NoProfile", "-Command", script], { stdio: "pipe" });
  return statSync(destination).size;
}

const jobs = [
  ["sample-velora-pack.jpg", ["mason jars", "empty glass jars", "ceramic jars"]],
  ["sample-copy-paper.jpg", ["typewriter desk", "person typing on a typewriter", "blank paper and pen"]],
];

for (const [name, queries] of jobs) {
  let found;
  for (const query of queries) {
    try {
      found = await commonsFile(query);
      break;
    } catch (error) {
      console.log("miss", query, error.message);
    }
  }
  if (!found) throw new Error(`failed ${name}`);
  const response = await fetch(found.url, { headers });
  if (!response.ok) throw new Error(`${name} ${response.status}`);
  writeFileSync(path.join(folder, name), Buffer.from(await response.arrayBuffer()));
  const size = shrink(name);
  console.log(JSON.stringify({ name, size, ...found }));
}

for (const name of ["sample-edit-marks.jpg", "sample-language-books.jpg", "sample-brand-color.jpg"]) {
  const size = shrink(name);
  console.log("shrunk", name, size);
}
