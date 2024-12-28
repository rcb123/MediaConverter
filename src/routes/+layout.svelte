<script lang="ts">
	import { previewUrl, showMediaPreviewModal } from '$lib/stores';
	import { Toaster } from '$components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { inject } from '@vercel/analytics';

	import MediaPreviewModal from '$components/MediaPreviewModal.svelte';
	import Header from '$components/Header.svelte';
	import Footer from '$components/Footer.svelte';

	import '../app.css';

	const { children } = $props();

	inject();
</script>

<ModeWatcher />
<Toaster />
<MediaPreviewModal showModal={showMediaPreviewModal} {previewUrl} />
<div class="flex min-h-screen flex-col justify-between">
	<Header />
	{@render children()}
	<Footer />
</div>
