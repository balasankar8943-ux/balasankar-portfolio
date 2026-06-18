// ============================================
// THREE.JS 3D PARTICLE BACKGROUND
// Engineering Theme - Circuit/Network Particles
// ============================================

(function () {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  camera.position.z = 50;

  // --- Particle System ---
  const PARTICLE_COUNT = 800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const colorPalette = [
    new THREE.Color(0x00d4ff),
    new THREE.Color(0x7b2ff7),
    new THREE.Color(0x00ff88),
    new THREE.Color(0x00aaff),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 120;
    positions[i3 + 1] = (Math.random() - 0.5) * 120;
    positions[i3 + 2] = (Math.random() - 0.5) * 80;

    velocities.push({
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.01,
    });

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 2 + 0.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom shader for particles
  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (50.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.2, 0.5, d);
      gl_FragColor = vec4(vColor, alpha * 0.7);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // --- Connection Lines ---
  const LINE_MAX_DIST = 15;
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 6);
  const lineColors = new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 6);
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // --- Mouse Interaction ---
  let mouse = { x: 0, y: 0 };
  let targetMouse = { x: 0, y: 0 };

  document.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // --- Animation Loop ---
  function animate() {
    requestAnimationFrame(animate);

    // Smooth mouse follow
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    const pos = geometry.attributes.position.array;

    // Update particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] += velocities[i].x;
      pos[i3 + 1] += velocities[i].y;
      pos[i3 + 2] += velocities[i].z;

      // Wrap around
      if (pos[i3] > 60) pos[i3] = -60;
      if (pos[i3] < -60) pos[i3] = 60;
      if (pos[i3 + 1] > 60) pos[i3 + 1] = -60;
      if (pos[i3 + 1] < -60) pos[i3 + 1] = 60;
      if (pos[i3 + 2] > 40) pos[i3 + 2] = -40;
      if (pos[i3 + 2] < -40) pos[i3 + 2] = 40;
    }

    geometry.attributes.position.needsUpdate = true;

    // Update connection lines
    let lineIndex = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const i3 = i * 3;
        const j3 = j * 3;
        const dx = pos[i3] - pos[j3];
        const dy = pos[i3 + 1] - pos[j3 + 1];
        const dz = pos[i3 + 2] - pos[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < LINE_MAX_DIST) {
          const alpha = 1 - dist / LINE_MAX_DIST;
          const li = lineIndex * 6;
          linePositions[li] = pos[i3];
          linePositions[li + 1] = pos[i3 + 1];
          linePositions[li + 2] = pos[i3 + 2];
          linePositions[li + 3] = pos[j3];
          linePositions[li + 4] = pos[j3 + 1];
          linePositions[li + 5] = pos[j3 + 2];

          const c = colorPalette[i % colorPalette.length];
          lineColors[li] = c.r * alpha;
          lineColors[li + 1] = c.g * alpha;
          lineColors[li + 2] = c.b * alpha;
          lineColors[li + 3] = c.r * alpha;
          lineColors[li + 4] = c.g * alpha;
          lineColors[li + 5] = c.b * alpha;

          lineIndex++;
        }
      }
    }

    // Clear remaining
    for (let i = lineIndex * 6; i < linePositions.length; i++) {
      linePositions[i] = 0;
      lineColors[i] = 0;
    }

    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;

    // Rotate scene subtly with mouse
    particles.rotation.x = mouse.y * 0.15;
    particles.rotation.y = mouse.x * 0.15;
    lines.rotation.x = mouse.y * 0.15;
    lines.rotation.y = mouse.x * 0.15;

    renderer.render(scene, camera);
  }

  animate();

  // --- Resize ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
