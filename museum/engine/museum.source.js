import * as THREE from 'three';

// ── Room size (meters) ───────────────────────────────────────
const W = 24, D = 16, H = 4.5, EYE = 1.6;
const ART_Y = 1.75, MAX_H = 1.5, MAX_W = 2.6;
const JUMP_V = 4.8, GRAVITY = 14;

const $ = (id) => document.getElementById(id);
const isFile = location.protocol === 'file:';
const EMBED = window.MUSEUM_EMBEDDED || {};
const TINY = !!window.tiny; // running as a tinyjs desktop app
const fileName = (src) => (src || '').split('/').pop().replace(/\.[^.]+$/, '');

// In the desktop app the backend downloads (and caches) Slate art and stories.
async function resolveImage(art) {
  if (TINY && art.remote) {
    try {
      const r = await tiny.api.call('asset', { kind: 'image', url: art.remote, name: fileName(art.src) });
      return 'data:' + r.type + ';base64,' + r.b64;
    } catch (e) { return null; }
  }
  return isFile && EMBED[art.src] ? EMBED[art.src] : art.src;
}
function openExternal(url) {
  if (TINY) tiny.shell.open(url).catch(() => {});
  else window.open(url, '_blank', 'noopener');
}
// links inside the page (reader, viewer) open in the default browser in the app
if (TINY) document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href^="http"]');
  if (!a) return;
  e.preventDefault(); e.stopPropagation();
  openExternal(a.href);
}, true);
const ARTICLES = window.MUSEUM_ARTICLES || {};

// mode: walk | diving | reading
let mode = 'walk';

// ── Renderer, scene, camera ──────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1418');
scene.fog = new THREE.Fog('#e6c9a8', 260, 1900); // haze over the valley (rooms are too small to notice)

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 3200);
camera.rotation.order = 'YXZ';
camera.position.set(0, EYE, D / 2 - 2.5);
let yaw = 0, pitch = 0, jumpY = 0, vy = 0;
const onGround = () => jumpY <= 0 && vy <= 0;

// ── Lights ───────────────────────────────────────────────────
const hemi = new THREE.HemisphereLight('#fff8f0', '#4a3a30', 1.1);
scene.add(hemi);
scene.add(camera); // so a held phone can ride along with the camera
const fill = new THREE.DirectionalLight('#ffffff', 0.5);
fill.position.set(3, 10, 4);
scene.add(fill);

// ── Room ─────────────────────────────────────────────────────
function woodTexture(rx = W / 4, ry = D / 4) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  for (let i = 0; i < 16; i++) {
    const shade = 120 + Math.floor(Math.random() * 30);
    g.fillStyle = `rgb(${shade + 20},${shade - 10},${shade - 50})`;
    g.fillRect(0, i * 32, 512, 32);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, i * 32, 512, 2);
    g.fillRect((i * 137) % 512, i * 32, 2, 32);
  }
  for (let k = 0; k < 900; k++) {
    g.fillStyle = `rgba(60,30,10,${Math.random() * 0.08})`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 40 + Math.random() * 80, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const solids = []; // things tomatoes can hit
const wallMat = new THREE.MeshStandardMaterial({ color: '#efebe4', roughness: 0.95 });
const trimMat = new THREE.MeshStandardMaterial({ color: '#2c0022', roughness: 0.7 });
const box = (w, h, d, x, y, z, mat = wallMat, solid = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); scene.add(m);
  if (solid) solids.push(m);
  return m;
};
const glow = new THREE.MeshBasicMaterial({ color: '#fffdf5' });
for (const x of [-6, 0, 6]) for (const z of [-3.5, 3.5]) box(3, 0.02, 1, x, H - 0.01, z, glow, false);

const benches = [];
const benchMat = new THREE.MeshStandardMaterial({ color: '#2c0022', roughness: 0.5 });
const legMat = new THREE.MeshStandardMaterial({ color: '#888', metalness: 0.6, roughness: 0.4 });
for (const x of [-4.5, 4.5]) {
  box(2.6, 0.08, 0.7, x, 0.46, 0, benchMat);
  for (const dx of [-1.1, 1.1]) box(0.08, 0.42, 0.6, x + dx, 0.21, 0, legMat);
  benches.push({ x0: x - 1.3, x1: x + 1.3, z0: -0.35, z1: 0.35 });
}

function textTexture(lines, w, h, bg) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  for (const l of lines) {
    g.fillStyle = l.color; g.font = l.font; g.textAlign = l.align || 'left'; g.textBaseline = 'top';
    g.fillText(l.text, l.x, l.y, w - 2 * Math.min(l.x, 40));
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
{
  const t = textTexture([
    { text: window.MUSEUM_TITLE || 'Museum', x: 1024, y: 40, align: 'center',
      font: 'bold 120px Register, Georgia, serif', color: '#6a0432' },
  ], 2048, 220);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.86),
    new THREE.MeshBasicMaterial({ map: t, transparent: true }));
  m.position.set(0, 3.78, -D / 2 + 0.03); scene.add(m); // above the place of honor
}

// ═════════════════════════════════════════════════════════════
//  ROOMS
//  gallery (center) · Long Hall (north) → balcony with a view
//  S-bend corridor (west) → theater · listening room (east) · games lounge (south)
// ═════════════════════════════════════════════════════════════
const DOOR_H = 3.0, DOOR = [-1.3, 1.3], TH = 6; // TH: theater ceiling height
const ROOMS = [
  { id: 'gallery', x0: -W / 2, x1: W / 2, z0: -D / 2, z1: D / 2 },
  { id: 'hallA', x0: -18, x1: -W / 2, z0: -1.3, z1: 1.3 },          // corridor, first leg (west)
  { id: 'hallB', x0: -20.6, x1: -18, z0: -9, z1: 1.3 },             // corridor, second leg (north)
  { id: 'theater', x0: -36, x1: -20.6, z0: -14, z1: 0, h: TH },
  { id: 'listen', x0: W / 2, x1: 22, z0: -6, z1: 6 },
  { id: 'longhall', x0: -4, x1: 4, z0: -26, z1: -D / 2 },
  { id: 'balcony', x0: -7, x1: 7, z0: -33, z1: -26, outdoor: true },
];
const R = Object.fromEntries(ROOMS.map((r) => [r.id, r]));
const DOOR_GAPS = [ // walkable strips through walls
  { x0: -W / 2 - 0.7, x1: -W / 2 + 0.7, z0: -0.85, z1: 0.85 },       // gallery ↔ corridor
  { x0: -18.7, x1: -17.3, z0: -0.85, z1: 0.85 },                     // corridor bend
  { x0: -21.3, x1: -19.9, z0: -7.95, z1: -6.25 },                    // corridor ↔ theater
  { x0: W / 2 - 0.7, x1: W / 2 + 0.7, z0: -0.85, z1: 0.85 },         // gallery ↔ listening room
  { x0: -0.85, x1: 0.85, z0: -D / 2 - 0.7, z1: -D / 2 + 0.7 },       // gallery ↔ Long Hall
  { x0: -1.15, x1: 1.15, z0: -26.7, z1: -25.3, door: true },         // Long Hall ↔ balcony (sliding doors)
];
const obstacles = benches.map((b) => ({ ...b, hop: true }));
const roomAt = (x, z) => ROOMS.find((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) || null;

// Walls sit just outside each room's boundary. A side can be solid ('wall'),
// have a doorway ({ door: [a, b] }), a full-height opening ({ open: [a, b] }), or be absent ('none').
function buildWalls(r, mat, sides) {
  const h = r.h || H;
  const seg = (axis, fixed, a, b, y0, y1) => {
    if (b - a < 0.01 || y1 - y0 < 0.01) return;
    if (axis === 'x') box(0.1, y1 - y0, b - a, fixed, (y0 + y1) / 2, (a + b) / 2, mat);
    else box(b - a, y1 - y0, 0.1, (a + b) / 2, (y0 + y1) / 2, fixed, mat);
  };
  const side = (key, axis, fixed, lo, hi) => {
    const s = sides[key] ?? 'wall';
    if (s === 'none') return;
    if (s === 'wall') return seg(axis, fixed, lo, hi, 0, h);
    const [a, b] = s.door || s.open;
    seg(axis, fixed, lo, a, 0, h); seg(axis, fixed, b, hi, 0, h);
    if (s.door) seg(axis, fixed, a, b, DOOR_H, h);
  };
  side('n', 'z', r.z0 - 0.05, r.x0, r.x1);
  side('s', 'z', r.z1 + 0.05, r.x0, r.x1);
  side('w', 'x', r.x0 - 0.05, r.z0, r.z1);
  side('e', 'x', r.x1 + 0.05, r.z0, r.z1);
}
function floorAndCeiling(r, floorMat, ceilMat) {
  const w = r.x1 - r.x0, d = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
  box(w, 0.1, d, cx, -0.05, cz, floorMat);
  if (ceilMat) box(w, 0.1, d, cx, (r.h || H) + 0.05, cz, ceilMat);
}
function baseboards(r, sides) {
  const run = (axis, fixed, lo, hi, s) => {
    if (s === 'none') return;
    const parts = s && s !== 'wall' ? [[lo, (s.door || s.open)[0]], [(s.door || s.open)[1], hi]] : [[lo, hi]];
    for (const [a, b] of parts) if (b - a > 0.01) {
      if (axis === 'x') box(0.04, 0.18, b - a, fixed, 0.09, (a + b) / 2, trimMat, false);
      else box(b - a, 0.18, 0.04, (a + b) / 2, 0.09, fixed, trimMat, false);
    }
  };
  run('z', r.z0 + 0.02, r.x0, r.x1, sides.n); run('z', r.z1 - 0.02, r.x0, r.x1, sides.s);
  run('x', r.x0 + 0.02, r.z0, r.z1, sides.w); run('x', r.x1 - 0.02, r.z0, r.z1, sides.e);
}
function sign(text, w, h, x, y, z, rotY, color = '#6a0432', bg = null, glowText = false) {
  const t = textTexture([{ text, x: 512, y: 28, align: 'center', font: 'bold 92px Register, Georgia, serif', color }], 1024, 150, bg);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: t, transparent: !bg, toneMapped: !glowText }));
  m.position.set(x, y, z); m.rotation.y = rotY; scene.add(m); return m;
}
const galleryCeil = new THREE.MeshStandardMaterial({ color: '#d9d4cc', emissive: '#6e6862', roughness: 1 });

// ── Gallery ─────────────────────────────────────────────────
{
  const g = R.gallery, sides = { n: { door: DOOR }, w: { door: DOOR }, e: { door: DOOR } };
  floorAndCeiling(g, new THREE.MeshStandardMaterial({ map: woodTexture(W / 4, D / 4), roughness: 0.6 }), galleryCeil);
  buildWalls(g, wallMat, sides); baseboards(g, sides);
  sign('THEATER', 2.6, 0.38, -W / 2 + 0.07, 3.35, 0, Math.PI / 2);
  sign('LISTENING ROOM', 2.6, 0.38, W / 2 - 0.07, 3.35, 0, -Math.PI / 2);
  sign('THE LONG HALL · BALCONY', 3.4, 0.4, 0, 3.3, -D / 2 + 0.07, 0);
}

// ── Long Hall ───────────────────────────────────────────────
{
  const r = R.longhall, sides = { s: 'none', n: 'none' }; // the gallery's north wall (with its doorway) is this hall's south end
  const hallWall = new THREE.MeshStandardMaterial({ color: '#e9e4ec', roughness: 0.95 });
  floorAndCeiling(r, new THREE.MeshStandardMaterial({ map: woodTexture(2, 4.5), roughness: 0.6 }), galleryCeil);
  buildWalls(r, hallWall, sides); baseboards(r, sides);
  const glowL = new THREE.MeshBasicMaterial({ color: '#fffdf5' });
  for (const z of [-11, -16, -21]) box(1.2, 0.02, 2.4, 0, H - 0.01, z, glowL, false);
  box(1.6, 0.08, 0.5, 0, 0.46, -16.5, new THREE.MeshStandardMaterial({ color: '#2c0022', roughness: 0.5 }));
  for (const dx of [-0.65, 0.65]) box(0.08, 0.42, 0.42, dx, 0.21, -16.5, legMat);
  obstacles.push({ x0: -0.8, x1: 0.8, z0: -16.75, z1: -16.25, hop: true });
}

// ── Sliding glass doors between the Long Hall and the balcony ──
const slideDoor = { open: 0, panels: [], wasOpening: false };
{
  const z = -26, gapHalf = 1.6, doorH = 3.0;
  const frameMat = new THREE.MeshStandardMaterial({ color: '#2c0022', roughness: 0.4, metalness: 0.5 });
  const glass = new THREE.MeshStandardMaterial({ color: '#d6ecf5', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide });
  // header and side frames
  box(8, H - doorH, 0.18, 0, (H + doorH) / 2, z, frameMat);
  for (const x of [-4 + 0.06, -gapHalf - 0.04, gapHalf + 0.04, 4 - 0.06]) box(0.1, doorH, 0.16, x, doorH / 2, z, frameMat);
  // fixed glass sidelights
  for (const s of [-1, 1]) {
    const w = 4 - gapHalf - 0.15, pane = new THREE.Mesh(new THREE.PlaneGeometry(w, doorH - 0.1), glass);
    pane.position.set(s * (gapHalf + 0.05 + w / 2), doorH / 2, z + 0.05); scene.add(pane); solids.push(pane);
  }
  // the two sliding panels
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    const w = gapHalf + 0.05;
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.08, doorH - 0.12), glass);
    g.add(pane);
    for (const [bw, bh, bx, by] of [[w, 0.06, 0, (doorH - 0.06) / 2], [w, 0.06, 0, -(doorH - 0.06) / 2], [0.06, doorH, -w / 2 + 0.03, 0], [0.06, doorH, w / 2 - 0.03, 0]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.05), frameMat); b.position.set(bx, by, 0); g.add(b);
    }
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.5, 0.06), new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.9, roughness: 0.2 }));
    handle.position.set(-s * (w / 2 - 0.15), 0, 0.04); g.add(handle);
    g.position.set(s * w / 2, doorH / 2, z - 0.06);
    g.userData = { closedX: s * w / 2, openX: s * (w / 2 + w - 0.1) };
    scene.add(g); solids.push(pane);
    slideDoor.panels.push(g);
  }
  sign('BALCONY', 1.6, 0.24, 0, doorH + 0.25, z + 0.1, 0, '#ffffff');
}
function updateSlidingDoors(dt) {
  const p = camera.position;
  const near = Math.abs(p.x) < 4 && p.z < -21.5 && p.z > -30.5; // someone's near the doors (either side)
  const target = near ? 1 : 0;
  if (near && !slideDoor.wasOpening && slideDoor.open < 0.5) sfx.door?.();
  slideDoor.wasOpening = near;
  slideDoor.open += (target - slideDoor.open) * Math.min(1, dt * 3.2);
  const t = slideDoor.open * slideDoor.open * (3 - 2 * slideDoor.open);
  for (const g of slideDoor.panels) g.position.x = THREE.MathUtils.lerp(g.userData.closedX, g.userData.openX, t);
}

