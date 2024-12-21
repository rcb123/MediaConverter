<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { mediaType } from '$lib/stores';

	import * as Dialog from '$components/ui/dialog/index.js';

	const {
		showModal = writable(false),
		previewUrl = writable(null)
	}: { showModal: Writable<boolean>; previewUrl: Writable<string | null> } = $props();
</script>

<Dialog.Root
	bind:open={$showModal}
	onOpenChange={() => {
		if (!$showModal) previewUrl.set(null);
	}}
>
	<Dialog.Content class="p-0">
		{#if $mediaType === 'audio'}
			<audio src={$previewUrl} controls class="w-full"></audio>
		{:else if $mediaType === 'image'}
			<img
				src={$previewUrl}
				alt="Enlarged preview"
				width="800"
				height="600"
				class="mx-auto aspect-[800/600] max-h-[80vh] w-full max-w-full rounded-lg object-cover"
			/>
		{:else if $mediaType === 'video'}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video src={$previewUrl}></video>
		{/if}
	</Dialog.Content>
</Dialog.Root>
