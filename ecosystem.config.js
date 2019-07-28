module.exports = {
  apps: [
    {
      name: "cache-service",
      script: "cache-service/server.js",
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
