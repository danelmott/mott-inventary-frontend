// Los archivos `*.dev.js` solo son rutas en `next dev`: así /docs no llega al build de producción.
const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: isDev ? ['dev.js', 'js', 'jsx'] : ['js', 'jsx'],
  experimental: {
    agentFeedback: true,
  },
};

export default nextConfig;
