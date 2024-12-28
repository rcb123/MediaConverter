<script>
	import { persistMedia, storageLimitMB } from '$lib/storage';
	import { Switch } from '$components/ui/switch';
	import { Label } from '$components/ui/label';
	import { advancedMode } from '$lib/stores';
</script>

<footer class="w-full border-t-2 border-foreground/20 py-4">
	<div class="container flex items-end justify-between">
		<div class="flex flex-col gap-4">
			<div class="flex items-center space-x-2">
				<Switch id="advanced-mode" bind:checked={$advancedMode} />
				<Label for="advanced-mode">Advanced Options</Label>
			</div>
			<div class="flex items-center space-x-2">
				<Switch id="persist-media" bind:checked={$persistMedia} />
				<Label for="persist-media">Persist converted media</Label>
			</div>
		</div>

		{#if typeof SharedArrayBuffer !== 'undefined'}
			<p class="text-sm text-foreground/60">SharedArrayBuffer is supported</p>
		{:else}
			<p class="text-sm text-destructive">SharedArrayBuffer is not supported</p>
		{/if}

		<div class="flex flex-col gap-4">
			<div class="flex items-center justify-end space-x-2">
				<Label for="storage-limit">Storage Limit (MB):</Label>
				<input
					id="storage-limit"
					type="number"
					bind:value={$storageLimitMB}
					min="1"
					max="1000"
					class="w-20 rounded border px-2 py-1"
				/>
			</div>

			<div class="flex items-center justify-end gap-2">
				<a
					href="https://rezab.vercel.app"
					class="rounded-sm underline-offset-4 hover:underline"
					target="_blank"
				>
					Made with ❤️ by Reza Banankhah
				</a>
			</div>
		</div>
	</div>
</footer>
