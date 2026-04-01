/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.williamvance.app',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;