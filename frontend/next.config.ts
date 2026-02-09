import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '9000',
                pathname: '/omnimetric-storage/**', // Scopes permissions to just this folder
            }
        ],
    },

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