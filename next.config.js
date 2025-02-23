/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["assets.wego.com", "content.airhex.com"],
    minimumCacheTTL: 3600,
  },
};

module.exports = nextConfig;
