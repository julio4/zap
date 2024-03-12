/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      o1js: require("path").resolve("node_modules/o1js"),
    };
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  // To enable o1js for the web, we must set the COOP and COEP headers.
  // See here for more information: https://docs.minaprotocol.com/zkapps/how-to-write-a-zkapp-ui#enabling-coop-and-coep-headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
        ],
      },
    ];
  },

  env: {
    ORACLE_ENDPOINT: "https://zap-oracle.onrender.com/api",
    AIRSTACK_SOURCE_PUBLIC_KEY: "B62qnhBxxQr7h2AE9f912AyvzJwK1fhEJq7NMZXbzXbhoepUZ7z7237",
    ZK_APP: "B62qpAdGKr4UyC9eGi3astRV38oC95VAxn2PaS9r4Gj7oobNhqdSn8u",
  },
};

module.exports = nextConfig;
