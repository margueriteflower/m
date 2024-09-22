<script>
	import '../app.css';
	import Navigation from '$lib/components/global/Navigation.svelte';

	let { children } = $props();
</script>

<Navigation />

{@render children()}
