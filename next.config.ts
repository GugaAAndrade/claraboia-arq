import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [45, 56, 58, 60, 68, 70, 72, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ualbydjwefsdozxwiric.supabase.co",
        pathname: "/storage/v1/object/public/images/**",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
