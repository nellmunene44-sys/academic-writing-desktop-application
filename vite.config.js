const { resolve } = require("path");
const react = require("@vitejs/plugin-react");

module.exports = {
  root: resolve(__dirname, "src/renderer"),
  plugins: [react()],
  base: "./",
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true
  }
};
