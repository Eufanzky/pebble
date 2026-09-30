import type { NextConfig } from "next";

// /api/* is proxied to the backend by app/api/[...path]/route.ts, which adds
// the signed-in user's access token (roadmap 4.3).
const nextConfig: NextConfig = {};

export default nextConfig;
