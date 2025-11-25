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
};

export default nextConfig;
