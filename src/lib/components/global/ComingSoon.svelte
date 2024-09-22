<script>
	import { onMount } from 'svelte';
	import { TextAnimator } from '$lib/textAnimator/text-animator.js';
	import Glitch from '../../webgl/glitch/Glitch.svelte';
	import gsap from 'gsap';

	let component = $state();
	let ctx = $state('');

	const init = () => {
		document.querySelectorAll('.coming-soon p ').forEach((item) => {
			const animator = new TextAnimator(item);
			item.addEventListener('mouseenter', () => {
				animator.animate();
			});

			setTimeout(() => {
				ctx.add(() => {
					gsap.set('.abs', { opacity: 0 });
					gsap.set('p', { opacity: 1 });
				});
				animator.animate();
			}, 1000);
		});
	};

	onMount(() => {
		ctx = gsap.context(() => {}, component);
		init();
	});
</script>

<Glitch />

<div class="coming-soon" bind:this={component}>
	<div class="abs">404 Not Found</div>
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

		font-size: 14px;
	}

	p {
		opacity: 0;
	}

	.abs {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
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
