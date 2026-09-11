/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/app',
        destination: '/',
      },
      {
        source: '/app/:path*',
        destination: '/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
      {
        source: '/static/:path*',
        destination: 'http://127.0.0.1:8000/static/:path*',
      },
      {
        source: '/assets/:path*',
        destination: 'http://127.0.0.1:8000/assets/:path*',
      },
    ];
  },
};

export default nextConfig;
