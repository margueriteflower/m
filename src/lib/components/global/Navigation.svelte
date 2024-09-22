<script>
	import { onMount } from 'svelte';
	import { TextAnimator } from '$lib/textAnimator/text-animator.js';

	let component = $state();

	const init = () => {
		component.querySelectorAll('a').forEach((item) => {
			const animator = new TextAnimator(item);
			item.addEventListener('mouseenter', () => {
				animator.animate();
			});

			animator.animate();

			// setTimeout(() => {
			// 	animator.animate();
			// }, 1000);
		});
	};

	onMount(() => {
		init();
	});
</script>

<nav bind:this={component}>
	<a href="/assistant">ASSISTANT</a>
	<a href="/contact">CONTACT</a>
</nav>

<style>
	nav {
		position: fixed;
		top: 0;
		left: 0;

		display: flex;
		align-items: center;
		gap: 10px;
		padding: 1rem;
		font-size: 12px;
		font-weight: 700;
		box-sizing: border-box;
	}

	a {
		padding: 1rem;
		&:nth-child(1) {
			padding-right: 0;
		}
	}
</style>
