import { ElevenLabsClient } from 'elevenlabs';
import { ELEVENLABS_API_KEY } from '$env/static/private';

const elevenlabs = new ElevenLabsClient({
	apiKey: ELEVENLABS_API_KEY // Defaults to process.env.ELEVENLABS_API_KEY
});

export { elevenlabs };
