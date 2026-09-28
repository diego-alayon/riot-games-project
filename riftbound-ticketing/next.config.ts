import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app lives inside the Riot Games Project repo but is its own project.
  // Pin the root so Turbopack never resolves modules from the parent app.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
