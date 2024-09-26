export interface ConvertedMediaItem {
	id: string;
	originalName: string;
	convertedName: string;
	blob: Blob;
	type: MediaType;
	size: number;
	date: Date;
}
