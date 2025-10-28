// next.config.ts
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repo = "security-video"; // ←あなたのリポジトリ名に変更

const nextConfig: NextConfig = {
  output: "export",                 // ← Next 14+ は next build で out/ に静的書き出し
  images: { unoptimized: true },    // ← 画像最適化APIは静的書き出し不可
  basePath: isProd ? `/${repo}` : "",        // ← サブパス対応
  assetPrefix: isProd ? `/${repo}/` : "",    // ← 静的アセットのプレフィックス
  // 必要に応じて: trailingSlash: true,
};

export default nextConfig;
