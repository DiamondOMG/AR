/** @type {import('vite').UserConfig} */
export default {
	build: {
		rollupOptions: {
			input: {
				index: "index.html",
				game: "game.html",
			},
		},
		assetsInclude: ["**/*.patt", "**/*.gltf", "**/*.bin", "**/*.glb"],
	},
	base: "/",
	publicDir: "public",
};
