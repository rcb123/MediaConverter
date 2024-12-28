<script lang="ts">
	import { downloadAllMedia, groupConvertedMedia, updatePreview } from '$lib/utils';
	import { advancedMode, loading, mediaType, options } from '$lib/stores';
	import { Download, Trash2 } from 'lucide-svelte';
	import { Switch } from '$components/ui/switch';
	import { Button } from '$components/ui/button';
	import { Label } from '$components/ui/label';
	import { writable, get } from 'svelte/store';
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import {
		convertedMedia,
		deleteAllMedia,
		enforceStorageLimit,
		togglePersistMedia,
		updateStorageLimit,
		persistMedia,
		storageLimitMB,
		saveConvertedMediaToStorage,
		loadConvertedMediaFromStorage,
		groupedConvertedMedia
	} from '$lib/storage';
	import FileConversionModal from '$components/FileConversionModal.svelte';
	import Dropzone from '$components/Dropzone.svelte';
	import ImageItem from '$components/ImageItem.svelte';
	import MediaPreviewModal from '$components/MediaPreviewModal.svelte';
	import FFmpegWrapper from '$lib/ffmpeg';

	// Stores
	const previewUrl = writable<string | null>(null);
	const selectedFiles = writable<File[]>([]);
	const showFileConversionModal = writable(false);
	const showMediaPreviewModal = writable(false);
	const isDraggingOver = writable(false);
	const loadingStoredMedia = writable(true);

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
		} catch (err) {
			console.error(err);
			toast.error('Error occurred during conversion. Please try again.');
		} finally {
			loading.set(false);
		}
	}

	onMount(() => {
		const storedPersistMedia = localStorage.getItem('persistMedia');
		if (storedPersistMedia !== null) {
			persistMedia.set(storedPersistMedia === 'true');
		}

		const storedStorageLimit = localStorage.getItem('storageLimitMB');
		if (storedStorageLimit !== null) {
			storageLimitMB.set(Number.parseInt(storedStorageLimit, 10));
		}

		if (get(persistMedia)) {
			loadConvertedMediaFromStorage();
		}

		groupConvertedMedia($convertedMedia);

		loadingStoredMedia.set(false);

		convertedMedia.subscribe((media) => {
			groupedConvertedMedia.set(groupConvertedMedia(media));
		});

		persistMedia.subscribe(() => {
			if (browser) togglePersistMedia();
		});

		storageLimitMB.subscribe(() => {
			if (browser) updateStorageLimit();
		});
	});

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
    * Navigation / Tabs in the middle ("Gallery", "Settings", etc.)
    * Global actions on far right (Simple/Advanced mode, Toggling dark/light mode, etc.)
  2. Main Workspace
    * Side Panel (Collapsible)
      - Batch Conversion List / Queue
    * Main Content Area
      - Drag and Drop Area
      - Conversion panel with options
  3. Footer
    * Progress Bar
    * Status Indicators (number of items in queue, etc.)
    * App version
    * Links to GitHub, etc.
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
>
	<FileConversionModal showModal={showFileConversionModal} {selectedFiles} {handleConversion} />
	<MediaPreviewModal showModal={showMediaPreviewModal} {previewUrl} />
	<section>
		<div class="flex items-center justify-between gap-4 pb-2">
			<div class="flex h-10 items-center">
				<h2 class="text-xl font-semibold">Converted Media</h2>
			</div>
			{#if $convertedMedia.length > 0}
				<div class="flex gap-2">
					<Button
						onclick={downloadAllMedia}
						disabled={$convertedMedia.length === 0}
						variant="ghost"
					>
						Download All
						<Download class="ml-2 h-4 w-4" />
					</Button>
					<Button
						onclick={deleteAllMedia}
						disabled={$convertedMedia.length === 0}
						variant="ghost"
						class="text-destructive"
					>
						Delete All
						<Trash2 class="ml-2 h-4 w-4" />
					</Button>
				</div>
			{/if}
		</div>
		{#each Object.entries($groupedConvertedMedia) as [group, items]}
			{#if Array.isArray(items) && items.length > 0}
				<div class="mb-6">
					<h3
						class="mb-2 border-b border-foreground/30 pb-1 text-lg font-medium tracking-wide text-foreground/80"
					>
						{group}
					</h3>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
						{#each items.sort((a, b) => b.date.getTime() - a.date.getTime()) as item (item.id)}
							<ImageItem
								{item}
								on:preview={(event) => {
									previewUrl.set(event.detail);
									mediaType.set('image');
									showMediaPreviewModal.set(true);
								}}
							/>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</section>
</Dropzone>

<footer class="w-full border-t-2 border-foreground/20 py-4">
	<div class="container flex items-end justify-between">
		<div class="flex flex-col gap-4">
			<div class="flex items-center space-x-2">
				<Switch id="advanced-mode" bind:checked={$advancedMode} />
				<Label for="advanced-mode">Advanced Options</Label>
			</div>
			<div class="flex items-center space-x-2">
				<Switch id="persist-media" bind:checked={$persistMedia} />
				<Label for="persist-media">Persist converted media</Label>
			</div>
		</div>

		{#if typeof SharedArrayBuffer !== 'undefined'}
			<p class="text-sm text-foreground/60">SharedArrayBuffer is supported</p>
		{:else}
			<p class="text-sm text-destructive">SharedArrayBuffer is not supported</p>
		{/if}

		<div class="flex flex-col gap-4">
			<div class="flex items-center justify-end space-x-2">
				<Label for="storage-limit">Storage Limit (MB):</Label>
				<input
					id="storage-limit"
					type="number"
					bind:value={$storageLimitMB}
					min="1"
					max="1000"
					class="w-20 rounded border px-2 py-1"
				/>
			</div>

			<div class="flex items-center justify-end gap-2">
				<a
					href="https://rezab.vercel.app"
					class="rounded-sm underline-offset-4 hover:underline"
					target="_blank"
				>
					Made with ❤️ by Reza Banankhah
				</a>
			</div>
		</div>
	</div>
</footer>
