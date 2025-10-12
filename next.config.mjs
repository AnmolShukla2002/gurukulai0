/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbopack: false,
        serverActions: {
            bodySizeLimit: '10mb',
        }
    }
};

export default nextConfig;
