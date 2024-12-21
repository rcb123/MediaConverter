<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { inject } from '@vercel/analytics';
	import '../app.css';

	const { children } = $props();

	inject();
</script>

<ModeWatcher />
{@render children()}
