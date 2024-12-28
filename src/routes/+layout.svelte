<script lang="ts">
	import { loadingStoredMedia, previewUrl, showMediaPreviewModal } from '$lib/stores';
	import { groupConvertedMedia } from '$lib/utils';
	import { Toaster } from '$components/ui/sonner';
	import { browser } from '$app/environment';
	import { ModeWatcher } from 'mode-watcher';
	import { inject } from '@vercel/analytics';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import {
		convertedMedia,
		groupedConvertedMedia,
		loadConvertedMediaFromStorage,
		persistMedia,
		storageLimitMB,
		togglePersistMedia,
		updateStorageLimit
	} from '$lib/storage';

	import MediaPreviewModal from '$components/MediaPreviewModal.svelte';
	import Header from '$components/Header.svelte';
	import Footer from '$components/Footer.svelte';

	import '../app.css';

	const { children } = $props();

	inject();

	onMount(() => {
		const storedPersistMedia = localStorage.getItem('persistMedia');
		if (storedPersistMedia !== null) {
			persistMedia.set(storedPersistMedia === 'true');
		}

		const storedStorageLimit = localStorage.getItem('storageLimitMB');
		if (storedStorageLimit !== null) {
			storageLimitMB.set(Number.parseInt(storedStorageLimit, 10));
		}

		if (get(persistMedia)) {
			loadConvertedMediaFromStorage();
		}

		groupConvertedMedia($convertedMedia);

		loadingStoredMedia.set(false);

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
</script>

<ModeWatcher />
<Toaster />
<MediaPreviewModal showModal={showMediaPreviewModal} {previewUrl} />
<div class="flex min-h-screen flex-col justify-between">
	<Header />
	{@render children()}
	<Footer />
</div>
