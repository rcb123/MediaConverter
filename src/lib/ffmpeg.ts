// @ts-ignore
import type { LogEvent } from '@ffmpeg/ffmpeg/dist/esm/types';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toast } from 'svelte-sonner';

const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';
let ffmpeg: FFmpeg | null = null;

/**
 * Initializes FFmpeg if it's not already loaded.
 */
export async function init(): Promise<boolean> {
	if (!ffmpeg) {
		try {
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
			return true;
		} catch (error) {
			toast.error('Failed to initialize FFmpeg');
			console.error('Failed to initialize FFmpeg:', error);
			ffmpeg = null;
			return false;
		}
	}
	return true;
}

/**
 * Cleans up FFmpeg's virtual filesystem by removing input and output files.
 */
async function cleanupFiles(inputFilename: string, outputFilename: string): Promise<void> {
	try {
		await ffmpeg?.deleteFile(inputFilename);
		await ffmpeg?.deleteFile(outputFilename);
	} catch (error) {
		console.error('Error during cleanup:', error);
	}
}

/**
 * Prepares the FFmpeg command based on conversion options.
 */
function prepareFFmpegCommand(
	inputFilename: string,
	options: { format: string; resolution?: string; bitrate?: string; codec?: string },
	outputFilename: string
): string[] {
	const command = ['-i', inputFilename];

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
	}

	command.push(outputFilename);
	return command;
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
	if (!ffmpeg || !ffmpeg.loaded) {
		throw new Error('FFmpeg not initialized');
	}

	console.debug('File conversion options:', options);

	const outputFileName = `${fileName.split('.')[0]}-converted.${options.format}`;

	// Write the input file to FFmpeg's file system
	await ffmpeg.writeFile(fileName, await fetchFile(file));
	console.debug(`File ${fileName} written to FFmpeg virtual file system`);

	// Generate FFmpeg command
	const command = prepareFFmpegCommand(fileName, options, outputFileName);
	console.debug('FFmpeg command generated:', command);

	try {
		// Execute the FFmpeg command
		await ffmpeg.exec(command);
		console.debug('Command executed');

		// Read the output file
		const outputData = await ffmpeg.readFile(outputFileName);
		if (typeof outputData === 'string') {
			throw new Error(`Failed to convert file: ${outputData}`);
		}

		return { file: outputData, name: outputFileName };
	} catch (error) {
		console.error('Error during conversion:', error);
		// Uncomment this line to terminate FFmpeg after an error
		// May be necessary if error causes FFmpeg to hang
		// ffmpeg.terminate();
		throw error;
	} finally {
		// Clean up the virtual file system
		await cleanupFiles(fileName, outputFileName);
	}
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
): Promise<{ file: Uint8Array; name: string }[]> {
	await init();
	if (!ffmpeg || !ffmpeg.loaded) {
		throw new Error('FFmpeg not initialized');
	}

	console.debug('Batch converting files:', files);

	const results: { file: Uint8Array; name: string }[] = [];

	await Promise.all(
		files.map(async (file) => {
			try {
				const convertedFile = await convertFile(file, file.name, options);
				results.push(convertedFile);
			} catch (error) {
				toast.error(`Failed to convert file: ${file.name}`);
				console.error('Batch conversion error:', error);
				throw error;
			}
		})
	);

	return results;
}
