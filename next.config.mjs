/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'woocommerce-1355247-4989037.cloudwaysapps.com', // existing domain
      'yourcdn.com', // 👈 added new CDN domain
    ],
  },
};

export default nextConfig;
