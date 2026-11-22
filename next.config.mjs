/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    agentFeedback: true,
  },
  // la app vive en /app: la raíz entra directo al inicio
  redirects() {
    return [{ source: '/', destination: '/app/home', permanent: false }];
  },
};

export default nextConfig;