// ── Balcony + the view ──────────────────────────────────────
const outdoor = {};
{
  const r = R.balcony;
  // facade around the Long Hall opening
  const facade = new THREE.MeshStandardMaterial({ color: '#d8cfc4', roughness: 0.9 });
  for (const [a, b] of [[r.x0, -4], [4, r.x1]]) box(b - a, H + 0.8, 0.3, (a + b) / 2, (H + 0.8) / 2, r.z1 - 0.15, facade);
  box(8, 0.8, 0.3, 0, H + 0.4, r.z1 - 0.15, facade);
  const stone = new THREE.MeshStandardMaterial({ color: '#cbbfae', roughness: 0.95 });
  box(r.x1 - r.x0, 0.3, r.z1 - r.z0, 0, -0.15, (r.z0 + r.z1) / 2, stone);
  // railing
  const metal = new THREE.MeshStandardMaterial({ color: '#2c0022', roughness: 0.4, metalness: 0.5 });
  const rail = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(len / 0.9);
    for (let i = 0; i <= n; i++) {
      const t = i / n; box(0.05, 1.0, 0.05, x0 + (x1 - x0) * t, 0.5, z0 + (z1 - z0) * t, metal, false);
    }
    box(Math.abs(x1 - x0) + 0.08, 0.06, Math.abs(z1 - z0) + 0.08, (x0 + x1) / 2, 1.03, (z0 + z1) / 2, metal);
  };
  rail(r.x0 + 0.05, r.z0 + 0.05, r.x1 - 0.05, r.z0 + 0.05);
  rail(r.x0 + 0.05, r.z0 + 0.05, r.x0 + 0.05, r.z1 - 0.3);
  rail(r.x1 - 0.05, r.z0 + 0.05, r.x1 - 0.05, r.z1 - 0.3);
  // a bench to sit and stare
  box(2.4, 0.08, 0.6, 0, 0.46, -29.2, new THREE.MeshStandardMaterial({ color: '#7b5236', roughness: 0.6 }));
  const benchLeg = new THREE.MeshStandardMaterial({ color: '#888', metalness: 0.6, roughness: 0.4 });
  for (const dx of [-1.0, 1.0]) box(0.08, 0.42, 0.52, dx, 0.21, -29.2, benchLeg);
  obstacles.push({ x0: -1.2, x1: 1.2, z0: -29.5, z1: -28.9, hop: true });
  // the museum's stone base, so the building sits on its hilltop
  box(66, 14, 54, -7, -7.15, -7.5, new THREE.MeshStandardMaterial({ color: '#b9ab98', roughness: 1 }), false);

  // sky
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#4f7fc4') }, mid: { value: new THREE.Color('#f6cfa2') }, low: { value: new THREE.Color('#e7a173') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, pow(clamp(h * 1.8, 0.0, 1.0), 0.6)) : mix(mid, low, clamp(-h * 4.0, 0.0, 1.0));
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
      }`,
  });
  // everything outside lives in one group, drawn only when it can be seen
  const world = new THREE.Group(); scene.add(world); outdoor.world = world;
  outdoor.sky = new THREE.Mesh(new THREE.SphereGeometry(2200, 32, 16), skyMat);
  outdoor.sky.renderOrder = -1;
  world.add(outdoor.sky);
  const sunDir = new THREE.Vector3(-0.85, 0.13, -0.5).normalize();
  outdoor.sun = new THREE.Mesh(new THREE.CircleGeometry(60, 32), new THREE.MeshBasicMaterial({ color: '#fff1c9', fog: false, toneMapped: false }));
  outdoor.sunDir = sunDir;
  world.add(outdoor.sun);
  const sunLight = new THREE.DirectionalLight('#ffd7a8', 1.4);
  sunLight.position.copy(sunDir).multiplyScalar(500); scene.add(sunLight); scene.add(sunLight.target);
  sunLight.target.position.set(0, -40, -250);

  // terrain: the museum sits on a hilltop above a valley; mountains beyond
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const noise = (x, z) => Math.sin(x * 0.021 + Math.sin(z * 0.013) * 2) * 0.5 + Math.sin(z * 0.017 + x * 0.006) * 0.5
    + 0.35 * Math.sin(x * 0.05 + z * 0.043) + 0.2 * Math.sin(x * 0.11 - z * 0.09);
  const terrainH = (x, z) => {
    const zz = -z;
    const t = clamp01((zz - 36) / 90);
    let h = -3 - 58 * t * t * (3 - 2 * t);
    h += 190 * Math.pow(clamp01((zz - 170) / 300), 1.35);
    h += 120 * Math.pow(clamp01((Math.abs(x) - 110) / 320), 1.5) * clamp01((zz + 60) / 120);
    h += noise(x, z) * (3 + 16 * t);
    return zz < 40 ? Math.min(h, -3.2) : h;
  };
  outdoor.terrainH = terrainH;
  const geo = new THREE.PlaneGeometry(2800, 2800, 220, 220);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -900);
  const pos = geo.attributes.position, cols = [];
  const cLow = new THREE.Color('#6f8f3d'), cMid = new THREE.Color('#c9a35c'), cHigh = new THREE.Color('#8a6b4c'), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = terrainH(x, z);
    pos.setY(i, h);
    const k = clamp01((h + 50) / 90);
    if (k < 0.5) c.copy(cLow).lerp(cMid, k * 2); else c.copy(cMid).lerp(cHigh, (k - 0.5) * 2);
    c.offsetHSL(0, 0, (noise(x * 3.1, z * 2.7)) * 0.03);
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  world.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
  // a lake in the valley
  const lake = new THREE.Mesh(new THREE.CircleGeometry(95, 48), new THREE.MeshStandardMaterial({ color: '#5f8fb8', roughness: 0.15, metalness: 0.3 }));
  lake.rotation.x = -Math.PI / 2; lake.position.set(-30, -55.5, -150); world.add(lake);
  // trees
  const treeGeo = new THREE.ConeGeometry(2.4, 8, 6);
  const trees = new THREE.InstancedMesh(treeGeo, new THREE.MeshLambertMaterial({ color: '#3e5a2a', flatShading: true }), 600);
  const m4 = new THREE.Matrix4(); let n = 0, seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  while (n < 600) {
    const x = (rnd() - 0.5) * 700, z = -60 - rnd() * 420, h = terrainH(x, z);
    if (Math.hypot(x + 30, z + 150) < 100) continue; // not in the lake
    const s = 0.7 + rnd() * 0.8;
    m4.makeScale(s, s, s).setPosition(x, h + 4 * s - 0.5, z);
    trees.setMatrixAt(n++, m4);
  }
  world.add(trees);
  // the SLATE sign on the far hillside, Hollywood style
  const letterMat = (ch) => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 320;
    const g = cv.getContext('2d'); g.fillStyle = '#ffffff';
    g.font = 'bold 300px "Helvetica Neue", Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(ch, 128, 172);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, color: '#fffaf0', toneMapped: false });
  };
  const legMat = new THREE.MeshLambertMaterial({ color: '#7d7466' });
  [...'SLATE'].forEach((ch, i) => {
    const x = -64 + i * 32 + (i % 2) * 2, z = -262 + (i % 3) * 4;
    const base = terrainH(x, z);
    const l = new THREE.Mesh(new THREE.PlaneGeometry(28, 35), letterMat(ch));
    l.position.set(x, base + 20 + (i % 2) * 1.5, z);
    l.rotation.set(-0.14, (i - 2) * 0.03, (i % 2 ? 0.02 : -0.015));
    world.add(l);
    for (const dx of [-8, 0, 8]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 18, 0.8), legMat);
      leg.position.set(x + dx, base + 8, z - 3.5); world.add(leg);
    }
  });
  outdoor.signPos = new THREE.Vector3(0, terrainH(0, -262) + 20, -262);
}

// ── S-bend corridor to the theater ──────────────────────────
const corridorCarpet = new THREE.MeshStandardMaterial({ color: '#4a0f22', roughness: 1 });
const corridorWall = new THREE.MeshStandardMaterial({ color: '#6b3346', roughness: 0.9 });
const corridorCeil = new THREE.MeshStandardMaterial({ color: '#120a0f', roughness: 1 });
{
  floorAndCeiling(R.hallA, corridorCarpet, corridorCeil);
  buildWalls(R.hallA, corridorWall, { e: 'none', w: 'none' });
  floorAndCeiling(R.hallB, corridorCarpet, corridorCeil);
  buildWalls(R.hallB, corridorWall, { e: { open: DOOR }, w: { door: [-8.4, -5.8] } });
  for (const [x, z] of [[-15, 0], [-19.3, -3.5], [-19.3, -7]]) {
    const l = new THREE.PointLight('#ffc49a', 7, 9, 1.4); l.position.set(x, 3.6, z); scene.add(l);
  }
  // marquee posters along the corridor
  const poster = (text, sub, x, z, rot) => {
    const t = textTexture([
      { text: 'NOW SHOWING', x: 256, y: 40, align: 'center', font: 'bold 34px Helvetica, Arial', color: '#ffd9a8' },
      { text, x: 256, y: 150, align: 'center', font: 'bold 54px Register, Georgia, serif', color: '#ffffff' },
      { text: sub, x: 256, y: 230, align: 'center', font: '28px Helvetica, Arial', color: '#f2d7e2' },
    ], 512, 720, '#2c0022');
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.55), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
    m.position.set(x, 1.8, z); m.rotation.y = rot; scene.add(m);
  };
  const vid = window.THEATER_VIDEO || {};
  poster('Slow Burn', vid.subtitle || 'Season 11', -15, -1.28, 0);
  poster('Slate TV', 'This way →', -18.03, -4.5, -Math.PI / 2);
}

// ── Theater ─────────────────────────────────────────────────
const theater = { screen: null, seat: new THREE.Vector3(-28.5, 1.25, -7), screenW: 9.6, screenH: 5.4, screenX: -35.94, screenY: 3.1, screenZ: -7 };
{
  const r = R.theater;
  const dark = new THREE.MeshStandardMaterial({ color: '#1d1219', roughness: 0.95 });
  floorAndCeiling(r, corridorCarpet, new THREE.MeshStandardMaterial({ color: '#120a0f', roughness: 1 }));
  // the corridor's wall (with the doorway) covers z −9…0 up to the corridor ceiling; close the rest
  buildWalls(r, dark, { e: { open: [-9, 0] } });
  box(0.1, TH - H, 9, r.x1 + 0.05, (H + TH) / 2, -4.5, dark);
  const vid = window.THEATER_VIDEO || {};
  const idle = textTexture([
    { text: 'SLATE TV', x: 512, y: 150, align: 'center', font: 'bold 110px Register, Georgia, serif', color: '#ffffff' },
    { text: vid.title || 'Now showing', x: 512, y: 300, align: 'center', font: '40px Helvetica, Arial', color: '#e9e6ea' },
    { text: 'Loading…', x: 512, y: 380, align: 'center', font: '34px Helvetica, Arial', color: '#c9a3b6' },
  ], 1024, 576, '#2c0022');
  theater.idleMap = idle;
  theater.screen = new THREE.Mesh(new THREE.PlaneGeometry(theater.screenW, theater.screenH),
    new THREE.MeshBasicMaterial({ map: idle, toneMapped: false }));
  theater.screen.position.set(theater.screenX, theater.screenY, theater.screenZ);
  theater.screen.rotation.y = Math.PI / 2;
  scene.add(theater.screen); solids.push(theater.screen);
  box(0.08, theater.screenH + 0.3, theater.screenW + 0.3, theater.screenX - 0.06, theater.screenY, theater.screenZ, new THREE.MeshStandardMaterial({ color: '#050305' }));
  const curtain = new THREE.MeshStandardMaterial({ color: '#8c0f2e', roughness: 0.9 });
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++)
    box(0.25, TH - 0.2, 0.32, r.x0 + 0.3 + (i % 2) * 0.12, (TH - 0.2) / 2, theater.screenZ + s * (theater.screenW / 2 + 0.4 + i * 0.3), curtain);
  const seatMat = new THREE.MeshStandardMaterial({ color: '#7a1430', roughness: 0.8 });
  for (const rx of [-31, -28.5, -26]) {
    for (const side of [-1, 1]) {
      for (let k = 0; k < 4; k++) {
        const z = theater.screenZ + side * (1.2 + k * 1.05);
        box(0.6, 0.45, 0.85, rx, 0.25, z, seatMat);
        box(0.18, 0.75, 0.85, rx + 0.33, 0.75, z, seatMat);
      }
      obstacles.push({ x0: rx - 0.35, x1: rx + 0.45, z0: theater.screenZ + (side > 0 ? 0.7 : -4.85), z1: theater.screenZ + (side > 0 ? 4.85 : -0.7) });
    }
  }
  const tlight = new THREE.PointLight('#ffb38a', 5, 18, 1.6); tlight.position.set(-24, 5.4, -7); scene.add(tlight);
  theater.light = tlight;
  sign('NOW SHOWING · SLATE TV', 4, 0.56, r.x1 - 0.12, 4.0, -7.1, -Math.PI / 2, '#ffd9a8', null, true);
}

// ── Listening room ─────────────────────────────────────────
const listen = { stand: new THREE.Vector3(21.1, 1.05, -1.0), equipped: false, headphones: null, onAir: null, discs: {} };
{
  const r = R.listen, sides = { w: 'none' }; // shares the gallery's east wall
  const warm = new THREE.MeshStandardMaterial({ color: '#e7dccb', roughness: 0.95 });
  floorAndCeiling(r, new THREE.MeshStandardMaterial({ map: woodTexture(2.5, 3), roughness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: '#d9d4cc', emissive: '#5a5450', roughness: 1 }));
  buildWalls(r, warm, sides); baseboards(r, sides);
  box(6, 0.01, 6, 17.5, 0.006, 0, new THREE.MeshStandardMaterial({ color: '#6a0432', roughness: 1 }), false);
  const wood = new THREE.MeshStandardMaterial({ color: '#5b3a24', roughness: 0.6 });
  box(1.1, 0.08, 3.2, 21.3, 0.95, 0, wood);
  for (const z of [-1.45, 1.45]) box(1.0, 0.95, 0.08, 21.3, 0.475, z, wood);
  obstacles.push({ x0: 20.7, x1: 22, z0: -1.7, z1: 1.7 });
  const kioskTex = textTexture([
    { text: 'SLATE PODCASTS', x: 512, y: 70, align: 'center', font: 'bold 84px Register, Georgia, serif', color: '#ffffff' },
    { text: '1. Put on the headphones', x: 512, y: 230, align: 'center', font: '44px Helvetica, Arial', color: '#f2d7e2' },
    { text: '2. Press E here to pick a show', x: 512, y: 300, align: 'center', font: '44px Helvetica, Arial', color: '#f2d7e2' },
  ], 1024, 512, '#2c0022');
  const kiosk = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), new THREE.MeshBasicMaterial({ map: kioskTex, toneMapped: false }));
  kiosk.position.set(21.45, 1.75, 0.35); kiosk.rotation.y = -Math.PI / 2; scene.add(kiosk); solids.push(kiosk);
  box(0.06, 0.85, 1.6, 21.5, 1.75, 0.35, new THREE.MeshStandardMaterial({ color: '#111' }));
  box(0.06, 0.45, 0.06, 21.5, 1.15, 0.35, new THREE.MeshStandardMaterial({ color: '#333' }));
  listen.kiosk = kiosk;
  const metal = new THREE.MeshStandardMaterial({ color: '#888', metalness: 0.8, roughness: 0.3 });
  const mic = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.12, 4, 12), new THREE.MeshStandardMaterial({ color: '#222', metalness: 0.5 }));
  mic.position.set(21.0, 1.35, 1.0); scene.add(mic);
  box(0.02, 0.3, 0.02, 21.0, 1.13, 1.0, metal, false);
  box(0.04, 0.5, 0.04, listen.stand.x, 1.24, listen.stand.z, metal, false);
  box(0.25, 0.03, 0.25, listen.stand.x, 1.0, listen.stand.z, metal, false);
  const hp = new THREE.Group();
  const black = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.4 });
  const plum = new THREE.MeshStandardMaterial({ color: '#6a0432', roughness: 0.5 });
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 10, 24, Math.PI), black);
  band.rotation.y = Math.PI / 2; band.position.y = 0.04; hp.add(band);
  for (const s of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 20), plum);
    cup.rotation.x = Math.PI / 2; cup.position.set(0, 0.03, s * 0.15); hp.add(cup);
  }
  const hpGrab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.55), new THREE.MeshBasicMaterial({ visible: false }));
  hp.add(hpGrab);
  hp.position.set(listen.stand.x, 1.5, listen.stand.z);
  scene.add(hp); listen.headphones = hp;
  const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(listen.stand.x, 1.48, listen.stand.z + 0.15), new THREE.Vector3(listen.stand.x - 0.1, 1.1, listen.stand.z + 0.4),
    new THREE.Vector3(listen.stand.x + 0.05, 1.0, listen.stand.z + 0.8)]), 16, 0.008, 6), black);
  scene.add(cord); listen.cord = cord;
  const onAirTex = textTexture([{ text: 'ON AIR', x: 512, y: 20, align: 'center', font: 'bold 110px Helvetica, Arial', color: '#ffffff' }], 1024, 150, '#3a0a10');
  listen.onAir = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.24), new THREE.MeshBasicMaterial({ map: onAirTex, toneMapped: false, color: '#555555' }));
  listen.onAir.position.set(r.x1 - 0.02, 3.2, 0); listen.onAir.rotation.y = -Math.PI / 2; scene.add(listen.onAir);

  // the shows as records: a sleeve with the record sliding out of it
  const PALETTE = ['#6a0432', '#1d3557', '#c8452f', '#2a9d8f', '#e9c46a', '#3b1430', '#88365b', '#264653', '#f4a261', '#2c0022'];
  const sleeveTex = (s, i) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 512;
    const g = cv.getContext('2d'), col = PALETTE[i % PALETTE.length];
    g.fillStyle = col; g.fillRect(0, 0, 512, 512);
    // a simple graphic per sleeve
    g.globalAlpha = 0.18; g.fillStyle = '#ffffff';
    for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(380, 140, 40 + k * 46, 0, Math.PI * 2); g.lineWidth = 10; g.strokeStyle = '#ffffff'; g.stroke(); }
    g.globalAlpha = 1;
    const light = ['#e9c46a', '#f4a261'].includes(col);
    g.fillStyle = light ? '#2c0022' : '#ffffff';
    g.font = 'bold 22px Helvetica, Arial'; g.fillText('SLATE PODCASTS', 36, 60);
    g.font = 'bold 62px Georgia, serif';
    const words = s.name.split(' '); let line = '', y = 330;
    const lines = [];
    for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > 440) { lines.push(line); line = w; } else line = t; }
    lines.push(line);
    y = 470 - lines.length * 66 - 30;
    for (const l of lines) { g.fillText(l, 36, y); y += 66; }
    g.font = '24px Helvetica, Arial'; g.globalAlpha = 0.85; g.fillText(s.hosts || '', 36, 480);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const recordTex = (s, i) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 512;
    const g = cv.getContext('2d');
    g.fillStyle = '#0d0d0d'; g.beginPath(); g.arc(256, 256, 254, 0, Math.PI * 2); g.fill();
    for (let rr = 250; rr > 100; rr -= 3) { g.strokeStyle = rr % 9 === 0 ? '#262626' : '#141414'; g.lineWidth = 1.2; g.beginPath(); g.arc(256, 256, rr, 0, Math.PI * 2); g.stroke(); }
    const sheen = g.createLinearGradient(0, 0, 512, 512); sheen.addColorStop(0.3, 'rgba(255,255,255,0)'); sheen.addColorStop(0.5, 'rgba(255,255,255,.10)'); sheen.addColorStop(0.7, 'rgba(255,255,255,0)');
    g.fillStyle = sheen; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.fill();
    g.fillStyle = PALETTE[(i + 3) % PALETTE.length]; g.beginPath(); g.arc(256, 256, 92, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.font = 'bold 22px Georgia, serif';
    g.fillText(s.name.length > 18 ? s.name.slice(0, 17) + '…' : s.name, 256, 230);
    g.font = '15px Helvetica, Arial'; g.fillText('SIDE A · 33⅓', 256, 296);
    g.fillStyle = '#0d0d0d'; g.beginPath(); g.arc(256, 256, 7, 0, Math.PI * 2); g.fill();
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  (window.PODCASTS || []).slice(0, 8).forEach((s, i) => {
    const side = i % 2 ? 1 : -1, k = Math.floor(i / 2);
    const grp = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.47, 48), new THREE.MeshStandardMaterial({ map: recordTex(s, i), roughness: 0.35, metalness: 0.1 }));
    disc.position.set(0.38, 0.02, -0.012);
    const sleeve = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshStandardMaterial({ map: sleeveTex(s, i), roughness: 0.8 }));
    grp.add(disc, sleeve);
    grp.position.set(13.5 + k * 2.15, 2.0, side * (r.z1 - 0.04));
    grp.rotation.y = side > 0 ? Math.PI : 0;
    scene.add(grp);
    listen.discs[s.id] = disc;
  });
  const lamp = new THREE.PointLight('#ffd9b0', 8, 14, 1.4); lamp.position.set(17, 3.8, 0); scene.add(lamp);
}

// ── The phone: left on the gallery's east bench ──
const lounge = { phone: null, tablePos: new THREE.Vector3(4.9, 0.52, 0.05) };
{
  const miniTex = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 512);
    // a little 5×5 crossword grid
    const cell = 36, ox = 38, oy = 120, blacks = new Set(['0,4', '4,0']);
    for (let rr = 0; rr < 5; rr++) for (let cc = 0; cc < 5; cc++) {
      g.fillStyle = blacks.has(rr + ',' + cc) ? '#111' : '#fff'; g.fillRect(ox + cc * cell, oy + rr * cell, cell, cell);
      g.strokeStyle = '#111'; g.lineWidth = 2; g.strokeRect(ox + cc * cell, oy + rr * cell, cell, cell);
    }
    g.fillStyle = '#2c0022'; g.font = 'bold 34px Georgia'; g.textAlign = 'center'; g.fillText('Crossword', 128, 80);
    g.font = '20px Helvetica'; g.fillStyle = '#6a0432'; g.fillText('Pick me up', 128, 360);
    g.font = '15px Helvetica'; g.fillStyle = '#777'; g.fillText('Slate · on Crosshare', 128, 392);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const phone = new THREE.Group();
  const bodyM = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.4), new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.3, metalness: 0.4 }));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.37), new THREE.MeshBasicMaterial({ map: miniTex, toneMapped: false }));
  scr.rotation.x = -Math.PI / 2; scr.position.y = 0.011;
  const phoneGrab = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.25, 0.65), new THREE.MeshBasicMaterial({ visible: false }));
  phone.add(bodyM, scr, phoneGrab);
  phone.position.copy(lounge.tablePos); phone.rotation.y = 0.3;
  scene.add(phone); lounge.phone = phone; lounge.screen = scr;
}

// ── Wall slots for art, best spots first ─────────────────────
const WALLS = {
  north: (a) => ({ x: a, z: -D / 2 + 0.02, rot: 0 }),
  south: (a) => ({ x: a, z: D / 2 - 0.02, rot: Math.PI }),
  west:  (a) => ({ x: -W / 2 + 0.02, z: a, rot: Math.PI / 2 }),
  east:  (a) => ({ x: W / 2 - 0.02, z: a, rot: -Math.PI / 2 }),
};
// Each piece's spot, in the order of gallery.js. Doorways sit mid-wall in the gallery,
// so art hangs either side; five pieces moved to the Long Hall for variety.
const SPOT = {
  gN: (x) => ({ x, z: -D / 2 + 0.02, rot: 0 }), gS: (x) => ({ x, z: D / 2 - 0.02, rot: Math.PI }),
  gW: (z) => ({ x: -W / 2 + 0.02, z, rot: Math.PI / 2 }), gE: (z) => ({ x: W / 2 - 0.02, z, rot: -Math.PI / 2 }),
  hW: (z) => ({ x: -4 + 0.02, z, rot: Math.PI / 2 }), hE: (z) => ({ x: 4 - 0.02, z, rot: -Math.PI / 2 }),
};
const SLOTS = [
  SPOT.gN(-4.5), SPOT.gN(4.5), SPOT.hW(-11.5), SPOT.gE(-4.5), SPOT.gW(4.5), SPOT.hE(-14),
  SPOT.gE(4.5), SPOT.gW(-4.5), SPOT.hW(-21.5), SPOT.hW(-16.5), SPOT.hE(-19),
  SPOT.gS(-5), SPOT.gS(5), SPOT.gS(0),
  // spare spots for dropped-in images
  SPOT.gN(-9), SPOT.gN(9), SPOT.gS(-9.5), SPOT.gS(9.5),
];

// ── Rippling painting material (the Mario 64 part) ───────────
function rippleMaterial(tex) {
  const u = { uTime: { value: 0 }, uAmp: { value: 0 }, uCenter: { value: new THREE.Vector2() } };
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.vertexShader = 'uniform float uTime;\nuniform float uAmp;\nuniform vec2 uCenter;\nvarying float vWave;\n' +
      s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        float rd = distance(position.xy, uCenter);
        float rw = sin(rd * 16.0 - uTime * 10.0) * exp(-rd * 1.3);
        transformed.z += uAmp * (rw + exp(-rd * 1.3)); // ripples only bulge outward, never into the frame behind
        vWave = clamp(rw * uAmp * 2.2, -0.25, 0.25);`);
    s.fragmentShader = 'varying float vWave;\n' +
      s.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n  diffuseColor.rgb *= 1.0 + vWave;');
  };
  m.userData.u = u;
  return m;
}

