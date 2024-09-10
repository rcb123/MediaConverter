<script lang="ts">
	import {
		type MediaFormat,
		baseAudioFormats,
		baseImageFormats,
		baseVideoFormats,
		extendedAudioFormats,
		extendedImageFormats,
		extendedVideoFormats
	} from '$lib/mediaFormats';
	import { formatMediaFileSize } from '$lib/mediaFileSizeFormatter';
	import { type AudioSettings, type ImageSettings, type VideoSettings } from '$lib/ffmpeg.d';
	import { LoaderCircle, Sun, Moon } from 'lucide-svelte';
	import { Switch } from '$components/ui/switch';
	import { Button } from '$components/ui/button';
	import { Label } from '$components/ui/label';
	import { Input } from '$components/ui/input';
	import { get, writable, type Writable } from 'svelte/store';
	import { toggleMode } from 'mode-watcher';
	import { MediaType } from '$lib/files';

	import JSZip from 'jszip';
	import ConversionOptions from '$components/ConversionOptions.svelte';
	import { onMount } from 'svelte';

	const mediaType = writable<MediaType | null>(null);
	const formatOptions = writable<{ label: string; value: MediaFormat }[]>([]);
	const advancedMode = writable(false);
	const loading = writable(false);
	const message = writable('');
	const error = writable<string | null>(null);
	const options: Writable<{
		[MediaType.Audio]: AudioSettings;
		[MediaType.Image]: ImageSettings;
		[MediaType.Video]: VideoSettings;
	}> = writable({
		[MediaType.Audio]: {
			format: 'mp3',
			bitrate: '',
			codec: '',
			channels: ''
		},
		[MediaType.Image]: {
			format: 'jpeg',
			resolution: '',
			quality: 100
		},
		[MediaType.Video]: {
			format: 'mp4',
			resolution: '',
			bitrate: '',
			frameRate: '',
			codec: ''
		}
	});

	let downloadEl: Button;
	let isDraggingOver: boolean = false;
	let selectedFiles: File[] | null = null;
	let previewUrl: string | null = null;
	let resolution = '';
	let bitrate = '';
	let codec = '';
	let conversionResult: string | null = null;
	let batchMode = false;
	let convertFile: (
		file: File,
		fileName: string,
		options: {
			format: string;
			resolution?: string;
			bitrate?: string;
			codec?: string;
		}
	) => Promise<{
		file: Uint8Array;
		name: string;
	}>;
	let batchConvert: (
		files: File[],
		options: {
			format: string;
			resolution?: string;
			bitrate?: string;
			codec?: string;
		}
	) => Promise<Uint8Array[]>;

	onMount(async () => {
		const ffmpegUtil = await import('$lib/ffmpeg');
		convertFile = ffmpegUtil.convertFile;
		batchConvert = ffmpegUtil.batchConvert;
		ffmpegUtil.init();
	});

	const handleFileChange = (event: any) => {
		error.set(null);
		const files: File[] | null = event.target.files;
		if (!files || !files.length) {
			selectedFiles = [];
			return;
		}
		selectedFiles = files;
		if (selectedFiles[0]) {
			const fileType = selectedFiles[0].type;
			if (fileType.startsWith('image/')) {
				mediaType.set(MediaType.Image);
				previewUrl = URL.createObjectURL(selectedFiles[0]);
			} else if (fileType.startsWith('video/')) {
				mediaType.set(MediaType.Video);
				previewUrl = URL.createObjectURL(selectedFiles[0]);
			} else if (fileType.startsWith('audio/')) {
				mediaType.set(MediaType.Audio);
				previewUrl = URL.createObjectURL(selectedFiles[0]);
			} else {
				mediaType.set(null);
				previewUrl = null;
			}
		}
		console.debug('File selected:', selectedFiles[0]);
	};

	const handleDrop = (event: any) => {
		event.preventDefault();
		const files = event.dataTransfer.files;
		if (!files || !files.length) {
			selectedFiles = [];
			return;
		}
		const firstFile = files[0];
		if (
			!(
				firstFile.type.startsWith('image/') ||
				firstFile.type.startsWith('video/') ||
				firstFile.type.startsWith('audio/')
			)
		) {
			error.set('Unsupported file type. Please select an image or video file.');
			return;
		}
		selectedFiles = files;
		handleFileChange({ target: { files } });
		isDraggingOver = false;
	};

	const handleDragOver = (event: any) => {
		event.preventDefault();
		isDraggingOver = true;
	};

	const handleDragLeave = () => {
		isDraggingOver = false;
	};

	async function handleConversion() {
		if ($loading) return;
		try {
			// Ensure a file is selected before proceeding
			if (!selectedFiles || !selectedFiles.length) {
				error.set('Please select a file to convert.');
				return;
			}
			if (!$mediaType) {
				error.set('Please select a valid file type to convert.');
				return;
			}
			const currentOptions = get(options)[$mediaType];
			if (!currentOptions.format) {
				error.set('Please select a format to convert the file to.');
				return;
			}
			loading.set(true);
			if (batchMode && selectedFiles.length) {
				const results = await batchConvert(selectedFiles, {
					format: currentOptions.format,
					resolution,
					bitrate,
					codec
				});
				conversionResult = 'Batch conversion completed. Download links will appear here.';
				// Construct a zip file with all the converted files
				const zip = new JSZip();
				results.forEach((result, index) => {
					const blob = new Blob([result.buffer], { type: `video/${currentOptions.format}` });
					zip.file(`converted-file-${index + 1}.${currentOptions.format}`, blob);
				});
				const zipBlob = await zip.generateAsync({ type: 'blob' });
				const zipUrl = URL.createObjectURL(zipBlob);
				downloadEl.download = 'converted-files.zip';
				conversionResult = zipUrl;
				loading.set(false);
			} else if (selectedFiles[0]) {
				const result = await convertFile(selectedFiles[0], selectedFiles[0].name, {
					format: currentOptions.format,
					resolution,
					bitrate,
					codec
				});
				console.debug('Conversion Finished');
				const blob = new Blob([result.file.buffer], { type: `video/${currentOptions.format}` });
				const url = URL.createObjectURL(blob);
				downloadEl.download = result.name;
				conversionResult = url;
				loading.set(false);
			}
		} catch (err) {
			console.error(err);
			error.set('Error occurred during conversion. Please try again.');
			loading.set(false);
		}
	}

	function updateFormatOptions() {
		switch ($mediaType) {
			case MediaType.Audio:
				formatOptions.set($advancedMode ? extendedAudioFormats : baseAudioFormats);
				break;
			case MediaType.Image:
				formatOptions.set($advancedMode ? extendedImageFormats : baseImageFormats);
				break;
			case MediaType.Video:
				formatOptions.set($advancedMode ? extendedVideoFormats : baseVideoFormats);
				break;
			default:
				formatOptions.set([]);
				break;
		}
	}

	mediaType.subscribe(() => {
		updateFormatOptions();
	});
	advancedMode.subscribe(() => {
		updateFormatOptions();
	});
