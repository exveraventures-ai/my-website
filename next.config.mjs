/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable server-side features that don't work with static export
  // Since this app uses client-side Supabase, it should work fine
};

export default nextConfig;






