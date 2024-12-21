<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { mediaType } from '$lib/stores';
	import { MediaType } from '$lib/files';

	import * as Dialog from '$components/ui/dialog/index.js';

	export let showModal: Writable<boolean> = writable(false);
	export let previewUrl = writable<string | null>(null);
</script>

<Dialog.Root
	bind:open={$showModal}
	onOpenChange={() => {
		if (!$showModal) previewUrl.set(null);
	}}
>
	<Dialog.Content class="p-0">
		{#if $mediaType === MediaType.Image}
			<img
				src={$previewUrl}
				alt="Enlarged preview"
				width="800"
				height="600"
				class="mx-auto max-h-[80vh] w-full max-w-full rounded-lg object-cover aspect-[800/600]"
			/>
		{:else if $mediaType === MediaType.Video}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video src={$previewUrl} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