// ── Hanging art ──────────────────────────────────────────────
const loader = new THREE.TextureLoader();
const frameMat = new THREE.MeshStandardMaterial({ color: '#1b1b1b', roughness: 0.4, metalness: 0.2 });
const matboard = new THREE.MeshStandardMaterial({ color: '#faf8f3', roughness: 1 });
const hung = []; // per slot: { group, pic, art, w, h, u, center, normal, right, splash }
const clickable = [];

function placeholderTexture(art, msg) {
  return textTexture([
    { text: art.title || 'Untitled', x: 256, y: 120, align: 'center', font: 'bold 38px Georgia', color: '#6a0432' },
    { text: 'Image not downloaded yet', x: 256, y: 180, align: 'center', font: '24px Helvetica', color: '#333' },
    { text: msg, x: 256, y: 222, align: 'center', font: '20px Helvetica', color: '#777' },
  ], 512, 384, '#f2efe9');
}

function hang(art, slotIndex) {
  const slot = SLOTS[slotIndex];
  if (!slot) return;
  const old = hung[slotIndex];
  if (old) {
    scene.remove(old.group);
    clickable.splice(clickable.indexOf(old.pic), 1);
    solids.splice(solids.indexOf(old.pic), 1);
  }

  let src = '';
  const build = (tex, aspect) => {
    let h = MAX_H, w = h * aspect;
    if (w > MAX_W) { w = MAX_W; h = w / aspect; }
    const group = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.34, h + 0.34, 0.06), frameMat);
    frame.position.z = 0.03;
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.22, h + 0.22), matboard);
    mat.position.z = 0.061;
    const material = rippleMaterial(tex);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 64, 48), material);
    pic.position.z = 0.063;
    pic.userData = { art, src: tex.image?.src || src, slot: slotIndex };
    group.add(frame, mat, pic);

    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), new THREE.MeshBasicMaterial({
      map: textTexture([
        { text: art.title || 'Untitled', x: 24, y: 22, font: 'bold 44px Georgia, serif', color: '#222' },
        { text: [art.artist, art.year].filter(Boolean).join(', '), x: 24, y: 82, font: '29px Helvetica, Arial', color: '#555' },
        { text: art.note || '', x: 24, y: 128, font: 'italic 28px Georgia, serif', color: '#666' },
        { text: art.url ? 'Jump in to read the story' : '', x: 24, y: 196, font: 'bold 24px Helvetica, Arial', color: '#6a0432' },
      ], 512, 256, '#ffffff'),
      toneMapped: false,
    }));
    label.position.set(w / 2 + 0.17 + 0.5, -0.3, 0.01);
    group.add(label);

    const spot = new THREE.SpotLight('#fff3dd', 18, 7, 0.42, 0.6, 1.2);
    spot.position.set(0, H - ART_Y - 0.2, 1.6);
    spot.target = pic;
    group.add(spot);

    group.position.set(slot.x, ART_Y, slot.z);
    group.rotation.y = slot.rot;
    scene.add(group);
    group.updateMatrixWorld(true);

    const normal = new THREE.Vector3(Math.sin(slot.rot), 0, Math.cos(slot.rot));
    const right = new THREE.Vector3(Math.cos(slot.rot), 0, -Math.sin(slot.rot));
    const center = new THREE.Vector3(slot.x, ART_Y, slot.z).addScaledVector(normal, 0.063);
    hung[slotIndex] = { group, pic, art, w, h, u: material.userData.u, center, normal, right, splash: 0 };
    clickable.push(pic);
    solids.push(pic);
  };

  const fail = () => build(placeholderTexture(art, TINY
      ? 'Couldn’t download it. Check your connection.'
      : art.remote ? 'Run get-slate-art.sh (see README)'
      : isFile ? 'Open via a local server (see README)' : art.src), 4 / 3);
  resolveImage(art).then((resolved) => {
    src = resolved || '';
    if (!src) return fail();
    loader.load(src,
      (tex) => { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
                 build(tex, tex.image.width / tex.image.height); },
      undefined, fail);
  });
}

