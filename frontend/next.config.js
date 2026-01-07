/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // This enables static export for GitHub Pages
  trailingSlash: true, // Add trailing slashes to make routing work on GitHub Pages
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  },
  // Since we're using static export, we need to handle the API base URL differently
  // This will be configured after deployment based on your GitHub Pages URL
};

module.exports = nextConfig;