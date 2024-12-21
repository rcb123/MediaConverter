import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.setHeaders({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET',
		'Cross-Origin-Opener-Policy': 'same-origin',
		'Cross-Origin-Embedder-Policy': 'require-corp'
	});
	event.request.headers.set('Access-Control-Allow-Origin', '*');
	event.request.headers.set('Access-Control-Allow-Methods', 'GET');
	event.request.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	event.request.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
	const response = await resolve(event);
	response.headers.set('Access-Control-Allow-Origin', '*');
	response.headers.set('Access-Control-Allow-Methods', 'GET');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

	return response;
};
