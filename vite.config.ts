import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodeLoaderPlugin } from '@vavite/node-loader/plugin';

export default defineConfig({
	plugins: [nodeLoaderPlugin(), sveltekit()]
});
