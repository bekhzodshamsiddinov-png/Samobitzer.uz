import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
  // Old site paths that may still be bookmarked or indexed.
  async redirects() {
    return [
      { source: '/about', destination: '/uz#why', permanent: true },
      { source: '/projects', destination: '/uz#projects', permanent: true },
      { source: '/services', destination: '/uz/catalog', permanent: true },
      { source: '/contact', destination: '/uz#contact', permanent: true },
      { source: '/login', destination: '/admin/login', permanent: false },
    ]
  },
}

export default nextConfig
