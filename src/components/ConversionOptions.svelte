<script lang="ts">
	import type { AudioSettings, ImageSettings, VideoSettings } from '$lib/ffmpeg.d';
	import type { MediaFormat } from '$lib/mediaFormats';
	import type { Writable } from 'svelte/store';
	import { Input } from '$components/ui/input';
	import { MediaType } from '$lib/files';

	import * as Select from '$components/ui/select';

	export let advancedMode: Writable<boolean>;
	export let formatOptions: Writable<{ label: string; value: MediaFormat }[]>;
	export let mediaType: MediaType;
	export let options: Writable<{
		[MediaType.Audio]: AudioSettings;
		[MediaType.Image]: ImageSettings;
		[MediaType.Video]: VideoSettings;
	}>;
</script>

<form class="h-fit w-full flex flex-col gap-4 py-4" on:submit|preventDefault={() => {}}>
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label>Format</label>
	<Select.Root
		items={$formatOptions}
		onSelectedChange={(state) => {
			if (state) {
				$options[mediaType].format = state.value;
				console.debug('Selected format:', state.value);
			}
		}}
	>
		<Select.Trigger>
			<Select.Value placeholder="Format" />
		</Select.Trigger>
		<Select.Content>
			{#each $formatOptions as { label, value }}
				<Select.Item {value}>{label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	{#if $advancedMode}
		<div class="border-t border-foreground/20" />
		<h3 class="font-semibold">Advanced Options</h3>
		{#if mediaType === MediaType.Audio}
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label>Bitrate</label>
			<Input bind:value={$options.audio.bitrate} placeholder="e.g., 128k" />

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label>Codec</label>
			<Input bind:value={$options.audio.codec} placeholder="e.g., aac" />

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label>Channels</label>
			<Input bind:value={$options.audio.channels} placeholder="e.g., 2" />
		{:else if mediaType === MediaType.Image}
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label>Resolution</label>
			<Input bind:value={$options.image.resolution} placeholder="e.g., 1280x720" />

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label>Quality</label>
			<Input bind:value={$options.image.quality} placeholder="e.g., 100" />
		{:else if mediaType === MediaType.Video}
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label>Resolution</label>
			<Input bind:value={$options.video.resolution} placeholder="e.g., 1280x720" />

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label>Bitrate</label>
			<Input bind:value={$options.video.bitrate} placeholder="e.g., 1000k" />

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label>Codec</label>
			<Input bind:value={$options.video.codec} placeholder="e.g., libx264" />
		{/if}
	{/if}
</form>
