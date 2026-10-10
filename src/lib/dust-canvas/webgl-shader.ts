export const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const fragmentShaderSource = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.03;
    
    vec2 q = vec2(fbm(uv + 0.1 * t), fbm(uv + vec2(1.2, 4.3)));
    vec2 r = vec2(fbm(uv + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t), fbm(uv + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t));
    
    float f = fbm(uv + 4.0 * r);

    vec3 color = mix(vec3(0.00, 0.00, 0.00),
                    vec3(0.02, 0.05, 0.15),
                    clamp((f*f)*4.0, 0.0, 1.0));

    color = mix(color,
                vec3(0.1, 0.05, 0.2),
                clamp(length(q), 0.0, 1.0));

    color = mix(color,
                vec3(0.8, 0.8, 1.0),
                clamp(length(r.x), 0.0, 1.0));

    float intensity = f * f * f * 1.5 + 0.2 * f * f;
    gl_FragColor = vec4(color * intensity, 1.0);
  }
`;

export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export interface WebGLNebula {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  positionAttributeLocation: number;
  positionBuffer: WebGLBuffer;
  timeLocation: WebGLUniformLocation | null;
  resolutionLocation: WebGLUniformLocation | null;
  canvas: HTMLCanvasElement;
  rafId: number;
}

export function initWebGLNebula(canvas: HTMLCanvasElement): WebGLNebula | null {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: false });
  if (!gl) return null;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  
  if (!vertexShader || !fragmentShader) return null;

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) return null;

  const positionAttributeLocation = gl.getAttribLocation(program, 'position');
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
  const positions = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

  return {
    gl,
    program,
    positionAttributeLocation,
    positionBuffer,
    timeLocation,
    resolutionLocation,
    canvas,
    rafId: 0,
  };
}

export function renderWebGLNebula(nebula: WebGLNebula, time: number): void {
  const { gl, program, positionAttributeLocation, positionBuffer, timeLocation, resolutionLocation, canvas } = nebula;
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.uniform1f(timeLocation, time * 0.005);
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function disposeWebGLNebula(nebula: WebGLNebula): void {
  const { gl, program, positionBuffer, rafId } = nebula;
  
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
  
  if (positionBuffer) {
    gl.deleteBuffer(positionBuffer);
  }
  
  if (program) {
    gl.deleteProgram(program);
  }
  
  const loseContext = gl.getExtension('WEBGL_lose_context');
  if (loseContext) {
    loseContext.loseContext();
  }
}

export function startWebGLNebulaLoop(nebula: WebGLNebula): void {
  const animate = (time: number) => {
    renderWebGLNebula(nebula, time);
    nebula.rafId = requestAnimationFrame(animate);
  };
  nebula.rafId = requestAnimationFrame(animate);
}

export function resizeWebGLNebula(nebula: WebGLNebula): void {
  const { canvas, gl } = nebula;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}