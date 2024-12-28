<script lang="ts">
	import { convertedMedia, deleteAllMedia, groupedConvertedMedia } from '$lib/storage';
	import { mediaType, previewUrl, showMediaPreviewModal } from '$lib/stores';
	import { Download, Trash2 } from 'lucide-svelte';
	import { Button } from '$components/ui/button';
	import { downloadAllMedia } from '$lib/utils';

	import ImageItem from './ImageItem.svelte';

	function previewImage(url: string) {
		previewUrl.set(url);
		mediaType.set('image');
		showMediaPreviewModal.set(true);
	}
</script>

<section>
	<div class="flex items-center justify-between gap-4 pb-2">
		<div class="flex h-10 items-center">
			<h2 class="text-xl font-semibold">Converted Media</h2>
		</div>
		{#if $convertedMedia.length > 0}
			<div class="flex gap-2">
				<Button onclick={downloadAllMedia} disabled={$convertedMedia.length === 0} variant="ghost">
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
						<ImageItem {item} {previewImage} />
					{/each}
				</div>
			</div>
		{/if}
	{/each}
</section>
