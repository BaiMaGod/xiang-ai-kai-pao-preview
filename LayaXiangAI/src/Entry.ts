type EnemyKind = "vacuum" | "delivery" | "dog" | "shield";
type CounterKind = "AP" | "RICOCHET" | "EMP";
type BuildKind = "NAIL" | "PRINTER" | "MAGNET" | "EXO";

interface Enemy {
    sprite: any;
    pose: any;
    art: any;
    shadow: any;
    kind: EnemyKind;
    hp: number;
    maxHp: number;
    speed: number;
    radius: number;
    shield: boolean;
    stunned: number;
    contactCd: number;
    animTime: number;
    partA?: any;
    partB?: any;
}

interface Bullet {
    sprite: any;
    vx: number;
    vy: number;
    damage: number;
    life: number;
    pierce: number;
    emp: boolean;
}

interface Pickup {
    sprite: any;
    value: number;
    life: number;
}

interface BuildOption {
    id: BuildKind;
    name: string;
    desc: string;
}

export async function main() {
    const stage = Laya.stage;
    const win = Laya.Browser.window as any;
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

    const artUrls = Object.values(ART);
    const artLoadFailures: string[] = [];
    try {
        await Laya.loader.load(artUrls);
    } catch (err) {
        console.warn("V1 art preload reported an error", err);
    }
    for (const url of artUrls) {
        if (!Laya.loader.getRes(url)) artLoadFailures.push(url);
    }

    stage.bgColor = "#08111c";

    // Mobile-first responsive layout.
    // The generated Laya template starts as a 1334x750 landscape project,
    // so we must replace the design resolution and force a canvas resize
    // before any gameplay coordinates are calculated.
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
        // Keep the useful desktop-wide preview instead of forcing a phone frame on PC.
        stage.designWidth = 1334;
        stage.designHeight = 750;
        stage.scaleMode = Laya.Stage.SCALE_FIXED_HEIGHT;
        stage.alignH = Laya.Stage.ALIGN_CENTER;
        stage.alignV = Laya.Stage.ALIGN_MIDDLE;
        stage.screenMode = Laya.Stage.SCREEN_NONE;
    }

    stage.updateCanvasSize();

    const doc: any = (win as any).document;
    if (doc?.documentElement && doc?.body) {
        let viewportMeta = doc.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = doc.createElement("meta");
            viewportMeta.name = "viewport";
            doc.head?.appendChild(viewportMeta);
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

        const container: any = Laya.Browser.container;
        if (container?.style) {
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

    const world = new Laya.Sprite();
    stage.addChild(world);

    drawWorld();

    const player = new Laya.Sprite();
    const playerVisual = drawPlayer(player);
    player.pos(W * 0.5, H * 0.58);
    world.addChild(player);

    // The V1 Wang sprite already contains the nail gun.
    // Keep this node only as an invisible aiming transform so combat logic remains unchanged.
    const weaponSprite = new Laya.Sprite();
    weaponSprite.visible = false;
    player.addChild(weaponSprite);

    const enemies: Enemy[] = [];
    const bullets: Bullet[] = [];
    const pickups: Pickup[] = [];
    const keys: Record<string, boolean> = {};

    let gameStarted = fast;
    let startGameAction: (() => void) | null = null;
    let webStartButton: any = null;
    let webModalOverlay: any = null;
    let gameOver = false;
    let paused = !gameStarted;
    let dragging = false;
    let pointerX = player.x;
    let pointerY = player.y;

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
    let emergencyCounter: CounterKind | "" = "";
    let shieldSpawned = 0;
    let blockCount = 0;
    let blockBeforeProtocol = 0;

    let bossActive = false;
    let bossDefeated = false;
    let bossPhase = 0;
    let bossMaxHp = fast ? 72 : 2800;
    let bossHp = bossMaxHp;
    let bossSprite: any = null;
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

    const probe: any = {
        ready: true,
        stageWidth: W,
        stageHeight: H,
        engine: "LayaAir",
        engineVersion: "3.4.0",
        version: "0.5.3-integrated-parts-animation",
        artVersion: "v1",
        animationVersion: "integrated-texture-parts-v2",
        layoutVersion: "mobile-responsive-v1",
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
        running: gameStarted
    };
    win.__XIANG_AI_LAYA__ = probe;
    if (!fast) showStartScreen();

    function makeText(text: string, size: number, color: string, bold = false): any {
        const t = new Laya.Text();
        t.text = text;
        t.fontSize = size;
        t.color = color;
        t.bold = bold;
        t.font = "Arial";
        return t;
    }

    function attachArt(
        parent: any,
        url: string,
        sourceW: number,
        sourceH: number,
        targetW: number,
        targetH: number,
        offsetX = 0,
        offsetY = 0
    ) {
        const art = new Laya.Sprite();
        const sx = targetW / sourceW;
        const sy = targetH / sourceH;
        const ready = !!Laya.loader.getRes(url);

        art.size(sourceW, sourceH);
        art.pivot(sourceW * 0.5, sourceH * 0.5);
        art.pos(offsetX, offsetY);
        art.scale(sx, sy);
        art.mouseEnabled = false;
        (art as any).__baseScaleX = sx;
        (art as any).__baseScaleY = sy;
        (art as any).__artReady = ready;

        if (ready) {
            art.loadImage(url);
        } else {
            // Never leave an unexplained shadow-only enemy on screen.
            art.graphics.drawRoundRect(16, 16, sourceW - 32, sourceH - 32, 14, "#8a1f2e", "#ff7788", 4);
            art.graphics.drawCircle(sourceW * 0.5, sourceH * 0.5, Math.min(sourceW, sourceH) * 0.18, "#ffcf5a");
            art.graphics.drawLine(sourceW * 0.5, sourceH * 0.38, sourceW * 0.5, sourceH * 0.57, "#381018", 7);
            art.graphics.drawCircle(sourceW * 0.5, sourceH * 0.68, 4, "#381018");
        }

        parent.addChild(art);
        return art;
    }

    function attachTexturePart(
        parent: any,
        url: string,
        sourceX: number,
        sourceY: number,
        sourceW: number,
        sourceH: number,
        targetW: number,
        targetH: number,
        offsetX = 0,
        offsetY = 0
    ) {
        const base = Laya.loader.getRes(url);
        if (!base) return null;

        const part = new Laya.Sprite();
        try {
            const tex = Laya.Texture.createFromTexture(base, sourceX, sourceY, sourceW, sourceH);
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

    function spawnHitFx(x: number, y: number) {
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
        bg.graphics.drawRect(0, 0, W, H, "#08111c");
        for (let x = 0; x <= W; x += 72) bg.graphics.drawLine(x, 0, x, H, "#10253a", 1);
        for (let y = 0; y <= H; y += 72) bg.graphics.drawLine(0, y, W, y, "#10253a", 1);
        world.addChild(bg);

        const road = new Laya.Sprite();
        road.graphics.drawRect(0, H * 0.34, W, 86, "#0d1a27");
        road.graphics.drawRect(W * 0.36, playTop, 92, playBottom - playTop, "#0d1a27");
        for (let x = 18; x < W; x += 92) road.graphics.drawRect(x, H * 0.34 + 41, 46, 4, "#25384a");
        for (let y = playTop + 22; y < playBottom; y += 92) road.graphics.drawRect(W * 0.36 + 44, y, 4, 46, "#25384a");
        world.addChild(road);

        const city = new Laya.Sprite();
        const blocks = [
            [28, 190, 88, 66], [145, 178, 74, 52], [W - 125, 185, 94, 78],
            [24, H * 0.49, 105, 63], [W - 145, H * 0.48, 118, 67],
            [45, H - 205, 110, 72], [W - 180, H - 218, 132, 78]
        ];
        blocks.forEach((b, i) => {
            city.graphics.drawRoundRect(b[0], b[1], b[2], b[3], 10, i % 2 ? "#10263a" : "#132d40");
            city.graphics.drawRoundRect(b[0] + 8, b[1] + 8, b[2] - 16, 9, 4, "#193b50");
            for (let wx = b[0] + 16; wx < b[0] + b[2] - 10; wx += 24) {
                city.graphics.drawCircle(wx, b[1] + 32, 3, "#2c5368");
            }
        });
        world.addChild(city);
    }

    function drawPlayer(s: any) {
        const shadow = new Laya.Sprite();
        shadow.graphics.drawEllipse(-25, 25, 50, 16, "#00000066");
        shadow.mouseEnabled = false;
        s.addChild(shadow);

        const pose = new Laya.Sprite();
        pose.pos(0, -5);
        s.addChild(pose);

        // V2: all moving limbs are cropped from the SAME Wang texture.
        // No foreign vector legs are layered over the illustration.
        let body = attachTexturePart(pose, ART.player, 0, 0, 160, 142, 78, 69, 0, -8);
        let legL = attachTexturePart(pose, ART.player, 37, 112, 48, 68, 24, 34, -9, 22);
        let legR = attachTexturePart(pose, ART.player, 76, 112, 48, 68, 24, 34, 9, 22);

        if (!body || !legL || !legR) {
            pose.removeChildren();
            body = attachArt(pose, ART.player, 160, 180, 78, 88, 0, -7);
            legL = null;
            legR = null;
        }

        const ring = new Laya.Sprite();
        ring.graphics.drawCircle(0, 28, 29, null, "#41e7e0aa", 2);
        ring.mouseEnabled = false;
        s.addChildAt(ring, 0);

        return { pose, body, legL, legR, shadow, ring };
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
            hud, hpText, statText, xpBar, aiText, aiBar,
            bossText, bossBarBg, bossBar,
            message, buildText, floating
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
        t.pos(0, H * 0.30);
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
            18, "#d4e1e9"
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
        button.zOrder = 1000;
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

        // Web preview: use a real DOM button above the Canvas.
        // Mini-game runtimes normally do not expose document, so they keep
        // using Laya's native stage/touch path below.
        const doc: any = (win as any).document;
        if (doc?.body) {
            const domBtn = doc.createElement("button");
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
            doc.body.appendChild(domBtn);
            webStartButton = domBtn;
            probe.webStartButton = true;
        }

        // The start screen is a modal: make the whole screen tappable.
        // This avoids engine hit-test differences between desktop Web,
        // mobile Web and mini-game runtimes.
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

        const keyboardStart = (ev: any) => {
            const key = String(ev.key || "").toLowerCase();
            if (!gameStarted && (key === "enter" || key === " " || key === "spacebar")) {
                startGame();
            }
        };
        win.addEventListener("keydown", keyboardStart);
    }

    function requiredXP(lv: number) {
        return 7 + lv * 4;
    }

    function enemyCost(kind: EnemyKind) {
        if (kind === "vacuum") return 1.0;
        if (kind === "delivery") return 1.7;
        if (kind === "dog") return 2.0;
        return 3.0;
    }

    function spawnRate() {
        const t = elapsed;
        let r = t < 30 ? 1.0 : t < 60 ? 1.45 : t < 120 ? 2.1 : t < 180 ? 3.0 : 3.8;
        if (aiAnalyzed) r *= 1.12;
        if (fast) r *= 4.2;
        return r;
    }

    function chooseEnemyKind(forceShield = false): EnemyKind {
        if (forceShield) return "shield";
        if (aiAnalyzed && Math.random() < 0.30) return "shield";

        const r = Math.random();
        if (elapsed < 30) return r < 0.78 ? "vacuum" : "delivery";
        if (elapsed < 65) return r < 0.54 ? "vacuum" : r < 0.82 ? "delivery" : "dog";
        return r < 0.34 ? "vacuum" : r < 0.62 ? "delivery" : "dog";
    }

    function makeEnemy(kind: EnemyKind, x: number, y: number): Enemy {
        const s = new Laya.Sprite();

        const shadow = new Laya.Sprite();
        shadow.graphics.drawEllipse(-24, 17, 48, 14, "#00000066");
        shadow.mouseEnabled = false;
        s.addChild(shadow);

        const pose = new Laya.Sprite();
        s.addChild(pose);

        let art: any = null;
        let partA: any = null;
        let partB: any = null;

        if (kind === "vacuum") {
            art = attachArt(pose, ART.vacuum, 128, 128, 58, 58, 0, -5);
        } else if (kind === "delivery") {
            // Body and wheels all come from enemy_box.png.
            // The old hand-drawn wheels are deliberately removed.
            art = attachTexturePart(pose, ART.delivery, 0, 0, 132, 96, 62, 45, 0, -10);
            partA = attachTexturePart(pose, ART.delivery, 4, 72, 52, 56, 24, 26, -16, 11);
            partB = attachTexturePart(pose, ART.delivery, 76, 72, 52, 56, 24, 26, 16, 11);
            if (!art || !partA || !partB) {
                pose.removeChildren();
                art = attachArt(pose, ART.delivery, 132, 128, 62, 60, 0, -5);
                partA = null;
                partB = null;
            }
        } else if (kind === "dog") {
            // Dog body and legs are cropped from the same dog texture.
            art = attachTexturePart(pose, ART.dog, 0, 0, 148, 100, 70, 47, 0, -12);
            partA = attachTexturePart(pose, ART.dog, 16, 70, 58, 58, 27, 27, -14, 11);
            partB = attachTexturePart(pose, ART.dog, 74, 70, 58, 58, 27, 27, 14, 11);
            if (!art || !partA || !partB) {
                pose.removeChildren();
                art = attachArt(pose, ART.dog, 148, 128, 70, 61, 0, -8);
                partA = null;
                partB = null;
            }
        } else {
            // Shield robot is ONE illustrated sprite. No detached blue ring.
            art = attachArt(pose, ART.shield, 102, 120, 66, 78, 0, -8);
        }

        const ready = !!art && ((art as any).__artReady !== false);
        shadow.visible = ready;
        if (!ready) {
            shadow.visible = false;
            console.warn("Enemy art fallback:", kind);
        }

        s.pos(x, y);
        world.addChild(s);

        const data: Record<EnemyKind, [number, number, number]> = {
            vacuum: [20, 60, 19],
            delivery: [42, 45, 22],
            dog: [34, 86, 21],
            shield: [78, 42, 24]
        };
        const d = data[kind];
        return {
            sprite: s, pose, art, shadow, kind, hp: d[0], maxHp: d[0],
            speed: d[1], radius: d[2], shield: kind === "shield",
            stunned: 0, contactCd: 0, animTime: Math.random() * Math.PI * 2,
            partA, partB
        };
    }

    function spawnEnemy(forceShield = false) {
        if (enemies.length >= 180) return;
        const kind = chooseEnemyKind(forceShield);
        const side = Math.floor(Math.random() * 4);
        let x = 0;
        let y = 0;

        if (side === 0) { x = margin; y = playTop + Math.random() * (playBottom - playTop); }
        if (side === 1) { x = W - margin; y = playTop + Math.random() * (playBottom - playTop); }
        if (side === 2) { x = margin + Math.random() * (W - margin * 2); y = playTop; }
        if (side === 3) { x = margin + Math.random() * (W - margin * 2); y = playBottom; }

        enemies.push(makeEnemy(kind, x, y));
        if (kind === "shield") shieldSpawned++;
    }

    function spawnPickup(x: number, y: number, value: number) {
        const s = new Laya.Sprite();
        attachArt(s, ART.xp, 56, 56, 29, 29);
        s.pos(x, y);
        world.addChild(s);
        pickups.push({ sprite: s, value: fast ? value * 3 : value, life: 18 });
    }

    function addXP(value: number) {
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

    function buildPool(): BuildOption[] {
        return [
            { id: "NAIL", name: "高压射钉枪", desc: "伤害 +4；LV3 后产生额外弹道" },
            { id: "PRINTER", name: "弹药打印机", desc: "射速 +13%；与射钉枪 LV3 可进化" },
            { id: "MAGNET", name: "拾取磁场", desc: "经验芯片吸附范围 +34" },
            { id: "EXO", name: "物业外骨骼", desc: "减伤 +8%，并恢复 12 HP" }
        ];
    }

    function pickBuildOptions() {
        const pool = buildPool();
        const out: BuildOption[] = [];
        while (pool.length && out.length < 3) {
            out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        }
        return out;
    }

    function applyBuild(id: BuildKind) {
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
            armor = Math.min(0.40, armor + 0.08);
            hp = Math.min(maxHp, hp + 12);
        }

        if (!evolved && nailLevel >= 3 && printerLevel >= 3) {
            evolved = true;
            flash("武器进化：无限弹幕！", "#72f5d0");
        }
    }

    function autoBuildForFast(): BuildKind {
        const seq: BuildKind[] = ["NAIL", "PRINTER", "NAIL", "PRINTER", "NAIL", "PRINTER", "MAGNET", "EXO"];
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

    function showWebChoiceModal(
        type: string,
        title: string,
        subtitle: string,
        choices: { id: string; name: string; desc: string; accent?: string }[],
        onChoose: (id: string) => void
    ) {
        const doc: any = (win as any).document;
        if (!doc?.body) return false;

        clearWebModal();

        const overlay = doc.createElement("div");
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

        const panel = doc.createElement("div");
        panel.style.width = "min(500px, calc(100vw - 34px))";
        panel.style.padding = "26px 22px 22px";
        panel.style.boxSizing = "border-box";
        panel.style.border = "2px solid rgba(116,235,213,.34)";
        panel.style.borderRadius = "24px";
        panel.style.background = "linear-gradient(180deg,#10283a 0%,#091521 100%)";
        panel.style.boxShadow = "0 20px 80px rgba(0,0,0,.55)";
        overlay.appendChild(panel);

        const h = doc.createElement("div");
        h.textContent = title;
        h.style.color = "#FFFFFF";
        h.style.fontSize = "30px";
        h.style.fontWeight = "800";
        h.style.textAlign = "center";
        panel.appendChild(h);

        if (subtitle) {
            const sub = doc.createElement("div");
            sub.textContent = subtitle;
            sub.style.color = "#9FB5C5";
            sub.style.fontSize = "16px";
            sub.style.lineHeight = "1.45";
            sub.style.textAlign = "center";
            sub.style.margin = "10px 0 20px";
            panel.appendChild(sub);
        }

        const list = doc.createElement("div");
        list.style.display = "grid";
        list.style.gap = "12px";
        panel.appendChild(list);

        choices.forEach((choice: any, index: number) => {
            const b = doc.createElement("button");
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

            const name = doc.createElement("div");
            name.textContent = (index + 1) + ". " + choice.name;
            name.style.fontSize = "20px";
            name.style.fontWeight = "800";
            b.appendChild(name);

            const desc = doc.createElement("div");
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

        doc.body.appendChild(overlay);
        webModalOverlay = overlay;
        probe.modalType = type;
        probe.modalChoices = choices.map((x: any) => x.id);
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

        const finishChoice = (id: BuildKind) => {
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
            options.map(o => ({ id: o.id, name: o.name, desc: o.desc, accent: "#58E8C9" })),
            (id) => finishChoice(id as BuildKind)
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

    function fireBullet(dx: number, dy: number) {
        const len = Math.max(0.001, Math.hypot(dx, dy));
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
            const dx = bossSprite.x - player.x;
            const dy = bossSprite.y - player.y;

            if (evolved) {
                for (let i = 0; i < 8; i++) {
                    const a = i / 8 * Math.PI * 2;
                    fireBullet(Math.cos(a), Math.sin(a));
                }
            } else {
                fireBullet(dx, dy);
                if (nailLevel >= 3) {
                    const a = Math.atan2(dy, dx);
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

        let nearest: Enemy | null = null;
        let best = Number.POSITIVE_INFINITY;
        for (const e of enemies) {
            const dx = e.sprite.x - player.x;
            const dy = e.sprite.y - player.y;
            const d2 = dx * dx + dy * dy;
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

    function killEnemy(index: number) {
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
        s.pos(W * 0.5, playTop + 110);
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

    function updateBoss(dt: number) {
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
        bossSprite.x = W * 0.5 + Math.sin(elapsed * speed) * Math.min(150, W * 0.28);
        bossSprite.y = playTop + 105 + Math.cos(elapsed * 0.9) * 28;
        // Keep the illustrated boss readable instead of spinning the whole painted sprite.
        bossSprite.rotation = Math.sin(elapsed * (bossPhase === 3 ? 1.4 : 0.8)) * (bossPhase === 3 ? 3.5 : 1.8);

        bossSkillCooldown -= dt;
        if (bossSkillCooldown <= 0) {
            bossSkillCooldown = fast
                ? (bossPhase === 3 ? 0.55 : 0.8)
                : (bossPhase === 3 ? 1.05 : bossPhase === 2 ? 1.35 : 1.8);

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

    function damageBoss(value: number) {
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

        const victorySummary =
            "生存 " + Math.floor(elapsed) + " 秒 · 击毁 " + kills + " · LV." + level +
            " · 获得 AI Core ×10";

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
            19, "#d5e2e9"
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

    function showFloat(text: string, x: number, y: number, color: string) {
        if (ui.floating.numChildren > 24) return;
        const t = makeText(text, 15, color, true);
        t.pos(x - 24, y - 30);
        ui.floating.addChild(t);
        let life = 0.52;

        const tick = () => {
            life -= Laya.timer.delta / 1000;
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

    function flash(text: string, color = "#ffffff") {
        ui.message.text = text;
        ui.message.color = color;
        aiBannerUntil = elapsed + 2.15;
    }

    function triggerAIAnalysis() {
        aiAnalyzed = true;
        flash("中央AI：实弹 Build 已锁定 → 部署防弹盾卫", "#ff7182");
        for (let i = 0; i < 4; i++) spawnEnemy(true);
    }

    function chooseEmergency(kind: CounterKind) {
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

        const choices: [CounterKind, string, string][] = [
            ["AP", "穿甲钉", "盾牌减伤从 80% 降到 18%"],
            ["RICOCHET", "跳射", "命中后继续贯穿下一个目标"],
            ["EMP", "EMP 钉", "每 4 发瘫痪盾卫 1.1 秒"]
        ];

        if (showWebChoiceModal(
            "EMERGENCY",
            "人类应急协议",
            "AI 已部署盾卫。选一个办法拆掉它的防御。",
            choices.map(x => ({
                id: x[0],
                name: x[1],
                desc: x[2],
                accent: x[0] === "EMP" ? "#69E8FF" : "#FFD77B"
            })),
            (id) => {
                clearWebModal();
                chooseEmergency(id as CounterKind);
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
        t.pos(0, H * 0.40);
        modalLayer.addChild(t);

        const stat = makeText(
            "生存 " + Math.floor(elapsed) + " 秒 · 击毁 " + kills + " · LV." + level,
            19, "#d5e2e9"
        );
        stat.width = W;
        stat.align = "center";
        stat.pos(0, H * 0.40 + 62);
        modalLayer.addChild(stat);

        const sub = makeText("按 R 立即重开", 19, "#ffffff", true);
        sub.width = W;
        sub.align = "center";
        sub.pos(0, H * 0.40 + 104);
        modalLayer.addChild(sub);
    }

    function clearEntities() {
        for (const e of enemies) { e.sprite.removeSelf(); e.sprite.destroy(); }
        for (const b of bullets) { b.sprite.removeSelf(); b.sprite.destroy(); }
        for (const p of pickups) { p.sprite.removeSelf(); p.sprite.destroy(); }
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
        player.pos(W * 0.5, H * 0.58);
        spawnEnemy(false);
        spawnEnemy(false);
        flash("重新连接人类神经网络。", "#72f5d0");
    }

    win.addEventListener("keydown", (ev: any) => {
        const k = String(ev.key || "").toLowerCase();
        keys[k] = true;
        if (k === "r" && (gameOver || victory)) restart();
    });
    win.addEventListener("keyup", (ev: any) => {
        keys[String(ev.key || "").toLowerCase()] = false;
    });

    stage.on(Laya.Event.MOUSE_DOWN, null, () => {
        if (!gameStarted) {
            startGameAction?.();
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

    function updatePlayer(dt: number) {
        let mx = 0;
        let my = 0;
        if (keys["a"] || keys["arrowleft"]) mx -= 1;
        if (keys["d"] || keys["arrowright"]) mx += 1;
        if (keys["w"] || keys["arrowup"]) my -= 1;
        if (keys["s"] || keys["arrowdown"]) my += 1;

        if (dragging) {
            const dx = pointerX - player.x;
            const dy = pointerY - player.y;
            const len = Math.hypot(dx, dy);
            if (len > 12) {
                mx += dx / len;
                my += dy / len;
            }
        }

        const ml = Math.hypot(mx, my);
        playerRecoil = Math.max(0, playerRecoil - dt * 9.5);

        const pose = playerVisual.pose;
        const body = playerVisual.body;

        if (ml > 0) {
            const nx = mx / ml;
            const ny = my / ml;
            player.x += nx * moveSpeed * dt;
            player.y += ny * moveSpeed * dt;

            playerWalkPhase += dt * 12.5;
            const step = Math.sin(playerWalkPhase);
            const lift = Math.abs(Math.sin(playerWalkPhase * 0.5));

            pose.scaleX = nx < -0.08 ? -1 : nx > 0.08 ? 1 : pose.scaleX || 1;
            pose.y = -5 - lift * 2.2;
            body.rotation = step * 2.1 - playerRecoil * 2.2;

            if (playerVisual.legL && playerVisual.legR) {
                playerVisual.legL.rotation = step * 24;
                playerVisual.legR.rotation = -step * 24;
                playerVisual.legL.y = 22 + Math.max(0, -step) * 2.2;
                playerVisual.legR.y = 22 + Math.max(0, step) * 2.2;
            }

            playerVisual.shadow.scaleX = 1 - lift * 0.08;
            playerVisual.shadow.scaleY = 1 - lift * 0.05;
            playerVisual.ring.alpha = 0.62 + lift * 0.30;
        } else {
            playerWalkPhase += dt * 2.2;
            pose.y = -5 + Math.sin(playerWalkPhase) * 0.6;
            body.rotation *= Math.max(0, 1 - dt * 12);
            if (playerVisual.legL && playerVisual.legR) {
                playerVisual.legL.rotation *= Math.max(0, 1 - dt * 14);
                playerVisual.legR.rotation *= Math.max(0, 1 - dt * 14);
                playerVisual.legL.y += (22 - playerVisual.legL.y) * Math.min(1, dt * 12);
                playerVisual.legR.y += (22 - playerVisual.legR.y) * Math.min(1, dt * 12);
            }
            playerVisual.shadow.scaleX = 1;
            playerVisual.shadow.scaleY = 1;
            playerVisual.ring.alpha = 0.72 + Math.sin(playerWalkPhase) * 0.08;
        }

        if (playerRecoil > 0) {
            pose.x = -playerRecoil * 2.2;
        } else {
            pose.x *= Math.max(0, 1 - dt * 16);
        }

        player.x = Math.max(margin, Math.min(W - margin, player.x));
        player.y = Math.max(playTop, Math.min(playBottom, player.y));
    }

    function updateSpawner(dt: number) {
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

    function updateBullets(dt: number) {
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
                    damage *= 0.20;
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

            if (
                consumed || b.life <= 0 ||
                b.sprite.x < -50 || b.sprite.x > W + 50 ||
                b.sprite.y < playTop - 70 || b.sprite.y > H + 50
            ) {
                b.sprite.removeSelf();
                b.sprite.destroy();
                bullets.splice(i, 1);
            }
        }
    }

    function updateEnemies(dt: number) {
        hurtCooldown -= dt;

        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            e.contactCd -= dt;
            e.animTime += dt;

            if (e.stunned > 0) {
                e.stunned -= dt;
                e.sprite.alpha = 0.58;
                if (e.glow) e.glow.alpha = 0.25 + Math.sin(e.animTime * 18) * 0.15;
                continue;
            }

            e.sprite.alpha = 1;
            const dx = player.x - e.sprite.x;
            const dy = player.y - e.sprite.y;
            const len = Math.max(0.001, Math.hypot(dx, dy));
            const nx = dx / len;
            const ny = dy / len;

            e.sprite.x += nx * e.speed * dt;
            e.sprite.y += ny * e.speed * dt;

            const art = e.art;
            const pose = e.pose;

            if (e.kind !== "shield") {
                pose.scaleX = nx < -0.08 ? -1 : nx > 0.08 ? 1 : pose.scaleX || 1;
            }

            if (e.kind === "vacuum") {
                const pulse = Math.sin(e.animTime * 8);
                pose.y = -Math.abs(pulse) * 0.8;
                art.rotation = pulse * 1.4;
                e.shadow.scaleX = 1 + pulse * 0.025;
            } else if (e.kind === "delivery") {
                const stride = e.animTime * e.speed * 0.19;
                const bump = Math.abs(Math.sin(stride * 0.5));
                pose.y = -bump * 1.1;
                art.rotation = Math.sin(stride * 0.5) * 0.7;

                // Real wheel pixels cropped from enemy_box.png.
                if (e.partA) e.partA.rotation = stride * 180 / Math.PI;
                if (e.partB) e.partB.rotation = stride * 180 / Math.PI;
                e.shadow.scaleX = 1 - bump * 0.03;
            } else if (e.kind === "dog") {
                const stride = Math.sin(e.animTime * 13.5);
                const lift = Math.abs(Math.sin(e.animTime * 6.75));
                pose.y = -lift * 2.0;
                art.rotation = stride * 1.3;

                // Real leg pixels cropped from enemy_dog.png.
                if (e.partA) e.partA.rotation = stride * 25;
                if (e.partB) e.partB.rotation = -stride * 25;
                e.shadow.scaleX = 1 - lift * 0.06;
            } else {
                // Shield artwork already contains its shield; keep it readable.
                const heavyStep = Math.abs(Math.sin(e.animTime * 4.3));
                pose.y = -heavyStep * 1.4;
                pose.rotation = Math.sin(e.animTime * 2.15) * 1.6;
                e.shadow.scaleX = 1 - heavyStep * 0.025;
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

    function updatePickups(dt: number) {
        for (let i = pickups.length - 1; i >= 0; i--) {
            const p = pickups[i];
            p.life -= dt;
            p.sprite.rotation += 90 * dt;

            const dx = player.x - p.sprite.x;
            const dy = player.y - p.sprite.y;
            const d = Math.max(0.001, Math.hypot(dx, dy));

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
        ui.statText.text = bossActive
            ? "BOSS P" + bossPhase + " · 敌人 " + enemies.length
            : "击毁 " + kills + " · 敌人 " + enemies.length + " · BOSS " + remain + "s";
        ui.aiText.text = aiAnalyzed
            ? "中央AI：已锁定实弹 Build · 主反制=盾卫"
            : "AI 学习度 " + Math.round(aiProgress * 100) + "%";

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
        probe.animatedEnemies = enemies.filter(e => !!e.art).length;
        probe.detachedFakeParts = 0;
        probe.integratedPartsAnimation = true;
        probe.stageWidth = stage.width;
        probe.stageHeight = stage.height;
        probe.designWidth = stage.designWidth;
        probe.designHeight = stage.designHeight;
        probe.elapsed = elapsed;
    }

    function loop() {
        const dt = Math.min(0.05, Math.max(0.001, Laya.timer.delta / 1000));

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

            if (
                aiAnalyzed && !emergencyShown &&
                elapsed >= emergencyEarliest &&
                blockCount >= 3
            ) {
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
}
