import * as THREE from 'three';

/* Shared WebGL bootstrap: renderer, resize, mouse/gyro parallax, scroll, visibility pause. */
export function createScene(build, { fov = 55, z = 34 } = {}) {
  const canvas = document.getElementById('bg3d');
  if (!canvas) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch { return; }

  const isMobile = matchMedia('(max-width: 768px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 500);
  camera.position.z = z;

  const state = { mouse: new THREE.Vector2(), target: new THREE.Vector2(), scroll: 0, isMobile, width: innerWidth, height: innerHeight };
  const ctx = { THREE, scene, camera, renderer, state };
  const update = build(ctx);

  const resize = () => {
    state.width = innerWidth; state.height = innerHeight; state.isMobile = innerWidth < 768;
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    ctx.onResize?.(state);
  };
  resize();
  addEventListener('resize', resize);

  addEventListener('pointermove', e => {
    state.target.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
  }, { passive: true });
  addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    state.target.set(Math.max(-1, Math.min(1, e.gamma / 35)), Math.max(-1, Math.min(1, (e.beta - 45) / 35)));
  }, { passive: true });
  const onScroll = () => { state.scroll = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();
  let raf = 0;
  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    state.mouse.lerp(state.target, 0.05);
    update?.(clock.elapsedTime, dt);
    renderer.render(scene, camera);
    if (!reduce && !document.hidden) raf = requestAnimationFrame(frame);
  };
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) { clock.getDelta(); frame(); }
  });
  frame();
  document.body.classList.add('webgl-ready');
}

/* Soft round sprite for particles */
export function dotTexture(THREE) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.35, 'rgba(255,255,255,.6)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function particles(THREE, { count, spread = 120, colors, size = 0.35, opacity = 0.8 }) {
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  const palette = colors.map(c => new THREE.Color(c));
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.8;
    const c = palette[i % palette.length]; col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size, vertexColors: true, map: dotTexture(THREE), transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
  return new THREE.Points(geo, mat);
}

/* Random nodes connected to near neighbours → "network / mesh" look */
export function network(THREE, { count, radius, maxDist, color, opacity = 0.25, shell = false }) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(shell ? radius * (0.85 + Math.random() * 0.3) : Math.cbrt(Math.random()) * radius);
    pts.push(v);
  }
  const seg = [];
  for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) {
    if (pts[i].distanceTo(pts[j]) < maxDist) seg.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
  }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  const pg = new THREE.BufferGeometry().setFromPoints(pts);
  const nodes = new THREE.Points(pg, new THREE.PointsMaterial({ color, size: 0.6, map: dotTexture(THREE), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  const g = new THREE.Group(); g.add(lines, nodes); g.userData = { pts, seg }; return g;
}
