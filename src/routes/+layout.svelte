<script lang="ts">
	import { Toaster } from '$components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { inject } from '@vercel/analytics';
	import '../app.css';

	inject();
</script>

<ModeWatcher />
<Toaster />
<slot />
