import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from './GlitchPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export default class Experience {
	constructor(canvas) {
		window.experience = this;

		this.canvas = canvas;

		this.scene = new THREE.Scene();
		this.scene2 = new THREE.Scene();

		this.setCamera();
		this.events();
		this.setRenderer();
		this.setPostProcessing();
		this.update();
	}

	setCamera() {
		this.camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		this.camera.position.set(0, 0, 10);
	}

	events() {
		this.resize = this.resize.bind(this);
		window.addEventListener('resize', this.resize);

		this.pointer = new THREE.Vector2();
		window.addEventListener('pointermove', this.pointermove.bind(this));
	}

	pointermove(e) {
		this.pointer = new THREE.Vector2(
			(e.clientX / window.innerWidth) * 2 - 1,
			-(e.clientY - window.innerHeight) * 2 + 1
		);
	}

	resize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		this.composer.setSize(window.innerWidth, window.innerHeight);
	}

	setRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
			alpha: true
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.shadowMap.enabled = true;
	}

	setPostProcessing() {
		const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
			samples: devicePixelRatio === 1 ? 2 : 0
		});

		this.composer = new EffectComposer(this.renderer, renderTarget);
		this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.composer.setSize(window.innerWidth, window.innerHeight);

		const renderPass = new RenderPass(this.scene, this.camera);
		this.composer.addPass(renderPass);

		const glitchPass = new GlitchPass();
		this.composer.addPass(glitchPass);

		const outputPass = new OutputPass();
		this.composer.addPass(outputPass);
	}

	update() {
		this.previousTime = 0;

		this.tick = this.tick.bind(this);
		this.animationFrameId = requestAnimationFrame(this.tick); // Save the requestAnimationFrame ID
	}

	tick(t) {
		this.elapsedTime = t / 1000;
		this.deltaTime = this.elapsedTime - this.previousTime;
		this.previousTime = this.elapsedTime;

		this.composer.render();
		this.animationFrameId = requestAnimationFrame(this.tick); // Save the new frame ID
	}

	// Function to clean up Three.js when changing page
	destroy() {
		// Cancel the animation frame to stop the loop
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}

		// Remove event listeners
		window.removeEventListener('resize', this.resize);
		window.removeEventListener('pointermove', this.pointermove);

		// Dispose of the renderer
		this.renderer.dispose();

		// Dispose of the scene and its objects
		this.scene.traverse((object) => {
			if (object.geometry) object.geometry.dispose();
			if (object.material) {
				if (Array.isArray(object.material)) {
					object.material.forEach((material) => material.dispose());
				} else {
					object.material.dispose();
				}
			}
		});

		// Dispose of the composer and passes
		this.composer.passes.forEach((pass) => {
			if (pass.dispose) pass.dispose();
		});
		this.composer.dispose();
	}
}
