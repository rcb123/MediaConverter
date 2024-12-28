import MediaStorageDB from './indexedDB';
import { writable, get } from 'svelte/store';
import type { ConvertedMediaItem } from './media';
import { toast } from 'svelte-sonner';

export const convertedMedia = writable<ConvertedMediaItem[]>([]);
export const groupedConvertedMedia = writable<Record<string, ConvertedMediaItem[]>>({});
export const storageLimitMB = writable<number>(100); // Default storage limit (in MB)
export const persistMedia = writable<boolean>(true); // Default to persist media

const db = MediaStorageDB.getInstance();

/**
 * Load all converted media from IndexedDB into the store.
 */
export async function loadConvertedMediaFromStorage(): Promise<void> {
	try {
		const storedMedia = await db.getAllItems();
		convertedMedia.set(storedMedia);
	} catch (error) {
		toast.error('Failed to load media from storage');
		console.error('Error loading media:', error);
	}
}

/**
 * Save the current converted media from the store to IndexedDB.
 */
export async function saveConvertedMediaToStorage(): Promise<void> {
	try {
		const media = get(convertedMedia);
		for (const item of media) {
			await db.saveItem(item);
		}
	} catch (error) {
		toast.error('Failed to save media to storage');
		console.error('Error saving media:', error);
	}
}

/**
 * Delete a specific media item by ID.
 * @param id - The ID of the media item to delete
 */
export async function deleteMediaItem(id: string): Promise<void> {
	try {
		convertedMedia.update((media) => media.filter((item) => item.id !== id));
		await db.deleteItem(id);
		toast.success('Media item deleted');
	} catch (error) {
		toast.error('Failed to delete media item');
		console.error('Error deleting media item:', error);
	}
}

/**
 * Delete all media items.
 */
export async function deleteAllMedia(): Promise<void> {
	try {
		convertedMedia.set([]);
		await db.clearAllItems();
		toast.success('All media items deleted');
	} catch (error) {
		toast.error('Failed to delete all media items');
		console.error('Error clearing media:', error);
	}
}

/**
 * Enforce the storage limit by removing the oldest items.
 */
export async function enforceStorageLimit(): Promise<void> {
	try {
		let totalSize = 0;
		const media = get(convertedMedia);
		const newMedia = [...media];

		// Sort by date (newest first)
		newMedia.sort((a, b) => b.date.getTime() - a.date.getTime());

		// Remove oldest items to maintain the limit
		for (const item of newMedia) {
			totalSize += item.size;
			if (totalSize > get(storageLimitMB) * 1024 * 1024) {
				const index = newMedia.indexOf(item);
				newMedia.splice(index, 1);
			}
		}

		convertedMedia.set(newMedia);

		if (get(persistMedia)) {
			await saveConvertedMediaToStorage();
		}
	} catch (error) {
		toast.error('Failed to enforce storage limit');
		console.error('Error enforcing storage limit:', error);
	}
}

/**
 * Update the storage limit and save it to localStorage.
 */
export function updateStorageLimit(): void {
	enforceStorageLimit();
	localStorage.setItem('storageLimitMB', get(storageLimitMB).toString());
}

/**
 * Toggle persisting media to IndexedDB or clearing it.
 */
export async function togglePersistMedia(): Promise<void> {
	try {
		if (get(persistMedia)) {
			await saveConvertedMediaToStorage();
		} else {
			await deleteAllMedia();
		}
		localStorage.setItem('persistMedia', get(persistMedia).toString());
	} catch (error) {
		toast.error('Failed to update media persistence setting');
		console.error('Error toggling persistence:', error);
	}
}

/**
 * Group media items by a specified field (e.g., date, type).
 */
export function groupMediaByField<K extends keyof ConvertedMediaItem>(field: K): void {
	const media = get(convertedMedia);
	const grouped = media.reduce(
		(acc, item) => {
			const key = item[field] as string;
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(item);
			return acc;
		},
		{} as Record<string, ConvertedMediaItem[]>
	);

	groupedConvertedMedia.set(grouped);
}