</script>

<svelte:head>
	<title>Media Conversion Tool</title>
</svelte:head>

<div class="flex flex-col">
	<div class="w-full border-b border-foreground/20">
		<section class="container flex flex-row items-center justify-between gap-4 mx-auto py-4">
			<h1 class="text-2xl font-semibold">Media Conversion Tool</h1>
			<Button on:click={toggleMode} variant="ghost" size="icon">
				<Sun
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<Moon
					class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</section>
	</div>
</div>
<section class="container flex flex-col mx-auto py-8">
	<div class="my-4 flex flex-row gap-4 items-center justify-between">
		<Button on:click={() => (batchMode = !batchMode)}>
			{batchMode ? 'Switch to Single File Mode' : 'Switch to Batch Mode'}
		</Button>
		<div class="flex items-center space-x-2">
			<Switch id="advanced-mode" aria-label="Advanced Mode Toggle" bind:checked={$advancedMode} />
			<Label for="advanced-mode">Advanced Mode</Label>
		</div>
	</div>
	<div class="flex flex-col items-center self-center w-full sm:w-3/4">
		{#if batchMode}
			<!-- Batch Mode -->
			<Input multiple type="file" bind:value={selectedFiles} />
		{:else}
			<!-- Single File Mode -->
			{#if selectedFiles && selectedFiles[0]}
				{@const file = selectedFiles[0]}
				<div class="flex flex-col gap-4">
					{#if previewUrl}
						{#if $mediaType === MediaType.Image}
							<img src={previewUrl} alt="File preview" class="preview" />
						{:else if $mediaType === MediaType.Video}
							<!-- svelte-ignore a11y-media-has-caption -->
							<video src={previewUrl} controls class="preview" />
						{:else if $mediaType === MediaType.Audio}
							<audio src={previewUrl} controls class="preview" />
						{/if}
					{/if}
					<div>
						<p><strong>File Name:</strong> {file.name}</p>
						<p><strong>File Size:</strong> {formatMediaFileSize(file.size)}</p>
						<p><strong>File Type:</strong> {file.type}</p>
					</div>
					<Button on:click={() => (selectedFiles = [])}>Remove File</Button>
				</div>
			{:else}
				<div
					class={`box-border flex flex-col h-fit w-full text-center cursor-default items-center self-center border-2 rounded-md pb-16 pt-20 px-4 transition-all ${
						isDraggingOver
							? 'border-transparent ring-2 scale-[1.01]'
							: 'border-dashed border-foreground/40'
					}`}
					role="button"
					tabindex="0"
					on:drop={handleDrop}
					on:dragover={handleDragOver}
					on:dragleave={handleDragLeave}
				>
					<label
						class="group mb-7 flex size-32 cursor-pointer items-center justify-center rounded-full border"
						for="filepicker"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="92"
							height="63"
							viewBox="0 0 92 63"
							class="fill-foreground group-hover:fill-foreground/50 transition-colors"
						>
							<path
								d="M75.1813 26.5125C75.1813 26.25 75.2223 25.9875 75.2223 25.725C75.2223 11.5063 64.5848 0 51.4625 0C41.9955 0 33.8634 5.99375 30.0438 14.6562C28.3804 13.7594 26.5116 13.2344 24.5402 13.2344C18.4821 13.2344 13.4304 18.025 12.4652 24.2812C5.19554 26.95 0 34.3656 0 43.0938C0 54.075 8.23482 63 18.3795 63H39.4286V45.5H29.5304L46 27.1906L62.4697 45.4781H52.5714V62.9781H75.2223C84.5045 62.9781 92 54.775 92 44.7344C92 34.6937 84.4634 26.5344 75.1813 26.5125Z"
							/>
						</svg>
					</label>
					<input
						type="file"
						id="filepicker"
						accept="image/*, video/*, audio/*"
						on:change={handleFileChange}
						class="hidden"
					/>
					<Label
						for="filepicker"
						class="text-xl md:text-2xl hover:text-opacity-50 transition-colors cursor-pointer"
					>
						Drag file here or click to upload
					</Label>
				</div>
			{/if}
		{/if}

		{#if selectedFiles && selectedFiles.length && $mediaType}
			<ConversionOptions mediaType={$mediaType} {formatOptions} {advancedMode} {options} />
		{/if}

		<Button
			bind:this={downloadEl}
			on:click={handleConversion}
			disabled={!selectedFiles ||
				!selectedFiles.length ||
				($mediaType && !$options[$mediaType].format)}
			class="my-4 w-full"
		>
			{#if $loading}
				<span class="pr-2">Converting...</span><LoaderCircle class="animate-spin" />
			{:else}
				Convert
			{/if}
		</Button>
		<div>
			{#if conversionResult}
				<Button
					bind:this={downloadEl}
					href={conversionResult}
					class="bg-blue-600 text-accent my-4 w-full"
				>
					Download Converted File
				</Button>
			{/if}

			{#if $message}
				<div class="text-accent">{$message}</div>
			{/if}
			{#if $error}
				<div class="text-destructive">{$error}</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.preview {
		width: fit-content;
		max-width: 100%;
		height: auto;
		max-height: 24rem;
		align-self: center;
	}
</style>
