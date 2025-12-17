import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/main.js",
            name: "BusinessCard",
            fileName: () => "business-card.min.js",
            formats: ["es"]
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true
            }
        },
        minify: "esbuild",
        emptyOutDir: true
    }
});
