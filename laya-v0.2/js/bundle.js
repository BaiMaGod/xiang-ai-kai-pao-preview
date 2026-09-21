"use strict";
(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/Entry.ts
  function main() {
    return __async(this, null, function* () {
      var _a;
      const stage = Laya.stage;
      const win = Laya.Browser.window;
      const fast = new URLSearchParams(win.location.search).get("fast") === "1";
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
        hit: "resources/art/v1/fx_hit.png"
      };
      const MAP_SVG_DATA = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="2200" viewBox="0 0 2200 2200">\n<defs>\n  <linearGradient id="base" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#07131d"/><stop offset=".55" stop-color="#0b1723"/><stop offset="1" stop-color="#050d16"/></linearGradient>\n  <linearGradient id="road" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#26333f"/><stop offset=".5" stop-color="#303d49"/><stop offset="1" stop-color="#202d39"/></linearGradient>\n  <linearGradient id="plaza" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#394753"/><stop offset="1" stop-color="#26343f"/></linearGradient>\n  <linearGradient id="bldg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#172839"/><stop offset=".6" stop-color="#0d1b29"/><stop offset="1" stop-color="#09131e"/></linearGradient>\n  <radialGradient id="core"><stop stop-color="#e8ffff"/><stop offset=".18" stop-color="#56eaff"/><stop offset=".48" stop-color="#117cff"/><stop offset="1" stop-color="#05265b"/></radialGradient>\n  <pattern id="pave" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="#283642"/><path d="M64 0H0V64" fill="none" stroke="#42515e" stroke-width="2" opacity=".25"/></pattern>\n  <pattern id="dashV" width="20" height="120" patternUnits="userSpaceOnUse"><rect x="8" y="28" width="5" height="48" rx="2" fill="#b4c6d3" opacity=".58"/></pattern>\n  <pattern id="dashH" width="120" height="20" patternUnits="userSpaceOnUse"><rect x="28" y="8" width="48" height="5" rx="2" fill="#b4c6d3" opacity=".58"/></pattern>\n  <filter id="cyanGlow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>\n  <filter id="magGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>\n</defs>\n<rect width="2200" height="2200" fill="url(#base)"/>\n<rect x="0" y="720" width="2200" height="760" fill="url(#pave)"/>\n<rect x="720" y="0" width="760" height="2200" fill="url(#pave)"/>\n\n<!-- Extra-wide four-way roads -->\n<rect x="820" y="0" width="560" height="2200" fill="url(#road)"/>\n<rect x="0" y="820" width="2200" height="560" fill="url(#road)"/>\n<rect x="1090" y="0" width="20" height="2200" fill="url(#dashV)"/>\n<rect x="0" y="1090" width="2200" height="20" fill="url(#dashH)"/>\n\n<!-- Corner futuristic building districts -->\n<g fill="url(#bldg)" stroke="#35546a" stroke-width="10">\n  <path d="M0 0H570V400L520 520H0Z"/>\n  <path d="M1630 0H2200V520H1680L1630 400Z"/>\n  <path d="M0 1680H520L570 1800V2200H0Z"/>\n  <path d="M1680 1680H2200V2200H1630V1800Z"/>\n</g>\n<g fill="none" stroke="#19dfff" stroke-width="12" opacity=".82" filter="url(#cyanGlow)">\n  <path d="M25 545H430L545 430V40"/>\n  <path d="M1655 40V430L1770 545H2170"/>\n  <path d="M25 1655H430L545 1770V2170"/>\n  <path d="M1655 2170V1770L1770 1655H2170"/>\n</g>\n<g fill="none" stroke="#ff42c8" stroke-width="10" opacity=".65" filter="url(#magGlow)">\n  <path d="M80 110H430"/><path d="M1770 110H2120"/>\n  <path d="M80 2090H430"/><path d="M1770 2090H2120"/>\n</g>\n\n<!-- Side water / utility complexes -->\n<g fill="#073049" stroke="#1686b3" stroke-width="9">\n  <path d="M0 680H260V940H0Z"/><path d="M0 1260H260V1520H0Z"/>\n  <path d="M1940 680H2200V940H1940Z"/><path d="M1940 1260H2200V1520H1940Z"/>\n</g>\n<g stroke="#45dfff" stroke-width="6" opacity=".65" fill="none">\n  <path d="M20 725Q120 690 245 740T245 890Q120 930 20 885"/>\n  <path d="M20 1315Q120 1280 245 1330T245 1475Q120 1510 20 1465"/>\n  <path d="M1960 725Q2060 690 2180 740T2180 890Q2060 930 1960 885"/>\n  <path d="M1960 1315Q2060 1280 2180 1330T2180 1475Q2060 1510 1960 1465"/>\n</g>\n\n<!-- Neon transit bridges -->\n<g fill="#102738" stroke="#32dfff" stroke-width="8">\n  <rect x="610" y="255" width="210" height="58" rx="18"/><rect x="1380" y="255" width="210" height="58" rx="18"/>\n  <rect x="610" y="1887" width="210" height="58" rx="18"/><rect x="1380" y="1887" width="210" height="58" rx="18"/>\n</g>\n\n<!-- Central open battle plaza -->\n<circle cx="1100" cy="1100" r="565" fill="url(#plaza)" stroke="#597080" stroke-width="10"/>\n<circle cx="1100" cy="1100" r="455" fill="none" stroke="#56dfff" stroke-width="8" opacity=".55"/>\n<circle cx="1100" cy="1100" r="350" fill="none" stroke="#a6c2d1" stroke-width="5" opacity=".32"/>\n<circle cx="1100" cy="1100" r="215" fill="#1d2c38" stroke="#34e4ff" stroke-width="8" opacity=".95"/>\n\n<!-- Central energy core (solid gameplay obstacle) -->\n<circle cx="1100" cy="1100" r="122" fill="#071c3d" stroke="#56eeff" stroke-width="14" filter="url(#cyanGlow)"/>\n<circle cx="1100" cy="1100" r="76" fill="url(#core)" stroke="#bafcff" stroke-width="7"/>\n<path d="M1100 960V1015M1100 1185V1240M960 1100H1015M1185 1100H1240" stroke="#58eaff" stroke-width="14" filter="url(#cyanGlow)"/>\n\n<!-- Large decorative planters: deliberately NON-collidable -->\n<g fill="#193d32" stroke="#50c999" stroke-width="5" opacity=".95">\n  <path d="M730 730H900L940 775L900 820H730L690 775Z"/>\n  <path d="M1300 730H1470L1510 775L1470 820H1300L1260 775Z"/>\n  <path d="M730 1380H900L940 1425L900 1470H730L690 1425Z"/>\n  <path d="M1300 1380H1470L1510 1425L1470 1470H1300L1260 1425Z"/>\n</g>\n\n<!-- Sci-fi towers and rooftop machinery on blocked corners -->\n<g fill="#12283a" stroke="#42677e" stroke-width="7">\n  <circle cx="245" cy="250" r="105"/><circle cx="1955" cy="250" r="105"/>\n  <circle cx="245" cy="1950" r="105"/><circle cx="1955" cy="1950" r="105"/>\n  <rect x="70" y="390" width="260" height="90" rx="20"/><rect x="1870" y="390" width="260" height="90" rx="20"/>\n  <rect x="70" y="1720" width="260" height="90" rx="20"/><rect x="1870" y="1720" width="260" height="90" rx="20"/>\n</g>\n<g fill="#28ddff" filter="url(#cyanGlow)">\n  <circle cx="245" cy="250" r="26"/><circle cx="1955" cy="250" r="26"/><circle cx="245" cy="1950" r="26"/><circle cx="1955" cy="1950" r="26"/>\n</g>\n<g fill="#ff3fc8" opacity=".8">\n  <rect x="85" y="425" width="100" height="12" rx="6"/><rect x="2015" y="425" width="100" height="12" rx="6"/>\n  <rect x="85" y="1755" width="100" height="12" rx="6"/><rect x="2015" y="1755" width="100" height="12" rx="6"/>\n</g>\n\n<!-- Road edge cyan strips -->\n<g stroke="#36e2ff" stroke-width="7" opacity=".72" filter="url(#cyanGlow)">\n  <path d="M815 0V650M815 1550V2200M1385 0V650M1385 1550V2200"/>\n  <path d="M0 815H650M1550 815H2200M0 1385H650M1550 1385H2200"/>\n</g>\n\n<!-- Tiny cars / lights are decorative only -->\n<g fill="#263f51" stroke="#66dfff" stroke-width="3">\n  <rect x="900" y="560" width="70" height="34" rx="10"/><rect x="1260" y="720" width="70" height="34" rx="10"/>\n  <rect x="720" y="1190" width="70" height="34" rx="10"/><rect x="1420" y="1230" width="70" height="34" rx="10"/>\n  <rect x="980" y="1570" width="70" height="34" rx="10"/><rect x="1220" y="1680" width="70" height="34" rx="10"/>\n</g>\n<g fill="#5bf0ff" opacity=".8"><circle cx="660" cy="660" r="7"/><circle cx="1540" cy="660" r="7"/><circle cx="660" cy="1540" r="7"/><circle cx="1540" cy="1540" r="7"/></g>\n\n<!-- World edge -->\n<rect x="5" y="5" width="2190" height="2190" fill="none" stroke="#143048" stroke-width="10"/>\n</svg>');
      const artUrls = Object.values(ART);
      const artLoadFailures = [];
      try {
        yield Laya.loader.load(artUrls);
      } catch (err) {
        console.warn("V1 art preload reported an error", err);
      }
      for (const url of artUrls) {
        if (!Laya.loader.getRes(url)) artLoadFailures.push(url);
      }
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
        if (Laya.Browser.onMobile) stage.screenMode = Laya.Stage.SCREEN_VERTICAL;
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
      if ((doc == null ? void 0 : doc.documentElement) && (doc == null ? void 0 : doc.body)) {
        let viewportMeta = doc.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
          viewportMeta = doc.createElement("meta");
          viewportMeta.name = "viewport";
          (_a = doc.head) == null ? void 0 : _a.appendChild(viewportMeta);
        }
        viewportMeta.setAttribute(
          "content",
          "width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
        );
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
      const W = Math.max(1, stage.width);
      const H = Math.max(1, stage.height);
      const margin = 34;
      const playTop = 150;
      const playBottom = H - 50;
      const WORLD_WIDTH = 2200;
      const WORLD_HEIGHT = 2200;
      const WORLD_MARGIN = 54;
      const deadLeft = Math.max(120, W * 0.25);
      const deadRight = Math.min(W - 120, W * 0.7);
      const deadTop = Math.max(playTop + 70, H * 0.3);
      const deadBottom = Math.min(H - 90, H * 0.72);
      const PLAYER_COLLISION_RADIUS = 19;
      const PLAYER_START_X = WORLD_WIDTH * 0.5;
      const PLAYER_START_Y = WORLD_HEIGHT * 0.5 + 245;
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
        { kind: "circle", id: "ENERGY_CORE", x: 1100, y: 1100, r: 126 }
      ];
      const world = new Laya.Sprite();
      stage.addChild(world);
      drawWorld();
      const player = new Laya.Sprite();
      const playerVisual = drawPlayer(player);
      player.pos(PLAYER_START_X, PLAYER_START_Y);
      world.addChild(player);
      let cameraX = Math.max(0, Math.min(WORLD_WIDTH - W, player.x - W * 0.5));
      let cameraY = Math.max(0, Math.min(WORLD_HEIGHT - H, player.y - H * 0.58));
      let cameraTargetX = cameraX;
      let cameraTargetY = cameraY;
      world.pos(-cameraX, -cameraY);
      const weaponSprite = new Laya.Sprite();
      weaponSprite.visible = false;
      player.addChild(weaponSprite);
      const enemies = [];
      const bullets = [];
      const pickups = [];
      const keys = {};
      let gameStarted = fast;
      let startGameAction = null;
      let webStartButton = null;
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
      let fireInterval = 0.25;
      let moveSpeed = 255;
      let pickupRadius = fast ? 260 : 95;
      let evolved = false;
      let levelChoiceCount = 0;
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
      let bossMaxHp = fast ? 72 : 2800;
      let bossHp = bossMaxHp;
      let bossSprite = null;
      let bossSkillCooldown = 0;
      let bossWarningShown = false;
      let victory = false;
      const analysisAt = fast ? 2.2 : 120;
      const emergencyEarliest = fast ? 3.1 : 128;
      const bossWarningAt = fast ? 4.7 : 270;
      const bossAt = fast ? 5.6 : 300;
      const ui = createUI();
      const modalLayer = new Laya.Sprite();
      stage.addChild(modalLayer);
      const startLayer = new Laya.Sprite();
      stage.addChild(startLayer);
      const probe = {
        ready: true,
        stageWidth: W,
        stageHeight: H,
        engine: "LayaAir",
        engineVersion: "3.4.0",
        version: "0.8.0-map-collision-nav",
        artVersion: "v1-runtime-baked-v2",
        animationVersion: "frame-clips-v3",
        layoutVersion: "large-world-camera-collision-v2",
        mobilePortraitLayout,
        viewportWidth: viewportW,
        viewportHeight: viewportH,
        designWidth: stage.designWidth,
        designHeight: stage.designHeight,
        artLoadFailures,
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
        collisionVersion: "city-plaza-v1",
        collisionZones: COLLISION_ZONES.length,
        playerCollisionRadius: PLAYER_COLLISION_RADIUS,
        enemyObstacleAvoidance: true,
        bulletWorldCollision: true
      };
      win.__XIANG_AI_LAYA__ = probe;
      if (!fast) showStartScreen();
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
        const art = new Laya.Sprite();
        const sx = targetW / sourceW;
        const sy = targetH / sourceH;
        const ready = !!Laya.loader.getRes(url);
        art.size(sourceW, sourceH);
        art.pivot(sourceW * 0.5, sourceH * 0.5);
        art.pos(offsetX, offsetY);
        art.scale(sx, sy);
        art.mouseEnabled = false;
        art.__baseScaleX = sx;
        art.__baseScaleY = sy;
        art.__artReady = ready;
        if (ready) {
          art.loadImage(url);
        } else {
          art.graphics.drawRoundRect(16, 16, sourceW - 32, sourceH - 32, 14, "#8a1f2e", "#ff7788", 4);
          art.graphics.drawCircle(sourceW * 0.5, sourceH * 0.5, Math.min(sourceW, sourceH) * 0.18, "#ffcf5a");
          art.graphics.drawLine(sourceW * 0.5, sourceH * 0.38, sourceW * 0.5, sourceH * 0.57, "#381018", 7);
          art.graphics.drawCircle(sourceW * 0.5, sourceH * 0.68, 4, "#381018");
        }
        parent.addChild(art);
        return art;
      }
      const texturePartCache = /* @__PURE__ */ new Map();
      function attachTexturePart(parent, url, sourceX, sourceY, sourceW, sourceH, targetW, targetH, offsetX = 0, offsetY = 0) {
        const base = Laya.loader.getRes(url);
        if (!base) return null;
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
      function showFrame(owner, frames, index) {
        if (!frames || frames.length === 0) return;
        const n = frames.length;
        const normalized = (Math.floor(index) % n + n) % n;
        const next = frames[normalized];
        if (owner.currentFrame === next) return;
        if (owner.currentFrame) owner.currentFrame.visible = false;
        next.visible = true;
        owner.currentFrame = next;
        owner.currentFrameIndex = normalized;
      }
      function setPlayerClip(visual, clip, frameIndex) {
        visual.currentClip = clip;
        if (!visual.animated) return;
        showFrame(visual, visual.clips[clip], frameIndex);
      }
      function spawnHitFx(x, y) {
        const fx = new Laya.Sprite();
        attachArt(fx, ART.hit, 64, 64, 34, 34);
        fx.pos(x, y);
        fx.rotation = Math.random() * 360;
        fx.alpha = 0.95;
        world.addChild(fx);
        Laya.timer.once(95, null, () => {
          fx.removeSelf();
          fx.destroy();
        });
      }
      function drawWorld() {
        const bg = new Laya.Sprite();
        bg.graphics.drawRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT, "#07131f");
        world.addChild(bg);
        const map = new Laya.Sprite();
        map.loadImage(MAP_SVG_DATA, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
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
        shadow.graphics.drawEllipse(-25, 25, 50, 16, "#00000066");
        shadow.mouseEnabled = false;
        s.addChild(shadow);
        const pose = new Laya.Sprite();
        pose.pos(0, -5);
        s.addChild(pose);
        const clips = { idle: [], run: [], fire: [], hurt: [] };
        const baseReady = !!Laya.loader.getRes(ART.player);
        const sourceW = 160;
        const sourceH = 180;
        const sx = 78 / sourceW;
        const sy = 88 / sourceH;
        const makeMaskedPart = (parent, maskX, maskY, maskW, maskH, pivotX, pivotY, outX, outY) => {
          if (!baseReady) return null;
          const holder = new Laya.Sprite();
          holder.pos(outX, outY);
          parent.addChild(holder);
          const art = new Laya.Sprite();
          art.size(sourceW, sourceH);
          art.pivot(pivotX, pivotY);
          art.scale(sx, sy);
          art.loadImage(ART.player);
          art.mouseEnabled = false;
          const mask = new Laya.Sprite();
          mask.graphics.drawRect(maskX, maskY, maskW, maskH, "#ffffff");
          art.mask = mask;
          holder.addChild(art);
          return holder;
        };
        const makeFrame = (mode, index, count) => {
          var _a2;
          if (!baseReady) return null;
          const phase = index / count * Math.PI * 2;
          const frame = new Laya.Sprite();
          frame.visible = false;
          pose.addChild(frame);
          const body = makeMaskedPart(frame, 0, 0, 160, 132, 80, 90, 0, -6);
          const legL = makeMaskedPart(frame, 28, 112, 62, 68, 62, 121, -8, 15);
          const legR = makeMaskedPart(frame, 72, 112, 66, 68, 102, 121, 8, 15);
          if (!body || !legL || !legR) {
            frame.removeSelf();
            frame.destroy(true);
            return null;
          }
          if (mode === "idle") {
            const breathe = Math.sin(phase);
            body.y = -6 - Math.abs(breathe) * 0.7;
            body.rotation = breathe * 0.5;
            legL.rotation = breathe * 1.8;
            legR.rotation = -breathe * 1.8;
          } else if (mode === "run") {
            const step = Math.sin(phase);
            const lift = Math.abs(Math.sin(phase * 0.5));
            body.y = -6 - lift * 1.7;
            body.rotation = step * 1.6;
            legL.rotation = step * 24;
            legR.rotation = -step * 24;
            legL.y = 15 + Math.max(0, -step) * 2.6;
            legR.y = 15 + Math.max(0, step) * 2.6;
            legL.x = -8 + step * 1.3;
            legR.x = 8 - step * 1.3;
          } else if (mode === "fire") {
            const recoil = (_a2 = [0, 1, 0.55, 0.18][index]) != null ? _a2 : 0;
            body.x = -recoil * 2.8;
            body.rotation = -recoil * 2.6;
            legL.x = -8 - recoil * 0.7;
            legR.x = 8 - recoil * 0.7;
            frame.scaleX = 1 - recoil * 0.015;
            frame.scaleY = 1 + recoil * 0.015;
          } else {
            const hit = index === 0 ? -1 : 1;
            frame.rotation = hit * 4;
            frame.x = hit * 2;
            frame.alpha = index === 0 ? 0.7 : 0.92;
          }
          return frame;
        };
        for (let i = 0; i < 4; i++) {
          const frame = makeFrame("idle", i, 4);
          if (frame) clips.idle.push(frame);
        }
        for (let i = 0; i < 8; i++) {
          const frame = makeFrame("run", i, 8);
          if (frame) clips.run.push(frame);
        }
        for (let i = 0; i < 4; i++) {
          const frame = makeFrame("fire", i, 4);
          if (frame) clips.fire.push(frame);
        }
        for (let i = 0; i < 2; i++) {
          const frame = makeFrame("hurt", i, 2);
          if (frame) clips.hurt.push(frame);
        }
        const animated = clips.idle.length === 4 && clips.run.length === 8 && clips.fire.length === 4 && clips.hurt.length === 2;
        let fallbackArt = null;
        if (!animated) {
          pose.removeChildren();
          fallbackArt = attachArt(pose, ART.player, 160, 180, 78, 88, 0, -7);
        }
        const ring = new Laya.Sprite();
        ring.graphics.drawCircle(0, 28, 29, null, "#41e7e0aa", 2);
        ring.mouseEnabled = false;
        s.addChildAt(ring, 0);
        const visual = {
          pose,
          shadow,
          ring,
          clips,
          animated,
          fallbackArt,
          currentFrame: null,
          currentFrameIndex: -1,
          currentClip: "idle"
        };
        if (animated) setPlayerClip(visual, "idle", 0);
        return visual;
      }
      function createUI() {
        const hud = new Laya.Sprite();
        hud.graphics.drawRect(0, 0, W, 100, "#071421ee");
        stage.addChild(hud);
        const title = makeText("向AI开炮 · 2D Vertical Slice", 25, "#ffffff", true);
        title.pos(18, 11);
        hud.addChild(title);
        const hpText = makeText("", 17, "#9fe8d9", true);
        hpText.pos(18, 48);
        hud.addChild(hpText);
        const statText = makeText("", 16, "#c7d3dc");
        statText.width = Math.max(200, W - 230);
        statText.align = "right";
        statText.pos(215, 50);
        hud.addChild(statText);
        const xpBg = new Laya.Sprite();
        xpBg.graphics.drawRoundRect(18, 78, W - 36, 10, 5, "#162a3b");
        hud.addChild(xpBg);
        const xpBar = new Laya.Sprite();
        hud.addChild(xpBar);
        const aiText = makeText("AI 学习度 0%", 15, "#8da5b8", true);
        aiText.pos(18, 108);
        stage.addChild(aiText);
        const aiBg = new Laya.Sprite();
        aiBg.graphics.drawRoundRect(18, 132, W - 36, 10, 5, "#15283a");
        stage.addChild(aiBg);
        const aiBar = new Laya.Sprite();
        stage.addChild(aiBar);
        const bossText = makeText("", 16, "#ff8fa0", true);
        bossText.width = W - 36;
        bossText.align = "center";
        bossText.pos(18, 151);
        bossText.visible = false;
        stage.addChild(bossText);
        const bossBarBg = new Laya.Sprite();
        bossBarBg.graphics.drawRoundRect(48, 176, W - 96, 12, 6, "#351521");
        bossBarBg.visible = false;
        stage.addChild(bossBarBg);
        const bossBar = new Laya.Sprite();
        bossBar.visible = false;
        stage.addChild(bossBar);
        const message = makeText("", 21, "#ffffff", true);
        message.width = W - 30;
        message.align = "center";
        message.pos(15, 198);
        stage.addChild(message);
        const buildText = makeText("", 15, "#6f8ca1");
        buildText.width = W - 36;
        buildText.pos(18, H - 47);
        stage.addChild(buildText);
        const floating = new Laya.Sprite();
        stage.addChild(floating);
        return {
          hud,
          hpText,
          statText,
          xpBar,
          aiText,
          aiBar,
          bossText,
          bossBarBg,
          bossBar,
          message,
          buildText,
          floating
        };
      }
      function showStartScreen() {
        paused = true;
        startLayer.removeChildren();
        const shade = new Laya.Sprite();
        shade.graphics.drawRect(0, 0, W, H, "#02070ded");
        startLayer.addChild(shade);
        const badge = makeText("HUMANITY // LAST STAND", 15, "#54e2c7", true);
        badge.width = W;
        badge.align = "center";
        badge.pos(0, H * 0.24);
        startLayer.addChild(badge);
        const t = makeText("向AI开炮", 52, "#ffffff", true);
        t.width = W;
        t.align = "center";
        t.pos(0, H * 0.3);
        startLayer.addChild(t);
        const sub = makeText("你在学习怎么杀AI，AI也在学习怎么杀你。", 19, "#a8bccb", true);
        sub.width = W - 50;
        sub.align = "center";
        sub.pos(25, H * 0.39);
        startLayer.addChild(sub);
        const cardW = Math.min(430, W - 56);
        const cardX = (W - cardW) * 0.5;
        const card = new Laya.Sprite();
        card.graphics.drawRoundRect(cardX, H * 0.47, cardW, 170, 22, "#0c1d2c");
        startLayer.addChild(card);
        const intro = makeText(
          "老王，物业电工。\n初始武器：工业高压射钉枪\n\n移动：WASD / 方向键 / 手机拖动\n攻击：自动锁定",
          18,
          "#d4e1e9"
        );
        intro.leading = 9;
        intro.pos(cardX + 24, H * 0.47 + 23);
        startLayer.addChild(intro);
        const bw = Math.min(360, W - 70);
        const bx = (W - bw) * 0.5;
        const by = H * 0.68;
        const button = new Laya.Sprite();
        button.name = "StartResistanceButton";
        button.pos(bx, by);
        button.size(bw, 72);
        button.hitArea = new Laya.Rectangle(0, 0, bw, 72);
        button.alpha = 1;
        button.zOrder = 1e3;
        button.graphics.drawRect(0, 0, bw, 72, "#45E0BD", "#D9FFF6", 4);
        button.graphics.drawRect(7, 7, bw - 14, 58, "#62F0CF");
        button.mouseEnabled = true;
        startLayer.addChild(button);
        const bt = makeText("▶  开始反抗", 26, "#05191A", true);
        bt.width = bw;
        bt.height = 72;
        bt.align = "center";
        bt.valign = "middle";
        bt.mouseEnabled = false;
        button.addChild(bt);
        const hint = makeText("点击按钮 / 按 Enter 或 Space 开始", 15, "#C5D7E1", true);
        hint.width = bw;
        hint.align = "center";
        hint.pos(bx, by + 86);
        startLayer.addChild(hint);
        const startGame = () => {
          if (gameStarted) return;
          startLayer.offAll();
          startLayer.removeChildren();
          startGameAction = null;
          if (webStartButton) {
            webStartButton.remove();
            webStartButton = null;
          }
          gameStarted = true;
          paused = false;
          probe.running = true;
          probe.startScreen = false;
          flash("老王：智能是吧？先交物业费。", "#ffd77b");
        };
        startGameAction = startGame;
        probe.startScreen = true;
        probe.startButton = { x: bx, y: by, width: bw, height: 72 };
        const doc2 = win.document;
        if (doc2 == null ? void 0 : doc2.body) {
          const domBtn = doc2.createElement("button");
          domBtn.id = "start-game-dom";
          domBtn.type = "button";
          domBtn.textContent = "▶  开始反抗";
          domBtn.setAttribute("aria-label", "开始反抗");
          domBtn.style.position = "fixed";
          domBtn.style.left = "50%";
          domBtn.style.top = "69%";
          domBtn.style.transform = "translate(-50%, -50%)";
          domBtn.style.width = "min(360px, calc(100vw - 70px))";
          domBtn.style.height = "72px";
          domBtn.style.border = "4px solid #D9FFF6";
          domBtn.style.borderRadius = "18px";
          domBtn.style.background = "#58E8C9";
          domBtn.style.color = "#06191A";
          domBtn.style.fontSize = "26px";
          domBtn.style.fontWeight = "800";
          domBtn.style.fontFamily = "Arial, sans-serif";
          domBtn.style.cursor = "pointer";
          domBtn.style.zIndex = "2147483647";
          domBtn.style.boxShadow = "0 0 0 6px rgba(88,232,201,.14)";
          domBtn.style.touchAction = "manipulation";
          domBtn.addEventListener("pointerdown", () => {
            domBtn.style.transform = "translate(-50%, -50%) scale(.97)";
          });
          domBtn.addEventListener("pointerup", () => {
            domBtn.style.transform = "translate(-50%, -50%) scale(1)";
          });
          domBtn.addEventListener("pointercancel", () => {
            domBtn.style.transform = "translate(-50%, -50%) scale(1)";
          });
          domBtn.addEventListener("click", startGame);
          doc2.body.appendChild(domBtn);
          webStartButton = domBtn;
          probe.webStartButton = true;
        }
        startLayer.size(W, H);
        startLayer.hitArea = new Laya.Rectangle(0, 0, W, H);
        startLayer.mouseEnabled = true;
        startLayer.on(Laya.Event.CLICK, null, startGame);
        button.on(Laya.Event.MOUSE_DOWN, null, () => {
          button.alpha = 0.78;
        });
        button.on(Laya.Event.MOUSE_UP, null, () => {
          button.alpha = 1;
        });
        button.on(Laya.Event.MOUSE_OUT, null, () => {
          button.alpha = 1;
        });
        button.on(Laya.Event.CLICK, null, startGame);
        const keyboardStart = (ev) => {
          const key = String(ev.key || "").toLowerCase();
          if (!gameStarted && (key === "enter" || key === " " || key === "spacebar")) {
            startGame();
          }
        };
        win.addEventListener("keydown", keyboardStart);
      }
      function requiredXP(lv) {
        return 7 + lv * 4;
      }
      function enemyCost(kind) {
        if (kind === "vacuum") return 1;
        if (kind === "delivery") return 1.7;
        if (kind === "dog") return 2;
        return 3;
      }
      function spawnRate() {
        const t = elapsed;
        let r = t < 30 ? 1 : t < 60 ? 1.45 : t < 120 ? 2.1 : t < 180 ? 3 : 3.8;
        if (aiAnalyzed) r *= 1.12;
        if (fast) r *= 4.2;
        return r;
      }
      function chooseEnemyKind(forceShield = false) {
        if (forceShield) return "shield";
        if (aiAnalyzed && Math.random() < 0.3) return "shield";
        const r = Math.random();
        if (elapsed < 30) return r < 0.78 ? "vacuum" : "delivery";
        if (elapsed < 65) return r < 0.54 ? "vacuum" : r < 0.82 ? "delivery" : "dog";
        return r < 0.34 ? "vacuum" : r < 0.62 ? "delivery" : "dog";
      }
      function makeEnemy(kind, x, y) {
        const s = new Laya.Sprite();
        const shadow = new Laya.Sprite();
        shadow.graphics.drawEllipse(-24, 17, 48, 14, "#00000066");
        shadow.mouseEnabled = false;
        s.addChild(shadow);
        const pose = new Laya.Sprite();
        s.addChild(pose);
        const visual = new Laya.Sprite();
        pose.addChild(visual);
        let frames = [];
        let artReady = true;
        const addFullFrame = (url, sourceW, sourceH, targetW, targetH, phase, baseY) => {
          const frame = new Laya.Sprite();
          frame.visible = false;
          visual.addChild(frame);
          const art2 = attachArt(frame, url, sourceW, sourceH, targetW, targetH, 0, baseY);
          if (!art2 || art2.__artReady === false) {
            frame.removeSelf();
            frame.destroy(true);
            return null;
          }
          const step = Math.sin(phase);
          frame.rotation = step * 1.1;
          frame.y = -Math.abs(Math.sin(phase * 0.5)) * 1.2;
          return frame;
        };
        if (kind === "vacuum") {
          for (let i = 0; i < 4; i++) {
            const frame = addFullFrame(ART.vacuum, 128, 128, 58, 58, i / 4 * Math.PI * 2, -5);
            if (frame) frames.push(frame);
          }
          artReady = frames.length === 4;
        } else if (kind === "delivery") {
          for (let i = 0; i < 6; i++) {
            const phase = i / 6 * Math.PI * 2;
            const frame = new Laya.Sprite();
            frame.visible = false;
            visual.addChild(frame);
            const body = attachTexturePart(frame, ART.delivery, 0, 0, 132, 96, 62, 45, 0, -10);
            const wheelL = attachTexturePart(frame, ART.delivery, 4, 72, 52, 56, 24, 26, -16, 11);
            const wheelR = attachTexturePart(frame, ART.delivery, 76, 72, 52, 56, 24, 26, 16, 11);
            if (!body || !wheelL || !wheelR) {
              frame.removeSelf();
              frame.destroy(true);
              continue;
            }
            const wheelAngle = i * 60;
            const bump = Math.abs(Math.sin(phase));
            wheelL.rotation = wheelAngle;
            wheelR.rotation = wheelAngle;
            body.y = -10 - bump * 1;
            frame.y = -bump * 0.8;
            frames.push(frame);
          }
          artReady = frames.length === 6;
        } else if (kind === "dog") {
          for (let i = 0; i < 8; i++) {
            const phase = i / 8 * Math.PI * 2;
            const step = Math.sin(phase);
            const frame = new Laya.Sprite();
            frame.visible = false;
            visual.addChild(frame);
            const body = attachTexturePart(frame, ART.dog, 0, 0, 148, 100, 70, 47, 0, -12);
            const legA = attachTexturePart(frame, ART.dog, 16, 70, 58, 58, 27, 27, -14, 11);
            const legB = attachTexturePart(frame, ART.dog, 74, 70, 58, 58, 27, 27, 14, 11);
            if (!body || !legA || !legB) {
              frame.removeSelf();
              frame.destroy(true);
              continue;
            }
            body.rotation = step * 1.5;
            body.y = -12 - Math.abs(Math.sin(phase * 0.5)) * 1.6;
            legA.rotation = step * 30;
            legB.rotation = -step * 30;
            legA.y = 11 + Math.max(0, -step) * 2.5;
            legB.y = 11 + Math.max(0, step) * 2.5;
            frames.push(frame);
          }
          artReady = frames.length === 8;
        } else {
          for (let i = 0; i < 6; i++) {
            const frame = addFullFrame(ART.shield, 102, 120, 66, 78, i / 6 * Math.PI * 2, -8);
            if (frame) frames.push(frame);
          }
          artReady = frames.length === 6;
        }
        let art = visual;
        let currentFrame = null;
        if (!artReady) {
          pose.removeChildren();
          const fallbackUrl = kind === "vacuum" ? ART.vacuum : kind === "delivery" ? ART.delivery : kind === "dog" ? ART.dog : ART.shield;
          const dims = {
            vacuum: [128, 128, 58, 58, -5],
            delivery: [132, 128, 62, 60, -5],
            dog: [148, 128, 70, 61, -8],
            shield: [102, 120, 66, 78, -8]
          };
          const d2 = dims[kind];
          art = attachArt(pose, fallbackUrl, d2[0], d2[1], d2[2], d2[3], 0, d2[4]);
          frames = [];
          shadow.visible = false;
          console.warn("Enemy frame art fallback:", kind);
        } else {
          currentFrame = frames[0];
          currentFrame.visible = true;
          shadow.visible = true;
        }
        s.pos(x, y);
        world.addChild(s);
        const data = {
          vacuum: [20, 60, 19],
          delivery: [42, 45, 22],
          dog: [34, 86, 21],
          shield: [78, 42, 24]
        };
        const d = data[kind];
        return {
          sprite: s,
          pose,
          art,
          shadow,
          kind,
          hp: d[0],
          maxHp: d[0],
          speed: d[1],
          radius: d[2],
          shield: kind === "shield",
          stunned: 0,
          contactCd: 0,
          animTime: Math.random() * Math.PI * 2,
          partA: null,
          partB: null,
          frames,
          currentFrame,
          currentFrameIndex: 0
        };
      }
      function spawnEnemy(forceShield = false) {
        if (enemies.length >= 180) return;
        const kind = chooseEnemyKind(forceShield);
        const pad = 100;
        const spawnRadius = kind === "shield" ? 25 : 21;
        let chosenX = NaN;
        let chosenY = NaN;
        for (let attempt = 0; attempt < 18; attempt++) {
          const candidates = [];
          if (cameraX - pad > WORLD_MARGIN) {
            candidates.push({
              x: cameraX - pad,
              y: clamp(cameraY + 70 + Math.random() * Math.max(40, H - 140), WORLD_MARGIN, WORLD_HEIGHT - WORLD_MARGIN)
            });
          }
          if (cameraX + W + pad < WORLD_WIDTH - WORLD_MARGIN) {
            candidates.push({
              x: cameraX + W + pad,
              y: clamp(cameraY + 70 + Math.random() * Math.max(40, H - 140), WORLD_MARGIN, WORLD_HEIGHT - WORLD_MARGIN)
            });
          }
          if (cameraY - pad > WORLD_MARGIN) {
            candidates.push({
              x: clamp(cameraX + 60 + Math.random() * Math.max(40, W - 120), WORLD_MARGIN, WORLD_WIDTH - WORLD_MARGIN),
              y: cameraY - pad
            });
          }
          if (cameraY + H + pad < WORLD_HEIGHT - WORLD_MARGIN) {
            candidates.push({
              x: clamp(cameraX + 60 + Math.random() * Math.max(40, W - 120), WORLD_MARGIN, WORLD_WIDTH - WORLD_MARGIN),
              y: cameraY + H + pad
            });
          }
          if (!candidates.length) break;
          const p = candidates[Math.floor(Math.random() * candidates.length)];
          const pdx = p.x - player.x;
          const pdy = p.y - player.y;
          if (pdx * pdx + pdy * pdy < 240 * 240) continue;
          if (!canStandAt(p.x, p.y, spawnRadius)) continue;
          chosenX = p.x;
          chosenY = p.y;
          break;
        }
        if (!Number.isFinite(chosenX)) {
          for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.max(W, H) * (0.55 + Math.random() * 0.2);
            const x = clamp(player.x + Math.cos(angle) * radius, WORLD_MARGIN + 30, WORLD_WIDTH - WORLD_MARGIN - 30);
            const y = clamp(player.y + Math.sin(angle) * radius, WORLD_MARGIN + 30, WORLD_HEIGHT - WORLD_MARGIN - 30);
            if (canStandAt(x, y, spawnRadius)) {
              chosenX = x;
              chosenY = y;
              break;
            }
          }
        }
        if (!Number.isFinite(chosenX)) return;
        enemies.push(makeEnemy(kind, chosenX, chosenY));
        if (kind === "shield") shieldSpawned++;
      }
      function spawnPickup(x, y, value) {
        const s = new Laya.Sprite();
        attachArt(s, ART.xp, 56, 56, 29, 29);
        s.pos(x, y);
        world.addChild(s);
        pickups.push({ sprite: s, value: fast ? value * 3 : value, life: 18 });
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
      function buildPool() {
        return [
          { id: "NAIL", name: "高压射钉枪", desc: "伤害 +4；LV3 后产生额外弹道" },
          { id: "PRINTER", name: "弹药打印机", desc: "射速 +13%；与射钉枪 LV3 可进化" },
          { id: "MAGNET", name: "拾取磁场", desc: "经验芯片吸附范围 +34" },
          { id: "EXO", name: "物业外骨骼", desc: "减伤 +8%，并恢复 12 HP" }
        ];
      }
      function pickBuildOptions() {
        const pool = buildPool();
        const out = [];
        while (pool.length && out.length < 3) {
          out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        }
        return out;
      }
      function applyBuild(id) {
        if (id === "NAIL") {
          nailLevel++;
          nailDamage += 4;
        } else if (id === "PRINTER") {
          printerLevel++;
          fireInterval = Math.max(0.095, fireInterval * 0.87);
        } else if (id === "MAGNET") {
          magnetLevel++;
          pickupRadius += 34;
        } else if (id === "EXO") {
          exoLevel++;
          armor = Math.min(0.4, armor + 0.08);
          hp = Math.min(maxHp, hp + 12);
        }
        if (!evolved && nailLevel >= 3 && printerLevel >= 3) {
          evolved = true;
          flash("武器进化：无限弹幕！", "#72f5d0");
        }
      }
      function autoBuildForFast() {
        const seq = ["NAIL", "PRINTER", "NAIL", "PRINTER", "NAIL", "PRINTER", "MAGNET", "EXO"];
        const id = seq[levelChoiceCount % seq.length];
        levelChoiceCount++;
        return id;
      }
      function clearWebModal() {
        if (webModalOverlay) {
          webModalOverlay.remove();
          webModalOverlay = null;
        }
        probe.modalType = "";
      }
      function showWebChoiceModal(type, title, subtitle, choices, onChoose) {
        const doc2 = win.document;
        if (!(doc2 == null ? void 0 : doc2.body)) return false;
        clearWebModal();
        const overlay = doc2.createElement("div");
        overlay.id = "game-choice-modal";
        overlay.dataset.modalType = type;
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.padding = "20px";
        overlay.style.boxSizing = "border-box";
        overlay.style.background = "rgba(2,7,13,.86)";
        overlay.style.zIndex = "2147483646";
        overlay.style.fontFamily = "Arial, sans-serif";
        overlay.style.userSelect = "none";
        overlay.style.touchAction = "manipulation";
        const panel = doc2.createElement("div");
        panel.style.width = "min(500px, calc(100vw - 34px))";
        panel.style.padding = "26px 22px 22px";
        panel.style.boxSizing = "border-box";
        panel.style.border = "2px solid rgba(116,235,213,.34)";
        panel.style.borderRadius = "24px";
        panel.style.background = "linear-gradient(180deg,#10283a 0%,#091521 100%)";
        panel.style.boxShadow = "0 20px 80px rgba(0,0,0,.55)";
        overlay.appendChild(panel);
        const h = doc2.createElement("div");
        h.textContent = title;
        h.style.color = "#FFFFFF";
        h.style.fontSize = "30px";
        h.style.fontWeight = "800";
        h.style.textAlign = "center";
        panel.appendChild(h);
        if (subtitle) {
          const sub = doc2.createElement("div");
          sub.textContent = subtitle;
          sub.style.color = "#9FB5C5";
          sub.style.fontSize = "16px";
          sub.style.lineHeight = "1.45";
          sub.style.textAlign = "center";
          sub.style.margin = "10px 0 20px";
          panel.appendChild(sub);
        }
        const list = doc2.createElement("div");
        list.style.display = "grid";
        list.style.gap = "12px";
        panel.appendChild(list);
        choices.forEach((choice, index) => {
          const b = doc2.createElement("button");
          b.type = "button";
          b.className = "game-choice-button";
          b.dataset.choiceId = choice.id;
          b.style.width = "100%";
          b.style.minHeight = "78px";
          b.style.padding = "12px 16px 12px 20px";
          b.style.boxSizing = "border-box";
          b.style.border = "2px solid #28536C";
          b.style.borderLeft = "7px solid " + (choice.accent || "#58E8C9");
          b.style.borderRadius = "14px";
          b.style.background = "#17344A";
          b.style.color = "#FFFFFF";
          b.style.textAlign = "left";
          b.style.cursor = "pointer";
          b.style.touchAction = "manipulation";
          const name = doc2.createElement("div");
          name.textContent = index + 1 + ". " + choice.name;
          name.style.fontSize = "20px";
          name.style.fontWeight = "800";
          b.appendChild(name);
          const desc = doc2.createElement("div");
          desc.textContent = choice.desc;
          desc.style.color = "#A9BECC";
          desc.style.fontSize = "15px";
          desc.style.marginTop = "6px";
          b.appendChild(desc);
          b.addEventListener("pointerdown", () => {
            b.style.transform = "scale(.985)";
            b.style.background = "#20506B";
          });
          b.addEventListener("pointerup", () => {
            b.style.transform = "scale(1)";
            b.style.background = "#17344A";
          });
          b.addEventListener("click", () => onChoose(choice.id));
          list.appendChild(b);
        });
        doc2.body.appendChild(overlay);
        webModalOverlay = overlay;
        probe.modalType = type;
        probe.modalChoices = choices.map((x) => x.id);
        return true;
      }
      function openLevelUp() {
        if (pendingLevelUps <= 0 || gameOver) return;
        pendingLevelUps--;
        paused = true;
        if (fast) {
          applyBuild(autoBuildForFast());
          paused = false;
          if (pendingLevelUps > 0) openLevelUp();
          return;
        }
        modalLayer.removeChildren();
        const options = pickBuildOptions();
        const finishChoice = (id) => {
          applyBuild(id);
          probe.lastChoice = id;
          clearWebModal();
          modalLayer.removeChildren();
          paused = false;
          if (pendingLevelUps > 0) openLevelUp();
        };
        if (showWebChoiceModal(
          "LEVEL_UP",
          "LV." + level + " · 选择升级",
          "选择一个强化。战斗在你做出选择前会暂停。",
          options.map((o) => ({ id: o.id, name: o.name, desc: o.desc, accent: "#58E8C9" })),
          (id) => finishChoice(id)
        )) {
          return;
        }
        const shade = new Laya.Sprite();
        shade.graphics.drawRect(0, 0, W, H, "#02070dcc");
        modalLayer.addChild(shade);
        const panelW = Math.min(500, W - 42);
        const panelH = 390;
        const px = (W - panelW) * 0.5;
        const py = (H - panelH) * 0.5;
        const panel = new Laya.Sprite();
        panel.graphics.drawRoundRect(px, py, panelW, panelH, 24, "#0c1724");
        panel.graphics.drawRoundRect(px + 3, py + 3, panelW - 6, panelH - 6, 21, "#102438");
        modalLayer.addChild(panel);
        const h = makeText("LV." + level + " · 选择升级", 30, "#ffffff", true);
        h.width = panelW;
        h.align = "center";
        h.pos(px, py + 28);
        modalLayer.addChild(h);
        options.forEach((o, i) => {
          const by = py + 91 + i * 91;
          const b = new Laya.Sprite();
          b.pos(px + 28, by);
          b.size(panelW - 56, 72);
          b.hitArea = new Laya.Rectangle(0, 0, panelW - 56, 72);
          b.graphics.drawRoundRect(0, 0, panelW - 56, 72, 14, "#17344a");
          b.mouseEnabled = true;
          modalLayer.addChild(b);
          const name = makeText(o.name, 20, "#ffffff", true);
          name.pos(px + 47, by + 12);
          name.mouseEnabled = false;
          modalLayer.addChild(name);
          const desc = makeText(o.desc, 15, "#9fb5c5");
          desc.pos(px + 47, by + 42);
          desc.mouseEnabled = false;
          modalLayer.addChild(desc);
          b.on(Laya.Event.CLICK, null, () => finishChoice(o.id));
        });
      }
      probe.testOpenLevelUp = () => {
        if (!gameStarted || gameOver) return false;
        pendingLevelUps++;
        openLevelUp();
        return true;
      };
      function fireBullet(dx, dy) {
        const len = Math.max(1e-3, Math.hypot(dx, dy));
        const nx = dx / len;
        const ny = dy / len;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        weaponSprite.rotation = angle;
        const muzzleX = player.x + nx * 56;
        const muzzleY = player.y + ny * 56;
        const s = new Laya.Sprite();
        attachArt(s, ART.nail, 96, 32, 40, 13);
        s.pos(muzzleX, muzzleY);
        s.rotation = angle;
        if (emergencyCounter === "EMP") s.alpha = 0.88;
        world.addChild(s);
        const flashFx = new Laya.Sprite();
        attachArt(flashFx, ART.muzzle, 80, 45, 44, 25);
        flashFx.pos(muzzleX, muzzleY);
        flashFx.rotation = angle;
        world.addChild(flashFx);
        Laya.timer.once(65, null, () => {
          flashFx.removeSelf();
          flashFx.destroy();
        });
        playerRecoil = 1;
        shots++;
        bullets.push({
          sprite: s,
          vx: nx * 610,
          vy: ny * 610,
          damage: nailDamage,
          life: 1.65,
          pierce: emergencyCounter === "RICOCHET" ? 2 : 1,
          emp: emergencyCounter === "EMP" && shots % 4 === 0
        });
      }
      function fire() {
        if (!enemies.length && !bossActive) return;
        if (bossActive && bossSprite) {
          const dx2 = bossSprite.x - player.x;
          const dy2 = bossSprite.y - player.y;
          if (evolved) {
            for (let i = 0; i < 8; i++) {
              const a = i / 8 * Math.PI * 2;
              fireBullet(Math.cos(a), Math.sin(a));
            }
          } else {
            fireBullet(dx2, dy2);
            if (nailLevel >= 3) {
              const a = Math.atan2(dy2, dx2);
              fireBullet(Math.cos(a + 0.11), Math.sin(a + 0.11));
              fireBullet(Math.cos(a - 0.11), Math.sin(a - 0.11));
            }
          }
          return;
        }
        if (evolved) {
          for (let i = 0; i < 8; i++) {
            const a = i / 8 * Math.PI * 2;
            fireBullet(Math.cos(a), Math.sin(a));
          }
          return;
        }
        let nearest = null;
        let best = Number.POSITIVE_INFINITY;
        for (const e of enemies) {
          const dx2 = e.sprite.x - player.x;
          const dy2 = e.sprite.y - player.y;
          const d2 = dx2 * dx2 + dy2 * dy2;
          if (d2 < best) {
            best = d2;
            nearest = e;
          }
        }
        if (!nearest) return;
        const dx = nearest.sprite.x - player.x;
        const dy = nearest.sprite.y - player.y;
        fireBullet(dx, dy);
        if (nailLevel >= 3) {
          const a = Math.atan2(dy, dx);
          fireBullet(Math.cos(a + 0.11), Math.sin(a + 0.11));
          fireBullet(Math.cos(a - 0.11), Math.sin(a - 0.11));
        }
      }
      function killEnemy(index) {
        const e = enemies[index];
        const value = e.kind === "shield" ? 3 : e.kind === "vacuum" ? 1 : 2;
        spawnPickup(e.sprite.x, e.sprite.y, value);
        e.sprite.removeSelf();
        e.sprite.destroy();
        enemies.splice(index, 1);
        kills++;
      }
      function createBoss() {
        if (bossActive || bossDefeated) return;
        bossActive = true;
        bossPhase = 1;
        bossHp = bossMaxHp;
        bossSkillCooldown = fast ? 0.7 : 1.8;
        const s = new Laya.Sprite();
        const bossShadow = new Laya.Sprite();
        bossShadow.graphics.drawEllipse(-118, 45, 236, 48, "#00000077");
        bossShadow.mouseEnabled = false;
        s.addChild(bossShadow);
        attachArt(s, ART.boss, 240, 120, 300, 150, 0, -8);
        let bossX = clamp(player.x, 180, WORLD_WIDTH - 180);
        let bossY = clamp(player.y - Math.min(300, H * 0.34), 160, WORLD_HEIGHT - 160);
        if (!canStandAt(bossX, bossY, 72)) {
          bossX = 1100;
          bossY = 700;
        }
        s.pos(bossX, bossY);
        world.addChild(s);
        bossSprite = s;
        ui.bossText.visible = true;
        ui.bossBarBg.visible = true;
        ui.bossBar.visible = true;
        flash("GPT-0 原型机：删除人类协议，开始。", "#ff7182");
        for (let i = 0; i < 3; i++) spawnEnemy(true);
      }
      function bossPhaseForHp() {
        const ratio = bossHp / bossMaxHp;
        return ratio > 0.65 ? 1 : ratio > 0.35 ? 2 : 3;
      }
      function updateBoss(dt) {
        if (!bossActive || !bossSprite || bossDefeated) return;
        const targetPhase = bossPhaseForHp();
        if (targetPhase !== bossPhase) {
          bossPhase = targetPhase;
          if (bossPhase === 2) {
            flash("GPT-0：已复制你的攻击节奏。部署镜像护卫。", "#ff9b70");
            for (let i = 0; i < 5; i++) spawnEnemy(true);
          } else if (bossPhase === 3) {
            flash("DELETE HUMAN PROTOCOL · 99.7%", "#ff4f68");
            for (let i = 0; i < 7; i++) spawnEnemy(i % 2 === 0);
          }
        }
        const speed = bossPhase === 3 ? 1.9 : bossPhase === 2 ? 1.25 : 0.8;
        const desiredBossX = clamp(player.x + Math.sin(elapsed * speed) * Math.min(160, W * 0.28), 150, WORLD_WIDTH - 150);
        const desiredBossY = clamp(player.y - Math.min(280, H * 0.32) + Math.cos(elapsed * 0.9) * 34, 130, WORLD_HEIGHT - 130);
        moveWithSlide(
          bossSprite,
          (desiredBossX - bossSprite.x) * Math.min(1, dt * 6),
          (desiredBossY - bossSprite.y) * Math.min(1, dt * 6),
          72
        );
        bossSprite.rotation = Math.sin(elapsed * (bossPhase === 3 ? 1.4 : 0.8)) * (bossPhase === 3 ? 3.5 : 1.8);
        bossSkillCooldown -= dt;
        if (bossSkillCooldown <= 0) {
          bossSkillCooldown = fast ? bossPhase === 3 ? 0.55 : 0.8 : bossPhase === 3 ? 1.05 : bossPhase === 2 ? 1.35 : 1.8;
          const dx = player.x - bossSprite.x;
          const dy = player.y - bossSprite.y;
          const dist = Math.hypot(dx, dy);
          if (!fast && dist < (bossPhase === 3 ? 310 : 245)) {
            const raw = bossPhase === 3 ? 13 : bossPhase === 2 ? 10 : 7;
            const damage = Math.max(1, Math.round(raw * (1 - armor)));
            hp -= damage;
            showFloat("-" + damage, player.x, player.y, "#ff7182");
            if (hp <= 0) gameOverScreen();
          }
          const summons = bossPhase === 3 ? 3 : bossPhase === 2 ? 2 : 1;
          for (let i = 0; i < summons; i++) {
            spawnEnemy(bossPhase >= 2 && i === 0);
          }
        }
      }
      function damageBoss(value) {
        if (!bossActive || bossDefeated) return;
        bossHp -= value;
        showFloat("-" + Math.round(value), bossSprite.x, bossSprite.y - 54, "#ffd77b");
        if (bossHp <= 0) defeatBoss();
      }
      function defeatBoss() {
        if (bossDefeated) return;
        bossDefeated = true;
        bossActive = false;
        victory = true;
        bossHp = 0;
        if (bossSprite) {
          for (let i = 0; i < 14; i++) {
            const a = i / 14 * Math.PI * 2;
            const p = new Laya.Sprite();
            p.graphics.drawCircle(0, 0, i % 3 === 0 ? 7 : 4, i % 2 ? "#ff6b72" : "#ffd15f");
            p.pos(bossSprite.x + Math.cos(a) * 36, bossSprite.y + Math.sin(a) * 36);
            ui.floating.addChild(p);
          }
          bossSprite.removeSelf();
          bossSprite.destroy();
          bossSprite = null;
        }
        ui.bossText.visible = false;
        ui.bossBarBg.visible = false;
        ui.bossBar.visible = false;
        showVictory();
      }
      function showVictory() {
        paused = true;
        clearWebModal();
        modalLayer.removeChildren();
        const victorySummary = "生存 " + Math.floor(elapsed) + " 秒 · 击毁 " + kills + " · LV." + level + " · 获得 AI Core ×10";
        if (showWebChoiceModal(
          "VICTORY",
          "GPT-0 已击破",
          victorySummary + "。第一章：智慧社区 · 暂时安全。",
          [
            {
              id: "RESTART",
              name: "再来一局",
              desc: "从 LV.1 重新开始第一章",
              accent: "#72F5D0"
            }
          ],
          () => {
            clearWebModal();
            restart();
          }
        )) {
          return;
        }
        const shade = new Laya.Sprite();
        shade.graphics.drawRect(0, 0, W, H, "#02070de8");
        modalLayer.addChild(shade);
        const badge = makeText("AI CORE OFFLINE", 16, "#72f5d0", true);
        badge.width = W;
        badge.align = "center";
        badge.pos(0, H * 0.29);
        modalLayer.addChild(badge);
        const t = makeText("GPT-0 已击破", 40, "#ffffff", true);
        t.width = W;
        t.align = "center";
        t.pos(0, H * 0.35);
        modalLayer.addChild(t);
        const stat = makeText(
          "生存 " + Math.floor(elapsed) + " 秒 · 击毁 " + kills + " · LV." + level + "\n获得 AI Core ×10",
          19,
          "#d5e2e9"
        );
        stat.leading = 10;
        stat.width = W;
        stat.align = "center";
        stat.pos(0, H * 0.43);
        modalLayer.addChild(stat);
        const sub = makeText("第一章：智慧社区 · 暂时安全", 18, "#9fb5c5", true);
        sub.width = W;
        sub.align = "center";
        sub.pos(0, H * 0.54);
        modalLayer.addChild(sub);
        const bw = Math.min(340, W - 80);
        const bx = (W - bw) * 0.5;
        const by = H * 0.64;
        const retry = new Laya.Sprite();
        retry.pos(bx, by);
        retry.size(bw, 68);
        retry.hitArea = new Laya.Rectangle(0, 0, bw, 68);
        retry.graphics.drawRoundRect(0, 0, bw, 68, 18, "#58E8C9");
        retry.mouseEnabled = true;
        modalLayer.addChild(retry);
        const retryText = makeText("再来一局", 24, "#06191A", true);
        retryText.width = bw;
        retryText.height = 68;
        retryText.align = "center";
        retryText.valign = "middle";
        retryText.mouseEnabled = false;
        retry.addChild(retryText);
        retry.on(Laya.Event.CLICK, null, restart);
      }
      function showFloat(text, x, y, color) {
        if (ui.floating.numChildren > 24) return;
        const t = makeText(text, 15, color, true);
        t.pos(worldToScreenX(x) - 24, worldToScreenY(y) - 30);
        ui.floating.addChild(t);
        let life = 0.52;
        const tick = () => {
          life -= Laya.timer.delta / 1e3;
          t.y -= 0.5 * (Laya.timer.delta / 16);
          t.alpha = Math.max(0, life / 0.52);
          if (life <= 0) {
            Laya.timer.clear(null, tick);
            t.removeSelf();
            t.destroy();
          }
        };
        Laya.timer.frameLoop(1, null, tick);
      }
      function flash(text, color = "#ffffff") {
        ui.message.text = text;
        ui.message.color = color;
        aiBannerUntil = elapsed + 2.15;
      }
      function triggerAIAnalysis() {
        aiAnalyzed = true;
        flash("中央AI：实弹 Build 已锁定 → 部署防弹盾卫", "#ff7182");
        for (let i = 0; i < 4; i++) spawnEnemy(true);
      }
      function chooseEmergency(kind) {
        emergencyCounter = kind;
        paused = false;
        clearWebModal();
        modalLayer.removeChildren();
        probe.lastChoice = kind;
        if (kind === "AP") flash("人类应急协议：穿甲钉已装填", "#ffd77b");
        if (kind === "RICOCHET") flash("人类应急协议：跳射弹头上线", "#ffd77b");
        if (kind === "EMP") flash("人类应急协议：EMP 钉上线", "#69e8ff");
      }
      function showEmergencyProtocol() {
        if (emergencyShown) return;
        emergencyShown = true;
        blockBeforeProtocol = blockCount;
        if (fast) {
          chooseEmergency("AP");
          return;
        }
        paused = true;
        modalLayer.removeChildren();
        const shade = new Laya.Sprite();
        shade.graphics.drawRect(0, 0, W, H, "#02070ddd");
        modalLayer.addChild(shade);
        const panelW = Math.min(500, W - 42);
        const panelH = 390;
        const px = (W - panelW) * 0.5;
        const py = (H - panelH) * 0.5;
        const panel = new Laya.Sprite();
        panel.graphics.drawRoundRect(px, py, panelW, panelH, 24, "#102438");
        panel.graphics.drawRoundRect(px + 3, py + 3, panelW - 6, panelH - 6, 20, "#0b1723");
        modalLayer.addChild(panel);
        const h = makeText("人类应急协议", 30, "#ffffff", true);
        h.width = panelW;
        h.align = "center";
        h.pos(px, py + 25);
        modalLayer.addChild(h);
        const desc = makeText("你已经连续看到 BLOCK。选一个办法拆掉 AI 的盾。", 16, "#9fb5c5");
        desc.width = panelW - 44;
        desc.align = "center";
        desc.pos(px + 22, py + 70);
        modalLayer.addChild(desc);
        const choices = [
          ["AP", "穿甲钉", "盾牌减伤从 80% 降到 18%"],
          ["RICOCHET", "跳射", "命中后继续贯穿下一个目标"],
          ["EMP", "EMP 钉", "每 4 发瘫痪盾卫 1.1 秒"]
        ];
        if (showWebChoiceModal(
          "EMERGENCY",
          "人类应急协议",
          "AI 已部署盾卫。选一个办法拆掉它的防御。",
          choices.map((x) => ({
            id: x[0],
            name: x[1],
            desc: x[2],
            accent: x[0] === "EMP" ? "#69E8FF" : "#FFD77B"
          })),
          (id) => {
            clearWebModal();
            chooseEmergency(id);
          }
        )) {
          modalLayer.removeChildren();
          return;
        }
        choices.forEach((c, i) => {
          const by = py + 119 + i * 79;
          const b = new Laya.Sprite();
          b.graphics.drawRoundRect(px + 28, by, panelW - 56, 62, 14, "#17344a");
          b.mouseEnabled = true;
          modalLayer.addChild(b);
          const name = makeText(c[1], 20, "#ffffff", true);
          name.pos(px + 48, by + 9);
          modalLayer.addChild(name);
          const d = makeText(c[2], 15, "#9fb5c5");
          d.pos(px + 48, by + 36);
          modalLayer.addChild(d);
          b.on(Laya.Event.CLICK, null, () => chooseEmergency(c[0]));
        });
      }
      function gameOverScreen() {
        if (gameOver) return;
        gameOver = true;
        paused = true;
        clearWebModal();
        modalLayer.removeChildren();
        const shade = new Laya.Sprite();
        shade.graphics.drawRect(0, 0, W, H, "#02070dee");
        modalLayer.addChild(shade);
        const t = makeText("人类样本已删除", 42, "#ff7182", true);
        t.width = W;
        t.align = "center";
        t.pos(0, H * 0.4);
        modalLayer.addChild(t);
        const stat = makeText(
          "生存 " + Math.floor(elapsed) + " 秒 · 击毁 " + kills + " · LV." + level,
          19,
          "#d5e2e9"
        );
        stat.width = W;
        stat.align = "center";
        stat.pos(0, H * 0.4 + 62);
        modalLayer.addChild(stat);
        const sub = makeText("按 R 立即重开", 19, "#ffffff", true);
        sub.width = W;
        sub.align = "center";
        sub.pos(0, H * 0.4 + 104);
        modalLayer.addChild(sub);
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
      }
      function restart() {
        clearEntities();
        clearWebModal();
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
        fireInterval = 0.25;
        moveSpeed = 255;
        pickupRadius = fast ? 260 : 95;
        evolved = false;
        levelChoiceCount = 0;
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
        flash("重新连接人类神经网络。", "#72f5d0");
      }
      win.addEventListener("keydown", (ev) => {
        const k = String(ev.key || "").toLowerCase();
        keys[k] = true;
        if (k === "r" && (gameOver || victory)) restart();
      });
      win.addEventListener("keyup", (ev) => {
        keys[String(ev.key || "").toLowerCase()] = false;
      });
      stage.on(Laya.Event.MOUSE_DOWN, null, () => {
        if (!gameStarted) {
          startGameAction == null ? void 0 : startGameAction();
          return;
        }
        if (paused) return;
        dragging = true;
        pointerX = stage.mouseX;
        pointerY = stage.mouseY;
      });
      stage.on(Laya.Event.MOUSE_MOVE, null, () => {
        if (!dragging || paused || !gameStarted) return;
        pointerX = stage.mouseX;
        pointerY = stage.mouseY;
      });
      stage.on(Laya.Event.MOUSE_UP, null, () => dragging = false);
      stage.on(Laya.Event.MOUSE_OUT, null, () => dragging = false);
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
        if (x - radius < WORLD_MARGIN || y - radius < WORLD_MARGIN || x + radius > WORLD_WIDTH - WORLD_MARGIN || y + radius > WORLD_HEIGHT - WORLD_MARGIN) return true;
        for (const zone of COLLISION_ZONES) {
          if (circleHitsZone(x, y, radius, zone)) return true;
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
          movedX = true;
        }
        const ny = sprite.y + dy;
        if (canStandAt(sprite.x, ny, radius)) {
          sprite.y = ny;
          movedY = true;
        }
        return { movedX, movedY };
      }
      function updateCamera(dt, snap = false) {
        const screenX = player.x - cameraX;
        const screenY = player.y - cameraY;
        if (screenX < deadLeft) cameraTargetX = player.x - deadLeft;
        else if (screenX > deadRight) cameraTargetX = player.x - deadRight;
        if (screenY < deadTop) cameraTargetY = player.y - deadTop;
        else if (screenY > deadBottom) cameraTargetY = player.y - deadBottom;
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
        let mx = 0;
        let my = 0;
        if (keys["a"] || keys["arrowleft"]) mx -= 1;
        if (keys["d"] || keys["arrowright"]) mx += 1;
        if (keys["w"] || keys["arrowup"]) my -= 1;
        if (keys["s"] || keys["arrowdown"]) my += 1;
        if (dragging) {
          const playerScreenX = player.x - cameraX;
          const playerScreenY = player.y - cameraY;
          const dx = pointerX - playerScreenX;
          const dy = pointerY - playerScreenY;
          const len = Math.hypot(dx, dy);
          if (len > 12) {
            mx += dx / len;
            my += dy / len;
          }
        }
        const ml = Math.hypot(mx, my);
        playerRecoil = Math.max(0, playerRecoil - dt * 9.5);
        const pose = playerVisual.pose;
        const recentlyHurt = hurtCooldown > 0.28;
        if (ml > 0) {
          const nx = mx / ml;
          const ny = my / ml;
          moveWithSlide(
            player,
            nx * moveSpeed * dt,
            ny * moveSpeed * dt,
            PLAYER_COLLISION_RADIUS
          );
          playerWalkPhase += dt * 10.5;
          const lift = Math.abs(Math.sin(playerWalkPhase * Math.PI / 4));
          pose.scaleX = nx < -0.08 ? -1 : nx > 0.08 ? 1 : pose.scaleX || 1;
          pose.y = -5 - lift * 1.5;
          if (recentlyHurt) {
            setPlayerClip(playerVisual, "hurt", hurtCooldown > 0.36 ? 0 : 1);
          } else if (playerRecoil > 0.16) {
            const fireIndex = Math.min(3, Math.max(0, Math.floor((1 - playerRecoil) * 4)));
            setPlayerClip(playerVisual, "fire", fireIndex);
          } else {
            setPlayerClip(playerVisual, "run", Math.floor(playerWalkPhase));
          }
          playerVisual.shadow.scaleX = 1 - lift * 0.09;
          playerVisual.shadow.scaleY = 1 - lift * 0.05;
          playerVisual.ring.alpha = 0.62 + lift * 0.3;
        } else {
          playerWalkPhase += dt * 3.2;
          pose.y = -5 + Math.sin(playerWalkPhase * 0.7) * 0.55;
          if (recentlyHurt) {
            setPlayerClip(playerVisual, "hurt", hurtCooldown > 0.36 ? 0 : 1);
          } else if (playerRecoil > 0.16) {
            const fireIndex = Math.min(3, Math.max(0, Math.floor((1 - playerRecoil) * 4)));
            setPlayerClip(playerVisual, "fire", fireIndex);
          } else {
            setPlayerClip(playerVisual, "idle", Math.floor(playerWalkPhase));
          }
          playerVisual.shadow.scaleX = 1;
          playerVisual.shadow.scaleY = 1;
          playerVisual.ring.alpha = 0.72 + Math.sin(playerWalkPhase) * 0.08;
        }
        if (!playerVisual.animated && playerVisual.fallbackArt) {
          playerVisual.fallbackArt.rotation = ml > 0 ? Math.sin(playerWalkPhase) * 1.5 : 0;
        }
        if (playerRecoil > 0) {
          pose.x = -playerRecoil * 2;
        } else {
          pose.x *= Math.max(0, 1 - dt * 16);
        }
        player.x = clamp(player.x, WORLD_MARGIN + PLAYER_COLLISION_RADIUS, WORLD_WIDTH - WORLD_MARGIN - PLAYER_COLLISION_RADIUS);
        player.y = clamp(player.y, WORLD_MARGIN + PLAYER_COLLISION_RADIUS, WORLD_HEIGHT - WORLD_MARGIN - PLAYER_COLLISION_RADIUS);
        updateCamera(dt);
      }
      function updateSpawner(dt) {
        const bossFactor = bossActive ? 0.42 : 1;
        spawnBudget += spawnRate() * bossFactor * dt;
        let guard = 0;
        while (guard++ < 14 && enemies.length < 180) {
          const kind = chooseEnemyKind(false);
          const cost = enemyCost(kind);
          if (spawnBudget < cost) break;
          spawnBudget -= cost;
          spawnEnemy(kind === "shield");
        }
      }
      function updateBullets(dt) {
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.sprite.x += b.vx * dt;
          b.sprite.y += b.vy * dt;
          b.life -= dt;
          let consumed = false;
          if (bossActive && bossSprite && !consumed) {
            const dx = bossSprite.x - b.sprite.x;
            const dy = bossSprite.y - b.sprite.y;
            if (dx * dx + dy * dy <= 105 * 105) {
              spawnHitFx(b.sprite.x, b.sprite.y);
              damageBoss(b.damage);
              b.pierce--;
              if (b.pierce <= 0) consumed = true;
            }
          }
          for (let j = enemies.length - 1; j >= 0 && !consumed; j--) {
            const e = enemies[j];
            const dx = e.sprite.x - b.sprite.x;
            const dy = e.sprite.y - b.sprite.y;
            if (dx * dx + dy * dy > (e.radius + 7) * (e.radius + 7)) continue;
            let damage = b.damage;
            if (e.shield && emergencyCounter !== "AP") {
              damage *= 0.2;
              blockCount++;
              showFloat("BLOCK", e.sprite.x, e.sprite.y, "#70dfff");
            } else if (e.shield && emergencyCounter === "AP") {
              damage *= 0.82;
              showFloat("PIERCE", e.sprite.x, e.sprite.y, "#ffd77b");
            }
            if (b.emp && e.shield) {
              e.stunned = Math.max(e.stunned, 1.1);
              showFloat("EMP", e.sprite.x, e.sprite.y, "#69e8ff");
            }
            spawnHitFx(b.sprite.x, b.sprite.y);
            e.hp -= damage;
            b.pierce--;
            if (e.hp <= 0) killEnemy(j);
            if (b.pierce <= 0) consumed = true;
          }
          if (!consumed && collidesWorld(b.sprite.x, b.sprite.y, 4)) {
            spawnHitFx(b.sprite.x, b.sprite.y);
            consumed = true;
          }
          if (consumed || b.life <= 0 || b.sprite.x < -80 || b.sprite.x > WORLD_WIDTH + 80 || b.sprite.y < -80 || b.sprite.y > WORLD_HEIGHT + 80) {
            b.sprite.removeSelf();
            b.sprite.destroy();
            bullets.splice(i, 1);
          }
        }
      }
      function updateEnemies(dt) {
        hurtCooldown -= dt;
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          e.contactCd -= dt;
          e.animTime += dt;
          if (e.stunned > 0) {
            e.stunned -= dt;
            e.sprite.alpha = 0.58;
            continue;
          }
          e.sprite.alpha = 1;
          const dx = player.x - e.sprite.x;
          const dy = player.y - e.sprite.y;
          const len = Math.max(1e-3, Math.hypot(dx, dy));
          const nx = dx / len;
          const ny = dy / len;
          const enemyRadius = Math.max(12, e.radius * 0.62);
          const stepX = nx * e.speed * dt;
          const stepY = ny * e.speed * dt;
          const moveResult = moveWithSlide(e.sprite, stepX, stepY, enemyRadius);
          if (!moveResult.movedX && !moveResult.movedY) {
            const side = (Math.floor(e.animTime * 2) + e.kind.length) % 2 === 0 ? 1 : -1;
            const tx = -ny * side;
            const ty = nx * side;
            let tangent = moveWithSlide(e.sprite, tx * e.speed * dt * 0.92, ty * e.speed * dt * 0.92, enemyRadius);
            if (!tangent.movedX && !tangent.movedY) {
              tangent = moveWithSlide(e.sprite, -tx * e.speed * dt * 0.92, -ty * e.speed * dt * 0.92, enemyRadius);
            }
          }
          const art = e.art;
          const pose = e.pose;
          if (e.kind !== "shield") {
            pose.scaleX = nx < -0.08 ? -1 : nx > 0.08 ? 1 : pose.scaleX || 1;
          }
          if (e.kind === "vacuum") {
            if (e.frames && e.frames.length) showFrame(e, e.frames, Math.floor(e.animTime * 8));
            const pulse = Math.sin(e.animTime * 8);
            pose.y = -Math.abs(pulse) * 0.7;
            art.rotation = 0;
            e.shadow.scaleX = 1 + pulse * 0.02;
          } else if (e.kind === "delivery") {
            if (e.frames && e.frames.length) {
              const fps = Math.max(7, e.speed * 0.18);
              showFrame(e, e.frames, Math.floor(e.animTime * fps));
            }
            const bump = Math.abs(Math.sin(e.animTime * 7));
            pose.y = -bump * 0.8;
            art.rotation = 0;
            e.shadow.scaleX = 1 - bump * 0.025;
          } else if (e.kind === "dog") {
            if (e.frames && e.frames.length) showFrame(e, e.frames, Math.floor(e.animTime * 12.5));
            const lift = Math.abs(Math.sin(e.animTime * 6.25));
            pose.y = -lift * 1.25;
            art.rotation = 0;
            e.shadow.scaleX = 1 - lift * 0.055;
          } else {
            if (e.frames && e.frames.length) showFrame(e, e.frames, Math.floor(e.animTime * 6));
            const heavyStep = Math.abs(Math.sin(e.animTime * 4.3));
            pose.y = -heavyStep * 0.9;
            pose.rotation = Math.sin(e.animTime * 2.15) * 1;
            e.shadow.scaleX = 1 - heavyStep * 0.02;
          }
          if (!fast && len < e.radius + 20 && hurtCooldown <= 0 && e.contactCd <= 0) {
            const raw = e.kind === "dog" ? 12 : e.kind === "shield" ? 10 : 7;
            const damage = Math.max(1, Math.round(raw * (1 - armor)));
            hp -= damage;
            hurtCooldown = 0.42;
            e.contactCd = 0.58;
            e.sprite.x -= nx * 30;
            e.sprite.y -= ny * 30;
            flash("-" + damage + " HP", "#ff7182");
            if (hp <= 0) gameOverScreen();
          }
        }
      }
      function updatePickups(dt) {
        for (let i = pickups.length - 1; i >= 0; i--) {
          const p = pickups[i];
          p.life -= dt;
          p.sprite.rotation += 90 * dt;
          const dx = player.x - p.sprite.x;
          const dy = player.y - p.sprite.y;
          const d = Math.max(1e-3, Math.hypot(dx, dy));
          if (d < pickupRadius) {
            const speed = 155 + (pickupRadius - d) * 4.5;
            p.sprite.x += dx / d * speed * dt;
            p.sprite.y += dy / d * speed * dt;
          }
          if (d < 26) {
            addXP(p.value);
            p.sprite.removeSelf();
            p.sprite.destroy();
            pickups.splice(i, 1);
            continue;
          }
          if (p.life <= 0) {
            p.sprite.removeSelf();
            p.sprite.destroy();
            pickups.splice(i, 1);
          }
        }
      }
      function updateUI() {
        const xpProgress = Math.min(1, xp / nextXp);
        ui.xpBar.graphics.clear();
        ui.xpBar.graphics.drawRoundRect(18, 78, Math.max(2, (W - 36) * xpProgress), 10, 5, evolved ? "#ffd45f" : "#60c9ff");
        const aiProgress = aiAnalyzed ? 1 : Math.min(1, elapsed / analysisAt);
        ui.aiBar.graphics.clear();
        ui.aiBar.graphics.drawRoundRect(18, 132, Math.max(2, (W - 36) * aiProgress), 10, 5, aiAnalyzed ? "#ff667b" : "#4dd7c2");
        ui.hpText.text = "HP " + Math.max(0, Math.ceil(hp)) + "/" + maxHp + "   LV." + level + "   XP " + xp + "/" + nextXp;
        const remain = Math.max(0, Math.ceil(bossAt - elapsed));
        ui.statText.text = bossActive ? "BOSS P" + bossPhase + " · 敌人 " + enemies.length : "击毁 " + kills + " · 敌人 " + enemies.length + " · BOSS " + remain + "s";
        ui.aiText.text = aiAnalyzed ? "中央AI：已锁定实弹 Build · 主反制=盾卫" : "AI 学习度 " + Math.round(aiProgress * 100) + "%";
        const build = [
          "射钉枪 L" + nailLevel,
          "打印机 L" + printerLevel,
          "磁场 L" + magnetLevel,
          "外骨骼 L" + exoLevel
        ];
        if (evolved) build.push("★无限弹幕");
        if (emergencyCounter) build.push("应急:" + emergencyCounter);
        ui.buildText.text = build.join("   ");
        if (bossActive) {
          const ratio = Math.max(0, bossHp / bossMaxHp);
          ui.bossText.visible = true;
          ui.bossBarBg.visible = true;
          ui.bossBar.visible = true;
          ui.bossText.text = "GPT-0 原型机 · PHASE " + bossPhase + " · " + Math.ceil(ratio * 100) + "%";
          ui.bossBar.graphics.clear();
          ui.bossBar.graphics.drawRoundRect(48, 176, Math.max(2, (W - 96) * ratio), 12, 6, bossPhase === 3 ? "#ff445f" : "#ff7182");
        }
        if (ui.message.text && elapsed >= aiBannerUntil && !paused) ui.message.text = "";
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
        probe.coreBlocksMovement = collidesWorld(1100, 1100, PLAYER_COLLISION_RADIUS);
        probe.northRoadOpen = !collidesWorld(1100, 500, PLAYER_COLLISION_RADIUS);
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
        probe.frameAnimatedEnemies = enemies.filter((e) => !!e.frames && e.frames.length > 1).length;
        probe.playerFrameClipReady = !!playerVisual.animated;
        probe.playerAnimation = playerVisual.currentClip || "fallback";
        probe.detachedFakeParts = 0;
        probe.integratedPartsAnimation = false;
        probe.frameClipAnimation = true;
        probe.stageWidth = stage.width;
        probe.stageHeight = stage.height;
        probe.designWidth = stage.designWidth;
        probe.designHeight = stage.designHeight;
        probe.elapsed = elapsed;
      }
      function loop() {
        const dt = Math.min(0.05, Math.max(1e-3, Laya.timer.delta / 1e3));
        if (gameStarted && !paused && !gameOver) {
          elapsed += dt;
          fireCooldown -= dt;
          updatePlayer(dt);
          updateSpawner(dt);
          if (fireCooldown <= 0 && enemies.length) {
            fire();
            fireCooldown = fireInterval;
          }
          if (!aiAnalyzed && elapsed >= analysisAt) {
            triggerAIAnalysis();
          }
          if (aiAnalyzed && !emergencyShown && elapsed >= emergencyEarliest && (fast || blockCount >= 3)) {
            showEmergencyProtocol();
          }
          if (!bossWarningShown && elapsed >= bossWarningAt) {
            bossWarningShown = true;
            flash("警告：检测到大型AI核心正在接入战场。", "#ff9b70");
          }
          if (!bossActive && !bossDefeated && elapsed >= bossAt) {
            createBoss();
          }
          updateBullets(dt);
          updateEnemies(dt);
          updatePickups(dt);
          updateBoss(dt);
        }
        updateUI();
        syncProbe();
      }
      Laya.timer.frameLoop(1, null, loop);
      spawnEnemy(false);
      spawnEnemy(false);
      spawnEnemy(false);
      if (fast) flash("FAST：自动测试 Build 与 AI 反制链路", "#72f5d0");
    });
  }

  // INDEX:bundle.js
  window.$_main_ = main;
})();
