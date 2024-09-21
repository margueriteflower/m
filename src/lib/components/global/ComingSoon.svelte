<script>
	import { onMount } from 'svelte';
	import { TextAnimator } from '$lib/textAnimator/text-animator.js';
	import Experience from '$lib/webgl/Experience.svelte';

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

<Experience />

<div class="coming-soon">
	<p>Coming Soon</p>
</div>

<style>
	.coming-soon {
		height: 100svh;
		width: 100vw;
		background-color: rgb(0, 0, 0);

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

		background: rgb(255, 255, 255);
		height: 100%;
	}
</style>
