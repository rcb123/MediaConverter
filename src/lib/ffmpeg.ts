import { fetchFile } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import {
	getMimeType,
	inferMediaType,
	isAudioFormat,
	isImageFormat,
	isVideoFormat,
	type MediaFormat
} from './media';
import type { AudioFormat, ImageFormat, MediaType, VideoFormat } from './media';

export interface CommonOptions {
	format: MediaFormat;
}

export interface AudioOptions extends CommonOptions {
	format: AudioFormat;
	codec?: string; // Audio codec (e.g., 'aac', 'mp3', 'opus')
	bitrate?: string; // Audio bitrate (e.g., '128k', '256k')
	sampleRate?: string; // Audio sample rate (e.g., '44100', '48000')
	channels?: number; // Audio channels (e.g., 1 for mono, 2 for stereo)
}

function isAudioOptions(options: ConversionOptions): options is AudioOptions {
	return inferMediaType(options.format) === 'audio';
}

export interface VideoOptions extends CommonOptions {
	format: VideoFormat;
	resolution?: string; // Video resolution (e.g., '1920x1080')
	bitrate?: string; // Video bitrate (e.g., '2M', '4M')
	codec?: string; // Video codec (e.g., 'h264', 'vp9')
	fps?: number; // Frames per second (e.g., 30, 60)
	preset?: string; // Encoder preset (e.g., 'fast', 'medium', 'slow')
	crf?: number; // Constant Rate Factor (e.g., 23, 28)
}

function isVideoOptions(options: ConversionOptions): options is VideoOptions {
	return inferMediaType(options.format) === 'video';
}

export interface ImageOptions extends CommonOptions {
	format: ImageFormat;
	quality?: number; // Image quality (e.g., 75 for JPEG)
	compressionLevel?: number; // Compression level (e.g., 6 for PNG)
}

function isImageOptions(options: ConversionOptions): options is ImageOptions {
	return inferMediaType(options.format) === 'image';
}

export type ConversionOptions = AudioOptions | VideoOptions | ImageOptions;

class FFmpegWrapper {
	private ffmpeg: FFmpeg;

	constructor() {
		this.ffmpeg = new FFmpeg();
	}

	/**
	 * Initializes FFmpeg.
	 */
	async initialize(): Promise<void> {
		if (this.ffmpeg.loaded) {
			console.warn('FFmpeg is already initialized.');
			return;
		}

		try {
			// Attach a logging handler
			this.ffmpeg.on('log', ({ type, message }) => {
				console.log(`[${type}] ${message}`);
			});

			await this.ffmpeg.load();
			console.log('FFmpeg initialized successfully.');
		} catch (error) {
			console.error('Failed to initialize FFmpeg:', error);
			throw new Error('FFmpeg initialization failed');
		}
	}

	/**
	 * Prepares the FFmpeg command based on conversion options.
	 */
	prepareFFmpegCommand(
		inputFilename: string,
		options: ConversionOptions,
		outputFilename: string
	): string[] {
		const command = ['-i', inputFilename];

		if (isAudioOptions(options)) {
			if (options.codec) {
				command.push('-c:a', options.codec);
			}
			if (options.bitrate) {
				command.push('-b:a', options.bitrate);
			}
			if (options.sampleRate) {
				command.push('-ar', options.sampleRate);
			}
			if (options.channels) {
				command.push('-ac', options.channels.toString());
			}
		} else if (isVideoOptions(options)) {
			if (options.resolution) {
				command.push('-s', options.resolution);
			}
			if (options.bitrate) {
				command.push('-b:v', options.bitrate);
			}
			if (options.codec) {
				command.push('-c:v', options.codec);
			}
			if (options.fps) {
				command.push('-r', options.fps.toString());
			}
			if (options.preset) {
				command.push('-preset', options.preset);
			}
			if (options.crf !== undefined) {
				command.push('-crf', options.crf.toString());
			}
		} else if (isImageOptions(options)) {
			if (options.quality) {
				command.push('-q:v', options.quality.toString());
			}
			if (options.compressionLevel) {
				command.push('-compression_level', options.compressionLevel.toString());
			}
		} else {
			throw new Error(`Unsupported media type: ${(options as { mediaType: string }).mediaType}`);
		}

		command.push(outputFilename);
		return command;
	}

	/**
	 * Converts a single file.
	 *
	 * @param inputFile - The file to be converted.
	 * @param options - The conversion options including format, bitrate, and resolution.
	 * @returns {Promise<File>} - The converted file.
	 */
	async convertFile(inputFile: File, options: ConversionOptions): Promise<File> {
		if (!this.ffmpeg.loaded) {
			throw new Error('FFmpeg is not initialized. Call initialize() first.');
		}

		console.debug('File conversion options:', options);

		const outputFileName = `${inputFile.name.split('.')[0]}-converted.${options.format}`;

		try {
			// Write the input file to FFmpeg's file system
			await this.ffmpeg.writeFile(inputFile.name, await fetchFile(inputFile));
			console.debug(`File '${inputFile.name}' written to FFmpeg virtual file system`);

			// Generate FFmpeg command
			const command = this.prepareFFmpegCommand(inputFile.name, options, outputFileName);
			console.debug('FFmpeg command generated:', command);

			// Execute the FFmpeg command
			await this.ffmpeg.exec(command);

			// Read the output file
			const output = await this.ffmpeg.readFile(outputFileName);

			if (typeof output === 'string') {
				throw new Error(`Failed to convert file: ${output}`);
			}

			return new File([output], outputFileName, { type: getMimeType(options.format) });
		} catch (error) {
			console.error('Error during file conversion:', error);
			throw new Error('File conversion failed');
		} finally {
			// Always cleanup files
			await this.ffmpeg.deleteFile(inputFile.name);
			await this.ffmpeg.deleteFile(outputFileName);
		}
	}

	/**
	 * Converts multiple files in a batch.
	 *
	 * @param files - Array of files to convert.
	 * @param options - The conversion options including format, bitrate, and resolution.
	 * @returns {Promise<File[]>} - Array of converted files.
	 */
	async convertBatch(files: File[], options: ConversionOptions): Promise<File[]> {
		if (!this.ffmpeg.loaded) {
			throw new Error('FFmpeg is not initialized. Call initialize() first.');
		}

		console.debug('Batch converting files:', files);

		const results: File[] = [];

		for (const file of files) {
			try {
				const result = await this.convertFile(file, options);
				results.push(result);
			} catch (error) {
				console.error(`Error converting file '${file.name}' to ${options.format}:`, error);
				// Continue processing the rest of the files
			}
		}

		return results;
	}

	/**
	 * Returns progress updates.
	 * @param callback - Callback to handle progress updates.
	 */
	onProgress(callback: (event: { progress: number; time: number }) => void): void {
		this.ffmpeg.on('progress', callback);
	}

	/**
	 * Stops listening to progress updates.
	 * @param callback - Callback to remove.
	 */
	offProgress(callback: (event: { progress: number; time: number }) => void): void {
		this.ffmpeg.off('progress', callback);
	}

	/**
	 * Cleans up the FFmpeg instance and terminates the worker.
	 */
	terminate(): void {
		this.ffmpeg.terminate();
		console.log('FFmpeg worker terminated.');
	}
}

export default FFmpegWrapper;
