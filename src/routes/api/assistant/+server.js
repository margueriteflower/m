import { openai, assistant, thread } from '$lib/openai.js';

export async function POST({ request }) {
	try {
		const { input } = await request.json();

		// Crée un flux pour envoyer les données progressivement
		const stream = new ReadableStream({
			async start(controller) {
				try {
					// Envoie le message à OpenAI
					const message = await openai.beta.threads.messages.create(thread.id, {
						role: 'user',
						content: input
					});

					// Crée un run pour le streaming
					const run = openai.beta.threads.runs
						.stream(thread.id, {
							assistant_id: assistant.id
						})
						.on('textDelta', (textDelta, snapshot) => {
							// Écrit chaque delta de texte dans le flux
							controller.enqueue(new TextEncoder().encode(textDelta.value));
						})
						.on('end', () => {
							// Termine le flux une fois le texte complet
							controller.close();
						})
						.on('error', (err) => {
							console.error('Stream error:', err);
							controller.error(err);
						});
				} catch (error) {
					console.error('Error:', error);
					controller.error(error);
				}
			}
		});

		// Retourne la réponse sous forme de stream
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/plain',
				'Transfer-Encoding': 'chunked'
			}
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, message: 'Something went wrong' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}
