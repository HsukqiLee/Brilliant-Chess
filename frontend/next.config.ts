import type { NextConfig } from "next"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

const nextConfig: NextConfig = {
  /* config options here */
  // reactStrictMode: false,
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath ? basePath + "/" : undefined,
  distDir: "dist",
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: `${basePath}/(.*)`,
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
      {
        source: `${basePath}/engine/(.*)`,
        headers: [
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ]
  }
}

export default nextConfig
