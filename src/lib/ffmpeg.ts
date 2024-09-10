// @ts-ignore
import type { LogEvent } from '@ffmpeg/ffmpeg/dist/esm/types';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';
let ffmpeg: FFmpeg | null = null;

/**
 * Initializes FFmpeg if it's not already loaded.
 */
export async function init() {
	if (!ffmpeg) {
		ffmpeg = new FFmpeg();

		// Attach a logging handler
		ffmpeg.on('log', ({ type, message }: LogEvent) => {
			console.log(`[${type}] ${message}`);
		});

		// Load FFmpeg with the correct core and wasm files
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
			workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
		});
	}
}

/**
 * Converts a single media file using FFmpeg.
 *
 * @param file - The file to be converted.
 * @param fileName - The name of the input file.
 * @param options - The conversion options including format, bitrate, and resolution.
 * @returns {Promise<{ file: Uint8Array; name: string }>} - The converted file data.
 */
export async function convertFile(
	file: File,
	fileName: string,
	options: { format: string; resolution?: string; bitrate?: string; codec?: string }
): Promise<{ file: Uint8Array; name: string }> {
	await init();
	if (!ffmpeg) {
		throw new Error('FFmpeg not initialized');
	}

	const outputFileName = `${fileName.split('.')[0]}-converted.${options.format}`;

	// Write the input file to FFmpeg's file system
	await ffmpeg.writeFile(fileName, await fetchFile(file));
	console.debug('File written to FFmpeg file system');

	// Generate FFmpeg command
	const command = ['-i', fileName];

	// Add resolution flag if provided
	if (options.resolution) {
		command.push('-s', options.resolution);
	}

	// Add bitrate flag if provided
	if (options.bitrate) {
		command.push('-b:v', options.bitrate);
	}

	// Add codec flag if provided
	if (options.codec) {
		command.push('-c:v', options.codec);
	} else {
		command.push('-c:v', 'libx264'); // Default to libx264 if codec is not provided
	}

	command.push(outputFileName);
	console.debug('Command generated:', command);

	// Execute the FFmpeg command
	await ffmpeg.exec(command);
	console.debug('Command executed');

	// Read the output file
	const outputData = await ffmpeg.readFile(outputFileName);
	if (typeof outputData === 'string') {
		throw new Error(`Failed to convert file: ${outputData}`);
	}

	// Clean up the virtual file system
	await ffmpeg.deleteFile(fileName);
	await ffmpeg.deleteFile(outputFileName);

	return { file: outputData, name: outputFileName };
}

/**
 * Batch converts multiple media files using FFmpeg.
 *
 * @param files - An array of File objects to be converted.
 * @param options - The conversion options including format, bitrate, and resolution.
 * @returns {Promise<Uint8Array[]>} - The array of converted files data.
 */
export async function batchConvert(
	files: File[],
	options: { format: string; resolution?: string; bitrate?: string; codec?: string }
): Promise<Uint8Array[]> {
	await init();
	if (!ffmpeg) {
		throw new Error('FFmpeg not initialized');
	}

	const results: Uint8Array[] = [];
	for (const file of files) {
		const convertedFile = await convertFile(file, file.name, options);
		if (typeof convertedFile === 'string') {
			throw new Error(`Failed to convert file: ${convertedFile}`);
		}
		results.push(convertedFile.file);
	}
	return results;
}
