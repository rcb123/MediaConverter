export const mediaFormats = {
	audio: [
		'mp3',
		'wav',
		'aac',
		'ogg',
		'flac',
		'wma',
		'm4a',
		'aiff',
		'alac',
		'ac3',
		'amr',
		'au',
		'mka',
		'mid',
		'mp2',
		'mpa',
		'ra',
		'wv',
		'opus',
		'dts',
		'eac3',
		'mpc',
		'tak',
		'tta',
		'w64'
	] as const,
	image: ['jpeg', 'png', 'gif', 'webp', 'avif', 'tiff', 'bmp', 'ico', 'svg'] as const,
	video: [
		'mp4',
		'avi',
		'mkv',
		'mov',
		'wmv',
		'flv',
		'webm',
		'mpeg',
		'3gp',
		'ts',
		'm4v',
		'm2v',
		'm2ts',
		'mts',
		'vob',
		'mpg',
		'asf',
		'rm',
		'swf',
		'rmvb',
		'divx',
		'xvid',
		'h264',
		'h265',
		'vp9',
		'av1'
	] as const
};
export type MediaType = keyof typeof mediaFormats;
export type ImageFormat = (typeof mediaFormats)['image'][number];
export type AudioFormat = (typeof mediaFormats)['audio'][number];
export type VideoFormat = (typeof mediaFormats)['video'][number];
export type MediaFormat = AudioFormat | ImageFormat | VideoFormat;

export function isAudioFormat(format: MediaFormat): format is AudioFormat {
	return mediaFormats.audio.includes(format as AudioFormat);
}

export function isImageFormat(format: MediaFormat): format is ImageFormat {
	return mediaFormats.image.includes(format as ImageFormat);
}

export function isVideoFormat(format: MediaFormat): format is VideoFormat {
	return mediaFormats.video.includes(format as VideoFormat);
}

export function inferMediaType(format: MediaFormat): MediaType {
	if (isAudioFormat(format)) {
		return 'audio';
	}
	if (isImageFormat(format)) {
		return 'image';
	}
	if (isVideoFormat(format)) {
		return 'video';
	}
	throw new Error(`Unknown Media Format: ${format}`);
}

// Format options for images and videos supported by ffmpeg
export const baseImageFormats: { label: string; value: ImageFormat }[] = [
	{ label: 'JPEG', value: 'jpeg' },
	{ label: 'PNG', value: 'png' },
	{ label: 'GIF', value: 'gif' },
	{ label: 'WEBP', value: 'webp' }
];
export const advancedImageFormats: { label: string; value: ImageFormat }[] = [
	{ label: 'TIFF', value: 'tiff' },
	{ label: 'BMP', value: 'bmp' },
	{ label: 'ICO', value: 'ico' },
	{ label: 'SVG', value: 'svg' }
];
export const extendedImageFormats: { label: string; value: ImageFormat }[] = [
	...baseImageFormats,
	...advancedImageFormats
];

export const baseVideoFormats: { label: string; value: VideoFormat }[] = [
	{ label: 'MP4', value: 'mp4' },
	{ label: 'AVI', value: 'avi' },
	{ label: 'MKV', value: 'mkv' },
	{ label: 'MOV', value: 'mov' }
];
export const advancedVideoFormats: { label: string; value: VideoFormat }[] = [
	{ label: 'WMV', value: 'wmv' },
	{ label: 'FLV', value: 'flv' },
	{ label: 'WEBM', value: 'webm' },
	{ label: 'MPEG', value: 'mpeg' },
	{ label: '3GP', value: '3gp' },
	{ label: 'TS', value: 'ts' },
	{ label: 'M4V', value: 'm4v' },
	{ label: 'M2V', value: 'm2v' },
	{ label: 'M2TS', value: 'm2ts' },
	{ label: 'MTS', value: 'mts' },
	{ label: 'VOB', value: 'vob' },
	{ label: 'MPG', value: 'mpg' },
	{ label: 'ASF', value: 'asf' },
	{ label: 'RM', value: 'rm' },
	{ label: 'SWF', value: 'swf' },
	{ label: 'RMVB', value: 'rmvb' },
	{ label: 'DIVX', value: 'divx' },
	{ label: 'XVID', value: 'xvid' },
	{ label: 'H264', value: 'h264' },
	{ label: 'H265', value: 'h265' },
	{ label: 'VP9', value: 'vp9' },
	{ label: 'AV1', value: 'av1' }
];
export const extendedVideoFormats: { label: string; value: VideoFormat }[] = [
	...baseVideoFormats,
	...advancedVideoFormats
];

