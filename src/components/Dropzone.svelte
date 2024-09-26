<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { groupedConvertedMedia } from '$lib/storage';
	import { createEventDispatcher } from 'svelte';
	import { LoaderCircle } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let loadingStoredMedia = true;
	export let isDraggingOver = false;
	export let selectedFiles: Writable<File[]>;

	let filesPresent = false;

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;
		if (files) {
			selectedFiles.set(Array.from(files));
			dispatch('fileSelected');
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		console.debug('Handling drop event!');
		const files = event.dataTransfer?.files;
		console.debug('Files:', files);
		if (files) {
			selectedFiles.set(Array.from(files));
			dispatch('fileSelected');
		}
		isDraggingOver = false;
	}

	groupedConvertedMedia.subscribe((media) => {
		if (Object.entries(media).length > 0) {
			filesPresent = true;
		} else {
			filesPresent = false;
		}
	});
</script>

<main
	role="region"
	class="flex-grow relative container mx-auto py-4"
	on:drop={handleDrop}
	on:dragover={(event) => event.preventDefault()}
>
	{#if loadingStoredMedia}
		<div class="absolute inset-0 flex items-center justify-center">
			<LoaderCircle class="size-8 animate-spin" />
		</div>
	{:else if !filesPresent}
		<div
			class="absolute inset-0 h-full flex flex-col items-center justify-center transition-all z-10"
		>
			<label
				for="file-input"
				class="cursor-pointer text-center pointer-events-auto transition-all p-[10%]"
			>
				<svg
					class="mx-auto h-12 w-12"
					stroke="currentColor"
					fill="none"
					viewBox="0 0 48 48"
					aria-hidden="true"
				>
					<path
						d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span class="mt-2 block text-sm font-medium">
					Drag and drop files here, or click to select files
				</span>
			</label>
		</div>
	{/if}
	<input
		id="file-input"
		type="file"
		multiple
		accept="image/*,video/*,audio/*"
		class="hidden w-full h-full"
		on:change={handleFileChange}
	/>
	<slot />
</main>
