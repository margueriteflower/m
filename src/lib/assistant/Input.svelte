<script>
	import { onMount } from 'svelte';

	let textAnswer = $state('');
	let textInput = $state('');
	let processedText = $state(''); // Pour suivre le texte déjà traité
	let isPlaying = $state(false); // Pour suivre l'état de lecture de l'audio
	let allSentences = $state([]);
	let audioElements = $state([]); // Liste des éléments audio pour chaque phrase
	let sentenceIndex = $state(0); // Pour suivre l'index de la phrase courante

	// visualizer
	let audioContext;
	let analyser;
	let dataArray;
	let bufferLength;
	let currentSource = $state();
	let raf = $state();

	onMount(() => {
		submitOPENAI('Presente toi en anglais');
	});

	const submitOPENAI = async (input) => {
		try {
			const response = await fetch('/api/assistant', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ input: input })
			});

			textInput = '';

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let done = false;

			while (!done) {
				const { value, done: readerDone } = await reader.read();
				done = readerDone;
				textAnswer += decoder.decode(value, { stream: true });

				// Découpe le texte en phrases, mais seulement les nouvelles
				const newText = textAnswer.substring(processedText.length);
				const sentences = newText.match(/[^.!?]+[.!?]+[\s]*/g);

				if (sentences) {
					for (const sentence of sentences) {
						await processSentence(sentence);
						allSentences.push(sentence);
					}
					processedText += newText; // Mettre à jour processedText après avoir traité
				}
			}
		} catch (error) {
			console.error('Error fetching stream:', error);
			textAnswer = 'Error fetching data';
		}
	};

	// Fonction pour traiter chaque phrase et la transformer en audio
	async function processSentence(sentence) {
		if (!sentence) return;

		// Envoie la phrase au TTS pour synthèse
		const ttsResponse = await fetch('/api/tts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ input: sentence })
		});

		// Lire la réponse sous forme de Blob pour créer un élément audio
		const audioBlob = await ttsResponse.blob();
		const audioUrl = URL.createObjectURL(audioBlob);
		const audioElement = new window.Audio(audioUrl); // Créer un élément audio

		// Ajouter l'élément audio à la liste pour lecture
		audioElements.push({
			audioElement,
			sentence
		});

		// Si rien ne joue, commencer la lecture immédiatement
		if (!isPlaying) {
			playNextAudio();
		}
	}

	async function playNextAudio() {
		if (sentenceIndex >= audioElements.length || isPlaying) {
			return; // Stoppe si tout est lu ou si l'audio est déjà en train de jouer
		}

		const { audioElement, sentence } = audioElements[sentenceIndex];
		allSentences[sentenceIndex] = sentence; // Mise à jour de la phrase courante

		// Marquer que l'audio est en cours de lecture
		isPlaying = true;

		// Créer un AudioContext et visualiseur s'ils ne sont pas déjà créés
		if (!audioContext) {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array(bufferLength);
		}

		// Vérifier si un source node existe et le déconnecter si nécessaire
		if (currentSource) {
			currentSource.disconnect();
			currentSource = null; // S'assurer qu'il est bien réinitialisé
		}

		// Créer une nouvelle source audio uniquement si nécessaire
		currentSource = audioContext.createMediaElementSource(audioElement);
		currentSource.connect(analyser);
		analyser.connect(audioContext.destination);

		// Démarrer l'animation du visualiseur
		raf = requestAnimationFrame(animateVisualizer);

		// Jouer l'audio
		audioElement.play();

		audioElement.onended = () => {
			sentenceIndex++;
			URL.revokeObjectURL(audioElement.src); // Libérer l'URL après usage
			isPlaying = false; // Marquer la fin de la lecture
			playNextAudio(); // Jouer l'audio suivant après la fin du courant
		};
	}

	function animateVisualizer(e) {
		analyser.getByteFrequencyData(dataArray); // Obtenir les données de fréquence

		raf = requestAnimationFrame(animateVisualizer);

		window.dispatchEvent(new CustomEvent('audioVisualizer', { detail: dataArray }));
	}

	const stopAudio = () => {
		audioElements.forEach(({ audioElement }) => {
			if (!audioElement.paused) {
				audioElement.pause(); // Mettre en pause
				audioElement.currentTime = 0; // Remettre à zéro le temps de lecture
			}
		});

		// Réinitialiser l'état de la lecture audio
		isPlaying = false;
		sentenceIndex = 0;
	};
</script>

<div class="input">
	<form
		onsubmit={(e) => {
			e.preventDefault();
			if (textInput !== '') submitOPENAI(textInput);
		}}
	>
		<input type="text" bind:value={textInput} placeholder="Ask something" />
		<button type="submit">Ask AI</button>
	</form>

	<!-- <p>Current Sentence: {allSentences[sentenceIndex]}</p> -->
	<!-- <p>All Text: {textAnswer}</p> -->

	<p class="warn">Our AI can make mistakes. Verify it’s outputs.</p>
</div>

<style>
	.input {
		height: 100svh;
		width: 100vw;

		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-direction: column;
		padding-bottom: 20px;

		display: none;
	}

	form {
		width: 680px;
		height: 48px;

		display: flex;
		align-items: center;
		gap: 10px;

		color: black;

		background-color: white;
		border-radius: 4px;

		font-size: 14px;
	}

	input {
		height: 100%;
		width: 80%;
		border: 0;
		border-radius: 4px;
		font-family: 'JetBrains Mono', monospace;
		padding: 0 10px;

		&:focus {
			outline: none;
		}

		&::placeholder {
			font-family: 'JetBrains Mono', monospace;
			font-size: 14px;
		}
	}

	button {
		width: 20%;
		text-align: center;
	}

	.warn {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
	}
</style>