export const baseAudioFormats: { label: string; value: AudioFormat }[] = [
	{ label: 'MP3', value: 'mp3' },
	{ label: 'WAV', value: 'wav' },
	{ label: 'AAC', value: 'aac' },
	{ label: 'OGG', value: 'ogg' }
];
export const advancedAudioFormats: { label: string; value: AudioFormat }[] = [
	{ label: 'FLAC', value: 'flac' },
	{ label: 'WMA', value: 'wma' },
	{ label: 'M4A', value: 'm4a' },
	{ label: 'AIFF', value: 'aiff' },
	{ label: 'ALAC', value: 'alac' },
	{ label: 'AC3', value: 'ac3' },
	{ label: 'AMR', value: 'amr' },
	{ label: 'AU', value: 'au' },
	{ label: 'MKA', value: 'mka' },
	{ label: 'MID', value: 'mid' },
	{ label: 'MP2', value: 'mp2' },
	{ label: 'MPA', value: 'mpa' },
	{ label: 'RA', value: 'ra' },
	{ label: 'WV', value: 'wv' },
	{ label: 'OPUS', value: 'opus' },
	{ label: 'DTS', value: 'dts' },
	{ label: 'EAC3', value: 'eac3' },
	{ label: 'MPC', value: 'mpc' },
	{ label: 'TAK', value: 'tak' },
	{ label: 'TTA', value: 'tta' },
	{ label: 'W64', value: 'w64' },
	{ label: 'WV', value: 'wv' },
	{ label: 'WMA', value: 'wma' }
];
export const extendedAudioFormats: { label: string; value: AudioFormat }[] = [
	...baseAudioFormats,
	...advancedAudioFormats
];

interface MimeTypeMap {
	audio: Record<AudioFormat, string>;
	image: Record<ImageFormat, string>;
	video: Record<VideoFormat, string>;
}
const mimeTypeMap: MimeTypeMap = {
	audio: {
		mp3: 'audio/mpeg',
		wav: 'audio/wav',
		aac: 'audio/aac',
		ogg: 'audio/ogg',
		flac: 'audio/flac',
		wma: 'audio/x-ms-wma',
		m4a: 'audio/mp4',
		aiff: 'audio/aiff',
		alac: 'audio/mp4',
		ac3: 'audio/ac3',
		amr: 'audio/amr',
		au: 'audio/basic',
		mka: 'audio/x-matroska',
		mid: 'audio/midi',
		mp2: 'audio/mpeg',
		mpa: 'audio/mpeg',
		ra: 'audio/x-realaudio',
		wv: 'audio/wavpack',
		opus: 'audio/opus',
		dts: 'audio/vnd.dts',
		eac3: 'audio/eac3',
		mpc: 'audio/x-musepack',
		tak: 'audio/x-tak',
		tta: 'audio/x-tta',
		w64: 'audio/x-w64'
	},
	image: {
		jpeg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		webp: 'image/webp',
		avif: 'image/avif',
		tiff: 'image/tiff',
		bmp: 'image/bmp',
		ico: 'image/vnd.microsoft.icon',
		svg: 'image/svg+xml'
	},
	video: {
		mp4: 'video/mp4',
		avi: 'video/x-msvideo',
		mkv: 'video/x-matroska',
		mov: 'video/quicktime',
		wmv: 'video/x-ms-wmv',
		flv: 'video/x-flv',
		webm: 'video/webm',
		mpeg: 'video/mpeg',
		'3gp': 'video/3gpp',
		ts: 'video/mp2t',
		m4v: 'video/x-m4v',
		m2v: 'video/mpeg',
		m2ts: 'video/mp2t',
		mts: 'video/mp2t',
		vob: 'video/dvd',
		mpg: 'video/mpeg',
		asf: 'video/x-ms-asf',
		rm: 'application/vnd.rn-realmedia',
		swf: 'application/x-shockwave-flash',
		rmvb: 'application/vnd.rn-realmedia-vbr',
		divx: 'video/divx',
		xvid: 'video/xvid',
		h264: 'video/h264',
		h265: 'video/h265',
		vp9: 'video/vp9',
		av1: 'video/av1'
	}
} as const;

export function getMimeType(format: MediaFormat): string {
	if (isAudioFormat(format)) {
		return mimeTypeMap.audio[format];
	}
	if (isImageFormat(format)) {
		return mimeTypeMap.image[format];
	}
	if (isVideoFormat(format)) {
		return mimeTypeMap.video[format];
	}
	throw new Error(`Unknown Media Format: ${format}`);
}

export interface ConvertedMediaItem {
	id: string;
	originalName: string;
	convertedName: string;
	blob: Blob;
	type: MediaType;
	size: number;
	date: Date;
}

/**
 * Formats a media file size in bytes to a human-readable string using binary units (up to GB).
 *
 * @param {number} bytes - The size in bytes to be converted.
 * @param {number} [precision=2] - Optional. The number of decimal places to include (default is 2).
 * @returns {string} Human-readable size format (e.g., "1.23 MB", "4.56 GB").
 */
export function formatMediaFileSize(bytes: number, precision = 2): string {
	if (bytes < 0) {
		throw new Error('Bytes cannot be negative');
	}

	if (Number.isNaN(bytes) || !Number.isFinite(bytes)) {
		throw new Error('Invalid byte value');
	}

	const units = ['Bytes', 'KB', 'MB', 'GB'];
	const base = 1024;

	if (bytes === 0) {
		return `0 ${units[0]}`;
	}

	// Calculate the index of the unit based on the logarithm (base 1024)
	const unitIndex = Math.floor(Math.log(bytes) / Math.log(base));

	// Cap the unit index to 3, so it doesn't exceed 'GB'
	const cappedUnitIndex = Math.min(unitIndex, units.length - 1);

	// Calculate the value in the selected unit
	const readableValue = bytes / base ** cappedUnitIndex;

	// Format the number with the specified precision
	return `${readableValue.toFixed(precision)} ${units[cappedUnitIndex]}`;
}

// Example usage:
// const size = formatMediaFileSize(1048576); // Returns "1.00 MB"
// const sizeWithPrecision = formatMediaFileSize(1048576, 3); // Returns "1.000 MB"
