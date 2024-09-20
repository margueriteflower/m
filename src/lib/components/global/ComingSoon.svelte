<script>
	import { onMount } from 'svelte';
	import { TextAnimator } from '$lib/textAnimator/text-animator.js';

	const init = () => {
		document.querySelectorAll('.coming-soon p ').forEach((item) => {
			const animator = new TextAnimator(item);
			item.addEventListener('mouseenter', () => {
				animator.animate();
			});

			setTimeout(() => {
				animator.animate();
			}, 1000);
		});
	};

	onMount(() => {
		init();
	});
</script>

<div class="coming-soon">
	<p>Coming Soon</p>
</div>

<style>
	.coming-soon {
		height: 100svh;
		width: 100vw;
		background-color: white;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.coming-soon p .char) {
		--opa: 0;
		position: relative;
	}

	:global(.coming-soon p .char::after) {
		content: '';
		width: 1ch;
		top: 0;
		left: 0;
		position: absolute;
		opacity: var(--opa);

		background: black;
		height: 100%;
	}
</style>
