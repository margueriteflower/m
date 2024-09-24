import * as THREE from 'three';
import vertex from './shaders/vertex.glsl?raw';
import fragment from './shaders/fragment.glsl?raw';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import Stats from 'stats.js';
import gsap from 'gsap';

export default class Experience {
	constructor(canvas) {
		window.experience = this;

		this.canvas = canvas;

		this.scene = new THREE.Scene();

		this.setRenderer();
		this.setCamera();
		this.setMesh();
		this.setEvents();
		this.setASCII();
		this.setTick();
	}

	setASCII() {
		this.effect = new AsciiEffect(this.renderer, '  .:-+*=%@#', { invert: true });
		this.effect.setSize(window.innerWidth, window.innerHeight);
		this.effect.domElement.style.color = 'white';
		this.effect.domElement.style.backgroundColor = 'black';

		this.effect.domElement.style.position = 'fixed';
		this.effect.domElement.style.top = '0';
		this.effect.domElement.style.left = '0';
		this.effect.domElement.style.zIndex = '-10';

		document.body.appendChild(this.effect.domElement);
	}

	setMesh() {
		this.mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(1, 1),
			new THREE.ShaderMaterial({
				vertexShader: vertex,
				fragmentShader: fragment,
				uniforms: {
					uResolution: {
						value: new THREE.Vector2(window.innerWidth, window.innerHeight)
					},
					uTime: { value: 0 },
					uFrequency: { value: 0 },
					uVisualizer: { value: 0 },
					uScale: { value: 0.1 }
				}
			})
		);

		this.mesh.scale.set(this.viewportWidth, this.viewportHeight, 0);

		this.scene.add(this.mesh);
	}

	setCamera() {
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
		this.camera.position.set(0, 0, 2);

		this.cameraUtils = () => {
			this.vFov = THREE.MathUtils.degToRad(this.camera.fov);
			this.viewportHeight = 2 * Math.tan(this.vFov / 2) * this.camera.position.z;
			this.viewportWidth = this.viewportHeight * this.camera.aspect;
		};
		this.cameraUtils();
	}

	setEvents() {
		this.resize = this.resize.bind(this);
		window.addEventListener('resize', this.resize);

		window.addEventListener('audioVisualizer', (e) => {
			const dataArray = e.detail;

			const silenceThreshold = 50;
			const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

			gsap.to(this.mesh.material.uniforms.uVisualizer, {
				value: () => {
					if (average < silenceThreshold) return 0;
					return 4;
				},
				duration: 4
			});
		});
	}

	resize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.effect.setSize(window.innerWidth, window.innerHeight);

		this.mesh.material.uniforms.uResolution.value = new THREE.Vector2(
			window.innerWidth,
			window.innerHeight
		);

		this.cameraUtils();
		this.mesh.scale.set(this.viewportWidth, this.viewportHeight, 0);
	}

	setRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor('black');
		this.renderer.shadowMap.enabled = true;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1;
	}

	setTick() {
		// this.stats = new Stats();
		// this.stats.showPanel(0);
		// document.body.appendChild(this.stats.dom);

		this.previousTime = 0;

		this.tick = this.tick.bind(this);
		this.animationFrameId = requestAnimationFrame(this.tick); // Save the requestAnimationFrame ID
	}

	tick(t) {
		// this.stats.begin();

		this.elapsedTime = t / 1000;
		this.deltaTime = this.elapsedTime - this.previousTime;
		this.previousTime = this.elapsedTime;

		this.renderer.render(this.scene, this.camera);
		this.effect.render(this.scene, this.camera);

		this.mesh.material.uniforms.uTime.value = this.elapsedTime;

		// this.stats.end();
		this.animationFrameId = requestAnimationFrame(this.tick); // Save the new frame ID
	}

	destroy() {
		// Cancel the animation frame to stop the loop
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}

		// Remove event listeners
		window.removeEventListener('resize', this.resize);

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

		// Remove the ASCII effect DOM element
		if (this.effect && this.effect.domElement) {
			document.body.removeChild(this.effect.domElement);
		}
	}
}
