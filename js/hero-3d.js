// ============================================
// HERO 3D INTRODUCTORY SIMULATION
// Floating torus knot with energy particles
// ============================================

(function () {
  const container = document.getElementById('hero-3d-container');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  camera.position.set(0, 0, 8);

  // --- Torus Knot ---
  const geometry = new THREE.TorusKnotGeometry(1.6, 0.5, 128, 16);
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x00d4ff),
    emissive: new THREE.Color(0x00d4ff),
    emissiveIntensity: 0.3,
    metalness: 0.7,
    roughness: 0.2,
    wireframe: false,
    transparent: true,
    opacity: 0.85,
  });

  const knot = new THREE.Mesh(geometry, material);
  scene.add(knot);

  // --- Wireframe overlay ---
  const wireGeo = new THREE.TorusKnotGeometry(1.62, 0.52, 64, 8);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x7b2ff7,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  });
  const wireKnot = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireKnot);

  // --- Orbiting energy particles ---
  const PARTICLE_COUNT = 60;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PARTICLE_COUNT * 3);
  const pSizes = new Float32Array(PARTICLE_COUNT);
  const pAngles = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = (i / PARTICLE_COUNT) * Math.PI * 2;
    const radius = 2.4 + Math.random() * 1.2;
    pPos[i * 3] = Math.cos(theta) * radius;
    pPos[i * 3 + 1] = Math.sin(theta) * radius * 0.6;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    pSizes[i] = Math.random() * 0.12 + 0.04;
    pAngles[i] = theta;
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

  const pMat = new THREE.PointsMaterial({
    color: 0x00ff88,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // --- Inner glow ring ---
  const ringGeo = new THREE.RingGeometry(1.8, 2.0, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  scene.add(ring);

  // --- Mouse interaction ---
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    targetY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  // --- Animation ---
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.008;

    // Smooth mouse follow
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    // Rotate knot
    knot.rotation.x += 0.005;
    knot.rotation.y += 0.008;
    knot.rotation.z += 0.003;

    wireKnot.rotation.x = knot.rotation.x;
    wireKnot.rotation.y = knot.rotation.y;
    wireKnot.rotation.z = knot.rotation.z;

    // Tilt with mouse
    knot.rotation.x += mouseY * 0.02;
    knot.rotation.y += mouseX * 0.02;
    wireKnot.rotation.x = knot.rotation.x;
    wireKnot.rotation.y = knot.rotation.y;

    // Orbit particles
    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = pAngles[i] + time * (0.3 + Math.sin(i) * 0.1);
      const radius = 2.4 + Math.sin(time * 0.5 + i) * 0.4;
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = Math.sin(theta) * radius * 0.6;
      pos[i * 3 + 2] = Math.sin(time + i * 0.3) * 1.5;
    }
    pGeo.attributes.position.needsUpdate = true;

    // Rotate ring
    ring.rotation.x = Math.sin(time * 0.3) * 0.5;
    ring.rotation.y += 0.01;

    // Pulse opacity
    const pulse = Math.sin(time * 2) * 0.15 + 0.85;
    material.opacity = pulse * 0.85;

    renderer.render(scene, camera);
  }

  animate();

  // --- Resize ---
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
