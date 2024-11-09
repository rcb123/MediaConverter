import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

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
	plugins: [sveltekit(), crossOriginIsolation],
	optimizeDeps: {
		exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
	}
});
