import { createScene, particles, network } from './scene-base.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* Fintech: spinning gold ₹ coin, orbiting coins, ledger network, live candlesticks, rising money particles */
function coinFace(THREE) {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(200, 180, 30, 256, 256, 280);
  grd.addColorStop(0, '#fff6d0'); grd.addColorStop(0.45, '#f6c453'); grd.addColorStop(1, '#9a5d12');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
  g.lineWidth = 12; g.strokeStyle = 'rgba(110,62,8,.55)';
  g.beginPath(); g.arc(256, 256, 212, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    g.beginPath(); g.arc(256 + Math.cos(a) * 236, 256 + Math.sin(a) * 236, 5, 0, 7); g.fillStyle = 'rgba(110,62,8,.5)'; g.fill();
  }
  g.font = 'bold 270px Georgia, "Times New Roman", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(255,248,215,.55)'; g.fillText('₹', 250, 262);
  g.fillStyle = 'rgba(105,55,5,.88)'; g.fillText('₹', 258, 272);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

createScene(ctx => {
  const { THREE, scene, renderer, camera, state } = ctx;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.PointLight(0xffd27a, 300, 120); key.position.set(10, 12, 20); scene.add(key);
  const rim = new THREE.PointLight(0x10e0a0, 260, 120); rim.position.set(-16, -8, 10); scene.add(rim);

  const hero = new THREE.Group(); scene.add(hero);

  const face = coinFace(THREE);
  const gold = new THREE.MeshStandardMaterial({ color: 0xf2b640, metalness: 1, roughness: 0.28 });
  const faceMat = new THREE.MeshStandardMaterial({ map: face, metalness: 0.75, roughness: 0.3 });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.8, 96, 1), [gold, faceMat, faceMat]);
  coin.rotation.x = Math.PI / 2;
  const coinPivot = new THREE.Group(); coinPivot.add(coin); hero.add(coinPivot);

  const rings = [0x10e0a0, 0xf6c453, 0x38bdf8].map((col, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(8 + i * 1.8, 0.06, 16, 200),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending }));
    m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0); hero.add(m); return m;
  });

  const miniGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.16, 40);
  const minis = Array.from({ length: 9 }, (_, i) => {
    const m = new THREE.Mesh(miniGeo, [gold, faceMat, faceMat]);
    m.userData = { a: (i / 9) * Math.PI * 2, r: 11 + (i % 3) * 1.4, s: 0.25 + Math.random() * 0.2, tilt: Math.random() * 0.6 };
    hero.add(m); return m;
  });

  const ledger = network(THREE, { count: state.isMobile ? 70 : 130, radius: 20, maxDist: 6, color: 0x10e0a0, opacity: 0.16, shell: true });
  hero.add(ledger);

  // Live candlestick "market" strip
  const candles = new THREE.Group();
  const up = new THREE.MeshStandardMaterial({ color: 0x10e0a0, emissive: 0x10e0a0, emissiveIntensity: 0.6, transparent: true, opacity: 0.55 });
  const down = new THREE.MeshStandardMaterial({ color: 0xff5a7a, emissive: 0xff5a7a, emissiveIntensity: 0.6, transparent: true, opacity: 0.55 });
  const cGeo = new THREE.BoxGeometry(0.7, 1, 0.7);
  for (let i = 0; i < 28; i++) {
    const m = new THREE.Mesh(cGeo, i % 3 === 0 ? down : up);
    m.position.x = (i - 14) * 1.3; m.userData = { p: Math.random() * 10, h: 1 + Math.random() * 5 };
    candles.add(m);
  }
  candles.position.set(-6, -16, -18); candles.rotation.x = -0.15; scene.add(candles);

  const dust = particles(THREE, { count: state.isMobile ? 500 : 1400, spread: 130, colors: [0xf6c453, 0x10e0a0, 0xffffff], size: 0.32, opacity: 0.75 });
  scene.add(dust);
  const dpos = dust.geometry.attributes.position;

  const layout = () => {
    if (state.isMobile) { hero.userData.baseX = 7; hero.userData.baseY = 14; hero.scale.setScalar(0.5); }
    else { hero.userData.baseX = 13; hero.userData.baseY = 0; hero.scale.setScalar(1); }
  };
  ctx.onResize = layout; layout();

  return (t, dt) => {
    const s = state.scroll, m = state.mouse;
    coin.rotation.z = t * 0.9;
    coinPivot.rotation.x = Math.sin(t * 0.6) * 0.25 + m.y * 0.4;
    coinPivot.rotation.y = m.x * 0.5;
    rings.forEach((r, i) => { r.rotation.x += dt * (0.2 + i * 0.1); r.rotation.y += dt * (0.15 - i * 0.07); });
    minis.forEach(c => {
      const u = c.userData; u.a += dt * u.s;
      c.position.set(Math.cos(u.a) * u.r, Math.sin(u.a * 2) * 2 + Math.sin(u.a) * u.tilt * 6, Math.sin(u.a) * u.r);
      c.rotation.x += dt * 2; c.rotation.y += dt * 1.3;
    });
    ledger.rotation.y = t * 0.05; ledger.rotation.x = t * 0.02;
    candles.children.forEach(c => { const h = c.userData.h * (0.6 + 0.4 * Math.sin(t * 1.5 + c.userData.p)); c.scale.y = h; c.position.y = h / 2; });
    candles.position.x = -6 + Math.sin(t * 0.2) * 2;

    for (let i = 1; i < dpos.array.length; i += 3) { dpos.array[i] += dt * 1.6; if (dpos.array[i] > 65) dpos.array[i] = -65; }
    dpos.needsUpdate = true;
    dust.rotation.y = t * 0.02 + m.x * 0.1;

    hero.position.x = hero.userData.baseX * Math.cos(s * Math.PI * 3);
    hero.position.y = hero.userData.baseY + Math.sin(t * 0.8) * 0.6;
    hero.rotation.y = s * Math.PI * 2;
    camera.position.x += (m.x * 3 - camera.position.x) * 0.05;
    camera.position.y += (m.y * 2 - s * 6 - camera.position.y) * 0.05;
    camera.lookAt(0, -s * 6, 0);
  };
});
