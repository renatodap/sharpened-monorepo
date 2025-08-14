/** @type {import('next').NextConfig} */
const nextConfig = {
  // Override the build to use the actual website
  distDir: '.next-temp',
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig