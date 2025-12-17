import * as THREE from 'three';

export class ParticleSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.frame = 0;
        this.animationId = null; 
        
        this.init();
        this.setupEventListeners();
    }

    getShaders = () => {
        const commonShader = `
#define N 10.
#define TAU 6.28318530718

// Hash functions for random numbers
int IHash(int a) {
    a = (a ^ 61) ^ (a >> 16);
    a = a + (a << 3);
    a = a ^ (a >> 4);
    a = a * 0x27d4eb2d;
    a = a ^ (a >> 15);
    return a;
}

float Hash(int a) {
    return float(IHash(a)) / float(0x7FFFFFFF);
}

vec4 rand4(int seed) {
    return vec4(
        Hash(seed ^ 0x34F85A93),
        Hash(seed ^ 0x85FB93D5),
        Hash(seed ^ 0x6253DF84),
        Hash(seed ^ 0x25FC3625)
    );
}

vec2 randn(vec2 r) {
    r.x = sqrt(-2.0 * log(1e-9 + abs(r.x)));
    r.y *= TAU;
    return r.x * vec2(cos(r.y), sin(r.y));
}

vec3 getPaletteColor(float v, vec2 uv) {
    vec3 c1 = vec3(0.678, 0.396, 0.843); // #AD65D7
    vec3 c2 = vec3(0.733, 0.953, 0.902); // #BBF3E6
    vec3 c3 = vec3(0.518, 0.808, 0.953); // #84CEF3
    
    // Generate a value t from 0 to 1 based on position and velocity
    // Using a sine wave pattern that moves with time/velocity
    float t = 0.5 + 0.5 * sin(uv.x * 3.0 + uv.y * 2.0 + v * 2.0);
    
    // Smooth 3-stop gradient: c1 -> c2 -> c3
    vec3 col;
    if (t < 0.5) {
        // Map 0..0.5 to 0..1
        float mixVal = smoothstep(0.0, 1.0, t * 2.0);
        col = mix(c1, c2, mixVal);
    } else {
        // Map 0.5..1 to 0..1
        float mixVal = smoothstep(0.0, 1.0, (t - 0.5) * 2.0);
        col = mix(c2, c3, mixVal);
    }
    
    return col;
}
`;

        
        const bufferAShader = `
${commonShader}

uniform sampler2D tPrevious;
uniform sampler2D tVoronoi;
uniform vec2 iResolution;
uniform int iFrame;
uniform float iTime;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution;
    vec4 O = texture2D(tPrevious, uv);
    
    // Wrap positions to screen bounds (toroidal topology)
    O.xy = mod(O.xy, iResolution);
    
    // Random seed
    vec4 r = rand4(int(gl_FragCoord.x) + int(gl_FragCoord.y) * 2141 + (int(iTime * 2141.0) + iFrame) * 2141);
    
    // Initialize particles on first frames
    if (iFrame < 3) {
        O.xy = r.xy * iResolution;
        O.zw = 0.25 * cos(TAU * (vec2(0.0, 0.25) + r.z));
    }
    
    // Get Voronoi neighbor info
    vec2 voronoiUV = O.xy / iResolution;
    vec4 neighbors = texture2D(tVoronoi, voronoiUV);
    
    // Pressure & viscosity (flocking behavior)
    vec2 avgVelocity = vec2(0.0);
    vec2 repulsion = vec2(0.0);
    vec2 D;
    
    for (int i = 0; i < 4; i++) {
        float neighborId = neighbors[i];
        if (neighborId > 0.0) {
            // Sample neighbor particle data
            float idx = neighborId - 1.0;
            float ix = mod(idx, iResolution.x);
            float iy = floor(idx / iResolution.x);
            vec2 neighborUV = (vec2(ix, iy) + 0.5) / iResolution;
            vec4 neighborData = texture2D(tPrevious, neighborUV);
            
            avgVelocity += neighborData.zw * 0.25;
            
            // Calculate wrapped distance
            D = O.xy - neighborData.xy;
            D = mod(D + iResolution * 0.5, iResolution) - iResolution * 0.5;
            
            float dist = length(D);
            if (dist > 0.005 && dist < 10.0) {
                repulsion += normalize(D) / (dist + 0.03);
            }
        }
    }
    
    // Apply forces
    O.zw += repulsion / 25.0;  // Pressure
    O.zw = mix(O.zw, avgVelocity, 0.1);  // Viscosity
    
    // Maintain velocity magnitude
    float velLength = length(O.zw);
    if (velLength > 0.001) {
        O.zw = mix(O.zw, normalize(O.zw) * 0.25, 0.05);
    }
    
    // Add noise
    O.zw += randn(r.xy) / 100.0;
    
    // Update position
    O.xy += O.zw;
    
    gl_FragColor = O;
}
`;

        const bufferBShader = `
${commonShader}

uniform sampler2D tPrevious;
uniform sampler2D tParticles;
uniform vec2 iResolution;
uniform int iFrame;

vec4 getParticle(float id) {
    if (id <= 0.0) return vec4(0.0);
    float idx = id - 1.0;
    float ix = mod(idx, iResolution.x);
    float iy = floor(idx / iResolution.x);
    vec2 uv = (vec2(ix, iy) + 0.5) / iResolution;
    return texture2D(tParticles, uv);
}

float calcDist(float id, vec2 pos) {
    if (id <= 0.0) return 1e9;
    vec4 particle = getParticle(id);
    vec2 D = mod(particle.xy - pos + iResolution * 0.5, iResolution) - iResolution * 0.5;
    return dot(D, D);
}

void listInsert(inout vec4 ids, inout vec4 dists, float newId, float newDist) {
    if (newId == 0.0) return;
    
    // Check if already in list
    if (newId == ids.x || newId == ids.y || newId == ids.z || newId == ids.w) return;
    
    if (newDist < dists.x) {
        ids = vec4(newId, ids.xyz);
        dists = vec4(newDist, dists.xyz);
    } else if (newDist < dists.y) {
        ids = vec4(ids.x, newId, ids.yz);
        dists = vec4(dists.x, newDist, dists.yz);
    } else if (newDist < dists.z) {
        ids = vec4(ids.xy, newId, ids.z);
        dists = vec4(dists.xy, newDist, dists.z);
    } else if (newDist < dists.w) {
        ids = vec4(ids.xyz, newId);
        dists = vec4(dists.xyz, newDist);
    }
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution;
    vec2 pos = gl_FragCoord.xy;
    
    vec4 ids = vec4(0.0);
    vec4 dists = vec4(1e9);
    
    // Get neighbors from previous frame and adjacent pixels
    vec4 center = texture2D(tPrevious, uv);
    vec4 right = texture2D(tPrevious, uv + vec2(1.0, 0.0) / iResolution);
    vec4 top = texture2D(tPrevious, uv + vec2(0.0, 1.0) / iResolution);
    vec4 left = texture2D(tPrevious, uv + vec2(-1.0, 0.0) / iResolution);
    vec4 bottom = texture2D(tPrevious, uv + vec2(0.0, -1.0) / iResolution);
    
    // Process all neighbor IDs
    for (int k = 0; k < 4; k++) {
        listInsert(ids, dists, center[k], calcDist(center[k], pos));
        listInsert(ids, dists, right[k], calcDist(right[k], pos));
        listInsert(ids, dists, top[k], calcDist(top[k], pos));
        listInsert(ids, dists, left[k], calcDist(left[k], pos));
        listInsert(ids, dists, bottom[k], calcDist(bottom[k], pos));
    }
    
    // Try random particle to catch escapes
    int r = IHash(int(gl_FragCoord.x) + int(gl_FragCoord.y) * 2141 + iFrame * 2141 * 2141 + 11131);
    float randomId = 1.0 + float(r % int((iResolution.x * iResolution.y) / N));
    listInsert(ids, dists, randomId, calcDist(randomId, pos));
    
    gl_FragColor = ids;
}
`;

        const bufferCShader = `
${commonShader}

uniform sampler2D tVoronoi;
uniform sampler2D tParticles;
uniform sampler2D tPrevious;
uniform vec2 iResolution;

vec4 getParticle(float id) {
    if (id <= 0.0) return vec4(0.0);
    float idx = id - 1.0;
    float ix = mod(idx, iResolution.x);
    float iy = floor(idx / iResolution.x);
    vec2 uv = (vec2(ix, iy) + 0.5) / iResolution;
    return texture2D(tParticles, uv);
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution;
    vec4 O = vec4(0.0);
    
    vec4 neighbors = texture2D(tVoronoi, uv);
    
    // Draw gaussian blobs for nearby particles
    for (int i = 0; i < 4; i++) {
        vec4 particle = getParticle(neighbors[i]);
        if (particle.x > 0.0 || particle.y > 0.0) {
            vec2 diff = gl_FragCoord.xy - particle.xy;
            float dist2 = dot(diff, diff);
            float intensity = 0.4 * exp(-0.5 * dist2);
            
            vec3 color = getPaletteColor(length(particle.zw), particle.xy / iResolution);
            O += vec4(color * intensity, intensity);
        }
    }
    
    // Motion blur - blend with previous frame
    vec4 prev = texture2D(tPrevious, uv);
    O = mix(O, prev, 0.9);
    
    gl_FragColor = O;
}
`;

        const displayShader = `
uniform sampler2D tRender;
uniform vec2 iResolution;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution;
    gl_FragColor = texture2D(tRender, uv);
}
`;
        return { commonShader, bufferAShader, bufferBShader, bufferCShader, displayShader };
    }
    
    init = () => {
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true }); // Alpha true for safe mixing
        this.renderer.setSize(this.width, this.height);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        this.rtParticlesA = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType
        });
        this.rtParticlesB = this.rtParticlesA.clone();
        
        this.rtVoronoiA = this.rtParticlesA.clone();
        this.rtVoronoiB = this.rtParticlesA.clone();
        
        this.rtRenderA = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        });
        this.rtRenderB = this.rtRenderA.clone();
        this.quad = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            null
        );
        this.scene.add(this.quad);
        
        this.createMaterials();
    }
    
    createMaterials = () => {
        const { bufferAShader, bufferBShader, bufferCShader, displayShader } = this.getShaders();

        this.materialParticles = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: bufferAShader,
            uniforms: {
                tPrevious: { value: null },
                tVoronoi: { value: null },
                iResolution: { value: new THREE.Vector2(this.width, this.height) },
                iFrame: { value: 0 },
                iTime: { value: 0 }
            }
        });
        
        this.materialVoronoi = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: bufferBShader,
            uniforms: {
                tPrevious: { value: null },
                tParticles: { value: null },
                iResolution: { value: new THREE.Vector2(this.width, this.height) },
                iFrame: { value: 0 }
            }
        });
        
        this.materialRender = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: bufferCShader,
            uniforms: {
                tVoronoi: { value: null },
                tParticles: { value: null },
                tPrevious: { value: null },
                iResolution: { value: new THREE.Vector2(this.width, this.height) }
            }
        });
        
        this.materialDisplay = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: displayShader,
            uniforms: {
                tRender: { value: null },
                iResolution: { value: new THREE.Vector2(this.width, this.height) }
            }
        });
    }
    
    setupEventListeners = () => {
        window.addEventListener('resize', this.onResize);
    }
    
    onResize = () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        
        this.rtParticlesA.setSize(this.width, this.height);
        this.rtParticlesB.setSize(this.width, this.height);
        this.rtVoronoiA.setSize(this.width, this.height);
        this.rtVoronoiB.setSize(this.width, this.height);
        this.rtRenderA.setSize(this.width, this.height);
        this.rtRenderB.setSize(this.width, this.height);
        
        const res = new THREE.Vector2(this.width, this.height);
        this.materialParticles.uniforms.iResolution.value = res;
        this.materialVoronoi.uniforms.iResolution.value = res;
        this.materialRender.uniforms.iResolution.value = res;
        this.materialDisplay.uniforms.iResolution.value = res;
        
        this.frame = 0; 
    }
    
    update = (time) => {
        this.materialParticles.uniforms.iFrame.value = this.frame;
        this.materialParticles.uniforms.iTime.value = time;
        
        this.materialVoronoi.uniforms.iFrame.value = this.frame;
        
        this.materialParticles.uniforms.tPrevious.value = this.rtParticlesB.texture;
        this.materialParticles.uniforms.tVoronoi.value = this.rtVoronoiB.texture;
        this.quad.material = this.materialParticles;
        this.renderer.setRenderTarget(this.rtParticlesA);
        this.renderer.render(this.scene, this.camera);
        
        this.materialVoronoi.uniforms.tPrevious.value = this.rtVoronoiB.texture;
        this.materialVoronoi.uniforms.tParticles.value = this.rtParticlesA.texture;
        this.quad.material = this.materialVoronoi;
        this.renderer.setRenderTarget(this.rtVoronoiA);
        this.renderer.render(this.scene, this.camera);
        
        this.materialRender.uniforms.tVoronoi.value = this.rtVoronoiA.texture;
        this.materialRender.uniforms.tParticles.value = this.rtParticlesA.texture;
        this.materialRender.uniforms.tPrevious.value = this.rtRenderB.texture;
        this.quad.material = this.materialRender;
        this.renderer.setRenderTarget(this.rtRenderA);
        this.renderer.render(this.scene, this.camera);
        
        this.materialDisplay.uniforms.tRender.value = this.rtRenderA.texture;
        this.quad.material = this.materialDisplay;
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
        
        [this.rtParticlesA, this.rtParticlesB] = [this.rtParticlesB, this.rtParticlesA];
        [this.rtVoronoiA, this.rtVoronoiB] = [this.rtVoronoiB, this.rtVoronoiA];
        [this.rtRenderA, this.rtRenderB] = [this.rtRenderB, this.rtRenderA];
        
        this.frame++;
    }
    
    animate = () => {
        this.animationId = requestAnimationFrame(this.animate);
        this.update(performance.now() / 1000);
    }
    
    start = () => {
        this.animate();
    }

    stop = () => {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        window.removeEventListener('resize', this.onResize);
        
        if (this.renderer) {
            this.renderer.dispose();
            
            this.rtParticlesA.dispose();
            this.rtParticlesB.dispose();
            this.rtVoronoiA.dispose();
            this.rtVoronoiB.dispose();
            this.rtRenderA.dispose();
            this.rtRenderB.dispose();

            this.scene.clear();
        }

        this.frame = 0;
    }
}
