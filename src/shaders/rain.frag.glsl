uniform sampler2D uTexture;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uUvSquash;

void main() {
  vec2 uv = gl_PointCoord;
	// Vertically squash UVs around center to avoid long line look when looking up/down
	uv.x = 0.5 + (uv.x - 0.5) * uUvSquash;
	
	vec4 tex = texture2D(uTexture, uv);

	gl_FragColor = vec4(uColor, tex.a * uOpacity);
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0	);
}
