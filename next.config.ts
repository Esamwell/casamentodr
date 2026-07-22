import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acesso pela rede local via IP (corrige o bloqueio do WebSocket HMR)
  allowedDevOrigins: ["192.168.0.176"],
};

export default nextConfig;
