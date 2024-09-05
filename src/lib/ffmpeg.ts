import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
let ffmpegInstance: FFmpeg | null = null;

/**
 * Initializes FFmpeg if it's not already loaded.
 */
async function initializeFFmpeg() {
	if (!ffmpegInstance) {
		ffmpegInstance = new FFmpeg();

		// Attach a logging handler
		ffmpegInstance.on('log', ({ type, message }) => {
			console.log(`[${type}] ${message}`);
		});

		// Load FFmpeg with the correct core and wasm files
		await ffmpegInstance.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
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
	await initializeFFmpeg();
	if (!ffmpegInstance) {
		throw new Error('FFmpeg not initialized');
	}

	const outputFileName = `${fileName.split('.')[0]}-converted.${options.format}`;

	// Write the input file to FFmpeg's file system
	await ffmpegInstance.writeFile(fileName, await fetchFile(file));
	console.log('File written to FFmpeg file system');

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
	console.log('Command generated:', command);

	// Execute the FFmpeg command
	await ffmpegInstance.exec(command);
	console.log('Command executed');

	// Read the output file
	const outputData = await ffmpegInstance.readFile(outputFileName);
	if (typeof outputData === 'string') {
		throw new Error(`Failed to convert file: ${outputData}`);
	}

	// Clean up the virtual file system
	await ffmpegInstance.deleteFile(fileName);
	await ffmpegInstance.deleteFile(outputFileName);

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
	await initializeFFmpeg();

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
