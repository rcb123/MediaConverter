import { writable } from 'svelte/store';
import type { MediaType } from '$lib/media';
import type { AudioOptions, ImageOptions, VideoOptions } from '$lib/ffmpeg';
import type { MediaFormat } from '$lib/media';

export const mediaType = writable<MediaType | null>(null);
export const previewUrl = writable<string | null>(null);
export const showMediaPreviewModal = writable(false);
export const loadingStoredMedia = writable(true);
export const isDraggingOver = writable(false);
export const advancedMode = writable(false);
export const loading = writable(false);
export const isFFmpegInitialized = writable(false);
export const formatOptions = writable<{ label: string; value: MediaFormat }[]>([]);
export const options = writable<{
	audio: AudioOptions;
	image: ImageOptions;
	video: VideoOptions;
}>({
	audio: {
		format: 'mp3'
	},
	image: {
		format: 'jpeg'
	},
	video: {
		format: 'mp4'
	}
});
