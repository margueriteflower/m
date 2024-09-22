<script>
	import { onMount } from 'svelte';
	import { TextAnimator } from '$lib/textAnimator/text-animator.js';
	import Glitch from '../../../webgl/glitch/Glitch.svelte';

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

<Glitch />

<div id="contact-page" bind:this={component}>
	<ul>
		<li>
			<a href="https://x.com/margueriteweb" target="_blank">
				<div>TW</div>
				@MARGUERITEWEB</a
			>
		</li>

		<li>
			<a href="mailto:contact@marguerite.app">
				<div>ML</div>
				CONTACT@MARGUERITE.APP</a
			>
		</li>
	</ul>

	<ul>
		<!-- <li>
			<a href="/">@MARGUERITEWEB</a>
		</li>
		<li>
			<a href="/">@MARGUERITEWEB</a>
		</li> -->
	</ul>
</div>

<style>
	#contact-page {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100svh;
		padding: 0 2rem;

		font-size: 14px;
	}

	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;

		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	a {
		display: flex;
		align-items: center;
		gap: 10px;

		div {
			font-weight: 600;
		}
	}
</style>