(window.GALLERY || []).slice(0, SLOTS.length).forEach((art, i) => hang(art, i));

// ── Drag & drop images to hang them ──────────────────────────
let dropNext = Math.min((window.GALLERY || []).length, SLOTS.length) % SLOTS.length;
addEventListener('dragover', (e) => { e.preventDefault(); $('drop').classList.add('on'); });
addEventListener('dragleave', (e) => { if (!e.relatedTarget) $('drop').classList.remove('on'); });
addEventListener('drop', (e) => {
  e.preventDefault(); $('drop').classList.remove('on');
  for (const file of e.dataTransfer.files) {
    if (!file.type.startsWith('image/')) continue;
    const reader = new FileReader();
    const slot = dropNext; dropNext = (dropNext + 1) % SLOTS.length;
    reader.onload = () => hang({ src: reader.result, title: file.name.replace(/\.[^.]+$/, ''),
                                 artist: 'Dropped in', year: '' }, slot);
    reader.readAsDataURL(file);
  }
  toast('Hung! Walk around to find them.');
});

// ── Looking around ───────────────────────────────────────────
const start = $('start');
let locked = false, dragMode = false, dragging = false, dragDist = 0;

function look(dx, dy) {
  if (mode !== 'walk') return;
  yaw -= dx * 0.0022; pitch -= dy * 0.0022;
  pitch = Math.max(-1.2, Math.min(1.2, pitch));
}
function lockPointer() {
  if (dragMode) return;
  try { const p = renderer.domElement.requestPointerLock(); if (p?.catch) p.catch(() => enableDrag()); }
  catch { enableDrag(); }
  // some webviews ignore the request silently: fall back to drag-to-look
  setTimeout(() => { if (!locked && !dragMode && mode === 'walk' && start.classList.contains('hidden')) enableDrag(); }, 600);
}
start.addEventListener('click', () => { start.classList.add('hidden'); unlockAudio(); lockPointer(); });
// After Esc closes something (a story, the phone, the station, a seat), don't show the pause screen.
// Browsers won't let Esc grab the mouse again, so you keep walking with the keys and one click resumes looking.
const resumeChip = $('resume');
function softResume() {
  if (dragMode || locked) return;
  start.classList.add('hidden');
  resumeChip.classList.add('on');
}
function enableDrag() { dragMode = true; start.classList.add('hidden'); $('hint-look').textContent = 'drag to look'; }
document.addEventListener('pointerlockerror', enableDrag);
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === renderer.domElement;
  if (locked) resumeChip.classList.remove('on');
  $('crosshair').style.display = locked ? 'block' : 'none';
  if (!locked && !dragMode && !viewer.open && mode === 'walk') {
    start.querySelector('h2').textContent = 'Paused'; start.classList.remove('hidden');
  }
});
document.addEventListener('mousemove', (e) => {
  if (locked) look(e.movementX, e.movementY);
  else if (dragging) { look(-e.movementX * 1.4, -e.movementY * 1.4); dragDist += Math.abs(e.movementX) + Math.abs(e.movementY); }
});
renderer.domElement.addEventListener('mousedown', () => {
  if (mode !== 'walk') return;
  if (locked) return clickArt({ x: 0, y: 0 });
  if (!dragMode && resumeChip.classList.contains('on')) { resumeChip.classList.remove('on'); unlockAudio(); lockPointer(); return; }
  if (dragMode) { dragging = true; dragDist = 0; }
});
addEventListener('mouseup', (e) => {
  if (dragging && dragDist < 5) clickArt({ x: (e.clientX / innerWidth) * 2 - 1, y: -(e.clientY / innerHeight) * 2 + 1 });
  dragging = false;
});

let touchPrev = null, touchMoved = 0;
renderer.domElement.addEventListener('touchstart', (e) => {
  dragMode = true; start.classList.add('hidden'); unlockAudio();
  touchPrev = e.touches[0]; touchMoved = 0;
}, { passive: true });
renderer.domElement.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (touchPrev) { look(-(t.clientX - touchPrev.clientX) * 1.6, -(t.clientY - touchPrev.clientY) * 1.6);
                   touchMoved += Math.abs(t.clientX - touchPrev.clientX) + Math.abs(t.clientY - touchPrev.clientY); }
  touchPrev = t;
}, { passive: true });
renderer.domElement.addEventListener('touchend', () => {
  if (touchMoved < 8 && touchPrev) clickArt({ x: (touchPrev.clientX / innerWidth) * 2 - 1, y: -(touchPrev.clientY / innerHeight) * 2 + 1 });
  touchPrev = null;
});

// ── Keys ─────────────────────────────────────────────────────
const keys = {};
addEventListener('keydown', (e) => {
  if (mode === 'reading') {
    if (e.code === 'Escape') closeReader(false);
    return; // let Space / arrows scroll the article
  }
  if (mode === 'seated' || mode === 'ui' || mode === 'phone') {
    if (e.code === 'Escape') escapeRooms();
    return;
  }
  keys[e.code] = true;
  if (e.code === 'Escape' && viewer.open) { closeViewer(false); softResume(); }
  if (mode !== 'walk' || viewer.open) return;
  if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) jump(); }
  if ((e.code === 'KeyE' || e.code === 'Enter') && !e.repeat) {
    const it = lookedAtInteract(4);
    if (it) it.use();
    else { const hit = lookedAt(8); if (hit) startDive(hit, true); else toast('Look at a painting (or something you can use), then press E'); }
  }
  if (e.code === 'KeyH' && !e.repeat && listen.equipped) toggleHeadphones();
  if (e.code === 'KeyT') throwTomato();
  if (e.code === 'KeyC' && !e.repeat) cleanUp();
  if (e.code === 'KeyO' && !e.repeat) openStory();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });

const pad = { f: 0, r: 0 };
document.querySelectorAll('[data-pad]').forEach((b) => {
  const [axis, val] = b.dataset.pad.split(':');
  const on = (e) => { e.preventDefault(); pad[axis] = +val; };
  const off = (e) => { e.preventDefault(); pad[axis] = 0; };
  b.addEventListener('touchstart', on); b.addEventListener('touchend', off);
  b.addEventListener('mousedown', on); b.addEventListener('mouseup', off); b.addEventListener('mouseleave', off);
});
const tap = (id, fn) => $(id).addEventListener('touchstart', (e) => { e.preventDefault(); unlockAudio(); fn(); });
tap('pad-jump', () => jump());
tap('pad-tomato', () => throwTomato());
if (matchMedia('(pointer: coarse)').matches) $('pad').style.display = 'grid';

function blocked(x, z) {
  const m = 0.45;
  const inside = ROOMS.some((r) => x > r.x0 + m && x < r.x1 - m && z > r.z0 + m && z < r.z1 - m)
    || DOOR_GAPS.some((d) => x > d.x0 && x < d.x1 && z > d.z0 && z < d.z1 && (!d.door || slideDoor.open > 0.85));
  if (!inside) return true;
  // benches and the coffee table can be hopped; seats, desks and the couch can't
  return obstacles.some((b) => !(b.hop && jumpY > 0.45) && x > b.x0 - 0.3 && x < b.x1 + 0.3 && z > b.z0 - 0.3 && z < b.z1 + 0.3);
}

function jump() {
  if (mode !== 'walk') return;
  if (!onGround()) {
    // bonus round: one extra jump in mid-air
    if (!mario.on || mario.airJumps >= 1) return;
    mario.airJumps++; vy = JUMP_V * 0.95; sfx.jump2(); return;
  }
  vy = JUMP_V;
  sfx.jump();
}

// ── Looking at art ───────────────────────────────────────────
const ray = new THREE.Raycaster();
const viewer = { open: false, slot: null };
function syncCamera() { camera.rotation.set(pitch, yaw, 0); camera.updateMatrixWorld(); }
function lookedAt(far, ndc = { x: 0, y: 0 }) {
  syncCamera();
  ray.setFromCamera(ndc, camera); ray.far = far;
  const hit = ray.intersectObjects(clickable)[0];
  return hit ? hung[hit.object.userData.slot] : null;
}
function clickArt(ndc) {
  if (mode !== 'walk') return;
  const it = lookedAtInteract(4, ndc);
  if (it) return it.use();
  const p = lookedAt(9, ndc);
  if (!p) return;
  const { art } = p;
  $('v-img').src = p.pic.userData.src;
  $('v-title').textContent = art.title || 'Untitled';
  $('v-meta').textContent = [art.artist, art.year].filter(Boolean).join(', ');
  $('v-note').textContent = art.note || '';
  $('v-link').href = art.url || '#';
  $('v-link').style.display = art.url ? 'inline-block' : 'none';
  $('viewer').classList.add('on'); viewer.open = true; viewer.slot = p;
  if (document.pointerLockElement) document.exitPointerLock();
}
function closeViewer(relock = true) {
  $('viewer').classList.remove('on'); viewer.open = false;
  if (relock && !dragMode) start.click();
}
$('viewer').addEventListener('click', () => closeViewer());
$('v-link').addEventListener('click', (e) => e.stopPropagation());
$('v-dive').addEventListener('click', (e) => {
  e.stopPropagation();
  const p = viewer.slot; closeViewer(false);
  if (p) startDive(p, true);
});

function openStory() {
  const p = viewer.open ? viewer.slot : lookedAt(9);
  if (!p) return toast('Look at a piece, then press O');
  if (!p.art.url) return toast('This piece has no link');
  openExternal(p.art.url);
  toast('Opening on Slate.com…');
}

function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200);
}

// ── Diving into a painting ───────────────────────────────────
const dive = { p: null, t: 0, from: new THREE.Vector3(), to: new THREE.Vector3(),
               yaw0: 0, yaw1: 0, pitch0: 0, pitch1: 0 };
const DIVE_TIME = 1.15;
const flash = $('flash');

function angleLerp(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + d * t;
}

function startDive(p, fromKey) {
  if (mode !== 'walk') return;
  mode = 'diving';
  dive.p = p; dive.t = 0;
  dive.from.copy(camera.position);
  dive.to.copy(p.center).addScaledVector(p.normal, 0.3); // stop just short of the canvas, so you never see behind the wall
  dive.yaw0 = yaw; dive.yaw1 = Math.atan2(p.normal.x, p.normal.z);
  dive.pitch0 = pitch; dive.pitch1 = 0;
  // where you'll hit the canvas, in the painting's own coordinates
  const rel = camera.position.clone().sub(p.center);
  const lat = THREE.MathUtils.clamp(rel.dot(p.right), -p.w / 2, p.w / 2);
  const vert = THREE.MathUtils.clamp(camera.position.y - p.center.y, -p.h / 2, p.h / 2);
  p.u.uCenter.value.set(fromKey ? 0 : lat, fromKey ? 0 : vert);
  p.splash = 0.03;
  sfx.dive();
  $('label').innerHTML = '';
}

const diveFx = $('dive-fx');
function updateDive(dt) {
  const p = dive.p;
  dive.t += dt;
  const t = Math.min(dive.t / DIVE_TIME, 1);
  const turn = 1 - Math.pow(1 - Math.min(t / 0.45, 1), 3);
  yaw = angleLerp(dive.yaw0, dive.yaw1, turn);
  pitch = THREE.MathUtils.lerp(dive.pitch0, dive.pitch1, turn);
  const move = t * t * (3 - 2 * t);
  camera.position.lerpVectors(dive.from, dive.to, move);
  camera.position.y = THREE.MathUtils.lerp(dive.from.y, p.center.y, move);
  // zoom in until the painting fills the screen, then blur and close a white iris around it
  camera.fov = 70 - 40 * move; camera.updateProjectionMatrix();
  p.splash = 0.03 + 0.06 * t;
  const close = THREE.MathUtils.clamp((t - 0.35) / 0.6, 0, 1);
  renderer.domElement.style.filter = close ? `blur(${(close * close * 10).toFixed(1)}px) saturate(${1 + close * 0.6})` : '';
  diveFx.style.setProperty('--r', (100 - close * 100).toFixed(1) + '%');
  diveFx.style.opacity = close ? '1' : '0';
  flash.style.opacity = String(THREE.MathUtils.clamp((t - 0.7) / 0.3, 0, 1));
  if (t >= 1) { renderer.domElement.style.filter = ''; diveFx.style.opacity = '0'; openReader(p); }
}

// ── The reader ───────────────────────────────────────────────
const readerEl = $('reader');
let readingSlot = null;

