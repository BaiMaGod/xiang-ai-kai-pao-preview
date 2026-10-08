(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };

  // LayaXiangAI/src/Rules.ts
  var CAPS = { NAIL: 5, PRINTER: 4, MAGNET: 3, EXO: 5 };
  var NAMES = { NAIL: "\u9AD8\u538B\u5C04\u9489\u67AA", PRINTER: "\u5F39\u836F\u6253\u5370\u673A", MAGNET: "\u62FE\u53D6\u78C1\u573A", EXO: "\u7269\u4E1A\u5916\u9AA8\u9ABC" };
  var DAMAGE = [0, 12, 17, 23, 30, 39];
  function freshBuild() {
    return { ranks: { NAIL: 1, PRINTER: 0, MAGNET: 0, EXO: 0 }, hp: 100, maxHp: 100, power: 1 };
  }
  function stats(s) {
    return {
      damage: DAMAGE[s.ranks.NAIL] * s.power,
      interval: 0.28 * Math.pow(0.84, s.ranks.PRINTER),
      pickup: 130 + 50 * s.ranks.MAGNET,
      armor: s.ranks.EXO * 0.08,
      evolved: s.ranks.NAIL >= 3 && s.ranks.PRINTER >= 3
    };
  }
  function requiredXP(level) {
    return 6 + (level - 1) * 3;
  }
  function upgradePool(s) {
    const a = stats(s), out = [];
    for (const id of Object.keys(CAPS)) {
      const n = s.ranks[id];
      if (n >= CAPS[id]) continue;
      let desc = "";
      if (id === "NAIL") desc = `\u4F24\u5BB3 ${Math.round(a.damage)} \u2192 ${Math.round(DAMAGE[n + 1] * s.power)}` + (n === 2 ? "\uFF1B\u89E3\u9501\u4E09\u5411\u5C04\u51FB" : "") + "\uFF1B\u4E0E\u6253\u5370\u673A Lv.3 \u914D\u5408\u8FDB\u5316";
      if (id === "PRINTER") desc = `\u6BCF\u79D2 ${(1 / a.interval).toFixed(1)} \u2192 ${(1 / (a.interval * 0.84)).toFixed(1)} \u8F6E\u5C04\u51FB\uFF1BLv.3 \u914D\u5408\u5C04\u9489\u67AA Lv.3 \u8FDB\u5316`;
      if (id === "MAGNET") desc = `\u5438\u9644\u8303\u56F4 ${a.pickup} \u2192 ${a.pickup + 50}\uFF0C\u66F4\u5BB9\u6613\u6536\u96C6\u7ECF\u9A8C\u82AF\u7247`;
      if (id === "EXO") desc = `\u51CF\u4F24 ${n * 8}% \u2192 ${(n + 1) * 8}%\uFF1B\u751F\u547D\u4E0A\u9650 +8\uFF0C\u6062\u590D 20 \u751F\u547D`;
      out.push({ id, name: `${NAMES[id]}  Lv.${n} \u2192 ${n + 1}/${CAPS[id]}`, desc, accent: id === "EXO" ? "#a0e398" : id === "MAGNET" ? "#70d8ff" : "#ffd078" });
    }
    if (!out.some((o) => o.id === "NAIL" || o.id === "PRINTER") || out.length < 3)
      out.push({ id: "POWER", name: "\u706B\u529B\u8865\u7ED9", desc: "\u5168\u90E8\u5C04\u9489\u4F24\u5BB3\u63D0\u5347 8%", accent: "#ffd078" });
    if (out.length < 3) out.push({ id: "VITAL", name: "\u4F53\u80FD\u8865\u7ED9", desc: "\u751F\u547D\u4E0A\u9650 +12\uFF0C\u540C\u65F6\u6062\u590D 12 \u751F\u547D", accent: "#a0e398" });
    if (out.length < 3) out.push({ id: "REPAIR", name: "\u7EF4\u4FEE\u8865\u7ED9", desc: "\u6062\u590D 40 \u751F\u547D\uFF0C\u751F\u547D\u4E0A\u9650 +4", accent: "#a0e398" });
    return out;
  }
  function chooseOptions(s, previous = [], random = Math.random) {
    const pool = upgradePool(s), out = [];
    const take = (items) => {
      if (!items.length) return;
      const o = items[Math.min(items.length - 1, Math.floor(random() * items.length))];
      out.push(o);
      pool.splice(pool.indexOf(o), 1);
    };
    if (previous.length) take(pool.filter((o) => !previous.includes(o.id)));
    if (!out.some((o) => ["NAIL", "PRINTER", "POWER"].includes(o.id))) take(pool.filter((o) => ["NAIL", "PRINTER", "POWER"].includes(o.id)));
    while (out.length < 3 && pool.length) take(pool);
    return out;
  }
  function applyUpgrade(s, id) {
    if (!upgradePool(s).some((o) => o.id === id)) return false;
    if (id === "POWER") s.power *= 1.08;
    else if (id === "VITAL") {
      s.maxHp += 12;
      s.hp = Math.min(s.maxHp, s.hp + 12);
    } else if (id === "REPAIR") {
      s.maxHp += 4;
      s.hp = Math.min(s.maxHp, s.hp + 40);
    } else {
      s.ranks[id]++;
      if (id === "EXO") {
        s.maxHp += 8;
        s.hp = Math.min(s.maxHp, s.hp + 20);
      }
    }
    return true;
  }
  function shieldMultiplier(counter, disabled, emp) {
    return disabled || emp ? 1 : counter === "AP" ? 0.82 : counter === "RICOCHET" ? 0.65 : counter === "EMP" ? 0.4 : 0.2;
  }
  function segmentCircle(x, y, nx, ny, cx, cy, r) {
    const dx = nx - x, dy = ny - y, fx = x - cx, fy = y - cy, c = fx * fx + fy * fy - r * r;
    if (c <= 0) return 0;
    const a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), d = b * b - 4 * a * c;
    if (a < 1e-12 || d < 0) return Infinity;
    const t = (-b - Math.sqrt(d)) / (2 * a);
    return t >= 0 && t <= 1 ? t : Infinity;
  }
  function segmentRect(x, y, nx, ny, left, top, right, bottom) {
    let near = 0, far = 1;
    for (const [p, d, min, max] of [[x, nx - x, left, right], [y, ny - y, top, bottom]]) {
      if (Math.abs(d) < 1e-12) {
        if (p < min || p > max) return Infinity;
      } else {
        const a = (min - p) / d, b = (max - p) / d;
        near = Math.max(near, Math.min(a, b));
        far = Math.min(far, Math.max(a, b));
        if (near > far) return Infinity;
      }
    }
    return near;
  }

  // LayaXiangAI/src/FlowField.ts
  var FlowField = class {
    constructor(w, h, cell, canStand) {
      this.cell = cell;
      this.target = -1;
      this.cols = Math.ceil(w / cell);
      this.rows = Math.ceil(h / cell);
      const n = this.cols * this.rows;
      this.blocked = new Uint8Array(n);
      this.distance = new Int32Array(n);
      this.distance.fill(-1);
      this.queue = new Int32Array(n);
      for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) this.blocked[y * this.cols + x] = canStand((x + 0.5) * cell, (y + 0.5) * cell) ? 0 : 1;
    }
    open(x, y) {
      return x >= 0 && y >= 0 && x < this.cols && y < this.rows && !this.blocked[y * this.cols + x];
    }
    allowed(x, y, dx, dy) {
      return this.open(x + dx, y + dy) && (!dx || !dy || this.open(x + dx, y) && this.open(x, y + dy));
    }
    update(x, y) {
      const cx = Math.floor(x / this.cell), cy = Math.floor(y / this.cell);
      let index = -1, best = Infinity;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const xx = cx + dx, yy = cy + dy, d = Math.hypot((xx + 0.5) * this.cell - x, (yy + 0.5) * this.cell - y);
        if (this.open(xx, yy) && d < best) {
          best = d;
          index = yy * this.cols + xx;
        }
      }
      if (index === this.target) return;
      this.target = index;
      this.distance.fill(-1);
      if (index < 0) return;
      let head = 0, tail = 1;
      this.queue[0] = index;
      this.distance[index] = 0;
      while (head < tail) {
        const i = this.queue[head++], xx = i % this.cols, yy = Math.floor(i / this.cols);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy || !this.allowed(xx, yy, dx, dy)) continue;
          const next = (yy + dy) * this.cols + xx + dx;
          if (this.distance[next] >= 0) continue;
          this.distance[next] = this.distance[i] + 1;
          this.queue[tail++] = next;
        }
      }
    }
    waypoint(x, y) {
      const cx = Math.floor(x / this.cell), cy = Math.floor(y / this.cell);
      if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) return null;
      let best = this.distance[cy * this.cols + cx], bx = cx, by = cy;
      if (best < 0) best = Infinity;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy || !this.allowed(cx, cy, dx, dy)) continue;
        const d = this.distance[(cy + dy) * this.cols + cx + dx];
        if (d >= 0 && d < best) {
          best = d;
          bx = cx + dx;
          by = cy + dy;
        }
      }
      return Number.isFinite(best) ? { x: (bx + 0.5) * this.cell, y: (by + 0.5) * this.cell } : null;
    }
  };

  // LayaXiangAI/src/Entry.ts
  async function main() {
    var _a, _b, _c;
    const stage = Laya.stage;
    const win = Laya.Browser.window;
    const params = new URLSearchParams(win.location.search);
    const fast = params.get("fast") === "1";
    const testMode = params.get("test") === "1";
    const ART = {
      player: "resources/art/v1/player_wang.png",
      vacuum: "resources/art/v1/enemy_mop.png",
      delivery: "resources/art/v1/enemy_box.png",
      dog: "resources/art/v1/enemy_dog.png",
      shield: "resources/art/v1/enemy_shield.png",
      boss: "resources/art/v1/boss_gpt0.png",
      xp: "resources/art/v1/pickup_xp.png",
      nail: "resources/art/v1/fx_nail.png",
      muzzle: "resources/art/v1/fx_muzzle.png",
      hit: "resources/art/v1/fx_hit.png",
      mapFallback: "resources/art/v2/future_neon_arena.jpg",
      mapHD: "resources/art/v2/city_square_hd.jpg"
    };
    const artUrls = Object.values(ART);
    const artLoadFailures = [];
    await Promise.all(artUrls.map(async (url) => {
      try {
        await Laya.loader.load(url);
      } catch (e) {
        console.warn("Asset failed:", url);
      }
      const tex = Laya.loader.getRes(url);
      if (!tex || !tex.width || !tex.bitmap)
        artLoadFailures.push(url);
    }));
    const activeMapUrl = Laya.loader.getRes(ART.mapHD) ? ART.mapHD : ART.mapFallback;
    stage.bgColor = "#08111c";
    const viewportW = Math.max(1, Laya.Browser.clientWidth || win.innerWidth || 540);
    const viewportH = Math.max(1, Laya.Browser.clientHeight || win.innerHeight || 960);
    const mobilePortraitLayout = !!Laya.Browser.onMobile || viewportH > viewportW;
    if (mobilePortraitLayout) {
      stage.designWidth = 540;
      stage.designHeight = 960;
      stage.scaleMode = Laya.Stage.SCALE_FIXED_WIDTH;
      stage.alignH = Laya.Stage.ALIGN_CENTER;
      stage.alignV = Laya.Stage.ALIGN_TOP;
      if (Laya.Browser.onMobile)
        stage.screenMode = Laya.Stage.SCREEN_VERTICAL;
    } else {
      stage.designWidth = 1334;
      stage.designHeight = 750;
      stage.scaleMode = Laya.Stage.SCALE_FIXED_HEIGHT;
      stage.alignH = Laya.Stage.ALIGN_CENTER;
      stage.alignV = Laya.Stage.ALIGN_MIDDLE;
      stage.screenMode = Laya.Stage.SCREEN_NONE;
    }
    stage.updateCanvasSize();
    const doc = win.document;
    if ((doc == null ? void 0 : doc.head) && !doc.querySelector("link[data-ai-quality]")) {
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = "resources/quality.css?v=1";
      link.setAttribute("data-ai-quality", "1");
      doc.head.appendChild(link);
    }
    if ((doc == null ? void 0 : doc.documentElement) && (doc == null ? void 0 : doc.body)) {
      let viewportMeta = doc.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = doc.createElement("meta");
        viewportMeta.name = "viewport";
        (_a = doc.head) == null ? void 0 : _a.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute("content", "width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover");
      const rootStyle = doc.documentElement.style;
      rootStyle.margin = "0";
      rootStyle.padding = "0";
      rootStyle.width = "100%";
      rootStyle.height = "100%";
      rootStyle.overflow = "hidden";
      rootStyle.background = "#08111c";
      const bodyStyle = doc.body.style;
      bodyStyle.margin = "0";
      bodyStyle.padding = "0";
      bodyStyle.position = "fixed";
      bodyStyle.inset = "0";
      bodyStyle.width = "100vw";
      bodyStyle.height = "100dvh";
      bodyStyle.overflow = "hidden";
      bodyStyle.background = "#08111c";
      bodyStyle.touchAction = "none";
      bodyStyle.overscrollBehavior = "none";
      const container = Laya.Browser.container;
      if (container == null ? void 0 : container.style) {
        container.style.position = "fixed";
        container.style.left = "0";
        container.style.top = "0";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.overflow = "hidden";
        container.style.background = "#08111c";
        container.style.touchAction = "none";
      }
    }
    let W = Math.max(1, stage.width);
    let H = Math.max(1, stage.height);
    const playTop = 150;
    const WORLD_WIDTH = 2200;
    const WORLD_HEIGHT = 2200;
    const WORLD_MARGIN = 54;
    const MAP_SOURCE_SIZE = 1254;
    const MAP_SCALE_X = WORLD_WIDTH / MAP_SOURCE_SIZE;
    const MAP_SCALE_Y = WORLD_HEIGHT / MAP_SOURCE_SIZE;
    const mx = (v) => v * MAP_SCALE_X;
    const my = (v) => v * MAP_SCALE_Y;
    const mapRect = (id, x, y, w, h) => ({
      kind: "rect",
      id,
      x: mx(x),
      y: my(y),
      w: mx(w),
      h: my(h)
    });
    const mapCircle = (id, x, y, r) => ({
      kind: "circle",
      id,
      x: mx(x),
      y: my(y),
      r: r * (MAP_SCALE_X + MAP_SCALE_Y) * 0.5
    });
    let deadLeft = Math.max(120, W * 0.25);
    let deadRight = Math.min(W - 120, W * 0.7);
    let deadTop = Math.max(playTop + 70, H * 0.3);
    let deadBottom = Math.min(H - 90, H * 0.72);
    const PLAYER_COLLISION_RADIUS = 19;
    const PLAYER_START_X = mx(625);
    const PLAYER_START_Y = my(748);
    const collisionDebug = new URLSearchParams(win.location.search).get("collisions") === "1";
    const COLLISION_ZONES = [
      { kind: "rect", id: "NW_BUILDINGS", x: 0, y: 0, w: 570, h: 620 },
      { kind: "rect", id: "NE_BUILDINGS", x: 1630, y: 0, w: 570, h: 620 },
      { kind: "rect", id: "SW_BUILDINGS", x: 0, y: 1580, w: 570, h: 620 },
      { kind: "rect", id: "SE_BUILDINGS", x: 1630, y: 1580, w: 570, h: 620 },
      { kind: "rect", id: "WEST_WATER_N", x: 0, y: 680, w: 260, h: 260 },
      { kind: "rect", id: "WEST_WATER_S", x: 0, y: 1260, w: 260, h: 260 },
      { kind: "rect", id: "EAST_WATER_N", x: 1940, y: 680, w: 260, h: 260 },
      { kind: "rect", id: "EAST_WATER_S", x: 1940, y: 1260, w: 260, h: 260 },
      // Central energy device.
      mapCircle("ENERGY_CORE", 625, 622, 78),
      // Central plaza flowerbeds / palm islands.
      mapRect("PLANT_CORE_N", 584, 393, 82, 63),
      mapRect("PLANT_CORE_NW_CURVE", 470, 460, 84, 84),
      mapRect("PLANT_CORE_NE_CURVE", 700, 460, 84, 84),
      mapRect("PLANT_CORE_W_N", 397, 468, 47, 82),
      mapRect("PLANT_CORE_E_N", 810, 468, 47, 82),
      mapRect("PLANT_CORE_SW_CURVE", 471, 653, 84, 82),
      mapRect("PLANT_CORE_SE_CURVE", 699, 653, 84, 82),
      mapRect("PLANT_CORE_W_S", 397, 646, 47, 84),
      mapRect("PLANT_CORE_E_S", 809, 646, 47, 84),
      mapRect("PLANT_CORE_S", 584, 774, 83, 64),
      // Northern junction flowerbeds.
      mapRect("PLANT_NORTH_W", 487, 178, 73, 84),
      mapRect("PLANT_NORTH_E", 694, 178, 73, 84),
      mapRect("PLANT_NORTH_W_SLIM", 541, 102, 31, 69),
      mapRect("PLANT_NORTH_E_SLIM", 682, 102, 31, 69),
      // Side plaza islands visible on the selected concept map.
      mapRect("PLANT_WEST_CORE", 232, 324, 87, 65),
      mapRect("PLANT_WEST_N", 362, 210, 43, 86),
      mapRect("PLANT_EAST_N", 833, 276, 48, 80),
      mapRect("PLANT_EAST_CORE", 1022, 367, 82, 78),
      // Southern junction flowerbeds.
      mapRect("PLANT_SOUTH_W", 489, 963, 72, 88),
      mapRect("PLANT_SOUTH_E", 695, 963, 72, 88),
      mapRect("PLANT_SOUTH_W_SLIM", 542, 1052, 29, 72),
      mapRect("PLANT_SOUTH_E_SLIM", 684, 1052, 29, 72)
    ];
    const world = new Laya.Sprite();
    stage.addChild(world);
    drawWorld();
    const texturePartCache = /* @__PURE__ */ new Map();
    const actorLayer = new Laya.Sprite();
    world.addChild(actorLayer);
    const projectileLayer = new Laya.Sprite();
    world.addChild(projectileLayer);
    const player = new Laya.Sprite();
    const playerVisual = drawPlayer(player);
    player.pos(PLAYER_START_X, PLAYER_START_Y);
    actorLayer.addChild(player);
    let cameraX = Math.max(0, Math.min(WORLD_WIDTH - W, player.x - W * 0.5));
    let cameraY = Math.max(0, Math.min(WORLD_HEIGHT - H, player.y - H * 0.58));
    let cameraTargetX = cameraX;
    let cameraTargetY = cameraY;
    world.pos(-cameraX, -cameraY);
    const enemies = [];
    const bullets = [];
    const pickups = [];
    const keys = {};
    const navigation = new FlowField(WORLD_WIDTH, WORLD_HEIGHT, 40, (x, y) => canStandAt(x, y, 18));
    const enemyBuckets = /* @__PURE__ */ new Map();
    const bulletPool = [], pickupPool = [], hitFxPool = [];
    const effects = [];
    let enemyId = 0, navCooldown = 0, hudCooldown = 0;
    let joystickX = 0, joystickY = 0, backgroundPaused = false;
    let buildState = freshBuild(), refreshes = 2, choosingLevel = false, chosenUpgrades = 0;
    let currentOptions = [];
    let modalSelect = null;
    let nativeModalRender = null;
    let bossAttack = null;
    let bossTelegraph = null;
    const enemyLimit = mobilePortraitLayout ? 110 : 140;
    let gameStarted = fast;
    let startGameAction = null;
    let webModalOverlay = null;
    let gameOver = false;
    let paused = !gameStarted;
    let dragging = false;
    let pointerX = W * 0.5;
    let pointerY = H * 0.58;
    let hp = 100;
    let maxHp = 100;
    let armor = 0;
    let level = 1;
    let xp = 0;
    let nextXp = requiredXP(level);
    let pendingLevelUps = 0;
    let xpCollected = 0;
    let kills = 0;
    let shots = 0;
    let elapsed = 0;
    let hurtCooldown = 0;
    let fireCooldown = 0;
    let spawnBudget = 0;
    let maxEnemiesSeen = 0;
    let playerWalkPhase = 0;
    let playerRecoil = 0;
    let nailLevel = 1;
    let printerLevel = 0;
    let magnetLevel = 0;
    let exoLevel = 0;
    let nailDamage = 12;
    let fireInterval = 0.28;
    let moveSpeed = 255;
    let pickupRadius = fast ? 260 : 130;
    let evolved = false;
    let aiAnalyzed = false;
    let aiBannerUntil = 0;
    let emergencyShown = false;
    let emergencyCounter = "";
    let shieldSpawned = 0;
    let blockCount = 0;
    let blockBeforeProtocol = 0;
    let bossActive = false;
    let bossDefeated = false;
    let bossPhase = 0;
    let bossMaxHp = fast ? 72 : 14e3;
    let bossHp = bossMaxHp;
    let bossSprite = null;
    let bossSkillCooldown = 0;
    let bossWarningShown = false;
    let victory = false;
    const analysisAt = fast ? 2.2 : 120;
    const emergencyEarliest = fast ? 3.1 : 128;
    const bossWarningAt = fast ? 4.7 : 270;
    const bossAt = fast ? 5.6 : 300;
    let ui = createUI();
    const modalLayer = new Laya.Sprite();
    stage.addChild(modalLayer);
    const probe = {
      ready: true,
      stageWidth: W,
      stageHeight: H,
      engine: "LayaAir",
      engineVersion: "3.4.0",
      version: "0.9.0-combat-build-art",
      artVersion: "validated-textures-v3",
      animationVersion: "shared-texture-rig-v4",
      layoutVersion: "large-world-camera-collision-v2",
      mobilePortraitLayout,
      viewportWidth: viewportW,
      viewportHeight: viewportH,
      designWidth: stage.designWidth,
      designHeight: stage.designHeight,
      artLoadFailures,
      mapLoadReady: !!(Laya.loader.getRes(activeMapUrl) || Laya.loader.getRes(ART.mapFallback)),
      mapRenderMode: "graphics-drawTexture-hd",
      mapTextureWidth: Number(((_b = Laya.loader.getRes(activeMapUrl) || Laya.loader.getRes(ART.mapFallback)) == null ? void 0 : _b.width) || 0),
      mapTextureHeight: Number(((_c = Laya.loader.getRes(activeMapUrl) || Laya.loader.getRes(ART.mapFallback)) == null ? void 0 : _c.height) || 0),
      mapHdActive: activeMapUrl === ART.mapHD,
      codeFirst: true,
      fast,
      playerX: player.x,
      playerY: player.y,
      hp,
      level,
      xpCollected,
      kills,
      shots,
      activeBullets: 0,
      enemies: 0,
      maxEnemiesSeen,
      pickups: 0,
      aiAnalyzed,
      shieldSpawned,
      blockCount,
      blockBeforeProtocol,
      emergencyUpgrade: emergencyCounter,
      evolved,
      bossActive,
      bossPhase,
      bossHp,
      bossMaxHp,
      bossDefeated,
      victory,
      running: gameStarted,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      cameraX,
      cameraY,
      cameraDeadZone: { left: deadLeft, right: deadRight, top: deadTop, bottom: deadBottom },
      largeWorldCamera: true,
      collisionVersion: "selected-neon-arena-planters-v2",
      mapArt: activeMapUrl === ART.mapHD ? "selected-second-concept-1254-hd" : "future_neon_arena.jpg",
      mapArtMode: activeMapUrl === ART.mapHD ? "external-hd-map" : "repository-fallback",
      collisionZones: COLLISION_ZONES.length,
      planterCollisionZones: COLLISION_ZONES.filter((z) => z.id.startsWith("PLANT_")).length,
      playerCollisionRadius: PLAYER_COLLISION_RADIUS,
      enemyObstacleAvoidance: true,
      bulletWorldCollision: true
    };
    win.__XIANG_AI_LAYA__ = probe;
    if (!fast)
      showStartScreen();
    function makeText(text, size, color, bold = false) {
      const t = new Laya.Text();
      t.text = text;
      t.fontSize = size;
      t.color = color;
      t.bold = bold;
      t.font = "Arial";
      return t;
    }
    function attachArt(parent, url, sourceW, sourceH, targetW, targetH, offsetX = 0, offsetY = 0) {
      const art = new Laya.Sprite(), tex = Laya.loader.getRes(url);
      art.pos(offsetX, offsetY);
      art.mouseEnabled = false;
      art.__artReady = !!tex && !!tex.bitmap;
      if (tex && tex.bitmap)
        art.graphics.drawTexture(tex, -targetW / 2, -targetH / 2, targetW, targetH);
      else {
        art.graphics.drawRoundRect(-targetW / 2, -targetH / 2, targetW, targetH, 7, 7, 7, 7, "#b55033", "#ffd878", 2);
        art.graphics.drawCircle(0, -4, 5, "#fff1b8");
      }
      parent.addChild(art);
      return art;
    }
    function attachTexturePart(parent, url, sourceX, sourceY, sourceW, sourceH, targetW, targetH, offsetX = 0, offsetY = 0) {
      const base = Laya.loader.getRes(url);
      if (!base)
        return null;
      const part = new Laya.Sprite();
      try {
        const cacheKey = [url, sourceX, sourceY, sourceW, sourceH].join("|");
        let tex = texturePartCache.get(cacheKey);
        if (!tex) {
          tex = Laya.Texture.createFromTexture(base, sourceX, sourceY, sourceW, sourceH);
          texturePartCache.set(cacheKey, tex);
        }
        part.graphics.drawTexture(tex, -targetW * 0.5, -targetH * 0.5, targetW, targetH);
        part.pos(offsetX, offsetY);
        part.mouseEnabled = false;
        parent.addChild(part);
        return part;
      } catch (err) {
        console.warn("Texture part crop failed:", url, err);
        return null;
      }
    }
    function spawnHitFx(x, y) {
      if (effects.length >= 48)
        return;
      const fx = hitFxPool.pop() || new Laya.Sprite();
      if (!fx.numChildren)
        attachArt(fx, ART.hit, 64, 64, 28, 28);
      fx.pos(x, y);
      fx.alpha = 1;
      fx.rotation = Math.random() * 360;
      projectileLayer.addChild(fx);
      effects.push({ sprite: fx, life: 0.12, total: 0.12, x, y, floating: false, recycleHit: true });
    }
    function drawWorld() {
      const bg = new Laya.Sprite();
      bg.graphics.drawRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT, "#07131f");
      world.addChild(bg);
      const map = new Laya.Sprite();
      const mapTexture = Laya.loader.getRes(activeMapUrl) || Laya.loader.getRes(ART.mapFallback);
      if (mapTexture) {
        map.graphics.drawTexture(mapTexture, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      } else {
        console.error("Selected map texture missing at draw time");
      }
      map.size(WORLD_WIDTH, WORLD_HEIGHT);
      map.mouseEnabled = false;
      world.addChild(map);
      const edge = new Laya.Sprite();
      edge.graphics.drawRect(2, 2, WORLD_WIDTH - 4, WORLD_HEIGHT - 4, null, "#32cbea66", 6);
      edge.mouseEnabled = false;
      world.addChild(edge);
      if (collisionDebug) {
        const debug = new Laya.Sprite();
        debug.alpha = 0.28;
        for (const z of COLLISION_ZONES) {
          if (z.kind === "rect") {
            debug.graphics.drawRect(z.x, z.y, z.w, z.h, "#ff375f44", "#ff6b81", 3);
          } else {
            debug.graphics.drawCircle(z.x, z.y, z.r, "#ff375f44", "#ff6b81", 3);
          }
        }
        debug.mouseEnabled = false;
        world.addChild(debug);
      }
    }
    function drawPlayer(s) {
      const shadow = new Laya.Sprite();
      shadow.graphics.drawEllipse(-22, 23, 44, 12, "#00000066", null, 0);
      s.addChild(shadow);
      const pose = new Laya.Sprite();
      s.addChild(pose);
      const body = attachTexturePart(pose, ART.player, 0, 0, 160, 134, 78, 65.325, 0, -18.3375);
      const left = new Laya.Sprite(), right = new Laya.Sprite();
      pose.addChild(left);
      pose.addChild(right);
      left.pos(-19.5, 14.325);
      right.pos(19.5, 14.325);
      attachTexturePart(left, ART.player, 0, 134, 80, 46, 39, 22.425, 0, 11.2125);
      attachTexturePart(right, ART.player, 80, 134, 80, 46, 39, 22.425, 0, 11.2125);
      if (!body)
        attachArt(pose, ART.player, 160, 180, 78, 88, 0, -7);
      const ring = new Laya.Sprite();
      ring.graphics.drawCircle(0, 23, 25, null, "#72f7dd", 2);
      s.addChildAt(ring, 0);
      return { pose, body, left, right, shadow, ring, animated: !!body, currentClip: "idle" };
    }
    function createUI() {
      const hud = new Laya.Sprite();
      stage.addChild(hud);
      hud.zOrder = 10;
      hud.graphics.drawRect(0, 0, W, 166, "#071421eb");
      hud.graphics.drawRect(0, H - 58, W, 58, "#071421dd");
      const title = makeText("\u5411AI\u5F00\u70AE", 24, "#ffffff", true);
      title.pos(18, 12);
      hud.addChild(title);
      const pause = makeText("\u2161 \u6682\u505C", 18, "#94eee0", true);
      pause.pos(W - 94, 14);
      pause.size(82, 34);
      pause.mouseEnabled = true;
      pause.on(Laya.Event.CLICK, null, showPause);
      hud.addChild(pause);
      const hpText = makeText("", 17, "#a0e8d9", true);
      hpText.pos(18, 49);
      hud.addChild(hpText);
      const statText = makeText("", 15, "#c7d3dc");
      statText.pos(18, 104);
      statText.width = W - 36;
      hud.addChild(statText);
      const xpBg = new Laya.Sprite();
      xpBg.graphics.drawRoundRect(18, 78, W - 36, 10, 5, 5, 5, 5, "#162a3b");
      hud.addChild(xpBg);
      const xpBar = new Laya.Sprite();
      hud.addChild(xpBar);
      const aiText = makeText("", 14, "#b8d5e0", true);
      aiText.pos(18, 127);
      aiText.width = W - 36;
      hud.addChild(aiText);
      const aiBar = new Laya.Sprite();
      hud.addChild(aiBar);
      const bossText = makeText("", 16, "#ff9bad", true);
      bossText.width = W - 36;
      bossText.align = "center";
      bossText.pos(18, 170);
      hud.addChild(bossText);
      const bossBarBg = new Laya.Sprite();
      bossBarBg.graphics.drawRect(0, 166, W, 54, "#071421eb");
      bossBarBg.graphics.drawRoundRect(48, 196, W - 96, 12, 6, 6, 6, 6, "#351521");
      hud.addChildAt(bossBarBg, hud.getChildIndex(bossText));
      const bossBar = new Laya.Sprite();
      hud.addChild(bossBar);
      bossText.visible = bossBarBg.visible = bossBar.visible = false;
      const message = makeText("", 18, "#ffffff", true);
      message.width = W - 36;
      message.wordWrap = true;
      message.align = "center";
      message.pos(18, 180);
      message.stroke = 3;
      message.strokeColor = "#071421";
      hud.addChild(message);
      const buildText = makeText("", 14, "#aec7d6");
      buildText.width = W - 36;
      buildText.wordWrap = true;
      buildText.leading = 4;
      buildText.pos(18, H - 50);
      hud.addChild(buildText);
      const floating = new Laya.Sprite();
      hud.addChild(floating);
      const joystick = new Laya.Sprite();
      joystick.mouseEnabled = false;
      joystick.visible = false;
      hud.addChild(joystick);
      return { hud, hpText, statText, xpBar, aiText, aiBar, bossText, bossBarBg, bossBar, message, buildText, floating, joystick };
    }
    function showStartScreen() {
      paused = true;
      probe.startScreen = true;
      showWebChoiceModal("START", "\u5411AI\u5F00\u70AE", "\u8001\u738B\uFF0C\u7269\u4E1A\u7535\u5DE5\u3002\u62D6\u52A8\u8D70\u4F4D\uFF0C\u81EA\u52A8\u5F00\u706B\u3002\u62FE\u53D6\u82AF\u7247\u5347\u7EA7\u6B66\u5668\uFF0C\u751F\u5B58 5 \u5206\u949F\u540E\u51FB\u7834 GPT-0\u3002", [
        { id: "START", name: "\u25B6 \u5F00\u59CB\u53CD\u6297", desc: "\u624B\u673A\uFF1A\u6309\u4F4F\u7A7A\u767D\u5904\u62D6\u52A8\u6447\u6746 \xB7 \u7535\u8111\uFF1AWASD / \u65B9\u5411\u952E" }
      ], () => {
        clearWebModal();
        gameStarted = true;
        paused = false;
        probe.startScreen = false;
        startGameAction = null;
        resetInput();
        flash("\u9760\u8FD1\u84DD\u8272\u82AF\u7247\u5347\u7EA7\uFF0C\u7559\u610F AI \u7684\u53CD\u5236", "#a3f5dc");
      });
      startGameAction = () => modalSelect == null ? void 0 : modalSelect(0);
    }
    function enemyCost(kind) {
      if (kind === "vacuum")
        return 1;
      if (kind === "delivery")
        return 1.7;
      if (kind === "dog")
        return 2;
      return 3;
    }
    function spawnRate() {
      const t = elapsed;
      let r = t < 30 ? 1 : t < 60 ? 1.45 : t < 120 ? 2.1 : t < 180 ? 4 : t < 240 ? 5.6 : 7;
      if (aiAnalyzed)
        r *= 1.12;
      if (fast)
        r *= 4.2;
      return r;
    }
    function chooseEnemyKind(forceShield = false) {
      if (forceShield)
        return "shield";
      if (aiAnalyzed && Math.random() < 0.3)
        return "shield";
      const r = Math.random();
      if (elapsed < 30)
        return r < 0.78 ? "vacuum" : "delivery";
      if (elapsed < 65)
        return r < 0.54 ? "vacuum" : r < 0.82 ? "delivery" : "dog";
      return r < 0.34 ? "vacuum" : r < 0.62 ? "delivery" : "dog";
    }
    function makeEnemy(kind, x, y) {
      const s = new Laya.Sprite(), shadow = new Laya.Sprite(), pose = new Laya.Sprite();
      shadow.graphics.drawEllipse(-22, 19, 44, 12, "#00000066", null, 0);
      s.addChild(shadow);
      s.addChild(pose);
      const sizes = { vacuum: [58, 58], delivery: [66, 64], dog: [84, 84], shield: [90, 90] };
      const art = attachArt(pose, ART[kind], 1, 1, sizes[kind][0], sizes[kind][1], 0, -8);
      let partA = null, partB = null;
      if (kind === "delivery") {
        const hub = (x2, y2) => {
          const h = new Laya.Sprite();
          h.pos(x2, y2);
          h.graphics.drawLine(-3, 0, 3, 0, "#759bb9", 1);
          h.graphics.drawLine(0, -3, 0, 3, "#759bb9", 1);
          pose.addChild(h);
          return h;
        };
        partA = hub(5, 12);
        partB = hub(24, 4);
      }
      const data = { vacuum: [20, 66, 19], delivery: [40, 52, 22], dog: [32, 100, 21], shield: [70, 48, 25] };
      const d = data[kind], difficulty = 1 + Math.min(2, elapsed / 160);
      s.pos(x, y);
      actorLayer.addChild(s);
      return { id: ++enemyId, hitTimer: 0, sprite: s, pose, art, shadow, kind, hp: d[0] * difficulty, maxHp: d[0] * difficulty, speed: d[1] * (1 + Math.min(0.35, elapsed / 900)), radius: d[2], shield: kind === "shield", stunned: 0, contactCd: 1, animTime: Math.random() * 6.28, partA, partB };
    }
    function spawnEnemy(forceShield = false, selectedKind) {
      if (enemies.length >= enemyLimit)
        return false;
      const kind = selectedKind || chooseEnemyKind(forceShield);
      for (let i = 0; i < 48; i++) {
        const a = Math.random() * Math.PI * 2, r = 340 + Math.random() * 140, x = player.x + Math.cos(a) * r, y = player.y + Math.sin(a) * r;
        if (!canStandAt(x, y, 26))
          continue;
        enemies.push(makeEnemy(kind, x, y));
        if (kind === "shield")
          shieldSpawned++;
        return true;
      }
      return false;
    }
    function spawnPickup(x, y, value) {
      value = fast ? value * 3 : value;
      if (pickups.length >= 150) {
        let nearest = pickups[0], best = Infinity;
        for (const p of pickups) {
          const d = Math.hypot(p.sprite.x - x, p.sprite.y - y);
          if (d < best) {
            best = d;
            nearest = p;
          }
        }
        nearest.value += value;
        return;
      }
      const s = pickupPool.pop() || new Laya.Sprite();
      if (!s.numChildren)
        attachArt(s, ART.xp, 56, 56, 22, 22);
      s.pos(x, y);
      s.visible = true;
      world.addChildAt(s, world.getChildIndex(actorLayer));
      pickups.push({ sprite: s, value, life: Infinity });
    }
    function addXP(value) {
      xp += value;
      xpCollected += value;
      while (xp >= nextXp) {
        xp -= nextXp;
        level++;
        nextXp = requiredXP(level);
        pendingLevelUps++;
      }
      if (pendingLevelUps > 0 && !paused && !gameOver) {
        openLevelUp();
      }
    }
    function pickBuildOptions(previous = []) {
      buildState.hp = hp;
      buildState.maxHp = maxHp;
      return chooseOptions(buildState, previous);
    }
    function applyBuild(id) {
      buildState.hp = hp;
      buildState.maxHp = maxHp;
      if (!applyUpgrade(buildState, id))
        return false;
      const a = stats(buildState);
      nailLevel = buildState.ranks.NAIL;
      printerLevel = buildState.ranks.PRINTER;
      magnetLevel = buildState.ranks.MAGNET;
      exoLevel = buildState.ranks.EXO;
      nailDamage = a.damage;
      fireInterval = a.interval;
      pickupRadius = Math.max(fast ? 260 : 0, a.pickup);
      armor = a.armor;
      hp = buildState.hp;
      maxHp = buildState.maxHp;
      if (!evolved && a.evolved)
        flash("\u8FDB\u5316\uFF1A\u65E0\u9650\u5F39\u5E55\uFF01\u4E94\u5411\u8FDE\u5C04 + \u8D2F\u7A7F", "#72f5d0");
      evolved = a.evolved;
      chosenUpgrades++;
      return true;
    }
    function clearWebModal() {
      if (webModalOverlay) {
        webModalOverlay.remove();
        webModalOverlay = null;
      }
      modalLayer.destroyChildren();
      modalSelect = null;
      nativeModalRender = null;
      probe.modalType = "";
      probe.modalChoices = [];
    }
    function showWebChoiceModal(type, title, subtitle, choices, onChoose, extra) {
      clearWebModal();
      resetInput();
      probe.modalType = type;
      probe.modalChoices = choices.map((c) => c.id);
      let resolved = false;
      const choose = (index) => {
        if (resolved || index < 0 || index >= choices.length)
          return;
        resolved = true;
        onChoose(choices[index].id);
        syncProbe();
      };
      modalSelect = choose;
      const doc2 = testMode && params.get("native") === "1" ? null : win.document;
      if (!(doc2 == null ? void 0 : doc2.body)) {
        nativeModalRender = () => {
          modalLayer.destroyChildren();
          modalLayer.zOrder = 100;
          const w = Math.min(500, W - 24), h2 = Math.min(H - 24, 145 + choices.length * 105 + (extra ? 48 : 0)), x = (W - w) / 2, y = (H - h2) / 2;
          const shade = new Laya.Sprite();
          shade.graphics.drawRect(0, 0, W, H, "#02070de8");
          shade.size(W, H);
          shade.mouseEnabled = true;
          modalLayer.addChild(shade);
          const panel2 = new Laya.Sprite();
          panel2.graphics.drawRoundRect(x, y, w, h2, 20, 20, 20, 20, "#102438");
          modalLayer.addChild(panel2);
          const heading = makeText(title, 26, "#fff", true);
          heading.pos(x + 16, y + 18);
          heading.width = w - 32;
          heading.align = "center";
          modalLayer.addChild(heading);
          const sub2 = makeText(subtitle, 14, "#b8cdda");
          sub2.pos(x + 16, y + 56);
          sub2.width = w - 32;
          sub2.wordWrap = true;
          modalLayer.addChild(sub2);
          choices.forEach((c, i) => {
            const b = new Laya.Sprite();
            b.pos(x + 16, y + 112 + i * 105);
            b.size(w - 32, 96);
            b.hitArea = new Laya.Rectangle(0, 0, w - 32, 96);
            b.graphics.drawRoundRect(0, 0, w - 32, 96, 12, 12, 12, 12, "#193c53", c.accent || "#58e8c9", 1);
            b.mouseEnabled = true;
            modalLayer.addChild(b);
            const n = makeText(c.name, 18, "#fff", true);
            n.pos(14, 10);
            n.mouseEnabled = false;
            b.addChild(n);
            const d = makeText(c.desc, 14, "#bdd2df");
            d.pos(14, 38);
            d.width = w - 60;
            d.wordWrap = true;
            d.mouseEnabled = false;
            b.addChild(d);
            b.on(Laya.Event.CLICK, null, () => choose(i));
          });
          if (extra) {
            const b = makeText(extra.label, 16, extra.disabled ? "#60788a" : "#ffd078", true);
            b.pos(x + 16, y + h2 - 38);
            b.size(w - 32, 34);
            b.align = "center";
            b.mouseEnabled = !extra.disabled;
            b.on(Laya.Event.CLICK, null, () => {
              if (!resolved && !extra.disabled) {
                resolved = true;
                extra.action();
              }
            });
            modalLayer.addChild(b);
          }
        };
        nativeModalRender();
        return true;
      }
      const overlay = doc2.createElement("div");
      overlay.id = "game-choice-modal";
      overlay.className = "ai-modal";
      overlay.dataset.modalType = type;
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", title);
      overlay.style.cssText = "position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(2,7,13,.88);color:white";
      const panel = doc2.createElement("div");
      panel.className = "ai-modal-panel";
      overlay.appendChild(panel);
      const h = doc2.createElement("h2");
      h.textContent = title;
      h.className = "ai-modal-heading";
      panel.appendChild(h);
      const sub = doc2.createElement("p");
      sub.textContent = subtitle;
      sub.className = "ai-modal-subtitle";
      panel.appendChild(sub);
      const list = doc2.createElement("div");
      list.className = "ai-modal-list";
      panel.appendChild(list);
      choices.forEach((c, i) => {
        const b = doc2.createElement("button");
        b.type = "button";
        b.className = "game-choice-button ai-choice";
        b.dataset.choiceId = c.id;
        if (type === "START")
          b.id = "start-game-dom";
        b.style.setProperty("--choice-accent", c.accent || "#58e8c9");
        const n = doc2.createElement("div");
        n.textContent = c.name;
        n.className = "ai-choice-name";
        b.appendChild(n);
        const d = doc2.createElement("div");
        d.textContent = c.desc;
        d.className = "ai-choice-desc";
        b.appendChild(d);
        b.addEventListener("click", () => choose(i));
        list.appendChild(b);
      });
      if (extra) {
        const b = doc2.createElement("button");
        b.id = "reroll-upgrades";
        b.type = "button";
        b.className = "ai-extra";
        b.textContent = extra.label;
        b.disabled = extra.disabled;
        b.addEventListener("click", () => {
          if (!resolved && !extra.disabled) {
            resolved = true;
            extra.action();
          }
        });
        panel.appendChild(b);
      }
      doc2.body.appendChild(overlay);
      webModalOverlay = overlay;
      return true;
    }
    function openLevelUp() {
      if (choosingLevel || pendingLevelUps <= 0 || gameOver || victory)
        return;
      choosingLevel = true;
      paused = true;
      currentOptions = pickBuildOptions();
      renderLevelChoices();
    }
    function renderLevelChoices() {
      const offered = currentOptions;
      const canRefresh = refreshes > 0 && upgradePool(buildState).some((option) => !offered.some((current) => current.id === option.id));
      const finish = (id) => {
        if (!choosingLevel || !offered.some((o) => o.id === id) || !applyBuild(id))
          return;
        pendingLevelUps--;
        choosingLevel = false;
        probe.lastChoice = id;
        clearWebModal();
        resetInput();
        hurtCooldown = 0.85;
        paused = false;
        if (pendingLevelUps > 0)
          openLevelUp();
      };
      if (fast) {
        finish((offered.find((o) => o.id === "NAIL" || o.id === "PRINTER") || offered[0]).id);
        return;
      }
      showWebChoiceModal("LEVEL_UP", "Lv." + (level - pendingLevelUps + 1) + " \xB7 \u9009\u62E9\u5F3A\u5316", evolved ? "\u65E0\u9650\u5F39\u5E55\u5DF2\u8FDB\u5316 \xB7 \u7EE7\u7EED\u5F3A\u5316\u4F60\u7684\u6784\u7B51" : "\u8FDB\u5316\uFF1A\u5C04\u9489\u67AA Lv.3 + \u6253\u5370\u673A Lv.3\uFF08\u5F53\u524D " + Math.min(3, nailLevel) + "/3 \xB7 " + Math.min(3, printerLevel) + "/3\uFF09", offered, finish, {
        label: !refreshes ? "\u672C\u5C40\u5237\u65B0\u5DF2\u7528\u5B8C" : canRefresh ? "\u5237\u65B0\u9009\u9879 \xB7 \u672C\u5C40\u5269\u4F59 " + refreshes + " \u6B21" : "\u5F53\u524D\u5F3A\u5316\u6C60\u5DF2\u5168\u90E8\u5C55\u793A",
        disabled: !canRefresh,
        action: () => {
          if (!canRefresh)
            return;
          refreshes--;
          currentOptions = pickBuildOptions(offered.map((o) => o.id));
          renderLevelChoices();
        }
      });
    }
    function fireBullet(dx, dy, damageScale = 1) {
      if (bullets.length >= 160)
        return;
      const len = Math.max(1e-3, Math.hypot(dx, dy)), nx = dx / len, ny = dy / len;
      const s = bulletPool.pop() || new Laya.Sprite();
      if (!s.numChildren)
        attachArt(s, ART.nail, 96, 32, 30, 10);
      s.pos(player.x + nx * 27, player.y + ny * 27 - 8);
      s.rotation = Math.atan2(dy, dx) * 180 / Math.PI;
      s.alpha = 1;
      s.visible = true;
      projectileLayer.addChild(s);
      playerRecoil = 1;
      shots++;
      bullets.push({ sprite: s, vx: nx * 650, vy: ny * 650, damage: nailDamage * damageScale, life: 1.25, pierce: evolved ? 2 : 1, emp: emergencyCounter === "EMP" && shots % 4 === 0, hitIds: /* @__PURE__ */ new Set(), bounces: emergencyCounter === "RICOCHET" ? 2 : 0 });
    }
    function fire() {
      let tx = 0, ty = 0, best = 740 * 740, found = false;
      for (const e of enemies) {
        const dx = e.sprite.x - player.x, dy = e.sprite.y - player.y, d = dx * dx + dy * dy;
        if (e.hp > 0 && d < best && wallHit(player.x, player.y - 8, e.sprite.x, e.sprite.y, 3) === Infinity) {
          best = d;
          tx = e.sprite.x;
          ty = e.sprite.y;
          found = true;
        }
      }
      if (bossActive && bossSprite) {
        const d = Math.hypot(bossSprite.x - player.x, bossSprite.y - player.y);
        if (d < 740 && (!found || best > 140 * 140) && wallHit(player.x, player.y - 8, bossSprite.x, bossSprite.y, 3) === Infinity) {
          tx = bossSprite.x;
          ty = bossSprite.y;
          found = true;
        }
      }
      if (!found)
        return;
      const a = Math.atan2(ty - player.y, tx - player.x), spread = evolved ? [-0.24, -0.12, 0, 0.12, 0.24] : nailLevel >= 3 ? [-0.13, 0, 0.13] : [0];
      for (const offset of spread)
        fireBullet(Math.cos(a + offset), Math.sin(a + offset), offset === 0 ? 1 : 0.72);
      if (!dragging && !Object.values(keys).some(Boolean))
        playerVisual.pose.scaleX = tx < player.x ? 1 : -1;
      if (effects.length < 48) {
        const f = new Laya.Sprite();
        attachArt(f, ART.muzzle, 80, 45, 32, 18);
        f.pos(player.x + Math.cos(a) * 30, player.y + Math.sin(a) * 30 - 8);
        f.rotation = a * 180 / Math.PI;
        projectileLayer.addChild(f);
        effects.push({ sprite: f, life: 0.06, total: 0.06, x: f.x, y: f.y, floating: false });
      }
    }
    function killEnemy(index) {
      const e = enemies[index];
      if (!e)
        return;
      spawnPickup(e.sprite.x, e.sprite.y, e.kind === "shield" ? 4 : e.kind === "vacuum" ? 1 : 2);
      e.hp = 0;
      e.sprite.destroy(true);
      enemies.splice(index, 1);
      kills++;
      if (kills % 25 === 0) {
        hp = Math.min(maxHp, hp + 8);
        showFloat("+8 HP", player.x, player.y, "#96f6b1");
      }
    }
    function createBoss() {
      if (bossActive || bossDefeated)
        return;
      bossActive = true;
      bossPhase = 1;
      bossHp = bossMaxHp;
      bossSkillCooldown = fast ? 0.7 : 1.8;
      const s = new Laya.Sprite();
      const bossShadow = new Laya.Sprite();
      bossShadow.graphics.drawEllipse(-118, 45, 236, 48, "#00000077", null, 0);
      bossShadow.mouseEnabled = false;
      s.addChild(bossShadow);
      attachArt(s, ART.boss, 240, 120, 300, 150, 0, -8);
      const bossSide = player.x < WORLD_WIDTH * 0.5 ? 1 : -1;
      let bossX = clamp(player.x + bossSide * 320, 180, WORLD_WIDTH - 180);
      let bossY = clamp(player.y, 160, WORLD_HEIGHT - 160);
      if (!canStandAt(bossX, bossY, 72)) {
        bossX = clamp(player.x - bossSide * 320, 180, WORLD_WIDTH - 180);
      }
      if (!canStandAt(bossX, bossY, 72)) {
        bossX = clamp(player.x + bossSide * 250, 180, WORLD_WIDTH - 180);
        bossY = clamp(player.y + 180, 160, WORLD_HEIGHT - 160);
      }
      if (!canStandAt(bossX, bossY, 72)) {
        let found = false;
        for (let r = 200; r <= 700 && !found; r += 60)
          for (let n = 0; n < 32; n++) {
            const a = n / 32 * Math.PI * 2, x = player.x + Math.cos(a) * r, y = player.y + Math.sin(a) * r;
            if (canStandAt(x, y, 72)) {
              bossX = x;
              bossY = y;
              found = true;
              break;
            }
          }
        if (!found) {
          bossActive = false;
          return;
        }
      }
      s.pos(bossX, bossY);
      actorLayer.addChild(s);
      bossSprite = s;
      ui.bossText.visible = true;
      ui.bossBarBg.visible = true;
      ui.bossBar.visible = true;
      flash("GPT-0 \u539F\u578B\u673A\uFF1A\u5220\u9664\u4EBA\u7C7B\u534F\u8BAE\uFF0C\u5F00\u59CB\u3002", "#ff7182");
      for (let i = 0; i < 3; i++)
        spawnEnemy(true);
    }
    function bossPhaseForHp() {
      const ratio = bossHp / bossMaxHp;
      return ratio > 0.65 ? 1 : ratio > 0.35 ? 2 : 3;
    }
    function updateBoss(dt) {
      if (!bossActive || !bossSprite || bossDefeated)
        return;
      const phase = bossPhaseForHp();
      if (phase !== bossPhase) {
        bossPhase = phase;
        flash("GPT-0 \u9636\u6BB5 " + phase + " \xB7 \u8EB2\u5F00\u7EA2\u8272\u9884\u8B66\u5708", "#ff9b70");
        for (let i = 0; i < 3; i++)
          spawnEnemy(i === 0);
      }
      if (bossAttack) {
        bossAttack.remaining -= dt;
        const p = 1 - Math.max(0, bossAttack.remaining) / bossAttack.duration;
        bossTelegraph.graphics.clear();
        bossTelegraph.graphics.drawCircle(0, 0, bossAttack.radius, "#ff385344", "#ff8394", 3);
        bossTelegraph.graphics.drawCircle(0, 0, bossAttack.radius * p, null, "#ffd1d9", 3);
        if (bossAttack.remaining <= 0) {
          if (Math.hypot(player.x - bossAttack.x, player.y - bossAttack.y) < bossAttack.radius + PLAYER_COLLISION_RADIUS)
            hurtPlayer(bossAttack.damage);
          spawnHitFx(bossAttack.x, bossAttack.y);
          bossAttack = null;
          bossTelegraph.destroy(true);
          bossTelegraph = null;
        }
      }
      const dx = player.x - bossSprite.x, dy = player.y - bossSprite.y, d = Math.max(1, Math.hypot(dx, dy));
      if (d > 210) {
        const moved = moveWithSlide(bossSprite, dx / d * 60 * dt, dy / d * 60 * dt, 72);
        if (!moved.movedX && !moved.movedY)
          moveWithSlide(bossSprite, -dy / d * 60 * dt, dx / d * 60 * dt, 72);
      }
      bossSprite.rotation = Math.sin(elapsed * 1.6) * 1.5;
      bossSprite.zOrder = Math.round(bossSprite.y);
      bossSkillCooldown -= dt;
      if (bossSkillCooldown <= 0 && !bossAttack) {
        bossSkillCooldown = bossPhase === 3 ? 2.5 : 3.4;
        const duration = fast ? 0.25 : bossPhase === 3 ? 0.9 : 1.2;
        bossAttack = { x: player.x, y: player.y, radius: bossPhase === 3 ? 92 : 78, remaining: duration, duration, damage: bossPhase === 3 ? 18 : 12 };
        bossTelegraph = new Laya.Sprite();
        bossTelegraph.pos(player.x, player.y);
        world.addChildAt(bossTelegraph, world.getChildIndex(actorLayer));
        for (let i = 0; i < (bossPhase === 3 ? 2 : 1); i++)
          spawnEnemy(false);
      }
    }
    function damageBoss(value) {
      if (!bossActive || bossDefeated)
        return;
      bossHp -= value;
      showFloat("-" + Math.round(value), bossSprite.x, bossSprite.y - 54, "#ffd77b");
      if (bossHp <= 0)
        defeatBoss();
    }
    function defeatBoss() {
      if (bossDefeated)
        return;
      bossDefeated = true;
      bossActive = false;
      victory = true;
      bossHp = 0;
      if (bossSprite) {
        bossSprite.removeSelf();
        bossSprite.destroy();
        bossSprite = null;
      }
      ui.bossText.visible = false;
      ui.bossBarBg.visible = false;
      ui.bossBar.visible = false;
      if (bossTelegraph) {
        bossTelegraph.destroy(true);
        bossTelegraph = null;
      }
      bossAttack = null;
      showVictory();
    }
    function showVictory() {
      paused = true;
      showWebChoiceModal("VICTORY", "GPT-0 \u5DF2\u51FB\u7834", `\u751F\u5B58 ${Math.floor(elapsed)} \u79D2 \xB7 \u51FB\u6BC1 ${kills} \xB7 Lv.${level} \xB7 \u793E\u533A\u6682\u65F6\u5B89\u5168`, [
        { id: "RESTART", name: "\u518D\u6765\u4E00\u5C40", desc: "\u5C1D\u8BD5\u53E6\u4E00\u5957\u5F3A\u5316\u4E0E\u5E94\u6025\u534F\u8BAE" },
        { id: "HOME", name: "\u8FD4\u56DE\u9996\u9875", desc: "\u7ED3\u675F\u672C\u6B21\u884C\u52A8" }
      ], (id) => {
        restart();
        if (id === "HOME") {
          gameStarted = false;
          showStartScreen();
        }
      });
    }
    function showFloat(text, x, y, color) {
      if (effects.length >= 48)
        return;
      const t = makeText(text, 15, color, true);
      t.pos(worldToScreenX(x) - 18, worldToScreenY(y) - 35);
      ui.floating.addChild(t);
      effects.push({ sprite: t, life: 0.55, total: 0.55, x, y, floating: true });
    }
    function clearEffects() {
      for (const f of effects) {
        if (f.recycleHit) {
          f.sprite.removeSelf();
          hitFxPool.push(f.sprite);
        } else f.sprite.destroy(true);
      }
      effects.length = 0;
    }
    function updateEffects(dt) {
      for (let i = effects.length - 1; i >= 0; i--) {
        const f = effects[i];
        f.life -= dt;
        if (f.life <= 0) {
          if (f.recycleHit) {
            f.sprite.removeSelf();
            hitFxPool.push(f.sprite);
          } else f.sprite.destroy(true);
          effects.splice(i, 1);
          continue;
        }
        f.sprite.alpha = f.life / f.total;
        if (f.floating) {
          f.y -= dt * 24;
          f.sprite.pos(worldToScreenX(f.x) - 18, worldToScreenY(f.y) - 35);
        }
      }
    }
    function hurtPlayer(raw) {
      if (fast || hurtCooldown > 0 || gameOver || victory)
        return;
      const damage = Math.max(1, Math.round(raw * (1 - armor)));
      hp = Math.max(0, hp - damage);
      hurtCooldown = 0.7;
      showFloat("-" + damage, player.x, player.y, "#ff879a");
      if (hp <= 0)
        gameOverScreen();
    }
    function flash(text, color = "#ffffff") {
      ui.message.text = text;
      ui.message.color = color;
      aiBannerUntil = elapsed + 2.15;
    }
    function triggerAIAnalysis() {
      aiAnalyzed = true;
      flash("\u4E2D\u592EAI\uFF1A\u5B9E\u5F39 Build \u5DF2\u9501\u5B9A \u2192 \u90E8\u7F72\u9632\u5F39\u76FE\u536B", "#ff7182");
      for (let i = 0; i < 4; i++)
        spawnEnemy(true);
    }
    function chooseEmergency(kind) {
      if (emergencyCounter)
        return;
      emergencyCounter = kind;
      paused = false;
      clearWebModal();
      resetInput();
      hurtCooldown = 1;
      probe.lastChoice = kind;
      flash(kind === "AP" ? "\u7A7F\u7532\u9489\uFF1A\u96C6\u4E2D\u706B\u529B\u7834\u76FE" : kind === "EMP" ? "EMP \u9489\uFF1A\u762B\u75EA\u671F\u95F4\u76FE\u724C\u5931\u6548" : "\u8DF3\u5C04\u5F39\uFF1A\u81EA\u52A8\u5F39\u5411\u5176\u4ED6\u76EE\u6807", "#a3f5dc");
      if (pendingLevelUps > 0)
        openLevelUp();
    }
    function showEmergencyProtocol() {
      if (emergencyShown)
        return;
      emergencyShown = true;
      blockBeforeProtocol = blockCount;
      paused = true;
      if (fast) {
        chooseEmergency("AP");
        return;
      }
      showWebChoiceModal("EMERGENCY", "\u4EBA\u7C7B\u5E94\u6025\u534F\u8BAE", "AI \u5DF2\u90E8\u7F72\u76FE\u536B\u3002\u9009\u62E9\u4E00\u79CD\u53CD\u5236\uFF0C\u6301\u7EED\u5230\u672C\u5C40\u7ED3\u675F\u3002", [
        { id: "AP", name: "\u7A7F\u7532\u9489 \xB7 \u96C6\u4E2D\u7834\u76FE", desc: "\u5BF9\u76FE\u4F24\u5BB3\u4ECE 20% \u63D0\u5347\u81F3 82%\uFF0C\u7A33\u5B9A\u653B\u575A", accent: "#ffd078" },
        { id: "RICOCHET", name: "\u8DF3\u5C04\u5F39 \xB7 \u8FDE\u9501\u6E05\u7FA4", desc: "\u547D\u4E2D\u540E\u5F39\u5411\u9644\u8FD1\u53E6\u4E00\u654C\u4EBA\uFF0C\u6700\u591A\u8DF3\u5C04 2 \u6B21\uFF1B\u5BF9\u76FE\u4F24\u5BB3 65%", accent: "#c7acff" },
        { id: "EMP", name: "EMP \u9489 \xB7 \u63A7\u573A\u62C6\u76FE", desc: "\u6BCF\u7B2C 4 \u53D1\u762B\u75EA\u76EE\u6807 1.6 \u79D2\u5E76\u5173\u95ED\u76FE\u724C\uFF1B\u5176\u4ED6\u5B50\u5F39\u5BF9\u76FE\u4F24\u5BB3 40%", accent: "#70d8ff" }
      ], (id) => chooseEmergency(id));
    }
    function gameOverScreen() {
      if (gameOver)
        return;
      gameOver = true;
      paused = true;
      hp = 0;
      showWebChoiceModal("GAME_OVER", "\u672C\u6B21\u53CD\u6297\u7ED3\u675F", `\u751F\u5B58 ${Math.floor(elapsed)} \u79D2 \xB7 \u51FB\u6BC1 ${kills} \xB7 Lv.${level}`, [
        { id: "RESTART", name: "\u518D\u6765\u4E00\u6B21", desc: "\u7ACB\u5373\u91CD\u65B0\u5F00\u59CB" },
        { id: "HOME", name: "\u8FD4\u56DE\u9996\u9875", desc: "\u4F11\u6574\u4E00\u4E0B\u518D\u51FA\u53D1" }
      ], (id) => {
        restart();
        if (id === "HOME") {
          gameStarted = false;
          showStartScreen();
        }
      });
    }
    function clearEntities() {
      for (const e of enemies) {
        e.sprite.removeSelf();
        e.sprite.destroy();
      }
      for (const b of bullets) {
        b.sprite.removeSelf();
        b.sprite.destroy();
      }
      for (const p of pickups) {
        p.sprite.removeSelf();
        p.sprite.destroy();
      }
      enemies.length = 0;
      bullets.length = 0;
      pickups.length = 0;
      enemyBuckets.clear();
    }
    function restart() {
      clearEntities();
      clearWebModal();
      clearEffects();
      resetInput();
      buildState = freshBuild();
      refreshes = 2;
      choosingLevel = false;
      chosenUpgrades = 0;
      currentOptions = [];
      navCooldown = 0;
      playerRecoil = 0;
      playerWalkPhase = 0;
      if (bossTelegraph) {
        bossTelegraph.destroy(true);
        bossTelegraph = null;
      }
      bossAttack = null;
      backgroundPaused = false;
      modalLayer.removeChildren();
      hp = 100;
      maxHp = 100;
      armor = 0;
      level = 1;
      xp = 0;
      nextXp = requiredXP(1);
      pendingLevelUps = 0;
      xpCollected = 0;
      kills = 0;
      shots = 0;
      elapsed = 0;
      hurtCooldown = 0;
      fireCooldown = 0;
      spawnBudget = 0;
      maxEnemiesSeen = 0;
      nailLevel = 1;
      printerLevel = 0;
      magnetLevel = 0;
      exoLevel = 0;
      nailDamage = 12;
      fireInterval = 0.28;
      moveSpeed = 255;
      pickupRadius = fast ? 260 : 130;
      evolved = false;
      aiAnalyzed = false;
      emergencyShown = false;
      emergencyCounter = "";
      shieldSpawned = 0;
      blockCount = 0;
      blockBeforeProtocol = 0;
      bossActive = false;
      bossDefeated = false;
      bossPhase = 0;
      bossHp = bossMaxHp;
      bossSkillCooldown = 0;
      bossWarningShown = false;
      victory = false;
      if (bossSprite) {
        bossSprite.removeSelf();
        bossSprite.destroy();
        bossSprite = null;
      }
      ui.bossText.visible = false;
      ui.bossBarBg.visible = false;
      ui.bossBar.visible = false;
      ui.floating.removeChildren();
      ui.message.text = "";
      aiBannerUntil = 0;
      gameOver = false;
      paused = false;
      gameStarted = true;
      player.pos(PLAYER_START_X, PLAYER_START_Y);
      cameraX = Math.max(0, Math.min(WORLD_WIDTH - W, player.x - W * 0.5));
      cameraY = Math.max(0, Math.min(WORLD_HEIGHT - H, player.y - H * 0.58));
      cameraTargetX = cameraX;
      cameraTargetY = cameraY;
      world.pos(-cameraX, -cameraY);
      pointerX = W * 0.5;
      pointerY = H * 0.58;
      spawnEnemy(false);
      spawnEnemy(false);
      flash("\u91CD\u65B0\u8FDE\u63A5\u4EBA\u7C7B\u795E\u7ECF\u7F51\u7EDC\u3002", "#72f5d0");
    }
    function resetInput() {
      dragging = false;
      for (const key of Object.keys(keys))
        delete keys[key];
      if (ui == null ? void 0 : ui.joystick)
        ui.joystick.visible = false;
    }
    function showPause() {
      if (!gameStarted || paused || gameOver || victory)
        return;
      paused = true;
      showWebChoiceModal("PAUSE", "\u6218\u6597\u5DF2\u6682\u505C", "\u51C6\u5907\u597D\u540E\u7EE7\u7EED\u53CD\u6297", [{ id: "RESUME", name: "\u7EE7\u7EED\u6218\u6597", desc: "\u6062\u590D\u5F53\u524D\u8FDB\u5EA6" }], () => {
        clearWebModal();
        resetInput();
        paused = false;
      });
    }
    win.addEventListener("keydown", (ev) => {
      var _a2;
      const k = String(ev.key || "").toLowerCase();
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k))
        (_a2 = ev.preventDefault) == null ? void 0 : _a2.call(ev);
      if (paused && ev.repeat)
        return;
      if (modalSelect && /^[123]$/.test(k)) {
        modalSelect(Number(k) - 1);
        return;
      }
      if (!gameStarted && (k === "enter" || k === " ")) {
        startGameAction == null ? void 0 : startGameAction();
        return;
      }
      if (k === "r" && (gameOver || victory)) {
        restart();
        return;
      }
      if (k === "escape" || k === "p") {
        if (probe.modalType === "PAUSE")
          modalSelect == null ? void 0 : modalSelect(0);
        else
          showPause();
        return;
      }
      if (!paused)
        keys[k] = true;
    });
    win.addEventListener("keyup", (ev) => {
      keys[String(ev.key || "").toLowerCase()] = false;
    });
    win.addEventListener("blur", () => {
      resetInput();
      backgroundPaused = true;
    });
    win.addEventListener("focus", () => {
      resetInput();
      backgroundPaused = false;
    });
    doc == null ? void 0 : doc.addEventListener("visibilitychange", () => {
      resetInput();
      backgroundPaused = !!doc.hidden;
    });
    stage.on(Laya.Event.MOUSE_DOWN, null, () => {
      if (paused || !gameStarted || stage.mouseY < (bossActive ? 220 : 166))
        return;
      dragging = true;
      joystickX = pointerX = stage.mouseX;
      joystickY = pointerY = stage.mouseY;
      ui.joystick.visible = true;
    });
    stage.on(Laya.Event.MOUSE_MOVE, null, () => {
      if (dragging && !paused) {
        pointerX = stage.mouseX;
        pointerY = stage.mouseY;
      }
    });
    stage.on(Laya.Event.MOUSE_UP, null, () => {
      dragging = false;
      ui.joystick.visible = false;
    });
    stage.on(Laya.Event.MOUSE_OUT, null, resetInput);
    win.addEventListener("pointercancel", resetInput);
    stage.on(Laya.Event.RESIZE, null, () => {
      W = Math.max(1, stage.width);
      H = Math.max(1, stage.height);
      deadLeft = W * 0.25;
      deadRight = W * 0.7;
      deadTop = Math.max(180, H * 0.3);
      deadBottom = Math.max(deadTop + 50, H * 0.72);
      clearEffects();
      ui.hud.destroy(true);
      ui = createUI();
      resetInput();
      updateCamera(0, true);
      nativeModalRender == null ? void 0 : nativeModalRender();
      hudCooldown = 0;
    });
    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }
    function circleHitsZone(x, y, radius, zone) {
      if (zone.kind === "circle") {
        const dx2 = x - zone.x;
        const dy2 = y - zone.y;
        const rr = radius + zone.r;
        return dx2 * dx2 + dy2 * dy2 < rr * rr;
      }
      const cx = clamp(x, zone.x, zone.x + zone.w);
      const cy = clamp(y, zone.y, zone.y + zone.h);
      const dx = x - cx;
      const dy = y - cy;
      return dx * dx + dy * dy < radius * radius;
    }
    function collidesWorld(x, y, radius) {
      if (x - radius < WORLD_MARGIN || y - radius < WORLD_MARGIN || x + radius > WORLD_WIDTH - WORLD_MARGIN || y + radius > WORLD_HEIGHT - WORLD_MARGIN)
        return true;
      for (const zone of COLLISION_ZONES) {
        if (circleHitsZone(x, y, radius, zone))
          return true;
      }
      return false;
    }
    function canStandAt(x, y, radius) {
      return !collidesWorld(x, y, radius);
    }
    function moveWithSlide(sprite, dx, dy, radius) {
      let movedX = false;
      let movedY = false;
      const nx = sprite.x + dx;
      if (canStandAt(nx, sprite.y, radius)) {
        sprite.x = nx;
        movedX = Math.abs(dx) > 1e-3;
      }
      const ny = sprite.y + dy;
      if (canStandAt(sprite.x, ny, radius)) {
        sprite.y = ny;
        movedY = Math.abs(dy) > 1e-3;
      }
      return { movedX, movedY };
    }
    function updateCamera(dt, snap = false) {
      const screenX = player.x - cameraX;
      const screenY = player.y - cameraY;
      if (screenX < deadLeft)
        cameraTargetX = player.x - deadLeft;
      else if (screenX > deadRight)
        cameraTargetX = player.x - deadRight;
      if (screenY < deadTop)
        cameraTargetY = player.y - deadTop;
      else if (screenY > deadBottom)
        cameraTargetY = player.y - deadBottom;
      cameraTargetX = clamp(cameraTargetX, 0, Math.max(0, WORLD_WIDTH - W));
      cameraTargetY = clamp(cameraTargetY, 0, Math.max(0, WORLD_HEIGHT - H));
      if (snap) {
        cameraX = cameraTargetX;
        cameraY = cameraTargetY;
      } else {
        const follow = Math.min(1, dt * 11);
        cameraX += (cameraTargetX - cameraX) * follow;
        cameraY += (cameraTargetY - cameraY) * follow;
      }
      world.pos(-cameraX, -cameraY);
    }
    function worldToScreenX(x) {
      return x - cameraX;
    }
    function worldToScreenY(y) {
      return y - cameraY;
    }
    function updatePlayer(dt) {
      let dx = 0, dy = 0;
      if (keys.a || keys.arrowleft)
        dx--;
      if (keys.d || keys.arrowright)
        dx++;
      if (keys.w || keys.arrowup)
        dy--;
      if (keys.s || keys.arrowdown)
        dy++;
      if (dragging) {
        const x = pointerX - joystickX, y = pointerY - joystickY, d = Math.hypot(x, y);
        if (d > 8) {
          dx += x / Math.max(52, d);
          dy += y / Math.max(52, d);
        }
        const g = ui.joystick.graphics;
        g.clear();
        g.drawCircle(joystickX, joystickY, 52, "#16334188", "#70e4d799", 2);
        g.drawCircle(joystickX + x / Math.max(1, d) * Math.min(36, d), joystickY + y / Math.max(1, d) * Math.min(36, d), 20, "#74dec8aa");
      }
      const len = Math.hypot(dx, dy), beforeX = player.x, beforeY = player.y;
      if (len > 0)
        moveWithSlide(player, dx / Math.max(1, len) * moveSpeed * dt, dy / Math.max(1, len) * moveSpeed * dt, PLAYER_COLLISION_RADIUS);
      const moving = Math.hypot(player.x - beforeX, player.y - beforeY) > 0.1;
      playerRecoil = Math.max(0, playerRecoil - dt * 10);
      playerWalkPhase += dt * (moving ? 12 : 3);
      const step2 = moving ? Math.sin(playerWalkPhase) : 0, v = playerVisual;
      if (moving && Math.abs(dx) > 0.08)
        v.pose.scaleX = dx < 0 ? 1 : -1;
      v.left.rotation = step2 * 17;
      v.right.rotation = -step2 * 17;
      v.left.y = 14.325 + Math.max(0, -step2) * 1.5;
      v.right.y = 14.325 + Math.max(0, step2) * 1.5;
      v.pose.y = moving ? -Math.abs(step2) * 1.8 : Math.sin(playerWalkPhase) * 0.5;
      if (v.body) {
        v.body.x = playerRecoil * 1.8;
        v.body.rotation = playerRecoil * 1.4;
      }
      v.pose.alpha = hurtCooldown > 0.3 ? 0.55 + Math.abs(Math.sin(elapsed * 35)) * 0.45 : 1;
      v.currentClip = moving ? "run" : playerRecoil > 0.2 ? "fire" : "idle";
      v.shadow.scaleX = 1 - Math.abs(step2) * 0.06;
      player.zOrder = Math.round(player.y);
      updateCamera(dt);
    }
    function updateSpawner(dt) {
      const wave = elapsed % 30, pressure = wave > 23 ? 0.55 : wave < 5 ? 1.25 : 1;
      spawnBudget = Math.min(8, spawnBudget + spawnRate() * (bossActive ? 0.42 : 1) * pressure * dt);
      let guard = 0;
      while (guard++ < 4 && enemies.length < enemyLimit) {
        const kind = chooseEnemyKind(false), cost = enemyCost(kind);
        if (spawnBudget < cost)
          break;
        if (!spawnEnemy(kind === "shield", kind))
          break;
        spawnBudget -= cost;
      }
    }
    function wallHit(x, y, nx, ny, r) {
      let best = Infinity;
      for (const z of COLLISION_ZONES) {
        const t = z.kind === "circle" ? segmentCircle(x, y, nx, ny, z.x, z.y, z.r + r) : segmentRect(x, y, nx, ny, z.x - r, z.y - r, z.x + z.w + r, z.y + z.h + r);
        if (t < best)
          best = t;
      }
      return best;
    }
    function nearby(left, top, right, bottom) {
      const out = [];
      for (let y = Math.floor(top / 96); y <= Math.floor(bottom / 96); y++)
        for (let x = Math.floor(left / 96); x <= Math.floor(right / 96); x++) {
          const bucket = enemyBuckets.get(y * 1024 + x);
          if (bucket) {
            for (const e of bucket)
              if (e.hp > 0)
                out.push(e);
          }
        }
      return out;
    }
    function updateBullets(dt) {
      for (const b of enemyBuckets.values())
        b.length = 0;
      for (const e of enemies) {
        const key = Math.floor(e.sprite.y / 96) * 1024 + Math.floor(e.sprite.x / 96);
        let b = enemyBuckets.get(key);
        if (!b)
          enemyBuckets.set(key, b = []);
        b.push(e);
      }
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i], x = b.sprite.x, y = b.sprite.y, nx = x + b.vx * dt, ny = y + b.vy * dt;
        b.life -= dt;
        let consumed = false, redirected = false;
        const wall = wallHit(x, y, nx, ny, 3), hits = [];
        for (const e of nearby(Math.min(x, nx) - 35, Math.min(y, ny) - 35, Math.max(x, nx) + 35, Math.max(y, ny) + 35)) {
          if (b.hitIds.has(e.id))
            continue;
          const t = segmentCircle(x, y, nx, ny, e.sprite.x, e.sprite.y, e.radius + 5);
          if (t < wall && t <= 1)
            hits.push({ t, enemy: e });
        }
        if (bossActive && bossSprite && !b.hitIds.has(-1)) {
          const t = segmentCircle(x, y, nx, ny, bossSprite.x, bossSprite.y, 82);
          if (t < wall && t <= 1)
            hits.push({ t, enemy: null });
        }
        hits.sort((a, b2) => a.t - b2.t);
        for (const hit of hits) {
          if (hit.enemy && hit.enemy.hp <= 0)
            continue;
          const hx = x + (nx - x) * hit.t, hy = y + (ny - y) * hit.t;
          b.hitIds.add(hit.enemy ? hit.enemy.id : -1);
          if (hit.enemy) {
            const e = hit.enemy;
            let damage = b.damage;
            if (e.shield) {
              const mult = shieldMultiplier(emergencyCounter, e.stunned > 0, b.emp);
              damage *= mult;
              if (mult < 0.5) {
                blockCount++;
                if (e.hitTimer <= 0)
                  showFloat("BLOCK", e.sprite.x, e.sprite.y, "#70dfff");
              }
            }
            if (b.emp) {
              e.stunned = Math.max(e.stunned, 1.6);
              showFloat("EMP", e.sprite.x, e.sprite.y, "#70efff");
            }
            e.hp -= damage;
            e.hitTimer = 0.09;
            if (e.hp <= 0)
              killEnemy(enemies.indexOf(e));
          } else
            damageBoss(b.damage);
          spawnHitFx(hx, hy);
          if (b.bounces > 0) {
            let target = null, best = 260;
            for (const e of nearby(hx - 260, hy - 260, hx + 260, hy + 260)) {
              const d = Math.hypot(e.sprite.x - hx, e.sprite.y - hy);
              if (!b.hitIds.has(e.id) && d < best && wallHit(hx, hy, e.sprite.x, e.sprite.y, 3) === Infinity) {
                target = e;
                best = d;
              }
            }
            if (target) {
              const d = Math.max(1e-3, best);
              b.vx = (target.sprite.x - hx) / d * 650;
              b.vy = (target.sprite.y - hy) / d * 650;
              b.bounces--;
              b.life = 0.6;
              b.sprite.pos(hx, hy);
              b.sprite.rotation = Math.atan2(b.vy, b.vx) * 180 / Math.PI;
              redirected = true;
              break;
            }
          }
          if (--b.pierce <= 0) {
            consumed = true;
            break;
          }
          if (paused || gameOver || victory)
            break;
        }
        if (!redirected) {
          b.sprite.pos(nx, ny);
          if (wall <= 1)
            consumed = true;
        }
        if (consumed || b.life <= 0 || nx < 0 || ny < 0 || nx > WORLD_WIDTH || ny > WORLD_HEIGHT) {
          b.sprite.removeSelf();
          b.sprite.visible = false;
          bulletPool.push(b.sprite);
          bullets.splice(i, 1);
        }
        if (paused || gameOver || victory)
          return;
      }
    }
    function updateEnemies(dt) {
      hurtCooldown = Math.max(0, hurtCooldown - dt);
      navCooldown -= dt;
      if (navCooldown <= 0) {
        navigation.update(player.x, player.y);
        navCooldown = 0.35;
      }
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.contactCd -= dt;
        e.animTime += dt;
        e.hitTimer = Math.max(0, e.hitTimer - dt);
        const dx = player.x - e.sprite.x, dy = player.y - e.sprite.y, d = Math.max(1e-3, Math.hypot(dx, dy));
        e.sprite.visible = e.sprite.x > cameraX - 100 && e.sprite.x < cameraX + W + 100 && e.sprite.y > cameraY - 100 && e.sprite.y < cameraY + H + 100;
        e.sprite.zOrder = Math.round(e.sprite.y);
        if (e.stunned > 0) {
          e.stunned = Math.max(0, e.stunned - dt);
          e.sprite.alpha = 0.65;
          continue;
        }
        e.sprite.alpha = e.hitTimer > 0 ? 0.6 : 1;
        let tx = player.x, ty = player.y;
        if (d > 80 && wallHit(e.sprite.x, e.sprite.y, tx, ty, 18) !== Infinity) {
          const target = navigation.waypoint(e.sprite.x, e.sprite.y);
          if (target) {
            tx = target.x;
            ty = target.y;
          }
        }
        const rd = Math.max(1e-3, Math.hypot(tx - e.sprite.x, ty - e.sprite.y));
        moveWithSlide(e.sprite, (tx - e.sprite.x) / rd * e.speed * dt, (ty - e.sprite.y) / rd * e.speed * dt, 18);
        if (e.sprite.visible) {
          e.pose.scaleX = dx < 0 ? 1 : -1;
          const step2 = Math.sin(e.animTime * (e.kind === "dog" ? 13 : 7));
          e.pose.y = -Math.abs(step2) * (e.kind === "dog" ? 2.8 : 1.1);
          e.pose.rotation = step2 * (e.kind === "dog" ? 2 : 1);
          e.shadow.scaleX = 1 - Math.abs(step2) * 0.04;
          if (e.partA) {
            e.partA.rotation = e.animTime * 300;
            e.partB.rotation = e.animTime * 300;
          }
        }
        if (d < e.radius + PLAYER_COLLISION_RADIUS && e.contactCd <= 0) {
          hurtPlayer(e.kind === "dog" ? 12 : e.kind === "shield" ? 10 : 7);
          e.contactCd = 0.85;
          moveWithSlide(e.sprite, -dx / d * 18, -dy / d * 18, 18);
          if (gameOver)
            return;
        }
      }
    }
    function updatePickups(dt) {
      let collected = 0;
      for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i], dx = player.x - p.sprite.x, dy = player.y - p.sprite.y, d = Math.max(1e-3, Math.hypot(dx, dy));
        if (d < 26) {
          collected += p.value;
          p.sprite.removeSelf();
          p.sprite.visible = false;
          pickupPool.push(p.sprite);
          pickups.splice(i, 1);
          continue;
        }
        if (d < pickupRadius) {
          const travel = Math.min(d, (210 + (pickupRadius - d) * 5) * dt);
          p.sprite.x += dx / d * travel;
          p.sprite.y += dy / d * travel;
        }
        p.sprite.visible = p.sprite.x > cameraX - 30 && p.sprite.x < cameraX + W + 30 && p.sprite.y > cameraY - 30 && p.sprite.y < cameraY + H + 30;
      }
      if (collected > 0)
        addXP(collected);
    }
    function updateUI() {
      ui.message.y = bossActive ? 230 : 180;
      const xpProgress = Math.min(1, xp / nextXp);
      ui.xpBar.graphics.clear();
      ui.xpBar.graphics.drawRoundRect(18, 78, Math.max(2, (W - 36) * xpProgress), 10, 5, 5, 5, 5, evolved ? "#ffd45f" : "#60c9ff");
      const aiProgress = aiAnalyzed ? 1 : Math.min(1, elapsed / analysisAt);
      ui.aiBar.graphics.clear();
      ui.aiBar.graphics.drawRoundRect(18, 148, Math.max(2, (W - 36) * aiProgress), 10, 5, 5, 5, 5, aiAnalyzed ? "#ff667b" : "#4dd7c2");
      ui.hpText.text = "HP " + Math.max(0, Math.ceil(hp)) + "/" + maxHp + "   LV." + level + "   XP " + xp + "/" + nextXp;
      const remain = Math.max(0, Math.ceil(bossAt - elapsed));
      ui.statText.text = bossActive ? "BOSS P" + bossPhase + " \xB7 \u654C\u4EBA " + enemies.length : "\u51FB\u6BC1 " + kills + " \xB7 \u654C\u4EBA " + enemies.length + " \xB7 BOSS " + remain + "s";
      ui.aiText.text = aiAnalyzed ? "\u4E2D\u592EAI\uFF1A\u5DF2\u9501\u5B9A\u5B9E\u5F39 Build \xB7 \u4E3B\u53CD\u5236=\u76FE\u536B" : "AI \u5B66\u4E60\u5EA6 " + Math.round(aiProgress * 100) + "%";
      const build = [
        "\u5C04\u9489\u67AA L" + nailLevel,
        "\u6253\u5370\u673A L" + printerLevel,
        "\u78C1\u573A L" + magnetLevel,
        "\u5916\u9AA8\u9ABC L" + exoLevel
      ];
      if (evolved)
        build.push("\u2605\u65E0\u9650\u5F39\u5E55");
      if (emergencyCounter)
        build.push("\u5E94\u6025:" + emergencyCounter);
      ui.buildText.text = build.join("   ");
      if (bossActive) {
        const ratio = Math.max(0, bossHp / bossMaxHp);
        ui.bossText.visible = true;
        ui.bossBarBg.visible = true;
        ui.bossBar.visible = true;
        ui.bossText.text = "GPT-0 \u539F\u578B\u673A \xB7 PHASE " + bossPhase + " \xB7 " + Math.ceil(ratio * 100) + "%";
        ui.bossBar.graphics.clear();
        ui.bossBar.graphics.drawRoundRect(48, 196, Math.max(2, (W - 96) * ratio), 12, 6, 6, 6, 6, bossPhase === 3 ? "#ff445f" : "#ff7182");
      }
      if (ui.message.text && elapsed >= aiBannerUntil && !paused)
        ui.message.text = "";
    }
    function syncProbe() {
      maxEnemiesSeen = Math.max(maxEnemiesSeen, enemies.length);
      probe.playerX = player.x;
      probe.playerY = player.y;
      probe.playerScreenX = player.x - cameraX;
      probe.playerScreenY = player.y - cameraY;
      probe.cameraX = cameraX;
      probe.cameraY = cameraY;
      probe.worldX = world.x;
      probe.worldY = world.y;
      probe.collisionZones = COLLISION_ZONES.length;
      probe.playerCollisionRadius = PLAYER_COLLISION_RADIUS;
      probe.playerOnValidGround = canStandAt(player.x, player.y, PLAYER_COLLISION_RADIUS);
      probe.coreBlocksMovement = collidesWorld(mx(625), my(622), PLAYER_COLLISION_RADIUS);
      probe.centralPlanterBlocksMovement = collidesWorld(mx(625), my(420), PLAYER_COLLISION_RADIUS);
      probe.northRoadOpen = !collidesWorld(mx(625), my(300), PLAYER_COLLISION_RADIUS);
      probe.hp = hp;
      probe.level = level;
      probe.xpCollected = xpCollected;
      probe.kills = kills;
      probe.shots = shots;
      probe.activeBullets = bullets.length;
      probe.enemies = enemies.length;
      probe.maxEnemiesSeen = maxEnemiesSeen;
      probe.pickups = pickups.length;
      probe.aiAnalyzed = aiAnalyzed;
      probe.shieldSpawned = shieldSpawned;
      probe.blockCount = blockCount;
      probe.blockBeforeProtocol = blockBeforeProtocol;
      probe.emergencyUpgrade = emergencyCounter;
      probe.evolved = evolved;
      probe.bossActive = bossActive;
      probe.bossPhase = bossPhase;
      probe.bossHp = bossHp;
      probe.bossMaxHp = bossMaxHp;
      probe.bossDefeated = bossDefeated;
      probe.victory = victory;
      probe.running = gameStarted && !gameOver && !victory;
      probe.artLoadFailures = artLoadFailures;
      probe.animatedEnemies = enemies.filter((e) => !!e.art).length;
      probe.frameAnimatedEnemies = enemies.filter((e) => e.art.__artReady).length;
      probe.playerFrameClipReady = !!playerVisual.animated;
      probe.playerAnimation = playerVisual.currentClip || "fallback";
      probe.detachedFakeParts = 0;
      probe.integratedPartsAnimation = true;
      probe.frameClipAnimation = false;
      probe.stageWidth = stage.width;
      probe.stageHeight = stage.height;
      probe.designWidth = stage.designWidth;
      probe.designHeight = stage.designHeight;
      probe.elapsed = elapsed;
      probe.paused = paused || backgroundPaused;
      probe.gameOver = gameOver;
      probe.buildRanks = __spreadValues({}, buildState.ranks);
      probe.refreshes = refreshes;
      probe.pendingLevelUps = pendingLevelUps;
      probe.chosenUpgrades = chosenUpgrades;
      probe.options = currentOptions.map((o) => __spreadValues({}, o));
      probe.effects = effects.length;
      probe.maxEnemyCount = enemyLimit;
      probe.enemyTypes = [...new Set(enemies.map((e) => e.kind))];
      probe.bossAttack = bossAttack ? __spreadValues({}, bossAttack) : null;
      probe.playerLegAngle = playerVisual.left.rotation;
      probe.activeTextureEnemies = enemies.filter((e) => e.art.__artReady).length;
      probe.textureParts = texturePartCache.size;
      probe.hitFxPool = hitFxPool.length;
      probe.uiQualityStylesheet = !!(doc == null ? void 0 : doc.querySelector("link[data-ai-quality]"));
      probe.bulletPool = bulletPool.length;
      probe.pickupPool = pickupPool.length;
    }
    function step(dt) {
      if (!gameStarted || paused || backgroundPaused || gameOver || victory)
        return;
      elapsed += dt;
      fireCooldown -= dt;
      updatePlayer(dt);
      updateSpawner(dt);
      updateEnemies(dt);
      if (paused || gameOver)
        return;
      if (fireCooldown <= 0 && (enemies.length || bossActive)) {
        fire();
        fireCooldown = fireInterval;
      }
      if (!aiAnalyzed && elapsed >= analysisAt)
        triggerAIAnalysis();
      if (aiAnalyzed && !emergencyShown && elapsed >= emergencyEarliest && (fast || blockCount >= 3 || elapsed >= analysisAt + 14)) {
        showEmergencyProtocol();
        if (paused)
          return;
      }
      if (!bossWarningShown && elapsed >= bossWarningAt) {
        bossWarningShown = true;
        flash("GPT-0 \u5373\u5C06\u63A5\u5165 \xB7 \u51C6\u5907\u8FCE\u6218", "#ff9b70");
      }
      if (!bossActive && !bossDefeated && elapsed >= bossAt)
        createBoss();
      updateBullets(dt);
      if (paused || gameOver || victory)
        return;
      updateBoss(dt);
      if (paused || gameOver || victory)
        return;
      updateEffects(dt);
      updatePickups(dt);
    }
    function loop() {
      const dt = Math.min(0.05, Math.max(1e-3, Laya.timer.delta / 1e3));
      if (!(testMode && params.get("manual") === "1")) step(dt);
      hudCooldown -= dt;
      if (hudCooldown <= 0) {
        updateUI();
        syncProbe();
        hudCooldown = 0.1;
      }
    }
    if (testMode) {
      probe.test = {
        clear: () => {
          clearEntities();
          syncProbe();
        },
        clearMobs: () => {
          for (const e of enemies) e.sprite.destroy(true);
          enemies.length = 0;
          syncProbe();
        },
        fireAt: (x, y) => {
          fireBullet(x - player.x, y - player.y);
        },
        bulletStep: (seconds) => {
          for (let t = 0; t < seconds; t += 1 / 120) updateBullets(1 / 120);
          syncProbe();
        },
        scene: () => ({ boss: bossSprite ? { x: bossSprite.x, y: bossSprite.y } : null, entities: enemies.map((e) => ({ id: e.id, x: e.sprite.x, y: e.sprite.y, kind: e.kind, hp: e.hp, stunned: e.stunned })), bullets: bullets.map((b) => ({ x: b.sprite.x, y: b.sprite.y, damage: b.damage, hits: [...b.hitIds] })) }),
        ground: (x, y, r = 19) => canStandAt(x, y, r),
        los: (x, y, nx, ny) => wallHit(x, y, nx, ny, 3) === Infinity,
        xp: (n) => {
          addXP(n);
          syncProbe();
        },
        advance: (seconds) => {
          for (let t = 0; t < seconds && !paused && !gameOver && !victory; t += 1 / 60)
            step(1 / 60);
          syncProbe();
        },
        boss: () => {
          clearEntities();
          createBoss();
          syncProbe();
        },
        damage: (n) => {
          hurtCooldown = 0;
          hurtPlayer(n);
          syncProbe();
        },
        restart: () => {
          restart();
          syncProbe();
        },
        emergency: () => {
          triggerAIAnalysis();
          showEmergencyProtocol();
          syncProbe();
        },
        entities: () => enemies.map((e) => ({ id: e.id, x: e.sprite.x, y: e.sprite.y, kind: e.kind, hp: e.hp })),
        chips: () => pickups.map((p) => ({ x: p.sprite.x, y: p.sprite.y, value: p.value })),
        spawn: (kind, x, y) => {
          if (canStandAt(x, y, 26))
            enemies.push(makeEnemy(kind, x, y));
          syncProbe();
        },
        position: (x, y) => {
          if (canStandAt(x, y, PLAYER_COLLISION_RADIUS)) {
            player.pos(x, y);
            updateCamera(0, true);
          }
          syncProbe();
        }
      };
    }
    Laya.timer.frameLoop(1, null, loop);
    spawnEnemy(false);
    spawnEnemy(false);
    spawnEnemy(false);
    if (fast)
      flash("FAST\uFF1A\u81EA\u52A8\u6D4B\u8BD5 Build \u4E0E AI \u53CD\u5236\u94FE\u8DEF", "#72f5d0");
  }

  // <stdin>
  window.$_main_ = main;
})();
