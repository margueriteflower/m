<script>
	import { onMount } from 'svelte';
	import { TextAnimator } from '$lib/textAnimator/text-animator.js';
	import Glitch from '../../webgl/glitch/Glitch.svelte';
	import gsap from 'gsap';

	let { warning = $bindable() } = $props();

	let component = $state();
	let ctx = $state('');
	let animator2 = $state();

	const init = () => {
		gsap.fromTo(
			'.description',
			{
				webkitMaskPosition: '50% 0%',
				maskPosition: '50% 0%',
				webkitMaskSize: '400% 400%', // End with larger mask size
				maskSize: '400% 400%'
			},
			{
				maskPosition: '-20% 0%',
				delay: 0.1,
				duration: 5, // Adjust the duration as needed
				ease: 'power2.out'
			}
		);

		const p = component.querySelector('.proceed');
		p.addEventListener('mouseenter', () => {
			animator2.animate();
		});
		animator2 = new TextAnimator(p);

		animator2.animate();
	};

	onMount(() => {
		ctx = gsap.context(() => {}, component);
		init();
	});

	function click() {
		warning = 'hidden';
	}

	function animateOut() {
		const tl = gsap.timeline();
		tl.to('.description', {
			maskPosition: '50% 0%',
			delay: 0.1,
			duration: 2, // Adjust the duration as needed
			ease: 'power2.out'
		});

		tl.to(component, { autoAlpha: 0, duration: 1, ease: 'power2.out' }, '-=1');

		animator2.reverse();

		return { duration: 3000 };
	}
</script>

<Glitch />

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="warning" bind:this={component} onclick={click} role="button" out:animateOut>
	<p class="description">
		<span> Glitches in the shadows, whispers in the code</span>
		<span> — our site is under construction,</span>
		<span> enter at your own risk.</span>
	</p>

	<p class="proceed">Click anywhere to proceed</p>
</div>

<style>
	.warning {
		position: fixed;

		height: 100svh;
		width: 100vw;
		background-color: rgb(0, 0, 0);
		z-index: 999;

		display: flex;
		align-items: center;
		justify-content: center;

		font-size: 14px;
		cursor: pointer;
	}

	.description {
		-webkit-mask-image: radial-gradient(circle, transparent 40%, black 60%);
		mask-image: radial-gradient(circle, transparent 40%, black 60%);
		-webkit-mask-size: 400% 400%;
		mask-size: 400% 400%;
		-webkit-mask-position: 50% 0%;
		mask-position: 50% 0%;

		pointer-events: none;
	}

	p {
		text-align: center;

		span {
			display: block;
		}
	}

	.proceed {
		position: absolute;
		bottom: 40px;
		left: 50%;
		transform: translate(-50%, -50%);

		pointer-events: none;
	}
</style>