function decodeB64(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function articleKey(art) {
  return 'articles/' + art.src.split('/').pop().replace(/\.[^.]+$/, '') + '.html';
}
async function getArticleHtml(art) {
  if (!art.src || art.src.startsWith('data:')) return null;
  if (TINY) {
    if (!art.url) return null;
    try { return (await tiny.api.call('asset', { kind: 'article', url: art.url, name: fileName(art.src) })).text || null; }
    catch { return null; }
  }
  const key = articleKey(art);
  if (ARTICLES[key]) return decodeB64(ARTICLES[key]);
  if (!isFile) {
    try { const r = await fetch(key); if (r.ok) return await r.text(); } catch {}
  }
  return null;
}

// Copy only safe inline content: text, links, emphasis.
function inline(node, out) {
  for (const n of node.childNodes) {
    if (n.nodeType === 3) { out.appendChild(document.createTextNode(n.textContent)); continue; }
    if (n.nodeType !== 1) continue;
    const tag = n.tagName;
    if (tag === 'A') {
      const href = n.getAttribute('href') || '';
      if (/^https?:\/\//.test(href)) {
        const a = document.createElement('a'); a.href = href; a.target = '_blank'; a.rel = 'noopener';
        inline(n, a); out.appendChild(a);
      } else inline(n, out);
    } else if (tag === 'EM' || tag === 'I' || tag === 'STRONG' || tag === 'B') {
      const el = document.createElement(tag === 'I' ? 'em' : tag === 'B' ? 'strong' : tag.toLowerCase());
      inline(n, el); out.appendChild(el);
    } else if (tag === 'BR') {
      out.appendChild(document.createElement('br'));
    } else if (!['SCRIPT', 'STYLE', 'BUTTON', 'svg', 'SVG', 'FORM', 'INPUT'].includes(tag)) {
      inline(n, out);
    }
  }
  return out;
}
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

async function renderArticle(p) {
  const { art } = p;
  const root = $('r-article');
  root.innerHTML = '';
  const html = await getArticleHtml(art);
  const doc = html ? new DOMParser().parseFromString(html, 'text/html') : null;
  const q = (s) => doc?.querySelector(s)?.textContent.trim().replace(/\s+/g, ' ') || '';

  const rubric = q('.article__rubric');
  const hed = q('h1') || art.title || 'Untitled';
  const dek = q('.article__dek') || art.note || '';
  const authors = doc ? [...doc.querySelectorAll('.article__byline a')]
    .map((a) => a.textContent.trim()).filter((t) => t && !/follow|sign|email|alert/i.test(t)) : [];

  if (rubric) root.appendChild(el('div', 'r-kicker', rubric));
  root.appendChild(el('h1', null, hed));
  if (dek) root.appendChild(el('p', 'r-dek', dek));
  const meta = el('div', 'r-byline');
  meta.textContent = (authors.length ? 'By ' + [...new Set(authors)].join(' and ') + ' · ' : '') + (art.year || '');
  root.appendChild(meta);

  const fig = el('figure', 'r-hero');
  const img = el('img'); img.src = p.pic.userData.src; img.alt = '';
  fig.appendChild(img);
  if (art.artist) fig.appendChild(el('figcaption', null, 'Illustration by ' + art.artist));
  root.appendChild(fig);

  const body = el('div', 'r-body');
  const content = doc?.querySelector('.article__content');
  let paras = 0;
  if (content) {
    for (const n of content.children) {
      const cls = (n.className || '').toString();
      if (n.tagName === 'P' && /slate-paragraph/.test(cls)) {
        const txt = n.textContent.trim();
        if (!txt) continue;
        if (txt.length < 240 && /^(sign up for|subscribe to|this article is part of)/i.test(txt)) continue; // promos
        body.appendChild(inline(n, el('p'))); paras++;
      } else if (/^H[2-4]$/.test(n.tagName)) {
        body.appendChild(inline(n, el('h2')));
      } else if (n.tagName === 'BLOCKQUOTE') {
        body.appendChild(inline(n, el('blockquote')));
      } else if (n.tagName === 'UL' || n.tagName === 'OL') {
        const list = el(n.tagName.toLowerCase());
        for (const li of n.querySelectorAll(':scope > li')) list.appendChild(inline(li, el('li')));
        body.appendChild(list);
      } else if (n.tagName === 'FIGURE' || /slate-image/.test(cls)) {
        const im = n.querySelector('img');
        const s = im?.getAttribute('src') || im?.getAttribute('data-src') || '';
        if (/^https:\/\/compote\.slate\.com\//.test(s)) {
          const f = el('figure'); const i2 = el('img'); i2.src = s; i2.alt = ''; i2.loading = 'lazy'; f.appendChild(i2);
          const cap = n.querySelector('figcaption')?.textContent.trim();
          if (cap) f.appendChild(el('figcaption', null, cap.replace(/\s+/g, ' ')));
          body.appendChild(f);
        }
      }
    }
  }
  if (!paras) {
    const box = el('div', 'r-missing');
    box.appendChild(el('p', null, html
      ? 'Couldn’t find the article text in the saved page.'
      : TINY ? 'Couldn’t download this story. Check your connection, or open it on Slate.com.'
      : 'This story isn’t downloaded yet. Run get-slate-art.sh to read it here.'));
    body.appendChild(box);
  }
  root.appendChild(body);

  if (art.url) {
    const end = el('div', 'r-end');
    const a = el('a', 'r-btn', 'Read it on Slate.com ↗'); a.href = art.url; a.target = '_blank'; a.rel = 'noopener';
    end.appendChild(a);
    root.appendChild(end);
  }
}

async function openReader(p) {
  mode = 'reading';
  readingSlot = p;
  if (document.pointerLockElement) document.exitPointerLock();
  $('r-open').href = p.art.url || '#';
  $('r-open').style.display = p.art.url ? '' : 'none';
  await renderArticle(p);
  readerEl.scrollTop = 0;
  readerEl.classList.add('on');
  requestAnimationFrame(() => { flash.style.opacity = '0'; });
  readerEl.focus();
}

function closeReader(viaClick) {
  if (mode !== 'reading') return;
  const p = readingSlot;
  readerEl.classList.remove('on');
  // pop back out in front of the painting, facing it, with a little hop
  camera.position.copy(p.center).addScaledVector(p.normal, 2.4);
  camera.position.y = EYE;
  yaw = Math.atan2(p.normal.x, p.normal.z); pitch = 0;
  camera.fov = 70; camera.updateProjectionMatrix();
  jumpY = 0.01; vy = 3.2;
  p.u.uCenter.value.set(0, 0); p.splash = 0.09;
  flash.style.opacity = '1';
  requestAnimationFrame(() => { flash.style.opacity = '0'; });
  sfx.pop();
  mode = 'walk';
  for (const k in keys) keys[k] = false;
  if (viaClick) lockPointer();
  else softResume();
}
$('r-back').addEventListener('click', () => closeReader(true));
readerEl.addEventListener('scroll', () => {
  const max = readerEl.scrollHeight - readerEl.clientHeight;
  $('r-progress').style.width = (max > 0 ? (readerEl.scrollTop / max) * 100 : 0) + '%';
});

// ── Tomatoes ─────────────────────────────────────────────────
const tomatoes = [], bits = [], splats = [];
const tomatoGeo = new THREE.SphereGeometry(0.07, 16, 12);
const tomatoMat = new THREE.MeshStandardMaterial({ color: '#e0261b', roughness: 0.35 });
const stemGeo = new THREE.ConeGeometry(0.035, 0.03, 5);
const stemMat = new THREE.MeshStandardMaterial({ color: '#2f7d32', roughness: 0.8 });
const bitGeo = new THREE.SphereGeometry(0.022, 6, 5);
const bitMat = new THREE.MeshStandardMaterial({ color: '#c81d14', roughness: 0.4 });

function splatTexture(seed) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  g.translate(128, 128);
  g.fillStyle = 'rgba(200,24,16,0.95)';
  g.beginPath(); g.arc(0, 0, 52, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 14; i++) {
    const a = rnd() * Math.PI * 2, r = 40 + rnd() * 60, rr = 8 + rnd() * 22;
    g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r, rr, 0, Math.PI * 2); g.fill();
    g.lineWidth = rr * 0.9; g.strokeStyle = 'rgba(200,24,16,0.95)';
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); g.stroke();
  }
  for (let i = 0; i < 10; i++) {
    const a = rnd() * Math.PI * 2, r = 85 + rnd() * 35;
    g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r, 3 + rnd() * 5, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = 'rgba(140,10,8,0.6)';
  g.beginPath(); g.arc(4, 4, 30, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(250,230,120,0.9)';
  for (let i = 0; i < 12; i++) {
    const a = rnd() * Math.PI * 2, r = rnd() * 40;
    g.beginPath(); g.ellipse(Math.cos(a) * r, Math.sin(a) * r, 4, 2.5, a, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const splatMats = [1, 2, 3, 4].map((sd) => new THREE.MeshStandardMaterial({
  map: splatTexture(sd), transparent: true, depthWrite: false, roughness: 0.3,
  polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
}));
const splatGeo = new THREE.PlaneGeometry(1, 1);

const CRITICS = [
  'Everyone’s a critic.', 'The critics have spoken.', 'A bold curatorial choice.',
  'Bravo! (Tomatoes are free.)', 'Somewhere, an art handler sighs.', 'Mixed reviews.',
];
let lastThrow = 0, thrown = 0;

function throwTomato() {
  if (mode !== 'walk') return;
  const now = performance.now();
  if (now - lastThrow < 160) return;
  lastThrow = now;
  if (mario.on) return throwFireball(); // in the bonus round, tomatoes are fireballs
  syncCamera();
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const rightV = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const m = new THREE.Mesh(tomatoGeo, tomatoMat);
  const stem = new THREE.Mesh(stemGeo, stemMat); stem.position.y = 0.07; stem.rotation.x = Math.PI; m.add(stem);
  m.position.copy(camera.position).addScaledVector(fwd, 0.35).addScaledVector(rightV, 0.18).add(new THREE.Vector3(0, -0.15, 0));
  scene.add(m);
  tomatoes.push({ m, v: fwd.multiplyScalar(13).add(new THREE.Vector3(0, 2.4, 0)),
                  spin: new THREE.Vector3(Math.random() * 8, Math.random() * 8, 0), age: 0 });
  thrown++;
  sfx.throw();
}

const tmpPrev = new THREE.Vector3(), tmpDir = new THREE.Vector3(), tmpN = new THREE.Vector3();
function updateTomatoes(dt) {
  for (let i = tomatoes.length - 1; i >= 0; i--) {
    const t = tomatoes[i];
    t.age += dt;
    tmpPrev.copy(t.m.position);
    t.v.y -= 9.8 * dt;
    t.m.position.addScaledVector(t.v, dt);
    t.m.rotation.x += t.spin.x * dt; t.m.rotation.y += t.spin.y * dt;
    tmpDir.copy(t.m.position).sub(tmpPrev);
    const len = tmpDir.length();
    if (len > 0) {
      ray.set(tmpPrev, tmpDir.normalize()); ray.far = len + 0.07;
      const hit = ray.intersectObjects(solids, false)[0];
      if (hit) { splat(hit); scene.remove(t.m); tomatoes.splice(i, 1); continue; }
    }
    if (t.age > 6) { scene.remove(t.m); tomatoes.splice(i, 1); }
  }
  for (let i = bits.length - 1; i >= 0; i--) {
    const b = bits[i];
    b.age += dt; b.v.y -= 9.8 * dt;
    b.m.position.addScaledVector(b.v, dt);
    if (b.m.position.y < 0.02) { b.m.position.y = 0.02; b.v.multiplyScalar(0.3); }
    b.m.scale.setScalar(Math.max(0.01, 1 - b.age / 0.7));
    if (b.age > 0.7) { scene.remove(b.m); bits.splice(i, 1); }
  }
}

function splat(hit) {
  tmpN.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
  const size = 0.35 + Math.random() * 0.25;
  const s = new THREE.Mesh(splatGeo, splatMats[(Math.random() * splatMats.length) | 0]);
  s.scale.setScalar(size);
  s.position.copy(hit.point).addScaledVector(tmpN, 0.012);
  s.lookAt(hit.point.clone().add(tmpN));
  s.rotateZ(Math.random() * Math.PI * 2);
  scene.add(s); splats.push(s);
  if (splats.length > 200) scene.remove(splats.shift());

  for (let k = 0; k < 12; k++) {
    const b = new THREE.Mesh(bitGeo, bitMat);
    b.position.copy(hit.point).addScaledVector(tmpN, 0.05);
    const v = tmpN.clone().multiplyScalar(1.5 + Math.random() * 2)
      .add(new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3));
    scene.add(b); bits.push({ m: b, v, age: Math.random() * 0.2 });
  }
  sfx.splat();

  const slot = hit.object.userData?.slot;
  if (slot != null && hung[slot]) {
    const p = hung[slot];
    const local = p.pic.worldToLocal(hit.point.clone());
    p.u.uCenter.value.set(local.x, local.y);
    p.splash = Math.max(p.splash, 0.06);
    toast(CRITICS[(Math.random() * CRITICS.length) | 0]);
  }
}

function cleanUp() {
  if (!splats.length) return toast('Spotless already.');
  for (const s of splats) scene.remove(s);
  splats.length = 0;
  toast('The janitor thanks you.');
}

// ── Sound effects (tiny synth, no files) ─────────────────────
let actx = null;
function unlockAudio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} }
  if (actx?.state === 'suspended') actx.resume();
}
function noise(dur, freq, q, gain) {
  if (!actx) return;
  const n = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate);
  const d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
  const src = actx.createBufferSource(); src.buffer = n;
  const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq; f.Q.value = q;
  const g = actx.createGain(); g.gain.value = gain;
  src.connect(f).connect(g).connect(actx.destination); src.start();
}
function tone(f0, f1, dur, type = 'square', gain = 0.06) {
  if (!actx) return;
  const o = actx.createOscillator(); o.type = type;
  const g = actx.createGain(); const t = actx.currentTime;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur);
}
const sfx = {
  jump: () => tone(300, 700, 0.18),
  throw: () => noise(0.12, 2500, 0.5, 0.15),
  splat: () => { noise(0.28, 700, 1.5, 0.9); tone(160, 60, 0.15, 'sine', 0.25); },
  dive: () => { tone(900, 200, 0.9, 'sine', 0.12); noise(0.9, 1200, 3, 0.25); },
  pop: () => tone(200, 600, 0.2, 'sine', 0.15),
  door: () => noise(0.7, 500, 0.7, 0.18),
};

// ── Loop ─────────────────────────────────────────────────────
const clock = new THREE.Clock();
const label = $('label');
let lastRoom = null;

// ═════════════════════════════════════════════════════════════
//  INTERACTIONS: things you press E on
// ═════════════════════════════════════════════════════════════
const interactMeshes = [];
function makeInteract(obj, root) {
  root.traverse((c) => { if (c.isMesh) { c.userData.interact = obj; interactMeshes.push(c); } });
  return obj;
}
function lookedAtInteract(far = 4, ndc = { x: 0, y: 0 }) {
  syncCamera();
  ray.setFromCamera(ndc, camera); ray.far = Math.max(far, 14);
  const hit = ray.intersectObjects([...interactMeshes, ...clickable], false)[0];
  const obj = hit?.object.userData.interact;
  // each thing has its own reach (the theater screen works from the seats)
  return obj && hit.distance <= Math.max(far, obj.reach || 0) ? obj : null;
}
let savedPose = null;
function leaveToWalk(viaClick) {
  mode = 'walk';
  for (const k in keys) keys[k] = false;
  if (viaClick) lockPointer();
  else softResume();
}

