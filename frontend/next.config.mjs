/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        }/:path*`,
      },
    ]
  },
  images: {
    domains: ['via.placeholder.com'],
  },
}

export default nextConfig
