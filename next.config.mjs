/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable API routes for email service
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;






