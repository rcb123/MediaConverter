export type MediaFormat = AudioFormat | ImageFormat | VideoFormat;
export type AudioFormat =
	| 'mp3'
	| 'wav'
	| 'aac'
	| 'ogg'
	| 'flac'
	| 'wma'
	| 'm4a'
	| 'aiff'
	| 'alac'
	| 'ac3'
	| 'amr'
	| 'au'
	| 'mka'
	| 'mid'
	| 'mp2'
	| 'mpa'
	| 'ra'
	| 'wv'
	| 'opus'
	| 'dts'
	| 'eac3'
	| 'mpc'
	| 'tak'
	| 'tta'
	| 'w64'
	| 'wv'
	| 'wma';
export type ImageFormat = 'jpeg' | 'png' | 'gif' | 'webp' | 'avif' | 'tiff' | 'bmp' | 'ico' | 'svg';
export type VideoFormat =
	| 'mp4'
	| 'avi'
	| 'mkv'
	| 'mov'
	| 'wmv'
	| 'flv'
	| 'webm'
	| 'mpeg'
	| '3gp'
	| 'ogg'
	| 'ts'
	| 'm4v'
	| 'm2v'
	| 'm2ts'
	| 'mts'
	| 'vob'
	| 'mpg'
	| 'asf'
	| 'rm'
	| 'swf'
	| 'rmvb'
	| 'divx'
	| 'xvid'
	| 'h264'
	| 'h265'
	| 'vp9'
	| 'av1';

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
	{ label: 'OGG', value: 'ogg' },
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
