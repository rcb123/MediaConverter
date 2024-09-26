import { writable } from 'svelte/store';
import { MediaType } from '$lib/files';
import type { AudioSettings, ImageSettings, VideoSettings } from '$lib/ffmpeg.d';
import type { MediaFormat } from '$lib/mediaFormats';

export const ffmpegInitialized = writable(false);
export const mediaType = writable<MediaType | null>(null);
export const advancedMode = writable(false);
export const loading = writable(false);
export const formatOptions = writable<{ label: string; value: MediaFormat }[]>([]);
export const options = writable<{
	[MediaType.Audio]: AudioSettings;
	[MediaType.Image]: ImageSettings;
	[MediaType.Video]: VideoSettings;
}>({
	[MediaType.Audio]: {
		format: 'mp3',
		bitrate: '',
		codec: '',
		channels: ''
	},
	[MediaType.Image]: {
		format: 'jpeg',
		resolution: '',
		quality: 100
	},
	[MediaType.Video]: {
		format: 'mp4',
		resolution: '',
		bitrate: '',
		frameRate: '',
		codec: ''
	}
});
