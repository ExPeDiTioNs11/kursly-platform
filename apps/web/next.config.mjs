/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces a minimal standalone server bundle for the Docker runtime stage.
  output: 'standalone',
  // Allow @kursly/shared to be transpiled from source within the monorepo.
  transpilePackages: ['@kursly/shared'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
