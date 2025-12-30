import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config) => {
        config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300,
        }
        return config
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    reactCompiler: true,
    experimental: {
        turbopackFileSystemCacheForDev: true,
    },
};

export default nextConfig;
