#define WAVES 3.0

uniform float uTime;
uniform vec2 uResolution;
uniform float uVisualizer;

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uvNorm = fragCoord.xy / uResolution.xy;
	vec2 uv = -1.0 + 2.0 * uvNorm;
    float time = uTime * 5.3;

    // uv*= 0.1;
       
    // Initialiser la couleur avec un fond noir
  	vec4 color = vec4(0.0, 0.0, 0.0, 1.0);    
    vec3 colorLine = vec3(1.0, 1.0, 1.0);
    float epaisLine = 0.02;     

    for(float i = 0.0; i < WAVES; i++) {
		float sizeDif = (i * 4.0);
        colorLine = vec3(1.0 - (i * 0.2));
        
		// SiriWave
        float K = 4.0;
        float B = 10.0; // Nombre d'ondes
        float x = uv.x * 2.5;
        float att = (1.0 - (i * 0.2)) * uVisualizer * 0.1; // Amplitude des ondes
        float posOnde = uv.y + (att * pow((K / (K + pow(x, K))), K) * cos((B * x) - (time + (i * 2.5))));
      
        // Ligne
        float difEpais = epaisLine + ((epaisLine / WAVES) * i);
        vec3 line = smoothstep(0.0, 1.0, abs(epaisLine / posOnde)) * colorLine;
        
        // Accumuler la couleur de la ligne sur la couleur de fond
        color.rgb += line;
    }

    // Assigner la couleur finale
    gl_FragColor = color;
}
