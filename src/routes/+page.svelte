<script lang="ts">
	import { formatMediaFileSize } from '$lib/mediaFileSizeFormatter';
	import { convertFile, batchConvert } from '$lib/ffmpeg';
	import { LoaderCircle, Sun, Moon } from 'lucide-svelte';
	import { Button } from '$components/ui/button';
	import { Label } from '$components/ui/label';
	import { Input } from '$components/ui/input';
	import { toggleMode } from 'mode-watcher';
	import { writable } from 'svelte/store';

	import * as Select from '$components/ui/select';
	import JSZip from 'jszip';

	const mediaType = writable<FileType | null>(null);
	const formatOptions = writable<{ label: string; value: string }[]>([]);
	const advancedMode = writable(false);
	const error = writable<string | null>(null);

	let downloadEl: Button;
	let isDraggingOver: boolean = false;
	let selectedFile: File | null = null;
	let selectedFiles: File[] = [];
	let previewUrl: string | null = null;
	let format: string | null = null;
	let resolution = '';
	let bitrate = '';
	let codec = '';
	let conversionResult: string | null = null;
	let batchMode = false;

	enum FileType {
		Image = 'image',
		Video = 'video',
		Audio = 'audio'
	}
	let conversionProcessing = false;

	// Format options for images and videos supported by ffmpeg
	const commonImageFormats = [
		{ label: 'JPEG', value: 'jpeg' },
		{ label: 'PNG', value: 'png' },
		{ label: 'GIF', value: 'gif' },
		{ label: 'WEBP', value: 'webp' }
	];
	const extendedImageFormats = [
		{ label: 'TIFF', value: 'tiff' },
		{ label: 'BMP', value: 'bmp' },
		{ label: 'ICO', value: 'ico' },
		{ label: 'SVG', value: 'svg' }
	];

	const commonVideoFormats = [
		{ label: 'MP4', value: 'mp4' },
		{ label: 'AVI', value: 'avi' },
		{ label: 'MKV', value: 'mkv' },
		{ label: 'MOV', value: 'mov' }
	];
	const extendedVideoFormats = [
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

	const commonAudioFormats = [
		{ label: 'MP3', value: 'mp3' },
		{ label: 'WAV', value: 'wav' },
		{ label: 'AAC', value: 'aac' },
		{ label: 'OGG', value: 'ogg' }
	];
	const extendedAudioFormats = [
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

	const handleFileChange = (event: any) => {
		error.set(null);
		const file = event.target.files[0];
		selectedFile = file;
		if (selectedFile) {
			const fileType = selectedFile.type;
			if (fileType.startsWith('image/')) {
				mediaType.set(FileType.Image);
				previewUrl = URL.createObjectURL(selectedFile);
			} else if (fileType.startsWith('video/')) {
				mediaType.set(FileType.Video);
				previewUrl = URL.createObjectURL(selectedFile);
			} else if (fileType.startsWith('audio/')) {
				mediaType.set(FileType.Audio);
				previewUrl = URL.createObjectURL(selectedFile);
			} else {
				mediaType.set(null);
				previewUrl = null;
			}
		}
		console.log('File selected:', selectedFile);
	};

	const handleDrop = (event: any) => {
		event.preventDefault();
		const file = event.dataTransfer.files[0];
		if (
			!(
				file.type.startsWith('image/') ||
				file.type.startsWith('video/') ||
				file.type.startsWith('audio/')
			)
		) {
			error.set('Unsupported file type. Please select an image or video file.');
			return;
		}
		selectedFile = file;
		handleFileChange({ target: { files: [file] } });
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
		if (conversionProcessing) return;
		try {
			// Ensure a file is selected before proceeding
			if (!selectedFile && (!batchMode || !selectedFiles.length)) {
				error.set('Please select a file to convert.');
				return;
			}
			if (!format) {
				error.set('Please select a format to convert the file to.');
				return;
			}
			conversionProcessing = true;
			if (batchMode && selectedFiles.length) {
				const results = await batchConvert(selectedFiles, { format, resolution, bitrate, codec });
				conversionResult = 'Batch conversion completed. Download links will appear here.';
				// Construct a zip file with all the converted files
				const zip = new JSZip();
				results.forEach((result, index) => {
					const blob = new Blob([result.buffer], { type: `video/${format}` });
					zip.file(`converted-file-${index + 1}.${format}`, blob);
				});
				const zipBlob = await zip.generateAsync({ type: 'blob' });
				const zipUrl = URL.createObjectURL(zipBlob);
				downloadEl.download = 'converted-files.zip';
				conversionResult = zipUrl;
				conversionProcessing = false;
			} else if (selectedFile) {
				const result = await convertFile(selectedFile, selectedFile.name, {
					format,
					resolution,
					bitrate,
					codec
				});
				console.log('Conversion Finished');
				const blob = new Blob([result.file.buffer], { type: `video/${format}` });
				const url = URL.createObjectURL(blob);
				downloadEl.download = result.name;
				conversionResult = url;
				conversionProcessing = false;
			}
		} catch (err) {
			console.error(err);
			error.set('Error occurred during conversion. Please try again.');
			conversionProcessing = false;
		}
	}

	mediaType.subscribe((value) => {
		switch (value) {
			case FileType.Image:
				formatOptions.set(
					$advancedMode ? [...commonImageFormats, ...extendedImageFormats] : commonImageFormats
				);
				break;
			case FileType.Video:
				formatOptions.set(
					$advancedMode ? [...commonVideoFormats, ...extendedVideoFormats] : commonVideoFormats
				);
				break;
			case FileType.Audio:
				formatOptions.set(
					$advancedMode ? [...commonAudioFormats, ...extendedAudioFormats] : commonAudioFormats
				);
				break;
			default:
				formatOptions.set([]);
				break;
		}
	});
</script>

<svelte:head>
	<title>Media Conversion Tool</title>
</svelte:head>

<div class="flex flex-col">
	<div class="w-full border-b border-foreground/20">
		<section class="container flex flex-row justify-between gap-4 mx-auto py-4">
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
	<div class="my-4">
		<Button on:click={() => (batchMode = !batchMode)}>
			{batchMode ? 'Switch to Single File Mode' : 'Switch to Batch Mode'}
		</Button>
	</div>

	{#if batchMode}
		<!-- Batch Mode -->
		<Input multiple type="file" bind:value={selectedFiles} />
	{:else}
		<!-- Single File Mode -->
		{#if selectedFile}
			<div class="flex flex-col gap-4">
				{#if previewUrl}
					{#if $mediaType === FileType.Image}
						<img src={previewUrl} alt="File preview" class="preview" />
					{:else if $mediaType === FileType.Video}
						<!-- svelte-ignore a11y-media-has-caption -->
						<video src={previewUrl} controls class="preview" />
					{:else if $mediaType === FileType.Audio}
						<audio src={previewUrl} controls class="preview" />
					{/if}
				{/if}
				<div>
					<p><strong>File Name:</strong> {selectedFile.name}</p>
					<p><strong>File Size:</strong> {formatMediaFileSize(selectedFile.size)}</p>
					<p><strong>File Type:</strong> {selectedFile.type}</p>
				</div>
				<Button on:click={() => (selectedFile = null)}>Remove File</Button>
			</div>
		{:else}
			<div
				class={`box-border flex flex-col h-fit w-full sm:w-3/4 text-center cursor-default items-center self-center border-2 rounded-md pb-16 pt-20 px-4 transition-all ${
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

	{#if selectedFile && $mediaType}
		<div class="my-4">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label>Format</label>
			<Select.Root
				items={$formatOptions}
				onSelectedChange={(state) => {
					if (state) {
						format = state.value ? state.value : 'mp4';
						console.log('Selected format:', format);
					}
				}}
			>
				<Select.Trigger>
					<Select.Value placeholder="Format" />
				</Select.Trigger>
				<Select.Content>
					{#each $formatOptions as { label, value }}
						<Select.Item {value}>{label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		{#if $mediaType === FileType.Video}
			<div class="my-4">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label>Resolution (Optional)</label>
				<Input bind:value={resolution} placeholder="e.g., 1280x720" />
			</div>

			<div class="my-4">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label>Bitrate (Optional)</label>
				<Input bind:value={bitrate} placeholder="e.g., 1000k" />
			</div>

			<div class="my-4">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label>Codec (Optional)</label>
				<Input bind:value={codec} placeholder="e.g., libx264" />
			</div>
		{/if}
	{/if}

	<Button
		bind:this={downloadEl}
		on:click={handleConversion}
		disabled={!selectedFile || !format}
		class="my-4"
	>
		{#if !conversionProcessing}
			Convert
		{:else}
			<span class="pr-2">Converting...</span><LoaderCircle class="animate-spin" />
		{/if}
	</Button>

	{#if conversionResult}
		<Button bind:this={downloadEl} href={conversionResult} class="bg-blue-600 text-accent my-4">
			Download Converted File
		</Button>
	{/if}

	{#if $error}
		<div class="text-destructive">{$error}</div>
	{/if}
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
