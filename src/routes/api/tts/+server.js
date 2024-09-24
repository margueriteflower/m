import { elevenlabs } from '$lib/elevenlabs.js';

export const POST = async ({ request }) => {
	const { input } = await request.json();

	try {
		const audioStream = await elevenlabs.generate({
			voice: 'Jessica',
			text: input,
			model_id: 'eleven_turbo_v2_5'
		});

		return new Response(audioStream, {
			headers: {
				'Content-Type': 'audio/mpeg'
			}
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: "Erreur lors de la génération de l'audio." }), {
			status: 500
		});
	}
};
