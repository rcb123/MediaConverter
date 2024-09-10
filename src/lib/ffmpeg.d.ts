import type { AudioFormat, ImageFormat, VideoFormat } from './mediaFormats';

export type ImageSettings = {
	format: ImageFormat;
	quality: number;
	resolution: string;
};
export type AudioSettings = {
	format: AudioFormat;
	bitrate: string;
	codec: string;
	channels: string;
};
export type VideoSettings = {
	format: VideoFormat;
	resolution: string;
	bitrate: string;
	frameRate: string;
	codec: string;
};
