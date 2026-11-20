import {
  Code,
  Database,
  FigmaLogo,
  FileCss,
  FileHtml,
  FileJs,
  FramerLogo,
  GitBranch,
  GithubLogo,
  NotionLogo,
  PaintBrush,
  Square,
} from "@phosphor-icons/react";

const ICONS = {
  figma: FigmaLogo,
  framer: FramerLogo,
  notion: NotionLogo,
  react: Code,
  "next.js": Code,
  nextjs: Code,
  javascript: FileJs,
  typescript: FileJs,
  css: FileCss,
  html: FileHtml,
  "node.js": Code,
  nodejs: Code,
  python: Code,
  supabase: Database,
  postgresql: Database,
  git: GitBranch,
  github: GithubLogo,
  photoshop: PaintBrush,
  coreldraw: PaintBrush,
};

export default function ToolIcon({ name }) {
  const key = String(name || "").trim().toLowerCase();
  const Icon = ICONS[key] || Square;
  return <Icon size={22} weight="regular" aria-hidden="true" />;
}
