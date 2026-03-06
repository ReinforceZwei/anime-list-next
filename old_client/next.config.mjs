/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        }
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    output: 'standalone',
    trailingSlash: true,
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: '/api/:path*',
                    destination: `${process.env.POCKETBASE_API_URL}/api/:path*`
                },
                {
                    source: '/_/:path*',
                    destination: `${process.env.POCKETBASE_API_URL}/_/:path*/`
                },
            ]
        }
    },
};

export default nextConfig;
