/** @type {import('vite').UserConfig} */
export default {
  build: {
    rollupOptions: {
      input: ["index.html", "game.html"],
    },
    assetsInclude: ["**/*.patt", "**/*.gltf", "**/*.bin", "**/*.glb"],
  },
  base: "/",
  publicDir: "public",
};
