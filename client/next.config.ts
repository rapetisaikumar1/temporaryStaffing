import type { NextConfig } from "next";

const apiRewriteTarget = process.env.API_URL?.trim().replace(/\/$/, '');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    if (!apiRewriteTarget) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiRewriteTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
