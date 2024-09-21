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

		// this.setMesh();
		this.setCamera();
		// this.setLights();
		// this.setDebug();
		this.events();
		this.setRenderer();
		this.setPostProcessing();
		// this.setStudio();
		this.update();
	}

	setMesh() {
		const object = new CSS3DObject(document.querySelector('input'));
		object.scale.set(0.05, 0.05, 0.05);
		this.scene2.add(object);

		this.myText = new Text();
		this.scene.add(this.myText);

		this.myText.text = 'login';
		this.myText.fontSize = 5;
		this.myText.position.y = 6;
		this.myText.position.z = -5;
		this.myText.anchorX = 'center';
		this.myText.anchorY = 'center';
		this.myText.material = new THREE.MeshStandardMaterial();
		this.myText.color = new THREE.Color('lightgrey');

		// ground
		this.ground = new THREE.Mesh(
			new THREE.PlaneGeometry(100, 100),
			new THREE.MeshStandardMaterial({ color: 'white' })
		);
		this.ground.rotation.x = -Math.PI / 2;
		this.ground.position.y = -2;
		this.ground.receiveShadow = true;

		this.scene.add(this.ground);

		this.createCube = function (position, rotation) {
			const mesh = new THREE.Mesh(
				new THREE.BoxGeometry(1, 1),
				new THREE.MeshStandardMaterial({ color: 'white' })
			);
			mesh.castShadow = true;

			mesh.position.copy(position);
			mesh.rotation.set(rotation.x, rotation.y, rotation.z);

			this.scene.add(mesh);
		};

		this.createCube({ x: -6, y: -2 + 0.5, z: 2 }, { x: 0, y: 2, z: 0 });
		this.createCube({ x: 0, y: -2 + 0.5, z: 0 }, { x: 0, y: 0, z: 0 });
		this.createCube({ x: 3, y: -2 + 0.5, z: 5 }, { x: 0, y: 2, z: 0 });
	}

	setCamera() {
		this.camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		this.camera.position.set(0, 0, 10);

		// this.controls = new OrbitControls(this.camera, this.canvas);
	}

	setLights() {
		this.directionalLight = new THREE.DirectionalLight('white', 3);
		this.directionalLight.castShadow = true;
		this.directionalLight.shadow.mapSize.width = 512 * 4;
		this.directionalLight.shadow.mapSize.height = 512 * 4;
		this.directionalLight.shadow.camera.left = -10;
		this.directionalLight.shadow.camera.right = 10;
		this.directionalLight.shadow.camera.top = 10;
		this.directionalLight.shadow.camera.bottom = -10;

		// this.dirHelper = new THREE.DirectionalLightHelper(
		//     this.directionalLight,
		//     5,
		//     new THREE.Color("green")
		// );

		this.pointLight = new THREE.PointLight('white', 3, 10, 0.1);
		this.pointHelper = new THREE.PointLightHelper(this.pointLight, 1, new THREE.Color('red'));

		const ambiant = new THREE.AmbientLight('white', 2.5);

		this.scene.add(this.directionalLight, ambiant, this.pointLight);
	}

	setStudio() {
		// studio.initialize();

		const project = getProject('Scene', { state: theatreState });
		const sheet = project.sheet('Animated Scene');

		/*
		 *
		 */
		const directionalLightObj = sheet.object('Directional Light', {
			position: { x: 0, y: 2, z: -2 }
		});

		directionalLightObj.onValuesChange((values) => {
			this.directionalLight.position.copy(values.position);

			// this.dirHelper.update();
		});

		/**
		 *
		 */
		const pointLightObj = sheet.object('Point Light', {
			position: { x: 0, y: 0, z: 0 }
		});

		pointLightObj.onValuesChange((values) => {
			this.pointLight.position.copy(values.position);
		});
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

		// this.renderer2.setSize(window.innerWidth, window.innerHeight);
	}

	setDebug() {
		const pane = new Pane({ title: 'Parameters' });
		// pane.addBinding()
	}

	setRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
			alpha: true
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		// this.renderer.setClearColor('white');
		this.renderer.shadowMap.enabled = true;

		// css renderer
		// this.renderer2 = new CSS3DRenderer();
		// this.renderer2.setSize(window.innerWidth, window.innerHeight);
		// this.renderer2.domElement.style.position = 'absolute';
		// this.renderer2.domElement.style.top = 0;
		// document.body.appendChild(this.renderer2.domElement);

		// this.controls = new OrbitControls(
		//     this.camera,
		//     this.renderer2.domElement
		// );
	}

	setPostProcessing() {
		const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
			samples: devicePixelRatio === 1 ? 2 : 0
		});

		this.composer = new EffectComposer(this.renderer, renderTarget);
		this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.composer.setSize(window.innerWidth, window.innerHeight);

		console.log(this.composer);

		const renderPass = new RenderPass(this.scene, this.camera);
		this.composer.addPass(renderPass);

		const glitchPass = new GlitchPass();
		this.composer.addPass(glitchPass);

		const outputPass = new OutputPass();
		this.composer.addPass(outputPass);
	}

	update() {
		/**
		 * Stats
		 */
		// this.stats = new Stats();
		// this.stats.showPanel(0);
		// document.body.appendChild(this.stats.dom);

		/**
		 * RAF
		 */
		this.previousTime = 0;

		this.tick = this.tick.bind(this);
		requestAnimationFrame(this.tick);
	}

	tick(t) {
		// this.stats.begin();

		this.elapsedTime = t / 1000;
		this.deltaTime = this.elapsedTime - this.previousTime;
		this.previousTime = this.elapsedTime;

		// this.renderer.render(this.scene, this.camera);
		this.composer.render();
		// this.renderer2.render(this.scene2, this.camera);

		// this.myText.sync();

		// gsap.to(this.scene.rotation, { y: -this.pointer.x * 0.5, duration: 1 });
		// gsap.to(this.scene2.rotation, {
		// 	y: -this.pointer.x * 0.5,
		// 	duration: 1
		// });

		// this.stats.end();
		requestAnimationFrame(this.tick);
	}
}
