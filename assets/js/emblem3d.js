/* متجر أبو طارق — 3D Gold Emblem (Three.js)
   - Real PBR gold shield + crown + gems + orbit rings
   - Follows pointer / device tilt (gyroscope on phones)
   - Tap: spin burst + gem shards explode + haptic
   - Idle: gentle float, ring rotation, sparkle
*/
import * as THREE from '../vendor/three.module.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';

const host = document.getElementById('emblem3d');
if (host && !matchMedia('(prefers-reduced-motion: reduce)').matches) init(host);

function init(host) {
  const isMobile = matchMedia('(max-width: 899px)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.15, 7.6);

  // Environment for realistic gold reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // Lights
  scene.add(new THREE.AmbientLight(0xffe2a8, 0.6));
  const fill = new THREE.DirectionalLight(0xffffff, 1.2); fill.position.set(0, 1, 6); scene.add(fill);
  const key = new THREE.DirectionalLight(0xfff1cc, 3.2); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xd6a640, 1.6); rim.position.set(-4, -2, -3); scene.add(rim);
  const spot = new THREE.PointLight(0xf5d78a, 3, 12); spot.position.set(0, 2, 3); scene.add(spot);

  // Materials
  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xf0c45c, metalness: 0.95, roughness: 0.22, clearcoat: 0.7, clearcoatRoughness: 0.12,
    reflectivity: 1, envMapIntensity: 2.2, emissive: 0x4a3208, emissiveIntensity: 0.25,
  });
  const goldDark = gold.clone(); goldDark.color.set(0x8f6a1c); goldDark.roughness = 0.3;
  const onyx = new THREE.MeshPhysicalMaterial({ color: 0x141a2b, metalness: 0.5, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 });
  const gem = new THREE.MeshPhysicalMaterial({
    color: 0xe0192f, metalness: 0, roughness: 0.02, transmission: 0.85, thickness: 1.2, ior: 2.2,
    emissive: 0x6a0010, emissiveIntensity: 0.6, envMapIntensity: 2,
  });
  const gemGold = gem.clone(); gemGold.color.set(0xffd15c); gemGold.emissive.set(0x7a5200);

  const root = new THREE.Group(); scene.add(root);
  const emblem = new THREE.Group(); root.add(emblem);

  // ---- Shield (extruded shape) ----
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 1.55);
  shieldShape.bezierCurveTo(0.9, 1.55, 1.35, 1.35, 1.35, 1.0);
  shieldShape.bezierCurveTo(1.35, -0.2, 0.9, -1.1, 0, -1.65);
  shieldShape.bezierCurveTo(-0.9, -1.1, -1.35, -0.2, -1.35, 1.0);
  shieldShape.bezierCurveTo(-1.35, 1.35, -0.9, 1.55, 0, 1.55);
  const extrude = { depth: 0.22, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 6, curveSegments: 48 };
  const shield = new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape, extrude), gold);
  shield.position.z = -0.11; emblem.add(shield);

  // Inner onyx plate
  const innerShape = new THREE.Shape();
  innerShape.moveTo(0, 1.28);
  innerShape.bezierCurveTo(0.72, 1.28, 1.08, 1.12, 1.08, 0.85);
  innerShape.bezierCurveTo(1.08, -0.15, 0.72, -0.85, 0, -1.32);
  innerShape.bezierCurveTo(-0.72, -0.85, -1.08, -0.15, -1.08, 0.85);
  innerShape.bezierCurveTo(-1.08, 1.12, -0.72, 1.28, 0, 1.28);
  const inner = new THREE.Mesh(new THREE.ExtrudeGeometry(innerShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 48 }), onyx);
  inner.position.z = 0.12; emblem.add(inner);

  // Gold rim line inside
  const rimShape = new THREE.Shape();
  rimShape.moveTo(0, 1.18);
  rimShape.bezierCurveTo(0.64, 1.18, 0.97, 1.03, 0.97, 0.8);
  rimShape.bezierCurveTo(0.97, -0.12, 0.64, -0.76, 0, -1.2);
  rimShape.bezierCurveTo(-0.64, -0.76, -0.97, -0.12, -0.97, 0.8);
  rimShape.bezierCurveTo(-0.97, 1.03, -0.64, 1.18, 0, 1.18);
  const rimHole = new THREE.Path();
  rimHole.moveTo(0, 1.1);
  rimHole.bezierCurveTo(0.58, 1.1, 0.89, 0.97, 0.89, 0.76);
  rimHole.bezierCurveTo(0.89, -0.1, 0.58, -0.7, 0, -1.1);
  rimHole.bezierCurveTo(-0.58, -0.7, -0.89, -0.1, -0.89, 0.76);
  rimHole.bezierCurveTo(-0.89, 0.97, -0.58, 1.1, 0, 1.1);
  rimShape.holes.push(rimHole);
  const rimMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(rimShape, { depth: 0.05, bevelEnabled: false, curveSegments: 48 }), gold);
  rimMesh.position.z = 0.18; emblem.add(rimMesh);

  // ---- Crossed swords (blades + guards) ----
  const makeSword = (angle) => {
    const g = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.9, 0.07), gold);
    blade.geometry.translate(0, 0.35, 0);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.3, 4), gold); tip.position.y = 1.42; tip.rotation.y = Math.PI / 4;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.09, 0.11), goldDark); guard.position.y = -0.62;
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 12), onyx); grip.position.y = -0.86;
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), gold); pommel.position.y = -1.1;
    g.add(blade, tip, guard, grip, pommel);
    g.rotation.z = angle; g.position.z = 0.26;
    return g;
  };
  emblem.add(makeSword(Math.PI / 5), makeSword(-Math.PI / 5));

  // ---- Center gem ----
  const centerGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), gem);
  centerGem.position.set(0, -0.05, 0.42); centerGem.rotation.x = Math.PI / 6; emblem.add(centerGem);
  const gemSetting = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 12, 32), gold);
  gemSetting.position.copy(centerGem.position); gemSetting.position.z -= 0.08; emblem.add(gemSetting);

  // ---- Crown ----
  const crown = new THREE.Group();
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.2, 40, 1, true), gold);
  band.material = gold.clone(); band.material.side = THREE.DoubleSide; crown.add(band);
  const bandTop = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 12, 48), gold); bandTop.rotation.x = Math.PI / 2; bandTop.position.y = 0.1; crown.add(bandTop);
  const bandBot = bandTop.clone(); bandBot.position.y = -0.1; bandBot.scale.setScalar(1.06); crown.add(bandBot);
  const gems = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const h = i % 2 === 0 ? 0.5 : 0.32;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.11, h, 4), gold);
    spike.position.set(Math.sin(a) * 0.6, 0.1 + h / 2, Math.cos(a) * 0.6); spike.rotation.y = -a + Math.PI / 4; crown.add(spike);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), i % 2 === 0 ? gem : gemGold);
    ball.position.set(Math.sin(a) * 0.6, 0.12 + h, Math.cos(a) * 0.6); crown.add(ball); gems.push(ball);
    const bandGem = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), i % 2 ? gem : gemGold);
    bandGem.position.set(Math.sin(a) * 0.65, 0, Math.cos(a) * 0.65); crown.add(bandGem); gems.push(bandGem);
  }
  crown.position.set(0, 1.95, 0); crown.scale.setScalar(0.85); emblem.add(crown);

  // ---- Orbit rings ----
  const ringMat = new THREE.MeshPhysicalMaterial({ color: 0xf5d78a, metalness: 1, roughness: 0.25, transparent: true, opacity: 0.85, envMapIntensity: 1.4 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.022, 10, 160), ringMat); ring1.rotation.x = Math.PI / 2.4; root.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.85, 0.014, 10, 160), ringMat.clone()); ring2.material.opacity = 0.5; ring2.rotation.x = Math.PI / 1.8; ring2.rotation.y = 0.6; root.add(ring2);
  // ring beads
  const beads = new THREE.Group();
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), i % 2 ? gem : gemGold); const a = (i / 6) * Math.PI * 2; b.position.set(Math.cos(a) * 2.55, 0, Math.sin(a) * 2.55); beads.add(b); }
  beads.rotation.x = Math.PI / 2.4; root.add(beads);

  // ---- Sparkle particles ----
  const N = isMobile ? 90 : 160;
  const pPos = new Float32Array(N * 3), pSeed = new Float32Array(N);
  for (let i = 0; i < N; i++) { const r = 2.2 + Math.random() * 1.8, t = Math.random() * Math.PI * 2, p = (Math.random() - .5) * Math.PI; pPos.set([Math.cos(t) * Math.cos(p) * r, Math.sin(p) * r * .7, Math.sin(t) * Math.cos(p) * r], i * 3); pSeed[i] = Math.random() * 10; }
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const sparkTex = makeSparkTexture();
  const pMat = new THREE.PointsMaterial({ size: 0.16, map: sparkTex, color: 0xf5d78a, transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const sparks = new THREE.Points(pGeo, pMat); root.add(sparks);

  // ---- Explosion shards (hidden until tap) ----
  const SH = 70;
  const shards = new THREE.Group(); root.add(shards);
  const shardData = [];
  for (let i = 0; i < SH; i++) {
    const m = new THREE.Mesh(new THREE.TetrahedronGeometry(0.07 + Math.random() * 0.07, 0), i % 3 === 0 ? gem : (i % 3 === 1 ? gemGold : gold));
    m.visible = false; shards.add(m); m.renderOrder = 10; shardData.push({ m, v: new THREE.Vector3(), r: new THREE.Vector3(), life: 0 });
  }

  // ---- Interaction state ----
  let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;
  let spinVel = 0, burstT = 0, hoverGlow = 0, pressed = false;
  const clamp = THREE.MathUtils.clamp;
  const onMove = (x, y) => { targetRY = clamp((x / innerWidth - .5) * 0.9, -0.55, 0.55); targetRX = clamp((y / innerHeight - .5) * 0.6, -0.35, 0.35); };
  addEventListener('pointermove', e => onMove(e.clientX, e.clientY), { passive: true });

  // gyroscope
  const onOrient = e => { if (e.gamma == null) return; targetRY = THREE.MathUtils.clamp(e.gamma / 45, -1, 1) * 0.7; targetRX = THREE.MathUtils.clamp((e.beta - 45) / 45, -1, 1) * 0.45; };
  const enableGyro = () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(s => s === 'granted' && addEventListener('deviceorientation', onOrient)).catch(() => {});
    } else addEventListener('deviceorientation', onOrient);
  };
  if (isMobile) { addEventListener('touchstart', enableGyro, { once: true, passive: true }); }

  // tap burst
  const burst = () => {
    spinVel = 0.55; burstT = 1; hoverGlow = 1;
    navigator.vibrate?.([12, 30, 18]);
    shardData.forEach(s => {
      s.m.visible = true; s.m.position.set(0, -0.05, 0.9); s.life = 1;
      s.v.set((Math.random() - .5), (Math.random() - .3), Math.random() * .6 + .5).normalize().multiplyScalar(0.09 + Math.random() * 0.13);
      s.r.set(Math.random() * .3, Math.random() * .3, Math.random() * .3);
    });
    host.dispatchEvent(new CustomEvent('emblem:burst', { bubbles: true }));
  };
  host.addEventListener('pointerdown', () => { pressed = true; });
  host.addEventListener('pointerup', () => { if (pressed) burst(); pressed = false; });
  host.addEventListener('pointerleave', () => pressed = false);
  host.addEventListener('pointerenter', () => hoverGlow = Math.max(hoverGlow, .5));
  host.style.cursor = 'pointer';

  // ---- Resize ----
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    const s = Math.min(1, w / 420); root.scale.setScalar(0.62 * s + 0.26);
  };
  new ResizeObserver(resize).observe(host); resize();

  // ---- Visibility pause ----
  let visible = true, inView = true;
  document.addEventListener('visibilitychange', () => visible = !document.hidden);
  new IntersectionObserver(([e]) => inView = e.isIntersecting, { threshold: 0 }).observe(host);

  // ---- Animate ----
  const clock = new THREE.Clock();
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible || !inView) return;
    const t = clock.getElapsedTime(), dt = Math.min(clock.getDelta() || 0.016, 0.05);

    curRX += (targetRX - curRX) * 0.06; curRY += (targetRY - curRY) * 0.06;
    spinVel *= 0.955;
    // spin accumulates then eases back toward a full turn so the front always settles facing the viewer
    emblem.userData.spin = (emblem.userData.spin || 0) + spinVel;
    if (spinVel < 0.002) { const full = Math.round(emblem.userData.spin / (Math.PI * 2)) * Math.PI * 2; emblem.userData.spin += (full - emblem.userData.spin) * 0.05; }
    emblem.rotation.y = curRY + Math.sin(t * 0.6) * 0.1 + emblem.userData.spin;
    emblem.rotation.x = curRX + Math.sin(t * 0.8) * 0.05;
    emblem.position.y = Math.sin(t * 1.1) * 0.08;

    ring1.rotation.z = t * 0.25; ring2.rotation.z = -t * 0.18; ring2.rotation.x = Math.PI / 1.8 + Math.sin(t * 0.3) * 0.15;
    beads.rotation.z = t * 0.25;
    crown.rotation.y = -t * 0.35;
    centerGem.rotation.y = t * 1.2; centerGem.rotation.x = Math.PI / 6 + Math.sin(t) * 0.2;
    sparks.rotation.y = t * 0.08;
    pMat.opacity = 0.55 + Math.sin(t * 2) * 0.25 + hoverGlow * 0.3;
    pMat.size = 0.14 + hoverGlow * 0.12;

    // gem pulse
    const pulse = 0.5 + Math.sin(t * 3) * 0.3 + burstT * 2.5;
    gem.emissiveIntensity = pulse; gemGold.emissiveIntensity = pulse * 0.8;
    spot.intensity = 3 + hoverGlow * 5 + burstT * 12;
    hoverGlow *= 0.97; burstT *= 0.92;

    // shards
    shardData.forEach(s => {
      if (!s.m.visible) return;
      s.life -= 0.016; if (s.life <= 0) { s.m.visible = false; return; }
      s.v.y -= 0.0025; s.m.position.add(s.v); s.m.rotation.x += s.r.x; s.m.rotation.y += s.r.y;
      s.m.scale.setScalar(s.life);
    });

    renderer.render(scene, camera);
  };
  tick();
  host.classList.add('is-ready');
}

function makeSparkTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.25, 'rgba(255,240,200,.9)'); grd.addColorStop(0.6, 'rgba(214,166,64,.35)'); grd.addColorStop(1, 'rgba(214,166,64,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  // cross flare
  g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,255,255,.7)';
  g.fillRect(30, 4, 4, 56); g.fillRect(4, 30, 56, 4);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}
