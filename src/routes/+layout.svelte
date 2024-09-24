<script>
	import '../app.css';
	import Navigation from '$lib/components/global/Navigation.svelte';
	import Warning from '../lib/components/global/Warning.svelte';

	let { children } = $props();

	let warning = $state('displayed');
</script>

<Navigation />

{#if warning === 'displayed'}
	<Warning bind:warning />
{/if}

{@render children()}
