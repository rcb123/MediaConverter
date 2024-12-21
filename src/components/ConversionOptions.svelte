<script lang="ts">
	import type { AudioOptions, ImageOptions, VideoOptions } from '$lib/ffmpeg';
	import {
		baseAudioFormats,
		baseImageFormats,
		baseVideoFormats,
		extendedAudioFormats,
		extendedImageFormats,
		extendedVideoFormats,
		type MediaFormat,
		type MediaType
	} from '$lib/media';

	import { writable, type Writable } from 'svelte/store';
	import { Label } from '$components/ui/label';
	import { Input } from '$components/ui/input';

	import * as Select from '$components/ui/select';
	import { onMount } from 'svelte';

	const formatOptions = writable<{ label: string; value: MediaFormat }[]>([]);

	export let advancedMode: Writable<boolean>;
	export let mediaType: MediaType;
	export let options: Writable<{
		audio: AudioOptions;
		image: ImageOptions;
		video: VideoOptions;
	}>;

	onMount(updateFormatOptions);

	function updateFormatOptions() {
		switch (mediaType) {
			case 'audio':
				formatOptions.set($advancedMode ? extendedAudioFormats : baseAudioFormats);
				break;
			case 'image':
				formatOptions.set($advancedMode ? extendedImageFormats : baseImageFormats);
				break;
			case 'video':
				formatOptions.set($advancedMode ? extendedVideoFormats : baseVideoFormats);
				break;
			default:
				formatOptions.set([]);
				break;
		}
	}
</script>

<div class="space-y-4">
	<div>
		<Label for="format">Format</Label>
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
				<Select.Value placeholder="Select format" />
			</Select.Trigger>
			<Select.Content>
				{#each $formatOptions as { label, value }}
					<Select.Item {value}>{label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	{#if $advancedMode}
		<div class="border-foreground/20 border-t" />
		<div>
			<h3 class="mb-2 text-lg font-semibold">Advanced Options</h3>
			{#if mediaType === MediaType.Audio}
				<div class="space-y-2">
					<Label for="bitrate">Bitrate</Label>
					<Input id="bitrate" bind:value={$options.audio.bitrate} placeholder="e.g., 128k" />

					<Label for="codec">Codec</Label>
					<Input id="codec" bind:value={$options.audio.codec} placeholder="e.g., aac" />

					<Label for="channels">Channels</Label>
					<Input id="channels" bind:value={$options.audio.channels} placeholder="e.g., 2" />
				</div>
			{:else if mediaType === MediaType.Image}
				<div class="space-y-2">
					<Label for="resolution">Resolution</Label>
					<Input
						id="resolution"
						bind:value={$options.image.resolution}
						placeholder="e.g., 1280x720"
					/>

					<Label for="quality">Quality</Label>
					<Input id="quality" bind:value={$options.image.quality} placeholder="e.g., 100" />
				</div>
			{:else if mediaType === MediaType.Video}
				<div class="space-y-2">
					<Label for="resolution">Resolution</Label>
					<Input
						id="resolution"
						bind:value={$options.video.resolution}
						placeholder="e.g., 1280x720"
					/>

					<Label for="bitrate">Bitrate</Label>
					<Input id="bitrate" bind:value={$options.video.bitrate} placeholder="e.g., 1000k" />

					<Label for="codec">Codec</Label>
					<Input id="codec" bind:value={$options.video.codec} placeholder="e.g., libx264" />
				</div>
			{/if}
		</div>
	{/if}
</div>
