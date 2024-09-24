import { openai } from '$lib/openai.js';
import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
	try {
		const data = await request.formData();
		const audioFile = data.get('audio');

		// Convertir le fichier audio en Buffer
		const arrayBuffer = await audioFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Générer un identifiant unique pour le fichier temporaire
		const tempFilePath = path.join('/tmp', `${crypto.randomUUID()}.mp3`);

		// Écrire le Buffer dans un fichier temporaire
		fs.writeFileSync(tempFilePath, buffer);

		// Transcrire l'audio en utilisant OpenAI
		const transcription = await openai.audio.transcriptions.create({
			file: fs.createReadStream(tempFilePath),
			model: 'whisper-1'
		});

		// Supprimer le fichier temporaire
		fs.unlinkSync(tempFilePath);

		return new Response(JSON.stringify({ success: true, transcription: transcription.text }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error during transcription:', error);
		return new Response(JSON.stringify({ success: false, message: 'Something went wrong' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}
