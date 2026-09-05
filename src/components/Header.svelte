<script lang="ts">
	import { Button } from '$components/ui/button';
	import { Moon, Sun } from '@lucide/svelte';
	import { toggleMode } from 'mode-watcher';
</script>

<header class="border-foreground/20 w-full border-b-2">
	<div class="container flex items-center justify-between gap-2 py-2">
		<h1 class="grow basis-0 text-2xl font-semibold">Media Converter</h1>
		<div class="flex flex-row">
			<Button variant="link" href="/">Conversion</Button>
			<Button variant="link" href="/gallery">Gallery</Button>
		</div>

		<div class="flex grow basis-0 justify-end">
			<Button onclick={toggleMode} variant="ghost" size="icon">
				<Sun
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all 
          dark:scale-0 dark:-rotate-90"
				/>
				<Moon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 
          transition-all dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
	</div>
</header>
