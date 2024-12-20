/** @type {import('vite').UserConfig} */
export default {
  build: {
    rollupOptions: {
      input: ["index.html", "game.html"],
    },
  },
};
