/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Desativa temporariamente para evitar warnings
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // NENHUMA configuração de rewrites ou env complicado
};

module.exports = nextConfig;