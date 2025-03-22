<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { Search } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';

	const {
		searchQuery
	}: {
		searchQuery: Writable<string>;
	} = $props();

	let timeout: number;

	// query after 0.3s of no input
	const debounceSearch = () => {
		clearTimeout(timeout); // Clear any existing timeout
		timeout = setTimeout(() => {
			if ($searchQuery !== '') {
				goto(`./gallery/?q=${$searchQuery}`, { invalidateAll: true });
			} else {
				goto('./gallery');
			}
		}, 500);
	};

	onDestroy(() => clearTimeout(timeout));
</script>

<div class="mb-3 flex items-center gap-1 rounded-full border-2 pl-3">
	<span class="flex items-center">
		<Search size={22} />
	</span>
	<input
		id="text"
		bind:value={$searchQuery}
		oninput={debounceSearch}
		placeholder={'Search your saved media'}
		class="h-10 w-full flex-1 rounded-full border-none bg-transparent pl-1 pr-6 text-sm outline-none placeholder:text-slate-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
	/>
</div>
