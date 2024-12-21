import type { ConvertedMediaItem } from '$lib/media';

import { advancedMode, formatOptions, mediaType } from './stores';
import { convertedMedia } from './storage';
import { MediaType } from '$lib/files';
import { get, type Writable } from 'svelte/store';
import {
	baseAudioFormats,
	baseImageFormats,
	baseVideoFormats,
	extendedAudioFormats,
	extendedImageFormats,
	extendedVideoFormats
} from '$lib/media';

import JSZip from 'jszip';
import { toast } from 'svelte-sonner';

export function updatePreview(selectedFiles: File[], previewUrl: Writable<string | null>) {
	if (selectedFiles.length > 0) {
		const file = selectedFiles[0];
		if (file.type.startsWith('image/')) {
			mediaType.set(MediaType.Image);
			previewUrl.set(URL.createObjectURL(file));
		} else if (file.type.startsWith('video/')) {
			mediaType.set(MediaType.Video);
			previewUrl.set(URL.createObjectURL(file));
		} else if (file.type.startsWith('audio/')) {
			mediaType.set(MediaType.Audio);
			previewUrl.set(URL.createObjectURL(file));
		} else {
			mediaType.set(null);
			previewUrl.set(null);
		}
	} else {
		mediaType.set(null);
		previewUrl.set(null);
	}
}

export function updateFormatOptions() {
	const currentMediaType = get(mediaType);
	const isAdvancedMode = get(advancedMode);

	switch (currentMediaType) {
		case MediaType.Audio:
			formatOptions.set(isAdvancedMode ? extendedAudioFormats : baseAudioFormats);
			break;
		case MediaType.Image:
			formatOptions.set(isAdvancedMode ? extendedImageFormats : baseImageFormats);
			break;
		case MediaType.Video:
			formatOptions.set(isAdvancedMode ? extendedVideoFormats : baseVideoFormats);
			break;
		default:
			formatOptions.set([]);
			break;
	}
}

export function getDateGroup(date: Date): string {
	const now = new Date();

	// Create new Date objects at midnight for accurate day comparison
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

	// Calculate the difference in milliseconds
	const diffTime = today.getTime() - targetDate.getTime();
	// Convert milliseconds to days
	const diffDays = diffTime / (1000 * 60 * 60 * 24);

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return 'Last Week';
	if (diffDays < 30) return 'Last Month';
	return 'Older';
}

export function groupConvertedMedia(
	media: ConvertedMediaItem[]
): Record<string, ConvertedMediaItem[]> {
	return media.reduce(
		(groups, item) => {
			const group = getDateGroup(item.date);
			if (!groups[group]) {
				groups[group] = [];
			}
			groups[group].push(item);
			return groups;
		},
		{} as Record<string, ConvertedMediaItem[]>
	);
}

export async function downloadAllMedia() {
	const zip = new JSZip();
	const media = get(convertedMedia);

	for (const item of media) {
		zip.file(item.convertedName, item.blob);
	}

	const content = await zip.generateAsync({ type: 'blob' });
	const url = URL.createObjectURL(content);
	const link = document.createElement('a');
	link.href = url;
	link.download = 'converted_media.zip';
	link.click();
}

export async function copyMediaToClipboard(blob: Blob) {
	try {
		const data = [new ClipboardItem({ [blob.type]: blob })];
		await navigator.clipboard.write(data);
		toast.success('Media copied to clipboard.');
	} catch (err) {
		let errorMessage = 'Failed to copy media to clipboard.';
		if (err && typeof err === 'object' && err.toString().includes('not supported on write')) {
			errorMessage += ` ${blob.type} is not supported by the web Clipboard API.`;
		}
		toast.error(errorMessage);
	}
}