// ── Theater: the trailer plays on the big screen, starting as you enter the corridor ──
const tv = { video: null, started: false, failed: false, texture: null, userPaused: false, needsUnmute: false };
const THEATER_VOL = { hallA: 0.12, hallB: 0.35, theater: 1 }; // sound leaks into the corridor
function tvMessage(msg) {
  theater.screen.material.map = textTexture([
    { text: 'SLATE TV', x: 512, y: 170, align: 'center', font: 'bold 110px Register, Georgia, serif', color: '#ffffff' },
    { text: msg, x: 512, y: 330, align: 'center', font: '38px Helvetica, Arial', color: '#e9e6ea' },
  ], 1024, 576, '#2c0022');
  theater.screen.material.needsUpdate = true;
}
async function mediaURL(src) {
  const b64 = window.MUSEUM_MEDIA_B64?.[src];
  if (b64) {
    // a blob URL counts as same-origin, so WebGL can use the frames even from a double-clicked file
    try { return URL.createObjectURL(await (await fetch('data:video/mp4;base64,' + b64)).blob()); }
    catch {
      const bin = atob(b64), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return URL.createObjectURL(new Blob([u8], { type: 'video/mp4' }));
    }
  }
  return isFile ? null : src; // served over http, the plain file works
}
async function startTheaterVideo() {
  if (tv.started) return;
  tv.started = true;
  const conf = window.THEATER_VIDEO;
  if (!conf?.src) return tvMessage('No video set in gallery.js');
  const url = await mediaURL(conf.src);
  if (!url) { tv.failed = true; return tvMessage('Run get-slate-art.sh to load the trailer'); }
  const v = document.createElement('video');
  v.src = url; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.volume = 0;
  v.addEventListener('playing', () => {
    if (tv.texture) return;
    tv.texture = new THREE.VideoTexture(v);
    tv.texture.colorSpace = THREE.SRGBColorSpace;
    theater.screen.material.map = tv.texture; theater.screen.material.needsUpdate = true;
  });
  v.addEventListener('error', () => { tv.failed = true; tvMessage('Couldn’t play the video file'); });
  v.addEventListener('play', updateTvBar); v.addEventListener('pause', updateTvBar);
  tv.video = v;
}
function playTv() {
  const v = tv.video; if (!v || tv.failed) return;
  v.play().catch(() => {
    // no sound allowed yet: play silently, and unmute on the next click
    v.muted = true; tv.needsUnmute = true; v.play().catch(() => {});
  });
}
addEventListener('pointerdown', () => { if (tv.needsUnmute && tv.video) { tv.video.muted = false; tv.needsUnmute = false; } }, true);
const lightsNormal = { hemi: 1.1, fill: 0.5, stage: 5 };
function updateTheater(dt) {
  const room = roomAt(camera.position.x, camera.position.z)?.id;
  const target = mode === 'seated' ? 1 : (THEATER_VOL[room] ?? 0);
  if (target > 0) {
    if (!tv.started) startTheaterVideo();
    if (tv.video && tv.video.paused && !tv.userPaused) playTv();
  } else if (tv.video && !tv.video.paused && tv.video.volume < 0.02) {
    tv.video.pause();
  }
  if (tv.video) tv.video.volume = THREE.MathUtils.clamp(tv.video.volume + (target - tv.video.volume) * Math.min(1, dt * 3), 0, 1);
  // the house lights dim inside the theater
  const dim = room === 'theater' || mode === 'seated';
  hemi.intensity += ((dim ? 0.22 : lightsNormal.hemi) - hemi.intensity) * Math.min(1, dt * 2.5);
  fill.intensity += ((dim ? 0.06 : lightsNormal.fill) - fill.intensity) * Math.min(1, dt * 2.5);
  theater.light.intensity += ((dim ? 0.9 : lightsNormal.stage) - theater.light.intensity) * Math.min(1, dt * 2.5);
}
function updateTvBar() {
  const v = tv.video;
  $('tv-now').textContent = window.THEATER_VIDEO?.title || 'Slate TV';
  $('tv-play').textContent = v && !v.paused ? 'Pause' : 'Play';
}
function sitDown() {
  if (mode !== 'walk') return;
  mode = 'seated';
  if (document.pointerLockElement) document.exitPointerLock();
  camera.position.copy(theater.seat);
  yaw = Math.PI / 2; pitch = Math.atan2(theater.screenY - theater.seat.y, theater.seat.x - theater.screenX);
  $('theater-ui').classList.add('on');
  label.innerHTML = '';
  if (!tv.started) startTheaterVideo();
  tv.userPaused = false; playTv(); updateTvBar();
}
function standUp(viaClick) {
  if (mode !== 'seated') return;
  $('theater-ui').classList.remove('on');
  camera.position.set(-23.5, EYE, -7); yaw = Math.PI / 2; pitch = 0;
  leaveToWalk(viaClick);
}
$('tv-leave').onclick = () => standUp(true);
$('tv-play').onclick = () => {
  const v = tv.video; if (!v) return;
  if (v.paused) { tv.userPaused = false; playTv(); } else { tv.userPaused = true; v.pause(); }
};
$('tv-restart').onclick = () => { if (tv.video) { tv.video.currentTime = 0; tv.userPaused = false; playTv(); } };
makeInteract({ prompt: 'Take a seat (the best one in the house)', use: sitDown, reach: 14 }, theater.screen);

// ── Listening station ─────────────────────────────────────────
const SHOWS = window.PODCASTS || [];
const audio = new Audio(); audio.preload = 'none';
const feedCache = {};
let nowShow = null;
async function loadFeed(show) {
  if (feedCache[show.id]) return feedCache[show.id];
  let xml = window.MUSEUM_FEEDS_B64?.[show.id] ? decodeB64(window.MUSEUM_FEEDS_B64[show.id]) : null;
  if (!xml) {
    try { xml = await (TINY ? tiny.fetch(show.feed) : fetch(show.feed)).then((r) => r.text()); } catch { xml = null; }
  }
  if (!xml) return null;
  const d = new DOMParser().parseFromString(xml, 'text/xml');
  const ch = d.querySelector('channel');
  const img = [...(ch?.children || [])].find((e) => e.localName === 'image' && e.getAttribute('href'))?.getAttribute('href')
    || ch?.querySelector('image > url')?.textContent || '';
  const eps = [...d.querySelectorAll('item')].slice(0, 5).map((it) => ({
    title: it.querySelector('title')?.textContent?.trim() || 'Episode',
    url: it.querySelector('enclosure')?.getAttribute('url') || '',
    date: it.querySelector('pubDate')?.textContent || '',
  })).filter((e) => e.url);
  return (feedCache[show.id] = { img, eps });
}
function equip(on) {
  listen.equipped = on;
  listen.headphones.visible = !on;
  listen.cord.visible = !on;
  document.body.classList.toggle('cans', on);
  $('cans-chip').hidden = !on;
  if (!on) audio.pause();
  else if (audio.src && nowShow) audio.play().catch(() => {});
  updateNowPlaying();
}
function toggleHeadphones() {
  if (listen.equipped) { equip(false); toast('Headphones back on the stand.'); }
  else { equip(true); toast('Headphones on. Now pick a show at the station.'); }
}
async function openStation() {
  if (mode !== 'walk') return;
  mode = 'ui';
  if (document.pointerLockElement) document.exitPointerLock();
  $('station').classList.add('on');
  $('st-warn').hidden = listen.equipped;
  const grid = $('st-shows');
  if (!grid.children.length) {
    for (const s of SHOWS) {
      const card = document.createElement('div'); card.className = 'show';
      card.innerHTML = '<div class="cover"></div><div class="meta"><b></b><span class="hosts"></span><span class="ep">Loading the latest episode…</span></div><button class="play">Play</button>';
      card.querySelector('b').textContent = s.name;
      card.querySelector('.hosts').textContent = s.hosts || '';
      card.querySelector('.play').onclick = () => playShow(s, card);
      grid.appendChild(card);
      loadFeed(s).then((f) => {
        const ep = card.querySelector('.ep');
        if (!f || !f.eps.length) { ep.textContent = TINY ? 'Couldn’t reach the feed.' : 'Feed not downloaded. Run get-slate-art.sh.'; card.querySelector('.play').disabled = true; return; }
        ep.textContent = f.eps[0].title;
        if (f.img) { const im = document.createElement('img'); im.src = f.img; im.alt = ''; card.querySelector('.cover').appendChild(im); }
      });
    }
  }
}
function closeStation(viaClick) {
  if (mode !== 'ui') return;
  $('station').classList.remove('on');
  leaveToWalk(viaClick);
}
async function playShow(s, card) {
  if (!listen.equipped) { $('st-warn').hidden = false; shakeEl($('st-warn')); return; }
  const f = await loadFeed(s);
  if (!f?.eps.length) return;
  nowShow = { show: s, ep: f.eps[0] };
  audio.src = f.eps[0].url;
  audio.play().catch(() => toast('Couldn’t start playback.'));
  updateNowPlaying();
  toast('Playing ' + s.name + '.');
}
function shakeEl(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
const fmtT = (s) => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '–:––';
function updateNowPlaying() {
  const np = $('np');
  const inRoom = roomAt(camera.position.x, camera.position.z)?.id === 'listen';
  np.hidden = !nowShow || !inRoom; // the player only shows in the listening room
  if (!nowShow) return;
  $('np-show').textContent = nowShow.show.name;
  $('np-ep').textContent = nowShow.ep.title;
  $('np-play').textContent = audio.paused ? 'Play' : 'Pause';
  $('np-time').textContent = fmtT(audio.currentTime) + ' / ' + fmtT(audio.duration);
  listen.onAir.material.color.set(!audio.paused ? '#ffffff' : '#555555');
}
audio.addEventListener('timeupdate', updateNowPlaying);
audio.addEventListener('play', updateNowPlaying);
audio.addEventListener('pause', updateNowPlaying);
$('np-play').onclick = () => {
  if (!listen.equipped) return toast('Put the headphones on first. It’s a quiet museum.');
  audio.paused ? audio.play().catch(() => {}) : audio.pause();
};
$('np-back').onclick = () => { audio.currentTime = Math.max(0, audio.currentTime - 15); };
$('np-fwd').onclick = () => { audio.currentTime += 30; };
$('np-stop').onclick = () => { audio.pause(); audio.removeAttribute('src'); audio.load(); nowShow = null; updateNowPlaying(); listen.onAir.material.color.set('#555555'); };
$('st-close').onclick = () => closeStation(true);
$('st-cans').onclick = () => { if (!listen.equipped) equip(true); $('st-warn').hidden = true; };
makeInteract({ get prompt() { return listen.equipped ? 'Hang the headphones back up' : 'Put on the headphones'; }, use: toggleHeadphones }, listen.headphones);
makeInteract({ prompt: 'Use the podcast station', use: openStation }, listen.kiosk);

// ── The phone: Crosshare's Daily Mini, right on the phone screen ──
const phoneFrame = $('phone-frame');
function miniInfo() {
  const m = window.CROSSHARE_MINI;
  if (!m) return null;
  // older gallery.js files give a puzzle and author id instead of an embed link
  if (!m.embed && m.puzzleId && m.authorId) return { ...m, embed: 'https://crosshare.org/embed/' + m.puzzleId + '/' + m.authorId };
  return m;
}
function placePhoneFrame() {
  placePhoneFrameRect();
  const fr = phoneFrame.style, ld = $('phone-loading').style;
  ld.left = fr.left; ld.top = fr.top; ld.width = fr.width; ld.height = fr.height;
}
function placePhoneFrameRect() {
  camera.updateMatrixWorld(); lounge.screen.updateMatrixWorld();
  const pts = [[-0.09, -0.185], [0.09, -0.185], [0.09, 0.185], [-0.09, 0.185]].map(([a, b]) =>
    lounge.screen.localToWorld(new THREE.Vector3(a, b, 0)).project(camera));
  const xs = pts.map((p) => (p.x + 1) / 2 * innerWidth), ys = pts.map((p) => (1 - p.y) / 2 * innerHeight);
  const l = Math.min(...xs), t = Math.min(...ys);
  Object.assign(phoneFrame.style, { left: l + 'px', top: t + 'px', width: Math.max(...xs) - l + 'px', height: Math.max(...ys) - t + 'px' });
}
// Load the crossword in the background soon after the museum opens, and keep it
// loaded (off-screen) when the phone is put down, so it's instant and keeps your progress.
let phoneLoaded = false;
function preloadPhone() {
  const m = miniInfo();
  if (!m?.embed || phoneFrame.dataset.src === m.embed) return;
  phoneFrame.dataset.src = m.embed;
  phoneFrame.onload = () => { phoneLoaded = true; if (mode === 'phone') showPhoneLoading(false); };
  phoneFrame.src = m.embed;
}
setTimeout(preloadPhone, 2500);
function pickUpPhone() {
  if (mode !== 'walk') return;
  mode = 'phone';
  if (document.pointerLockElement) document.exitPointerLock();
  lounge.phone.removeFromParent();
  camera.add(lounge.phone);
  lounge.phone.position.set(0, 0.0, -0.3);
  lounge.phone.rotation.set(Math.PI / 2, 0, 0);
  const m = miniInfo();
  if (m?.embed) {
    preloadPhone();
    showPhoneLoading(!phoneLoaded);
    $('phone-note').textContent = m.title || 'A Slate crossword';
    $('phone-open').href = m.link || m.embed.replace('/embed/', '/crosswords/').replace(/\/[^/]+(\?.*)?$/, '');
  } else {
    $('phone-note').textContent = 'No puzzle set. Add one to CROSSHARE_MINI in gallery.js.';
  }
  $('phone-ui').classList.add('on');
  phoneFrame.classList.add('on');
  label.innerHTML = '';
}
function showPhoneLoading(on) {
  const el = $('phone-loading');
  clearTimeout(showPhoneLoading.t);
  el.classList.toggle('on', on);
  el.querySelector('.slow').hidden = true;
  if (on) showPhoneLoading.t = setTimeout(() => { el.querySelector('.slow').hidden = false; }, 8000);
}
function putDownPhone(viaClick) {
  if (mode !== 'phone') return;
  showPhoneLoading(false);
  phoneFrame.classList.remove('on');
  Object.assign(phoneFrame.style, { left: '-10000px', top: '0px' }); // stays loaded, out of sight
  lounge.phone.removeFromParent();
  scene.add(lounge.phone);
  lounge.phone.position.copy(lounge.tablePos); lounge.phone.rotation.set(0, 0.3, 0);
  $('phone-ui').classList.remove('on');
  leaveToWalk(viaClick);
}
$('phone-down').onclick = () => putDownPhone(true);
makeInteract({ prompt: 'Pick up the phone and do the Slate crossword', use: pickUpPhone }, lounge.phone);

function escapeRooms() {
  if (mode === 'seated') { standUp(false); return true; }
  if (mode === 'ui') { closeStation(false); return true; }
  if (mode === 'phone') { putDownPhone(false); return true; }
  return false;
}


// ═════════════════════════════════════════════════════════════
//  BONUS ROUND ("mario mode"): hit the ? block on the balcony
//  60 seconds · comment trolls · coins · fireballs · double jump
//  hold 7 for 5 s → star power for 10 s · touch a painting to stop
// ═════════════════════════════════════════════════════════════
const MAX_HP = 5, MARIO_TIME = 60, STAR_HOLD = 5, STAR_TIME = 10;
const mario = {
  on: false, t: 0, coins: 0, stomps: 0, score: 0, airJumps: 0,
  star: 0, hold7: 0, needRelease: false, hurt: 0,
  trolls: [], coins3d: [], fireballs: [], poofs: [],
  spawnT: 0, coinT: 0, lastSec: 0, best: 0,
};
try { mario.best = +localStorage.getItem('museum-bonus-best') || 0; } catch {}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// ── the ? block ──
const qBlock = {};
{
  const qTex = (used) => canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = used ? '#8a5a2b' : '#f4b400'; g.fillRect(0, 0, w, h);
    g.strokeStyle = used ? '#4a2c10' : '#9c5b00'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = used ? '#4a2c10' : '#9c5b00';
    for (const [x, y] of [[16, 16], [w - 16, 16], [16, h - 16], [w - 16, h - 16]]) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
    if (!used) {
      g.font = '900 86px Arial Black, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#7a3e00'; g.fillText('?', w / 2 + 5, h / 2 + 7);
      g.fillStyle = '#fff6d0'; g.fillText('?', w / 2, h / 2 + 2);
    }
  });
  qBlock.texOn = qTex(false); qBlock.texUsed = qTex(true);
  qBlock.mat = new THREE.MeshStandardMaterial({ map: qBlock.texOn, roughness: 0.5, emissive: '#ffffff', emissiveMap: qBlock.texOn, emissiveIntensity: 0.35 });
  qBlock.mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), qBlock.mat);
  qBlock.home = new THREE.Vector3(6.05, 2.75, -26.9); // tucked in the corner by the railing and the doors
  qBlock.mesh.position.copy(qBlock.home);
  scene.add(qBlock.mesh); solids.push(qBlock.mesh);
  qBlock.bump = 0; qBlock.cool = 0;
  makeInteract({ prompt: 'A ? block. Stand under it and jump (Space)', use: () => toast('Stand right under it and jump!'), reach: 6 }, qBlock.mesh);
}

