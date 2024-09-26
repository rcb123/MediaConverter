<script lang="ts">
	import { ffmpegInitialized, advancedMode, loading, mediaType, options } from '$lib/stores';
	import { downloadAllMedia, groupConvertedMedia, updatePreview } from '$lib/utils';
	import { Sun, Moon, Trash2, Download } from 'lucide-svelte';
	import GithubIcon from '../assets/GithubIcon.svelte';
	import { Switch } from '$components/ui/switch';
	import { Button } from '$components/ui/button';
	import { Label } from '$components/ui/label';
	import { get, writable } from 'svelte/store';
	import { browser } from '$app/environment';
	import { toggleMode } from 'mode-watcher';
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
	import { MediaType } from '$lib/files';

	// Stores
	const previewUrl = writable<string | null>(null);
	const selectedFiles = writable<File[]>([]);
	const showFileConversionModal = writable(false);
	const showMediaPreviewModal = writable(false);

	let isDraggingOver = false;
	let loadingStoredMedia = true;

	async function handleConversion() {
		if (get(loading) || !$selectedFiles.length || !get(mediaType)) return;
		loading.set(true);

		try {
			const currentOptions = get(options)[get(mediaType)!];
			const results = await batchConvert($selectedFiles, currentOptions);

			const newConvertedMedia = results.map((result, index) => {
				const file = $selectedFiles[index];
				const blob = new Blob([result.file.buffer], {
					type: `${get(mediaType)}/${currentOptions.format}`
				});
				return {
					id: crypto.randomUUID(),
					originalName: file.name,
					convertedName: `${file.name.replace(/\.[^/.]+$/, '')}.${currentOptions.format}`,
					blob,
					type: get(mediaType)!,
					size: blob.size,
					date: new Date()
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

	let batchConvert: (
		files: File[],
		options: {
			format: string;
			resolution?: string;
			bitrate?: string;
			codec?: string;
		}
	) => Promise<{ file: Uint8Array; name: string }[]>;

	onMount(() => {
		const storedPersistMedia = localStorage.getItem('persistMedia');
		if (storedPersistMedia !== null) {
			persistMedia.set(storedPersistMedia === 'true');
		}

		const storedStorageLimit = localStorage.getItem('storageLimitMB');
		if (storedStorageLimit !== null) {
			storageLimitMB.set(parseInt(storedStorageLimit, 10));
		}

		if (get(persistMedia)) {
			loadConvertedMediaFromStorage();
		}

		groupConvertedMedia($convertedMedia);

		loadingStoredMedia = false;

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
  ========== UI Ideas ==========
  Big empty space
  If no pictures converted, then show drag and drop area
  When picture dragged, open overlay for conversion, saving options from previous
  Should be able to drag and drop multiple files
  Should be able to convert multiple files at once
  Restrict to single media type at a time (audio, video, image)
  Show preview of media to be converted (just image and video for now)
  Conversion options will be in a panel on the right side
  Once conversion is started, close the modal and go back to the main screen
  This will be a grid that will populate as images are converted.
  Will show placeholders for conversions that have started but not finished.
  This should be a preview of the original image with a blur applied,
  or a loading icon/spinner for videos or audio.
  Once conversion is complete, show the converted image in the grid.
  These will be persisted for the session, but not saved to the server.
  Either cookies or local storage will be used to persist the data.
  Hovering over the media will show a download button and trash/discard button.
  For images, a copy button will also be shown to copy the image to the user's clipboard.
  For all media, clicking on a converted media will open a modal with the media in full size.
  There will also be a download all button to download all converted media at once in zip format.
  Media will be sorted in the grid by date relative to the current day (newest first).
  This will be something like Today, Yesterday, Last Week, Last Month, Older.
  The user will also be able to set a storage limit for persisted converted media,
  and the oldest media will be deleted when the limit is reached.
  The user will also be able to disable persisting media if they want.
  The user will be able to delete individual media items from the grid.
  The user will be able to delete all media items from the grid.

  ========== UI Components ==========
  - Drag and drop area ✅
  - Conversion options panel
  - Converted media grid
  - Converted media item
  - Converted media modal
  - Download all button ✅
  - Delete all button ✅
  - Delete media item button
  - Copy media item button
  - Download media item button
  - Trash media item button
  - Conversion in progress placeholder
  - Conversion failed placeholder
  - Conversion succeeded placeholder
  - Conversion modal ✅
  - Conversion modal close button ✅
  - Conversion modal download button
  - Conversion modal trash button
  - Conversion modal copy button
  
  ========== UI States ==========
  - Dragging over drag and drop area
  - Conversion in progress
  - Conversion failed
  - Conversion succeeded
  - Conversion modal open
  - Conversion modal close
  - Conversion modal download
  - Conversion modal trash
 -->

<div class="flex flex-col min-h-screen">
	<header class="w-full border-b-2 border-foreground/20">
		<div class="container flex items-center justify-between gap-2 py-2">
			<h1 class="text-2xl font-semibold">Media Conversion Tool</h1>
			<Button on:click={toggleMode} variant="ghost" size="icon">
				<Sun
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all 
          dark:-rotate-90 dark:scale-0"
				/>
				<Moon
					class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 
          transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
	</header>

	<Dropzone
		{loadingStoredMedia}
		{isDraggingOver}
		on:fileSelected={async () => {
			showFileConversionModal.set(true);
			if (!get(ffmpegInitialized)) {
				const ffmpegUtil = await import('$lib/ffmpeg');
				batchConvert = ffmpegUtil.batchConvert;
				ffmpegInitialized.set(await ffmpegUtil.init());
			}
		}}
		{selectedFiles}
	>
		<FileConversionModal showModal={showFileConversionModal} {selectedFiles} {handleConversion} />
		<MediaPreviewModal showModal={showMediaPreviewModal} {previewUrl} />
		<section>
			<div class="flex items-center justify-between gap-4 pb-2">
				<div class="flex items-center h-10">
					<h2 class="text-xl font-semibold">Converted Media</h2>
				</div>
				{#if $convertedMedia.length > 0}
					<div class="flex gap-2">
						<Button
							on:click={downloadAllMedia}
							disabled={$convertedMedia.length === 0}
							variant="ghost"
						>
							Download All
							<Download class="ml-2 h-4 w-4" />
						</Button>
						<Button
							on:click={deleteAllMedia}
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
							class="text-lg font-medium tracking-wide text-foreground/80 mb-2 pb-1 border-b border-foreground/30"
						>
							{group}
						</h3>
						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
							{#each items.sort((a, b) => b.date.getTime() - a.date.getTime()) as item (item.id)}
								<ImageItem
									{item}
									on:preview={(event) => {
										previewUrl.set(event.detail);
										mediaType.set(MediaType.Image);
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
		<div class="container flex justify-between items-end">
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
			<p>
				Made with ❤️ by <a
					href="rezab.vercel.app"
					class="rounded-sm underline-offset-4 hover:underline"
					target="_blank"
				>
					Reza Banankhah
				</a>
			</p>
			<div class="flex flex-col gap-4">
				<div class="flex items-center space-x-2">
					<Label for="storage-limit">Storage Limit (MB):</Label>
					<input
						id="storage-limit"
						type="number"
						bind:value={$storageLimitMB}
						min="1"
						max="1000"
						class="w-20 px-2 py-1 border rounded"
					/>
				</div>
				<div class="flex items-center justify-end gap-2">
					<a href="https://github.com/rcb123/MediaConverter" target="_blank">
						<GithubIcon size={6} />
					</a>
				</div>
			</div>
		</div>
	</footer>
</div>
