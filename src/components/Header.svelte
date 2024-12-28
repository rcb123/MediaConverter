<script lang="ts">
	import { Button } from '$components/ui/button';
	import { Moon, Sun } from 'lucide-svelte';
	import { toggleMode } from 'mode-watcher';
</script>

<header class="w-full border-b-2 border-foreground/20">
	<div class="container flex items-center justify-between gap-2 py-2">
		<h1 class="text-2xl font-semibold">Media Converter</h1>
		<div class="flex flex-row">
			<Button variant="link" href="/">Conversion</Button>
			<Button variant="link" href="/gallery">Gallery</Button>
		</div>

		{#if typeof SharedArrayBuffer !== 'undefined'}
			<p class="text-sm text-foreground/60">SharedArrayBuffer is supported</p>
		{:else}
			<p class="text-sm text-destructive">SharedArrayBuffer is not supported</p>
		{/if}

		<Button onclick={toggleMode} variant="ghost" size="icon">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all 
          dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 
          transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>
</header>
