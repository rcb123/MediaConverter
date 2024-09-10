<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { inject } from '@vercel/analytics';
	import '../app.css';
</script>

<ModeWatcher />
<slot />
