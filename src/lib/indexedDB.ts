import type { ConvertedMediaItem } from './media';

const DB_NAME = 'mediaStorageDB';
const DB_VERSION = 1;
const STORE_NAME = 'convertedMedia';

/**
 * TODO:
 *
 * - Use cursor to query items
 * - Consider adopting Supabase-like API to enable more expressive queries
 */

class MediaStorageDB {
	private static instance: MediaStorageDB;
	private dbConnection: IDBDatabase | null = null;

	private constructor() {}

	// Singleton Instance
	static getInstance(): MediaStorageDB {
		if (!MediaStorageDB.instance) {
			MediaStorageDB.instance = new MediaStorageDB();
		}
		return MediaStorageDB.instance;
	}

	private async openDB(): Promise<IDBDatabase> {
		if (this.dbConnection) {
			return this.dbConnection; // Reuse the existing connection
		}

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME, { keyPath: 'id' });
				}
			};

			request.onsuccess = () => {
				this.dbConnection = request.result;
				resolve(this.dbConnection);
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	async saveItem(item: ConvertedMediaItem): Promise<void> {
		const db = await this.openDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.put(item);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async getItemById(id: string): Promise<ConvertedMediaItem | undefined> {
		const db = await this.openDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.get(id);

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async getAllItems(): Promise<ConvertedMediaItem[]> {
		const db = await this.openDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async queryItems(
		predicate: (item: ConvertedMediaItem) => boolean
	): Promise<ConvertedMediaItem[]> {
		const items = await this.getAllItems();
		return items.filter(predicate);
	}

	async deleteItem(id: string): Promise<void> {
		const db = await this.openDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.delete(id);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async clearAllItems(): Promise<void> {
		const db = await this.openDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.clear();

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async countItems(): Promise<number> {
		const db = await this.openDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.count();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	closeDB(): void {
		if (this.dbConnection) {
			this.dbConnection.close();
			this.dbConnection = null;
		}
	}
}

export default MediaStorageDB;
