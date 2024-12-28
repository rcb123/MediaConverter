<script lang="ts">
	import { Toaster } from '$components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { inject } from '@vercel/analytics';

	import Header from '$components/Header.svelte';

	import '../app.css';

	const { children } = $props();

	inject();
</script>

<ModeWatcher />
<Toaster />
<div class="flex min-h-screen flex-col">
	<Header />
	{@render children()}
</div>
