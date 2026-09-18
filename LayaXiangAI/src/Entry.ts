type EnemyKind = "vacuum" | "delivery" | "dog" | "shield";
type UpgradeKind = "AP" | "RICOCHET" | "EMP";

interface Enemy {
    sprite: any;
    kind: EnemyKind;
    hp: number;
    speed: number;
    radius: number;
    shield: boolean;
    stunned: number;
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

export async function main() {
    const stage = Laya.stage;
    const win = Laya.Browser.window as any;
    const fast = new URLSearchParams(win.location.search).get("fast") === "1";

    stage.bgColor = "#09111d";
    stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
    stage.alignH = Laya.Stage.ALIGN_CENTER;
    stage.alignV = Laya.Stage.ALIGN_MIDDLE;

    const W = Math.max(stage.width || 540, 540);
    const H = Math.max(stage.height || 960, 720);
    const margin = 34;

    const world = new Laya.Sprite();
    stage.addChild(world);

    const background = new Laya.Sprite();
    background.graphics.drawRect(0, 0, W, H, "#09111d");
    for (let x = 0; x <= W; x += 72) {
        background.graphics.drawLine(x, 0, x, H, "#10243a", 1);
    }
    for (let y = 0; y <= H; y += 72) {
        background.graphics.drawLine(0, y, W, y, "#10243a", 1);
    }
    world.addChild(background);

    const city = new Laya.Sprite();
    for (let i = 0; i < 10; i++) {
        const bw = 54 + (i % 3) * 22;
        const bh = 36 + (i % 4) * 18;
        const bx = 30 + (i * 97) % Math.max(80, W - 100);
        const by = 120 + (i * 149) % Math.max(100, H - 250);
        city.graphics.drawRoundRect(bx, by, bw, bh, 8, i % 2 ? "#102033" : "#13283a");
        city.graphics.drawCircle(bx + 14, by + 14, 3, "#25435b");
        city.graphics.drawCircle(bx + 28, by + 14, 3, "#25435b");
    }
    world.addChild(city);

    const player = new Laya.Sprite();
    player.graphics.drawCircle(0, 0, 20, "#f4c76b");
    player.graphics.drawCircle(0, -7, 9, "#ffe0a4");
    player.graphics.drawRect(-13, 10, 26, 18, "#2d7f83");
    player.graphics.drawRect(14, -3, 30, 7, "#c8d0d7");
    player.graphics.drawRect(33, -1, 15, 3, "#8ea1ad");
    player.graphics.drawCircle(-6, -8, 2, "#162333");
    player.graphics.drawCircle(6, -8, 2, "#162333");
    player.pos(W * 0.5, H * 0.58);
    world.addChild(player);

    let hp = 100;
    let level = 1;
    let xp = 0;
    let nextXp = 8 + level * 5;
    let kills = 0;
    let shots = 0;
    let elapsed = 0;
    let fireCooldown = 0;
    let spawnCooldown = 0;
    let hurtCooldown = 0;
    let gameOver = false;
    let paused = false;
    let aiAnalyzed = false;
    let aiBannerUntil = 0;
    let emergencyShown = false;
    let selectedUpgrade: UpgradeKind | "" = "";
    let shieldSpawned = 0;
    let blockCount = 0;
    let dragging = false;
    let pointerX = player.x;
    let pointerY = player.y;

    const analysisAt = fast ? 1.2 : 120;
    const emergencyAt = fast ? 2.6 : 128;

    let nailDamage = 12;
    let fireInterval = 0.22;
    let moveSpeed = 255;
    let bulletSpeed = 640;

    const enemies: Enemy[] = [];
    const bullets: Bullet[] = [];
    const keys: Record<string, boolean> = {};

    const hudTop = new Laya.Sprite();
    hudTop.graphics.drawRect(0, 0, W, 92, "#0a1724cc");
    stage.addChild(hudTop);

    const title = makeText("向AI开炮 · LayaAir V0.2 技术验证", 26, "#ffffff", true);
    title.pos(20, 13);
    hudTop.addChild(title);

    const hpText = makeText("", 18, "#9fe8d9");
    hpText.pos(20, 51);
    hudTop.addChild(hpText);

    const statsText = makeText("", 18, "#c7d3dc");
    statsText.pos(Math.min(300, W * 0.54), 51);
    hudTop.addChild(statsText);

    const aiLabel = makeText("AI 学习进度", 15, "#8aa4b8");
    aiLabel.pos(20, 102);
    stage.addChild(aiLabel);

    const aiBarBg = new Laya.Sprite();
    aiBarBg.graphics.drawRoundRect(20, 126, Math.max(180, W - 40), 12, 6, "#14283a");
    stage.addChild(aiBarBg);

    const aiBar = new Laya.Sprite();
    stage.addChild(aiBar);

    const help = makeText("WASD / 方向键移动 · 手机按住屏幕拖动 · 自动锁定射击", 16, "#6f8ca1");
    help.width = W - 40;
    help.pos(20, H - 34);
    stage.addChild(help);

    const message = makeText("", 22, "#ffffff", true);
    message.width = Math.max(220, W - 40);
    message.align = "center";
    message.pos(20, 154);
    stage.addChild(message);

    const floatingLayer = new Laya.Sprite();
    stage.addChild(floatingLayer);

    const modalLayer = new Laya.Sprite();
    stage.addChild(modalLayer);

    function makeText(text: string, size: number, color: string, bold = false): any {
        const t = new Laya.Text();
        t.text = text;
        t.fontSize = size;
        t.color = color;
        t.bold = bold;
        t.font = "Arial";
        return t;
    }

    function makeEnemy(kind: EnemyKind, x: number, y: number): Enemy {
        const s = new Laya.Sprite();
        if (kind === "vacuum") {
            s.graphics.drawRoundRect(-21, -10, 42, 23, 10, "#91a8ba");
            s.graphics.drawCircle(0, -4, 8, "#263c50");
            s.graphics.drawCircle(0, -4, 3, "#ff5964");
        } else if (kind === "delivery") {
            s.graphics.drawRoundRect(-18, -18, 36, 36, 8, "#e58b4b");
            s.graphics.drawRect(-13, -10, 26, 16, "#5c3427");
            s.graphics.drawCircle(-11, 18, 6, "#273440");
            s.graphics.drawCircle(11, 18, 6, "#273440");
        } else if (kind === "dog") {
            s.graphics.drawRoundRect(-22, -13, 44, 26, 8, "#7b8fa6");
            s.graphics.drawCircle(15, -10, 8, "#a9bbca");
            s.graphics.drawLine(-15, 10, -22, 22, "#7b8fa6", 5);
            s.graphics.drawLine(13, 10, 20, 22, "#7b8fa6", 5);
            s.graphics.drawCircle(18, -12, 2, "#ff5964");
        } else {
            s.graphics.drawRoundRect(-18, -18, 36, 36, 8, "#6f7f91");
            s.graphics.drawCircle(0, -6, 5, "#ff5964");
            s.graphics.drawRoundRect(-31, -25, 13, 50, 6, "#4ea5c7");
            s.graphics.drawLine(-27, -20, -27, 20, "#9be7ff", 2);
        }
        s.pos(x, y);
        world.addChild(s);

        const data: Record<EnemyKind, [number, number, number]> = {
            vacuum: [22, 58, 19],
            delivery: [42, 44, 22],
            dog: [34, 82, 20],
            shield: [70, 40, 23]
        };
        const d = data[kind];
        return { sprite: s, kind, hp: d[0], speed: d[1], radius: d[2], shield: kind === "shield", stunned: 0 };
    }

    function spawnEnemy(forceShield = false) {
        let kind: EnemyKind;
        if (forceShield || (aiAnalyzed && Math.random() < 0.36)) {
            kind = "shield";
        } else {
            const r = Math.random();
            kind = r < 0.48 ? "vacuum" : r < 0.77 ? "delivery" : "dog";
        }

        const side = Math.floor(Math.random() * 4);
        let x = 0;
        let y = 0;
        if (side === 0) { x = margin; y = margin + Math.random() * (H - margin * 2); }
        if (side === 1) { x = W - margin; y = margin + Math.random() * (H - margin * 2); }
        if (side === 2) { x = margin + Math.random() * (W - margin * 2); y = margin + 95; }
        if (side === 3) { x = margin + Math.random() * (W - margin * 2); y = H - margin - 48; }

        const e = makeEnemy(kind, x, y);
        enemies.push(e);
        if (kind === "shield") shieldSpawned++;
    }

    function fire() {
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
        const len = Math.max(0.001, Math.hypot(dx, dy));
        const s = new Laya.Sprite();
        s.graphics.drawRoundRect(-7, -2, 14, 4, 2, selectedUpgrade === "EMP" ? "#69e8ff" : "#ffe08a");
        s.pos(player.x, player.y);
        s.rotation = Math.atan2(dy, dx) * 180 / Math.PI;
        world.addChild(s);

        shots++;
        const empShot = selectedUpgrade === "EMP" && shots % 4 === 0;
        bullets.push({
            sprite: s,
            vx: dx / len * bulletSpeed,
            vy: dy / len * bulletSpeed,
            damage: nailDamage,
            life: 1.7,
            pierce: selectedUpgrade === "RICOCHET" ? 2 : 1,
            emp: empShot
        });
    }

    function removeEnemy(index: number) {
        const e = enemies[index];
        e.sprite.removeSelf();
        e.sprite.destroy();
        enemies.splice(index, 1);
        kills++;
        xp += e.kind === "shield" ? 3 : e.kind === "vacuum" ? 1 : 2;

        if (xp >= nextXp) {
            xp -= nextXp;
            level++;
            nextXp = 8 + level * 5;
            if (level % 2 === 0) {
                nailDamage += 3;
                flash("射钉枪强化：伤害 +" + 3, "#ffd77b");
            } else {
                fireInterval = Math.max(0.1, fireInterval * 0.9);
                flash("弹药打印机强化：射速 +10%", "#9fe8d9");
            }
        }
    }

    function showFloat(text: string, x: number, y: number, color: string) {
        const t = makeText(text, 15, color, true);
        t.pos(x - 24, y - 30);
        floatingLayer.addChild(t);
        let life = 0.55;
        const tick = () => {
            life -= Laya.timer.delta / 1000;
            t.y -= 0.5 * (Laya.timer.delta / 16);
            t.alpha = Math.max(0, life / 0.55);
            if (life <= 0) {
                Laya.timer.clear(null, tick);
                t.removeSelf();
                t.destroy();
            }
        };
        Laya.timer.frameLoop(1, null, tick);
    }

    function flash(text: string, color = "#ffffff") {
        message.text = text;
        message.color = color;
        aiBannerUntil = elapsed + 2.2;
    }

    function triggerAIAnalysis() {
        aiAnalyzed = true;
        flash("AI 分析完成：弹道输出占比过高 → 部署盾卫机器人", "#ff7f91");
        spawnEnemy(true);
        spawnEnemy(true);
    }

    function chooseUpgrade(kind: UpgradeKind) {
        selectedUpgrade = kind;
        paused = false;
        modalLayer.removeChildren();
        if (kind === "AP") flash("人类应急协议：穿甲钉已装填", "#ffd77b");
        if (kind === "RICOCHET") flash("人类应急协议：反弹弹头上线", "#ffd77b");
        if (kind === "EMP") flash("人类应急协议：EMP 钉上线", "#69e8ff");
    }

    function showEmergencyProtocol() {
        if (emergencyShown) return;
        emergencyShown = true;
        if (fast) {
            chooseUpgrade("AP");
            return;
        }
        paused = true;

        const shade = new Laya.Sprite();
        shade.graphics.drawRect(0, 0, W, H, "#02070dcc");
        modalLayer.addChild(shade);

        const panelW = Math.min(620, W - 44);
        const panelH = 360;
        const px = (W - panelW) * 0.5;
        const py = (H - panelH) * 0.5;
        const panel = new Laya.Sprite();
        panel.graphics.drawRoundRect(px, py, panelW, panelH, 24, "#122438");
        panel.graphics.drawRoundRect(px + 3, py + 3, panelW - 6, panelH - 6, 20, "#0c1724");
        modalLayer.addChild(panel);

        const h = makeText("人类应急协议", 30, "#ffffff", true);
        h.width = panelW;
        h.align = "center";
        h.pos(px, py + 28);
        modalLayer.addChild(h);

        const desc = makeText("AI 已部署盾卫。选一个临时反制，让你的 Build 继续活下去。", 17, "#a8bccb");
        desc.width = panelW - 50;
        desc.align = "center";
        desc.pos(px + 25, py + 78);
        modalLayer.addChild(desc);

        const choices: [UpgradeKind, string, string][] = [
            ["AP", "穿甲钉", "盾牌减伤大幅下降"],
            ["RICOCHET", "反弹弹头", "子弹可继续贯穿目标"],
            ["EMP", "EMP 钉", "每 4 发眩晕盾卫"]
        ];

        choices.forEach((c, i) => {
            const bw = panelW - 70;
            const by = py + 126 + i * 69;
            const b = new Laya.Sprite();
            b.graphics.drawRoundRect(px + 35, by, bw, 55, 12, "#17344a");
            b.graphics.drawRoundRect(px + 39, by + 4, 7, 47, 3, i === 2 ? "#67e8ff" : "#ffd477");
            b.mouseEnabled = true;
            modalLayer.addChild(b);

            const bt = makeText(c[1] + "  ·  " + c[2], 18, "#ffffff", true);
            bt.pos(px + 60, by + 16);
            modalLayer.addChild(bt);

            b.on(Laya.Event.CLICK, null, () => chooseUpgrade(c[0]));
        });
    }

    function gameOverScreen() {
        if (gameOver) return;
        gameOver = true;
        paused = true;
        const shade = new Laya.Sprite();
        shade.graphics.drawRect(0, 0, W, H, "#02070ddd");
        modalLayer.addChild(shade);

        const t = makeText("人类防线失守", 42, "#ff7182", true);
        t.width = W;
        t.align = "center";
        t.pos(0, H * 0.42);
        modalLayer.addChild(t);

        const sub = makeText("按 R 重新开始技术验证", 20, "#ffffff");
        sub.width = W;
        sub.align = "center";
        sub.pos(0, H * 0.42 + 66);
        modalLayer.addChild(sub);
    }

    function restart() {
        for (const e of enemies) { e.sprite.removeSelf(); e.sprite.destroy(); }
        for (const b of bullets) { b.sprite.removeSelf(); b.sprite.destroy(); }
        enemies.length = 0;
        bullets.length = 0;
        modalLayer.removeChildren();
        hp = 100;
        level = 1;
        xp = 0;
        nextXp = 13;
        kills = 0;
        shots = 0;
        elapsed = 0;
        fireCooldown = 0;
        spawnCooldown = 0;
        hurtCooldown = 0;
        gameOver = false;
        paused = false;
        aiAnalyzed = false;
        emergencyShown = false;
        selectedUpgrade = "";
        shieldSpawned = 0;
        blockCount = 0;
        nailDamage = 12;
        fireInterval = 0.22;
        player.pos(W * 0.5, H * 0.58);
        message.text = "";
    }

    win.addEventListener("keydown", (ev: any) => {
        const k = String(ev.key || "").toLowerCase();
        keys[k] = true;
        if (k === "r" && gameOver) restart();
    });
    win.addEventListener("keyup", (ev: any) => {
        keys[String(ev.key || "").toLowerCase()] = false;
    });

    stage.on(Laya.Event.MOUSE_DOWN, null, () => {
        if (paused) return;
        dragging = true;
        pointerX = stage.mouseX;
        pointerY = stage.mouseY;
    });
    stage.on(Laya.Event.MOUSE_MOVE, null, () => {
        if (!dragging || paused) return;
        pointerX = stage.mouseX;
        pointerY = stage.mouseY;
    });
    stage.on(Laya.Event.MOUSE_UP, null, () => dragging = false);
    stage.on(Laya.Event.MOUSE_OUT, null, () => dragging = false);

    const probe: any = {
        ready: true,
        engine: "LayaAir",
        engineVersion: "3.4.0",
        version: "0.2-tech-validation",
        codeFirst: true,
        fast,
        playerX: player.x,
        playerY: player.y,
        hp,
        kills,
        shots,
        enemies: 0,
        aiAnalyzed,
        shieldSpawned,
        blockCount,
        emergencyUpgrade: selectedUpgrade,
        running: true
    };
    win.__XIANG_AI_LAYA__ = probe;

    function loop() {
        const dt = Math.min(0.05, Math.max(0.001, Laya.timer.delta / 1000));

        if (!paused && !gameOver) {
            elapsed += dt;
            fireCooldown -= dt;
            spawnCooldown -= dt;
            hurtCooldown -= dt;

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
                if (len > 10) {
                    mx += dx / len;
                    my += dy / len;
                }
            }

            const ml = Math.hypot(mx, my);
            if (ml > 0) {
                player.x += mx / ml * moveSpeed * dt;
                player.y += my / ml * moveSpeed * dt;
            }
            player.x = Math.max(margin, Math.min(W - margin, player.x));
            player.y = Math.max(112, Math.min(H - 58, player.y));

            const spawnInterval = Math.max(0.18, 0.72 - elapsed * 0.0028);
            if (spawnCooldown <= 0) {
                spawnEnemy(false);
                spawnCooldown = spawnInterval;
            }

            if (fireCooldown <= 0 && enemies.length) {
                fire();
                fireCooldown = fireInterval;
            }

            if (!aiAnalyzed && elapsed >= analysisAt) {
                triggerAIAnalysis();
            }
            if (aiAnalyzed && !emergencyShown && elapsed >= emergencyAt) {
                showEmergencyProtocol();
            }

            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.sprite.x += b.vx * dt;
                b.sprite.y += b.vy * dt;
                b.life -= dt;
                let consumed = false;

                for (let j = enemies.length - 1; j >= 0 && !consumed; j--) {
                    const e = enemies[j];
                    const dx = e.sprite.x - b.sprite.x;
                    const dy = e.sprite.y - b.sprite.y;
                    if (dx * dx + dy * dy <= (e.radius + 7) * (e.radius + 7)) {
                        let damage = b.damage;
                        if (e.shield && selectedUpgrade !== "AP") {
                            damage *= 0.2;
                            blockCount++;
                            showFloat("BLOCK", e.sprite.x, e.sprite.y, "#6fd9ff");
                        }
                        if (e.shield && selectedUpgrade === "AP") {
                            damage *= 0.82;
                        }
                        if (b.emp && e.shield) {
                            e.stunned = 1.1;
                            showFloat("EMP", e.sprite.x, e.sprite.y, "#69e8ff");
                        }
                        e.hp -= damage;
                        b.pierce--;
                        if (e.hp <= 0) removeEnemy(j);
                        if (b.pierce <= 0) consumed = true;
                    }
                }

                if (consumed || b.life <= 0 || b.sprite.x < -40 || b.sprite.x > W + 40 || b.sprite.y < 70 || b.sprite.y > H + 40) {
                    b.sprite.removeSelf();
                    b.sprite.destroy();
                    bullets.splice(i, 1);
                }
            }

            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (e.stunned > 0) {
                    e.stunned -= dt;
                    e.sprite.alpha = 0.65;
                    continue;
                }
                e.sprite.alpha = 1;
                const dx = player.x - e.sprite.x;
                const dy = player.y - e.sprite.y;
                const len = Math.max(0.001, Math.hypot(dx, dy));
                e.sprite.x += dx / len * e.speed * dt;
                e.sprite.y += dy / len * e.speed * dt;

                if (len < e.radius + 19 && hurtCooldown <= 0) {
                    hp -= e.kind === "dog" ? 12 : e.kind === "shield" ? 9 : 7;
                    hurtCooldown = 0.42;
                    e.sprite.x -= dx / len * 28;
                    e.sprite.y -= dy / len * 28;
                    flash("-" + (e.kind === "dog" ? 12 : e.kind === "shield" ? 9 : 7) + " HP", "#ff7182");
                    if (hp <= 0) gameOverScreen();
                }
            }
        }

        const progress = Math.min(1, elapsed / analysisAt);
        aiBar.graphics.clear();
        aiBar.graphics.drawRoundRect(20, 126, Math.max(2, (W - 40) * progress), 12, 6, aiAnalyzed ? "#ff667b" : "#4dd7c2");
        hpText.text = "HP " + Math.max(0, Math.ceil(hp)) + "/100   LV." + level + "   XP " + xp + "/" + nextXp;
        statsText.text = "击毁 " + kills + "   敌人 " + enemies.length + "   " + (selectedUpgrade ? "应急:" + selectedUpgrade : "射钉枪");
        if (message.text && elapsed >= aiBannerUntil && !paused) message.text = "";

        probe.playerX = player.x;
        probe.playerY = player.y;
        probe.hp = hp;
        probe.kills = kills;
        probe.shots = shots;
        probe.enemies = enemies.length;
        probe.aiAnalyzed = aiAnalyzed;
        probe.shieldSpawned = shieldSpawned;
        probe.blockCount = blockCount;
        probe.emergencyUpgrade = selectedUpgrade;
        probe.running = !gameOver;
        probe.elapsed = elapsed;
    }

    Laya.timer.frameLoop(1, null, loop);
    spawnEnemy(false);
    spawnEnemy(false);
    flash("老王：先把物业的高压射钉枪拿上。", "#ffd77b");
}