// ── looks ──
const trollBody = new THREE.SphereGeometry(0.34, 20, 14);
const trollMats = ['#5b3a8c', '#2f6f5e', '#8c3a5b'].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55 }));
const eyeGeo = new THREE.SphereGeometry(0.085, 12, 8), pupilGeo = new THREE.SphereGeometry(0.04, 8, 6);
const white = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
const black = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.3 });
const browGeo = new THREE.BoxGeometry(0.13, 0.03, 0.03), footGeo = new THREE.SphereGeometry(0.1, 10, 6);
const footMat = new THREE.MeshStandardMaterial({ color: '#2a1630', roughness: 0.7 });
const COMMENTS = ['First!', 'Um, actually…', 'didn’t read lol', 'Paywall??', 'Ratio.', 'Source?', 'This aged badly',
  'Slate is pitching again', 'Cancel my sub', 'Who asked?', 'Do your research', 'Unsubscribe', 'Fake news', '…and another thing'];
const bubbleTex = COMMENTS.map((t) => canvasTex(256, 96, (g, w, h) => {
  g.fillStyle = '#fff'; g.strokeStyle = '#2c0022'; g.lineWidth = 5;
  g.beginPath(); g.roundRect(6, 6, w - 12, h - 30, 16); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(w / 2 - 14, h - 26); g.lineTo(w / 2, h - 6); g.lineTo(w / 2 + 14, h - 26); g.fill();
  g.fillStyle = '#2c0022'; g.font = '700 28px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(t, w / 2, (h - 24) / 2 + 3, w - 30);
}));
const coinGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 24);
const coinMat = new THREE.MeshStandardMaterial({ color: '#ffd23a', metalness: 0.3, roughness: 0.3, emissive: '#ffb300', emissiveIntensity: 0.55 });
const fireGeo = new THREE.SphereGeometry(0.11, 12, 8);
const fireMat = new THREE.MeshBasicMaterial({ color: '#ffb02e' });
const glowTex = canvasTex(64, 64, (g) => {
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,240,180,1)'); r.addColorStop(0.35, 'rgba(255,120,20,.8)'); r.addColorStop(1, 'rgba(255,40,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
});
const glowMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false });
const poofGeo = new THREE.SphereGeometry(0.06, 6, 4);
const poofMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true });

function makeTroll() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(trollBody, trollMats[(Math.random() * trollMats.length) | 0]);
  body.scale.set(1.15, 0.95, 1.05); body.position.y = 0.36; g.add(body);
  const face = new THREE.Group(); face.position.set(0, 0.44, 0.3); g.add(face);
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(eyeGeo, white); e.position.set(s * 0.11, 0, 0); face.add(e);
    const p = new THREE.Mesh(pupilGeo, black); p.position.set(s * 0.11, -0.01, 0.065); face.add(p);
    const b = new THREE.Mesh(browGeo, black); b.position.set(s * 0.11, 0.1, 0.05); b.rotation.z = s * 0.45; face.add(b);
  }
  const feet = [-1, 1].map((s) => { const f = new THREE.Mesh(footGeo, footMat); f.scale.set(1, 0.6, 1.4); f.position.set(s * 0.17, 0.05, 0.06); g.add(f); return f; });
  const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTex[(Math.random() * bubbleTex.length) | 0], depthTest: true }));
  bubble.scale.set(0.9, 0.34, 1); bubble.position.y = 1.08; g.add(bubble);
  g.scale.setScalar(0.01);
  return { g, body, feet, bubble, born: 0, dead: 0, how: null, vy: 0, spin: 0, speed: 1.8 + Math.random() * 0.8, phase: Math.random() * 6 };
}

// ── HUD ──
const hud = $('mario-hud');
function renderHud() {
  const t = Math.max(0, Math.ceil(mario.t));
  hud.querySelector('.time b').textContent = t;
  hud.querySelector('.time').classList.toggle('low', mario.t <= 10);
  hud.querySelector('.coins b').textContent = mario.coins;
  const hpEl = hud.querySelector('.hp');
  if (hpEl.childElementCount !== MAX_HP) hpEl.innerHTML = '<i></i>'.repeat(MAX_HP);
  [...hpEl.children].forEach((c, k) => c.classList.toggle('off', k >= mario.hp));
  hpEl.classList.toggle('low', mario.hp <= 2);
  hpEl.classList.toggle('hit', mario.hurt > 1.2);
  hud.querySelector('.stomps b').textContent = mario.stomps;
  hud.querySelector('.score b').textContent = mario.score.toLocaleString();
  const bar = hud.querySelector('.charge');
  bar.hidden = !(mario.hold7 > 0.15 && !mario.star);
  bar.querySelector('i').style.width = Math.min(100, (mario.hold7 / STAR_HOLD) * 100) + '%';
  hud.querySelector('.star').hidden = !mario.star;
  hud.querySelector('.star b').textContent = Math.ceil(mario.star);
  hud.classList.toggle('starred', mario.star > 0);
  $('star-fx').classList.toggle('on', mario.star > 0);
}

// ── sounds (original bleeps, no borrowed tunes) ──
Object.assign(sfx, {
  jump2: () => tone(500, 1100, 0.16),
  coin: () => { tone(988, 988, 0.08, 'square', 0.05); setTimeout(() => tone(1319, 1319, 0.3, 'square', 0.05), 80); },
  stomp: () => { tone(420, 110, 0.14, 'square', 0.08); noise(0.1, 900, 1, 0.3); },
  fire: () => tone(1400, 300, 0.12, 'sawtooth', 0.04),
  burn: () => { noise(0.25, 3000, 0.8, 0.3); tone(600, 80, 0.25, 'square', 0.05); },
  bump: () => { tone(160, 90, 0.12, 'square', 0.1); },
  hurt: () => { tone(500, 120, 0.4, 'sawtooth', 0.07); },
  power: () => [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, f * 1.01, 0.12, 'square', 0.05), i * 70)),
  tick: () => tone(1760, 1760, 0.05, 'square', 0.03),
  over: () => [784, 659, 523, 392].forEach((f, i) => setTimeout(() => tone(f, f, 0.18, 'triangle', 0.08), i * 150)),
});
// a little original loop while the round runs (faster when you have the star)
const music = { step: 0, next: 0 };
const BASS = [131, 131, 196, 131, 175, 131, 196, 220, 147, 147, 220, 147, 196, 175, 165, 147];
const LEAD = [523, 0, 659, 784, 0, 659, 523, 0, 587, 0, 698, 880, 0, 784, 659, 587];
function updateMusic(dt) {
  if (!actx || !mario.on || mode !== 'walk') return;
  music.next -= dt;
  if (music.next > 0) return;
  const beat = mario.star ? 0.09 : (mario.t <= 10 ? 0.12 : 0.16);
  music.next += beat;
  if (music.next < -0.2) music.next = beat;
  const i = music.step++ % 16;
  tone(BASS[i], BASS[i] * 0.99, beat * 0.9, 'triangle', 0.07);
  if (LEAD[i]) tone(LEAD[i] * (mario.star ? 2 : 1), LEAD[i] * (mario.star ? 2 : 1), beat * 0.7, 'square', mario.star ? 0.025 : 0.018);
}

// ── start / stop ──
function startMario() {
  if (mario.on) return;
  Object.assign(mario, { on: true, hp: MAX_HP, t: MARIO_TIME, coins: 0, stomps: 0, score: 0, star: 0, hold7: 0, hurt: 0,
    spawnT: 1.2, coinT: 0, lastSec: MARIO_TIME, airJumps: 0, needRelease: !!(keys.Digit7 || keys.Numpad7) });
  qBlock.mat.map = qBlock.texUsed; qBlock.mat.emissiveMap = qBlock.texUsed; qBlock.mat.emissiveIntensity = 0.1; qBlock.mat.needsUpdate = true;
  // a burst of coins out of the block
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    spawnCoin(qBlock.home.x + Math.cos(a) * 1.6, qBlock.home.z + Math.sin(a) * 1.2, 1.0 + (k % 2) * 0.9);
  }
  hud.classList.add('on'); document.body.classList.add('bonus'); renderHud();
  $('hint').dataset.old ??= $('hint').innerHTML;
  $('hint').innerHTML = 'BONUS ROUND · Space (twice) to double jump · land on trolls · T fireball · hold 7 for star power · touch a painting to quit';
  sfx.power();
  toast('Bonus round! 60 seconds. Stomp the comment trolls, grab the coins.');
}
function stopMario(reason) {
  if (!mario.on) return;
  mario.on = false; mario.star = 0; mario.noDive = clock.elapsedTime + 1.5;
  for (const tr of mario.trolls) scene.remove(tr.g);
  for (const c of mario.coins3d) scene.remove(c.m);
  for (const f of mario.fireballs) scene.remove(f.m);
  mario.trolls.length = mario.coins3d.length = mario.fireballs.length = 0;
  const score = mario.score + mario.coins * 50;
  const best = score > mario.best;
  if (best) { mario.best = score; try { localStorage.setItem('museum-bonus-best', score); } catch {} }
  hud.classList.remove('on', 'starred'); document.body.classList.remove('bonus'); $('star-fx').classList.remove('on');
  if ($('hint').dataset.old) $('hint').innerHTML = $('hint').dataset.old;
  const r = $('mario-result');
  r.querySelector('h3').textContent = reason === 'time' ? 'Time’s up!' : reason === 'hp' ? 'Game over' : 'Back to the art';
  r.querySelector('.c').textContent = mario.coins;
  r.querySelector('.s').textContent = mario.stomps;
  r.querySelector('.p').textContent = score.toLocaleString();
  r.querySelector('.best').textContent = best ? 'New museum record!' : `Record: ${mario.best.toLocaleString()}`;
  const showCard = () => { r.classList.add('on'); clearTimeout(stopMario.t); stopMario.t = setTimeout(() => r.classList.remove('on'), 4200); };
  if (reason === 'hp') {
    // you died: freeze, fade to the death screen, respawn on the balcony
    mode = 'dead'; vy = 0;
    for (const k in keys) keys[k] = false;
    const d = $('you-died'); d.classList.add('on');
    tone(220, 55, 1.6, 'sawtooth', 0.08); noise(1.2, 300, 1, 0.5);
    setTimeout(() => {
      jumpY = 0; vy = 0;
      const sx = 4.2, sz = -28.6;
      camera.position.set(sx, EYE, sz);
      yaw = Math.atan2(-(qBlock.home.x - sx), -(qBlock.home.z - sz)); pitch = 0.15;
      mode = 'walk';
      d.classList.remove('on');
      sfx.pop(); showCard();
    }, 3200);
  } else { showCard(); sfx.over(); }
  // the block comes back after a moment
  qBlock.cool = 3;
}

function spawnCoin(x, z, y) {
  const m = new THREE.Mesh(coinGeo, coinMat);
  m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z); scene.add(m);
  mario.coins3d.push({ m, age: 0, baseY: y, phase: Math.random() * 6 });
}
function randomSpotIn(room, awayFrom, minD) {
  for (let k = 0; k < 30; k++) {
    const x = room.x0 + 0.9 + Math.random() * (room.x1 - room.x0 - 1.8);
    const z = room.z0 + 0.9 + Math.random() * (room.z1 - room.z0 - 1.8);
    if (Math.hypot(x - awayFrom.x, z - awayFrom.z) < minD) continue;
    if (!blockedFor(x, z)) return { x, z };
  }
  return null;
}
// same walls and furniture as you, minus the hop-over rule
function blockedFor(x, z) {
  const m = 0.45;
  const inside = ROOMS.some((r) => x > r.x0 + m && x < r.x1 - m && z > r.z0 + m && z < r.z1 - m)
    || DOOR_GAPS.some((d) => x > d.x0 && x < d.x1 && z > d.z0 && z < d.z1 && (!d.door || slideDoor.open > 0.85));
  if (!inside) return true;
  return obstacles.some((b) => x > b.x0 - 0.3 && x < b.x1 + 0.3 && z > b.z0 - 0.3 && z < b.z1 + 0.3);
}

function killTroll(tr, how) {
  if (tr.dead) return;
  tr.dead = 0.001; tr.how = how;
  tr.bubble.visible = false;
  if (how === 'stomp') { sfx.stomp(); mario.score += 100; }
  else { sfx.burn(); mario.score += how === 'star' ? 200 : 150; tr.vy = 3.5; tr.spin = (Math.random() < 0.5 ? -1 : 1) * 9; }
  mario.stomps++; mario.coins++;
  sfx.coin();
  for (let k = 0; k < 10; k++) {
    const m = new THREE.Mesh(poofGeo, poofMat.clone());
    m.position.copy(tr.g.position).add(new THREE.Vector3(0, 0.3, 0));
    scene.add(m);
    mario.poofs.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 2.5, (Math.random() - 0.5) * 3), age: 0 });
  }
}

function throwFireball() {
  syncCamera();
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  fwd.y = Math.min(fwd.y, 0.1); fwd.normalize();
  const m = new THREE.Mesh(fireGeo, fireMat);
  const glow = new THREE.Sprite(glowMat); glow.scale.setScalar(0.55); m.add(glow);
  m.position.copy(camera.position).addScaledVector(fwd, 0.4).add(new THREE.Vector3(0, -0.35, 0));
  scene.add(m);
  mario.fireballs.push({ m, v: new THREE.Vector3(fwd.x * 9, -1, fwd.z * 9), age: 0, bounces: 0 });
  sfx.fire();
}

