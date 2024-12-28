<script lang="ts">
	import { type ConvertedMediaItem, formatMediaFileSize } from '$lib/media';
	import { Copy, Download, Trash2 } from 'lucide-svelte';
	import { copyMediaToClipboard } from '$lib/utils';
	import { deleteMediaItem } from '$lib/storage';
	import { fade } from 'svelte/transition';
	import { Button } from './ui/button';

	const { item, previewImage }: { item: ConvertedMediaItem; previewImage: (url: string) => void } =
		$props();

	const objectURL = URL.createObjectURL(item.convertedFile);
</script>

<div
	class="group relative rounded-lg border transition-all hover:-translate-y-1 hover:shadow-md"
	out:fade={{ duration: 300 }}
>
	<div
		class="pointer-events-none absolute right-0 top-0 flex w-full justify-end rounded-t-lg
           bg-foreground/75 p-2 text-background opacity-0
           transition-all group-hover:pointer-events-auto
           group-hover:opacity-100"
	>
		<Button
			onclick={async () => copyMediaToClipboard(item.convertedFile)}
			size="icon"
			variant="ghost"
		>
			<Copy class="size-4" />
		</Button>
		<Button
			onclick={() => {
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
		<Button onclick={() => deleteMediaItem(item.id)} size="icon" variant="ghost">
			<Trash2 class="size-4 stroke-destructive" />
		</Button>
	</div>

	{#if item.type === 'image'}
		<button class="w-full" onclick={() => previewImage(objectURL)}>
			<img
				src={objectURL}
				alt={item.originalName}
				class="mb-2 h-44 w-full rounded-t-lg object-cover"
			/>
		</button>
	{:else if item.type === 'video'}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video src={objectURL} class="mb-2 h-32 w-full rounded-t-lg object-cover"></video>
	{:else if item.type === 'audio'}
		<audio src={objectURL} controls class="mb-2 w-full"></audio>
	{/if}

	<div class="px-4 pb-2">
		<p class="truncate font-semibold">{item.convertedName}</p>
		<p class="text-sm text-foreground/50">{formatMediaFileSize(item.size)}</p>
	</div>
</div>
