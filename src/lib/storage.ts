import { saveItem, getAllItems, deleteItem, clearAllItems } from './indexedDB';
import { get, writable } from 'svelte/store';
import type { ConvertedMediaItem } from './media';
import { toast } from 'svelte-sonner';

export const convertedMedia = writable<ConvertedMediaItem[]>([]);
export const groupedConvertedMedia = writable<Record<string, ConvertedMediaItem[]>>({});
export const storageLimitMB = writable<number>(100); // Default 100MB storage limit
export const persistMedia = writable<boolean>(true); // Default to persisting media

/**
 * Load all converted media from IndexedDB
 */
export async function loadConvertedMediaFromStorage() {
	const storedMedia = await getAllItems();
	convertedMedia.set(storedMedia);
	toast.success('Media loaded from storage');
}

/**
 * Save converted media to IndexedDB
 */
export function saveConvertedMediaToStorage() {
	const media = get(convertedMedia);
	for (const item of media) {
		saveItem(item); // Save each item in the media array
	}
}

/**
 * Delete a specific media item
 * @param id - The ID of the media item to delete
 */
export function deleteMediaItem(id: string) {
	convertedMedia.update((media) => media.filter((item) => item.id !== id));
	deleteItem(id);
	toast.success('Media item deleted');
}

/**
 * Delete all media items
 */
export function deleteAllMedia() {
	convertedMedia.set([]);
	clearAllItems(); // Clear all items from IndexedDB
	toast.success('All media items deleted');
}

/**
 * Enforce the storage limit by removing the oldest items
 */
export function enforceStorageLimit() {
	let totalSize = 0;
	const media = get(convertedMedia);
	const newMedia = [...media];

	newMedia.sort((a, b) => b.date.getTime() - a.date.getTime());

	for (const item of newMedia) {
		totalSize += item.size;
		if (totalSize > get(storageLimitMB) * 1024 * 1024) {
			const index = newMedia.indexOf(item);
			newMedia.splice(index);
			break;
		}
	}

	convertedMedia.set(newMedia);
	if (get(persistMedia)) {
		saveConvertedMediaToStorage();
	}
}

export function updateStorageLimit() {
	enforceStorageLimit();
	localStorage.setItem('storageLimitMB', get(storageLimitMB).toString());
}

export function togglePersistMedia() {
	if (get(persistMedia)) {
		saveConvertedMediaToStorage();
	} else {
		localStorage.removeItem('convertedMedia');
	}
	localStorage.setItem('persistMedia', get(persistMedia).toString());
}
