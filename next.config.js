/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Silence the "Extra attributes from server" React 19 hydration warnings from browser extensions
  reactStrictMode: true,
};

module.exports = nextConfig;
