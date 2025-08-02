/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude mobile directory from Next.js compilation
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/mobile/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
