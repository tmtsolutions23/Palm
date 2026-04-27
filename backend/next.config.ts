import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable Cache Components when stable in deployment
    // cacheComponents: true,
  },
  // CORS for the mobile client. Mobile apps don't need CORS at all
  // (they use Bearer tokens, not cookies). This headers() config is
  // only needed if you add a web landing page or dev tools that call the API.
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "development"
                ? "*"
                : "https://palmreader.app https://api.palmreader.app",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PATCH,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default config;