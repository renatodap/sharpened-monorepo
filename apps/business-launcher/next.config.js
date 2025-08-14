/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Enable static exports for offline functionality
  output: 'standalone',
  // Optimize for faster builds
  swcMinify: true,
  // Enable React strict mode
  reactStrictMode: true,
}

module.exports = nextConfig