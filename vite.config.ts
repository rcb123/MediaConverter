/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

const crossOriginIsolation: Plugin = {
	name: 'cross-origin-isolation',
	configureServer: (server) => {
		server.middlewares.use((_, response, next) => {
			response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
			response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
			response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
			next();
		});
	},
	configurePreviewServer: (server) => {
		server.middlewares.use((_, response, next) => {
			response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
			response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
			response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
			next();
		});
	}
};

export default defineConfig({
	optimizeDeps: {
		exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
	},
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter({
				runtime: 'nodejs22.x'
			})
		}),
		tailwindcss(),
		crossOriginIsolation
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
