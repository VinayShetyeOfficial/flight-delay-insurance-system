/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "content.airhex.com",
        pathname: "/content/logos/**",
      },
    ],
  },
};

module.exports = nextConfig;
