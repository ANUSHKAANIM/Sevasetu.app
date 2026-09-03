import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root: this project lives inside a directory whose
  // parent (the user's home folder) happens to contain an unrelated
  // package.json/lockfile from a different git repo, which otherwise
  // confuses Turbopack's automatic root detection.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
