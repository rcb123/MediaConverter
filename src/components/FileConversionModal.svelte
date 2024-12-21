<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { advancedMode, ffmpegInitialized, mediaType, loading, options } from '$lib/stores';
	import { formatMediaFileSize } from '$lib/mediaFileSizeFormatter';
	import { Button } from '$components/ui/button/index.js';
	import { LoaderCircle } from 'lucide-svelte';
	import { MediaType } from '$lib/files';

	import ConversionOptions from './ConversionOptions.svelte';
	import * as Dialog from '$components/ui/dialog/index.js';

	export let showModal: Writable<boolean> = writable(false); // Boolean to control the visibility of the modal
	export let selectedFiles: Writable<File[]>; // Array of files selected by the user
	export let handleConversion: () => void; // Function to handle the conversion process

	// Supported image formats for the <img> tag
	const supportedImageFormats = [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/svg+xml',
		'image/bmp',
		'image/apng',
		'image/avif'
	];

	// Helper function to check if the file is a supported image format
	function isSupportedImage(file: File): boolean {
		return supportedImageFormats.includes(file.type);
	}
</script>

<Dialog.Root
	bind:open={$showModal}
	onOpenChange={() => {
		if ($showModal) selectedFiles.set([]);
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Convert Selected Files</Dialog.Title>
			<Dialog.Description>Convert the selected files to the desired format.</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col max-h-[50vh] overflow-auto px-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{#each $selectedFiles as file}
					<div class="border rounded-lg hover:shadow-md hover:scale-[1.01] transition-all">
						{#if $mediaType === MediaType.Image}
							{#if isSupportedImage(file)}
								<img
									src={URL.createObjectURL(file)}
									alt="File preview"
									class="w-full h-44 object-cover mb-2 rounded-t-lg"
								/>
							{:else}
								<div class="unsupported-preview rounded-t-lg">
									<p>Preview not available for this format</p>
								</div>
							{/if}
						{:else if $mediaType === MediaType.Video}
							<!-- svelte-ignore a11y-media-has-caption -->
							<video src={URL.createObjectURL(file)} class="gallery-preview" />
						{:else if $mediaType === MediaType.Audio}
							<audio src={URL.createObjectURL(file)} class="gallery-preview" />
						{/if}
						<p class="file-info px-2 pb-2">
							{file.name.length > 16
								? `${file.name.slice(0, 13)}...${file.name.slice(file.name.lastIndexOf('.'))}`
								: file.name}
							({formatMediaFileSize(file.size)})
						</p>
					</div>
				{/each}
			</div>
		</div>

		{#if $selectedFiles.length > 0 && $mediaType}
			<ConversionOptions mediaType={$mediaType} {advancedMode} {options} />
		{/if}

		<Dialog.Footer>
			<Button
				type="submit"
				on:click={handleConversion}
				disabled={$selectedFiles.length === 0 || !$mediaType || $loading || !$ffmpegInitialized}
				class="w-full mt-4"
			>
				{#if $loading}
					<LoaderCircle class="mr-2 size-4 animate-spin" />
					Converting...
				{:else if !$ffmpegInitialized}
					Initializing FFMPEG...
				{:else}
					Convert
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	/* Preview image/video/audio */
	.gallery-preview {
		width: 100%;
		height: auto;
		object-fit: cover;
	}

	.file-info {
		text-align: center;
		margin-top: 8px;
		font-size: 0.875rem;
		color: #555;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Unsupported image format styling */
	.unsupported-preview {
		width: 100%;
		height: 128px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background-color: #f0f0f0;
		color: #999;
		font-size: 0.875rem;
		text-align: center;
		border: 1px dashed #ccc;
	}
</style>
