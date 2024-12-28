<script lang="ts">
	import { Button } from '$components/ui/button';
	import { Moon, Sun } from 'lucide-svelte';
	import { toggleMode } from 'mode-watcher';
</script>

<header class="w-full border-b-2 border-foreground/20">
	<div class="container flex items-center justify-between gap-2 py-2">
		<h1 class="grow basis-0 text-2xl font-semibold">Media Converter</h1>
		<div class="flex flex-row">
			<Button variant="link" href="/">Conversion</Button>
			<Button variant="link" href="/gallery">Gallery</Button>
		</div>

		<div class="flex grow basis-0 justify-end">
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
	</div>
</header>