const mTmp = new THREE.Vector3(), mDir = new THREE.Vector3(), mN = new THREE.Vector3();
function updateMario(rawDt, moving) {
  const dt = Math.min(rawDt, 0.05);
  const pos = camera.position;

  // the block: bump animation, and the head-butt check
  if (qBlock.bump > 0) { qBlock.bump = Math.max(0, qBlock.bump - dt * 5); qBlock.mesh.position.y = qBlock.home.y + Math.sin(qBlock.bump * Math.PI) * 0.22; }
  if (qBlock.cool > 0) {
    qBlock.cool -= dt;
    if (qBlock.cool <= 0) { qBlock.mat.map = qBlock.texOn; qBlock.mat.emissiveMap = qBlock.texOn; qBlock.mat.emissiveIntensity = 0.35; qBlock.mat.needsUpdate = true; }
  }
  if (!mario.on) qBlock.mesh.rotation.y = Math.sin(clock.elapsedTime * 1.2) * 0.12;
  if (mode === 'walk' && vy > 0 && Math.abs(pos.x - qBlock.home.x) < 0.6 && Math.abs(pos.z - qBlock.home.z) < 0.6
      && pos.y + 0.15 >= qBlock.home.y - 0.4) {
    vy = -0.5; jumpY = Math.min(jumpY, qBlock.home.y - 0.4 - 0.15 - EYE);
    qBlock.bump = 1; sfx.bump();
    if (!mario.on && qBlock.cool <= 0) startMario();
  }

  // poofs fade even after the round
  for (let i = mario.poofs.length - 1; i >= 0; i--) {
    const p = mario.poofs[i]; p.age += dt;
    p.v.y -= 6 * dt; p.m.position.addScaledVector(p.v, dt);
    p.m.material.opacity = Math.max(0, 1 - p.age / 0.5);
    if (p.age > 0.5) { scene.remove(p.m); mario.poofs.splice(i, 1); }
  }
  if (!mario.on) return;
  if (mode !== 'walk') { renderHud(); return; } // the clock stops while you're sitting, reading, on the phone

  const rt = Math.min(rawDt, 0.25);
  mario.t -= Math.min(rawDt, 1);
  const sec = Math.ceil(mario.t);
  if (sec < mario.lastSec) { mario.lastSec = sec; if (sec <= 10 && sec > 0) sfx.tick(); }
  if (mario.t <= 0) { stopMario('time'); return; }
  if (mario.hp <= 0) { stopMario('hp'); return; }
  if (mario.hurt > 0) mario.hurt -= rt;
  updateMusic(rt);

  // star power: hold 7 for five seconds
  const holding = keys.Digit7 || keys.Numpad7;
  if (!holding) mario.needRelease = false;
  if (holding && !mario.needRelease && !mario.star) {
    mario.hold7 += Math.min(rawDt, 1); // real seconds, even on slow machines
    if (mario.hold7 >= STAR_HOLD) {
      mario.star = STAR_TIME; mario.hold7 = 0; mario.needRelease = true;
      sfx.power(); toast('★ Star power! Invincible for 10 seconds.');
    }
  } else if (!holding) mario.hold7 = 0;
  if (mario.star > 0) { mario.star = Math.max(0, mario.star - rt); if (!mario.star) toast('Star power wore off.'); }

  const room = roomAt(pos.x, pos.z);
  // spawn trolls and coins in whatever room you're in
  mario.spawnT -= rt;
  const alive = mario.trolls.filter((t) => !t.dead).length;
  if (room && mario.spawnT <= 0 && alive < 9) {
    mario.spawnT = Math.max(0.7, 1.7 - (MARIO_TIME - mario.t) / 60);
    const s = randomSpotIn(room, pos, 3.5);
    if (s) { const tr = makeTroll(); tr.g.position.set(s.x, 0, s.z); scene.add(tr.g); mario.trolls.push(tr); sfx.pop(); }
  }
  mario.coinT -= rt;
  if (room && mario.coinT <= 0 && mario.coins3d.length < 12) {
    mario.coinT = 0.9;
    const s = randomSpotIn(room, pos, 1.5);
    if (s) spawnCoin(s.x, s.z, Math.random() < 0.4 ? 2.0 : 1.0);
  }

  // coins spin; walk (or jump) through them
  const feet = jumpY;
  for (let i = mario.coins3d.length - 1; i >= 0; i--) {
    const c = mario.coins3d[i]; c.age += dt;
    c.m.rotation.z += dt * 4;
    c.m.position.y = c.baseY + Math.sin(clock.elapsedTime * 3 + c.phase) * 0.06;
    c.m.visible = c.age < 11 || Math.floor(c.age * 8) % 2 === 0;
    const near = Math.hypot(pos.x - c.m.position.x, pos.z - c.m.position.z) < 0.6 && c.m.position.y > feet - 0.2 && c.m.position.y < feet + 1.95;
    if (near || c.age > 13) {
      scene.remove(c.m); mario.coins3d.splice(i, 1);
      if (near) { mario.coins++; mario.score += 10; sfx.coin(); }
    }
  }

  // trolls waddle toward you
  for (let i = mario.trolls.length - 1; i >= 0; i--) {
    const tr = mario.trolls[i], g = tr.g;
    if (tr.dead) {
      tr.dead += dt;
      if (tr.how === 'stomp') { g.scale.set(1.25, Math.max(0.12, 1 - tr.dead * 8), 1.25); }
      else { tr.vy -= 12 * dt; g.position.y += tr.vy * dt; g.rotation.z += tr.spin * dt; }
      if (tr.dead > (tr.how === 'stomp' ? 0.45 : 1.4)) { scene.remove(g); mario.trolls.splice(i, 1); }
      continue;
    }
    tr.born += dt;
    if (tr.born < 0.35) { g.scale.setScalar(Math.max(0.01, tr.born / 0.35)); continue; }
    g.scale.setScalar(1);
    const dx = pos.x - g.position.x, dz = pos.z - g.position.z, d = Math.hypot(dx, dz);
    if (d > 0.3) {
      const sp = tr.speed * dt * (d < 6 ? 1 : 0.8);
      const nx = g.position.x + (dx / d) * sp, nz = g.position.z + (dz / d) * sp;
      if (!blockedFor(nx, g.position.z)) g.position.x = nx;
      if (!blockedFor(g.position.x, nz)) g.position.z = nz;
    }
    g.rotation.y = Math.atan2(dx, dz);
    const w = clock.elapsedTime * 9 + tr.phase;
    tr.feet[0].position.z = 0.06 + Math.sin(w) * 0.08; tr.feet[1].position.z = 0.06 - Math.sin(w) * 0.08;
    tr.body.position.y = 0.36 + Math.abs(Math.sin(w)) * 0.03;
    tr.body.rotation.z = Math.sin(w) * 0.08;
    tr.bubble.visible = d < 9;

    // contact
    const hd = Math.hypot(dx, dz);
    if (hd < 0.62) {
      if (mario.star) killTroll(tr, 'star');
      else if (vy < 0 && feet > 0.12 && feet < 0.85) {
        killTroll(tr, 'stomp');
        vy = keys.Space ? JUMP_V * 1.15 : JUMP_V * 0.8; // hold Space for a big bounce
        mario.airJumps = 0;
      } else if (feet <= 0.12 && mario.hurt <= 0) {
        mario.hurt = 1.5;
        mario.hp = Math.max(0, mario.hp - 1);
        sfx.hurt(); toast(mario.hp ? (mario.hp <= 2 ? `Ouch! ${mario.hp} health left.` : 'Ouch! Don’t feed the trolls.') : 'The trolls won this one.');
        flash.style.transition = 'none'; flash.style.background = 'rgba(255,14,80,.45)'; flash.style.opacity = '1';
        requestAnimationFrame(() => { flash.style.transition = 'opacity .5s'; flash.style.opacity = '0'; setTimeout(() => { flash.style.background = ''; }, 500); });
        // knock you back
        const kx = pos.x + (dx / (hd || 1)) * 1.2, kz = pos.z + (dz / (hd || 1)) * 1.2;
        if (!blocked(kx, pos.z)) pos.x = kx;
        if (!blocked(pos.x, kz)) pos.z = kz;
        vy = 3;
      }
    }
  }

  // fireballs bounce along the floor and burn trolls
  for (let i = mario.fireballs.length - 1; i >= 0; i--) {
    const f = mario.fireballs[i]; f.age += dt;
    mTmp.copy(f.m.position);
    f.v.y -= 16 * dt;
    f.m.position.addScaledVector(f.v, dt);
    f.m.rotation.y += dt * 20;
    let gone = f.age > 3;
    if (f.m.position.y < 0.11) { f.m.position.y = 0.11; f.v.y = 4.2; f.bounces++; }
    mDir.copy(f.m.position).sub(mTmp);
    const len = mDir.length();
    if (!gone && len > 0) {
      ray.set(mTmp, mDir.normalize()); ray.far = len + 0.1;
      const hit = ray.intersectObjects(solids, false)[0];
      if (hit) {
        mN.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
        if (mN.y > 0.6) { f.m.position.copy(hit.point).addScaledVector(mN, 0.12); f.v.y = 4.2; }
        else {
          gone = true; sfx.stomp();
          const slot = hit.object.userData?.slot;
          if (slot != null && hung[slot]) { const p = hung[slot]; const l = p.pic.worldToLocal(hit.point.clone()); p.u.uCenter.value.set(l.x, l.y); p.splash = Math.max(p.splash, 0.04); }
        }
      }
    }
    for (const tr of mario.trolls) {
      if (!tr.dead && tr.born >= 0.35 && f.m.position.distanceTo(mTmp.set(tr.g.position.x, 0.35, tr.g.position.z)) < 0.48) { killTroll(tr, 'fire'); gone = true; break; }
    }
    if (gone) { scene.remove(f.m); mario.fireballs.splice(i, 1); }
  }
  renderHud();
}

const fwdTmp = new THREE.Vector3();

renderer.setAnimationLoop(() => {
  const rawDt = clock.getDelta();
  const dt = Math.min(rawDt, 0.05);
  const time = clock.elapsedTime;
  if (mode === 'reading') return; // don't burn battery while you read
  if (mode === 'phone') placePhoneFrame();
  updateTheater(Math.min(rawDt, 0.5)); // real time, so fades work on slow machines too
  updateSlidingDoors(Math.min(rawDt, 0.25));
  const here = roomAt(camera.position.x, camera.position.z)?.id;
  if (here !== lastRoom) { lastRoom = here; updateNowPlaying(); }
  outdoor.world.visible = here === 'longhall' || here === 'balcony' || here === 'gallery' || mode === 'diving' || mode === 'reading';
  outdoor.sky.position.copy(camera.position);
  outdoor.sun.position.copy(camera.position).addScaledVector(outdoor.sunDir, 1900);
  outdoor.sun.lookAt(camera.position);
  // the record for the show that's playing spins at 33⅓
  for (const [id, disc] of Object.entries(listen.discs)) if (nowShow?.show.id === id && !audio.paused) disc.rotation.z -= dt * 3.5;

  if (mode === 'walk' && !viewer.open) {
    const run = (keys.ShiftLeft || keys.ShiftRight ? 1.8 : 1) * (mario.star ? 1.35 : 1);
    const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0) + pad.f;
    const r = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + pad.r;
    yaw += ((keys.ArrowLeft ? 1 : 0) - (keys.ArrowRight ? 1 : 0)) * 1.8 * dt;
    pitch = Math.max(-1.2, Math.min(1.2, pitch + ((keys.ArrowUp ? 1 : 0) - (keys.ArrowDown ? 1 : 0)) * 1.4 * dt)); // arrows look around
    const sp = 3.2 * run * dt;
    const dx = (-Math.sin(yaw) * f + Math.cos(yaw) * r) * sp;
    const dz = (-Math.cos(yaw) * f - Math.sin(yaw) * r) * sp;
    const pos = camera.position;
    if (!blocked(pos.x + dx, pos.z)) pos.x += dx;
    if (!blocked(pos.x, pos.z + dz)) pos.z += dz;

    if (jumpY > 0 || vy > 0) {
      vy -= GRAVITY * dt; jumpY += vy * dt;
      if (jumpY <= 0) { jumpY = 0; vy = 0; mario.airJumps = 0; }
    }
    const moving = f || r;
    pos.y = EYE + jumpY + (moving && jumpY === 0 ? Math.sin(time * 9) * 0.025 : 0);

    // the headphones are wired to the desk
    if (listen.equipped && Math.hypot(pos.x - listen.stand.x, pos.z - listen.stand.z) > 5.5) {
      equip(false);
      toast('The cord yanked the headphones off. They’re wired, like it’s 1996.');
    }

    // bonus round: running into a painting ends it (no diving until it's over)
    if (mario.on) {
      syncCamera();
      camera.getWorldDirection(fwdTmp);
      for (const p of hung) {
        if (!p) continue;
        const rel = pos.clone().sub(p.center);
        const dn = rel.dot(p.normal), lat = rel.dot(p.right);
        if (dn > 0 && dn < 0.62 && Math.abs(lat) < p.w / 2 + 0.1 && (f > 0 || jumpY > 0.05) && -fwdTmp.dot(p.normal) > 0.25) {
          p.splash = Math.max(p.splash, 0.05); stopMario('painting');
          const bx = pos.x + p.normal.x * 0.4, bz = pos.z + p.normal.z * 0.4; // bounce off it
          if (!blocked(bx, bz)) { pos.x = bx; pos.z = bz; }
          break;
        }
      }
    } else
    // Mario 64 rule: jump into a painting to go inside it
    if (jumpY > 0.05 && time > (mario.noDive || 0)) {
      syncCamera();
      camera.getWorldDirection(fwdTmp);
      for (const p of hung) {
        if (!p) continue;
        const rel = pos.clone().sub(p.center);
        const dn = rel.dot(p.normal), lat = rel.dot(p.right);
        if (dn > 0 && dn < 0.85 && Math.abs(lat) < p.w / 2 + 0.15 && -fwdTmp.dot(p.normal) > 0.25) {
          startDive(p, false); break;
        }
      }
    }
  } else if (mode === 'diving') {
    updateDive(Math.min(rawDt, 0.25)); // real time, so slow machines don't get slow-motion
  }
  camera.rotation.set(pitch, yaw, 0);

  // ripples: settle splashes, and wobble gently when you're close
  for (const p of hung) {
    if (!p) continue;
    p.splash *= Math.pow(0.25, dt);
    const near = camera.position.distanceTo(p.center) < 3 ? 0.012 : 0;
    p.u.uAmp.value = Math.max(p.splash, near);
    p.u.uTime.value = time;
  }

  updateTomatoes(dt);
  updateMario(rawDt);

  if (mode === 'walk' && !viewer.open) {
    const it = lookedAtInteract(4);
    const p = it ? null : lookedAt(5);
    const a = p?.art;
    if (it) label.innerHTML = `<b>${esc(it.prompt)}</b><span>Press E${dragMode ? ' or click' : ''}</span>`;
    else label.innerHTML = a ? `<b>${esc(a.title || 'Untitled')}</b>${a.artist ? ' · ' + esc(a.artist) : ''}<span>${a.url ? 'Jump in (Space) or press E to read · ' : ''}click to view · T to throw a tomato</span>` : '';
  }
  renderer.render(scene, camera);
});
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

window.__museum = {
  camera, hung, get mode() { return mode; }, splats, tomatoes,
  setView: (x, z, y, p) => { camera.position.x = x; camera.position.z = z; yaw = y; pitch = p || 0; syncCamera(); },
  throwTomato, startDive, slideDoor, sitDown, standUp, openStation, closeStation, pickUpPhone, putDownPhone, equip, listen, theater, lounge, tv, outdoor,
  lookedAtInteract, get audio() { return audio; }, blocked, roomAt,
  mario, qBlock, startMario, stopMario, jump, keys, dive,
};
