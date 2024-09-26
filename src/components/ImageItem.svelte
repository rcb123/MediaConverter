<script lang="ts">
	import type { ConvertedMediaItem } from '$lib/media';
	import { formatMediaFileSize } from '$lib/mediaFileSizeFormatter';
	import { Copy, Download, Trash2 } from 'lucide-svelte';
	import { copyMediaToClipboard } from '$lib/utils';
	import { createEventDispatcher } from 'svelte';
	import { deleteMediaItem } from '$lib/storage';
	import { fade } from 'svelte/transition';
	import { MediaType } from '$lib/files';
	import { Button } from './ui/button';

	export let item: ConvertedMediaItem;

	const dispatch = createEventDispatcher();

	let objectURL = URL.createObjectURL(item.blob);
</script>

<div
	class="relative group border rounded-lg hover:shadow-md hover:-translate-y-1 transition-all"
	out:fade={{ duration: 300 }}
>
	<div
		class="absolute flex justify-end p-2 w-full top-0 right-0 rounded-t-lg
           bg-foreground/50 text-background opacity-0 pointer-events-none
           group-hover:opacity-100 group-hover:pointer-events-auto
           transition-all"
	>
		<Button on:click={() => copyMediaToClipboard(item.blob)} size="icon" variant="ghost">
			<Copy class="size-4" />
		</Button>
		<Button
			on:click={() => {
				const link = document.createElement('a');
				link.href = objectURL;
				link.download = item.convertedName;
				link.click();
			}}
			size="icon"
			variant="ghost"
		>
			<Download class="size-4" />
		</Button>
		<Button on:click={() => deleteMediaItem(item.id)} size="icon" variant="ghost">
			<Trash2 class="size-4 stroke-destructive" />
		</Button>
	</div>

	{#if item.type === MediaType.Image}
		<button class="w-full" on:click|preventDefault={() => dispatch('preview', objectURL)}>
			<img
				src={objectURL}
				alt={item.originalName}
				class="w-full h-44 object-cover mb-2 rounded-t-lg"
			/>
		</button>
	{:else if item.type === MediaType.Video}
		<!-- svelte-ignore a11y-media-has-caption -->
		<video src={objectURL} class="w-full h-32 object-cover mb-2 rounded-t-lg" />
	{:else if item.type === MediaType.Audio}
		<audio src={objectURL} controls class="w-full mb-2" />
	{/if}

	<div class="px-4 pb-2">
		<p class="font-semibold truncate">{item.convertedName}</p>
		<p class="text-sm text-foreground/50">{formatMediaFileSize(item.size)}</p>
	</div>
</div>
