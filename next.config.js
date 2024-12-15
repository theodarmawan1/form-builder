const { hostname } = require('os');

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
    },
    image: {
        remotePatterns: [
            {
                hostname: "utfs.io",
            }
        ]
    }
};

module.exports = nextConfig;
