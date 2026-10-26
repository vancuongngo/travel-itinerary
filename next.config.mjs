// BASE_PATH is set by the GitHub Pages workflow (e.g. "/travel-itinerary"); empty locally.
const basePath = process.env.BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  trailingSlash: true,
};

export default nextConfig;
