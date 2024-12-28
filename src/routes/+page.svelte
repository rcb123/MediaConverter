<script lang="ts">
	import { updatePreview } from '$lib/utils';
	import { writable, get } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import {
		convertedMedia,
		enforceStorageLimit,
		persistMedia,
		saveConvertedMediaToStorage
	} from '$lib/storage';
	import {
		isDraggingOver,
		loading,
		loadingStoredMedia,
		mediaType,
		options,
		previewUrl
	} from '$lib/stores';

	import FileConversionModal from '$components/FileConversionModal.svelte';
	import FFmpegWrapper from '$lib/ffmpeg';
	import Dropzone from '$components/Dropzone.svelte';
	import { goto } from '$app/navigation';

	// Stores
	const selectedFiles = writable<File[]>([]);
	const showFileConversionModal = writable(false);

	// FFmpeg Wrapper Instance
	let ffmpegWrapper: FFmpegWrapper | null = null;

	async function initializeFFmpeg() {
		if (!ffmpegWrapper) {
			ffmpegWrapper = new FFmpegWrapper();
		}
		await ffmpegWrapper.initialize();
	}

	async function handleConversion() {
		const currentMediaType = get(mediaType);
		if (get(loading) || !$selectedFiles.length || !currentMediaType) return;
		loading.set(true);

		try {
			if (!ffmpegWrapper?.isInitialized) {
				await initializeFFmpeg();
			}

			const currentOptions = get(options)[currentMediaType];
			const results = await ffmpegWrapper?.convertBatch($selectedFiles, currentOptions);

			if (!results) {
				throw new Error(
					'Unexpected error occurred! Either ffmpeg is not initialized or conversion failed.'
				);
			}

			const newConvertedMedia = results.map((file, index) => {
				const originalFile = $selectedFiles[index];
				return {
					id: crypto.randomUUID(),
					originalName: originalFile.name,
					convertedName: file.name,
					convertedFile: file,
					type: currentMediaType,
					size: file.size,
					date: new Date(file.lastModified)
				};
			});

			convertedMedia.update((media) => [...newConvertedMedia, ...media]);
			if (get(persistMedia)) {
				saveConvertedMediaToStorage();
			}
			enforceStorageLimit();

			selectedFiles.set([]);
			showFileConversionModal.set(false);

			toast.success('Conversion completed successfully.');
			goto('/gallery');
		} catch (err) {
			console.error(err);
			toast.error('Error occurred during conversion. Please try again.');
		} finally {
			loading.set(false);
		}
	}

	selectedFiles.subscribe((value) => {
		updatePreview(value, previewUrl);
	});
</script>

<svelte:head>
	<title>Media Conversion Tool</title>
</svelte:head>

<!--
  =============== UI Ideas ===============
  ----------- High Level Layout ----------
  1. Header
    * Logo or app name on far left
    * Navigation / Tabs in the middle (Conversion screen and Gallery screen)
    * Light/Dark mode toggle on the far right
  2. Main Workspace
    * Side Panel (Collapsible)
      - Batch Conversion List / Queue
    * Main Content Area
      - Drag and Drop Area
      - Conversion panel with options
  3. Footer
    * Options
      - Advanced mode toggle
      - Persist media toggle
      - Storage limit input
    * Progress Bar
    * Status Indicators (number of items in queue, etc.)
    * Links to portfolio
  ----------- User Flow -----------
  1. Entry Point: User lands on the main "Convert" screen
  2. File Upload / Drag-and-Drop:
    - User can drag and drop files or click an "Upload" button
    - When files are dropped, they appear in a Batch List on the side,
      each with a preview icon
  3. Select Conversion Options (Simple Mode):
    - User can select a basic target format (e.g., JPG to PNG)
    - User can select a quality setting (e.g., 80%)
    - If multiple files with different media types are added,
      the app automatically groups them by type
  4. Advanced Conversion (Advanced Mode):
    - Toggled advanced mode to get deeper options, e.g. codec, bitrate, etc.
    - Each file or group of files can have its own settings
  5. Conversion & Progress
    - Hit a "Convert" button to start
    - Option to see real-time progress for each file in the gallery
    - A global progress bar for the entire batch can show in the footer
  6. Result / Output:
    - Once converted, the file(s) are stored in the local gallery (IndexedDB)
    - The user is given the option to download the file(s) as a zip (or single if only one)
    - User can preview the converted file(s) or copy to clipboard in the gallery
  ----------- UI Components -----------
  A. File Upload / Drag-and-Drop Area
    - A central "Drop your files here" area with a large plus sign or a minimal icon
    - Accepts images, audio, and video. If the user drops multiple files, each file
      is automatically added to the Batch Conversion List
    - Feedback: Show a highlight or border when files are dragged over the area
  B. Batch Conversion List
    - Collapsible Panel: By default, it's open so users can see the files queued.
    - File Entries: Each file is displayed as a row with:
      - A preview icon (image, audio, or video)
      - File name and basic info (size, type)
    - Group Actions: Users can select multiple files in the queue (e.g., shift+click
      or checkboxes) and apply a single format/setting to the entire selection.
    - Remove / Clear: An "X" or "Trash" icon to remove individual files from the queue.
      Possibly a "Clear All" button to remove all files at the top.
    Big empty space
 -->
<Dropzone
	{loadingStoredMedia}
	{isDraggingOver}
	on:fileSelected={async () => {
		showFileConversionModal.set(true);
		if (!ffmpegWrapper?.isInitialized) {
			try {
				await initializeFFmpeg();
			} catch (error) {
				toast.error('Failed to initialize FFmpeg. Please try again.');
				console.error('FFmpeg initialization error:', error);
				return;
			}
		}
	}}
	{selectedFiles}
/>
<FileConversionModal showModal={showFileConversionModal} {selectedFiles} {handleConversion} />
