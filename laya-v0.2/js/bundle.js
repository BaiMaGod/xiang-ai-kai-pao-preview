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
      const stage = Laya.stage;
      const win = Laya.Browser.window;
      const fast = new URLSearchParams(win.location.search).get("fast") === "1";
      stage.bgColor = "#08111c";
      stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
      stage.alignH = Laya.Stage.ALIGN_CENTER;
      stage.alignV = Laya.Stage.ALIGN_MIDDLE;
      const W = Math.max(stage.width || 540, 540);
      const H = Math.max(stage.height || 960, 720);
      const margin = 34;
      const playTop = 150;
      const playBottom = H - 50;
      const world = new Laya.Sprite();
      stage.addChild(world);
      drawWorld();
      const player = new Laya.Sprite();
      drawPlayer(player);
      player.pos(W * 0.5, H * 0.58);
      world.addChild(player);
      const enemies = [];
      const bullets = [];
      const pickups = [];
      const keys = {};
      let gameStarted = fast;
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
      let nailLevel = 1;
      let printerLevel = 0;
      let magnetLevel = 0;
      let exoLevel = 0;
      let nailDamage = 12;
      let fireInterval = 0.25;
      let moveSpeed = 255;
      let pickupRadius = 95;
      let evolved = false;
      let levelChoiceCount = 0;
      let aiAnalyzed = false;
      let aiBannerUntil = 0;
      let emergencyShown = false;
      let emergencyCounter = "";
      let shieldSpawned = 0;
      let blockCount = 0;
      let blockBeforeProtocol = 0;
      const analysisAt = fast ? 2.2 : 120;
      const emergencyEarliest = fast ? 3.1 : 128;
      const ui = createUI();
      const modalLayer = new Laya.Sprite();
      stage.addChild(modalLayer);
      const startLayer = new Laya.Sprite();
      stage.addChild(startLayer);
      if (!fast) showStartScreen();
      const probe = {
        ready: true,
        engine: "LayaAir",
        engineVersion: "3.4.0",
        version: "0.3-vertical-slice-1",
        codeFirst: true,
        fast,
        playerX: player.x,
        playerY: player.y,
        hp,
        level,
        xpCollected,
        kills,
        shots,
        enemies: 0,
        maxEnemiesSeen,
        pickups: 0,
        aiAnalyzed,
        shieldSpawned,
        blockCount,
        blockBeforeProtocol,
        emergencyUpgrade: emergencyCounter,
        evolved,
        running: gameStarted
      };
      win.__XIANG_AI_LAYA__ = probe;
      function makeText(text, size, color, bold = false) {
        const t = new Laya.Text();
        t.text = text;
        t.fontSize = size;
        t.color = color;
        t.bold = bold;
        t.font = "Arial";
        return t;
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
          [28, 190, 88, 66],
          [145, 178, 74, 52],
          [W - 125, 185, 94, 78],
          [24, H * 0.49, 105, 63],
          [W - 145, H * 0.48, 118, 67],
          [45, H - 205, 110, 72],
          [W - 180, H - 218, 132, 78]
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
      function drawPlayer(s) {
        s.graphics.drawCircle(0, 0, 21, "#eec55f");
        s.graphics.drawCircle(0, -8, 10, "#ffdda2");
        s.graphics.drawRect(-14, 10, 28, 20, "#258087");
        s.graphics.drawRect(14, -3, 31, 8, "#cbd4da");
        s.graphics.drawRect(35, -1, 16, 3, "#8ea1ad");
        s.graphics.drawCircle(-6, -9, 2, "#162333");
        s.graphics.drawCircle(6, -9, 2, "#162333");
        s.graphics.drawLine(-12, 26, -18, 38, "#33465a", 5);
        s.graphics.drawLine(12, 26, 18, 38, "#33465a", 5);
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
        const message = makeText("", 21, "#ffffff", true);
        message.width = W - 30;
        message.align = "center";
        message.pos(15, 153);
        stage.addChild(message);
        const buildText = makeText("", 15, "#6f8ca1");
        buildText.width = W - 36;
        buildText.pos(18, H - 47);
        stage.addChild(buildText);
        const floating = new Laya.Sprite();
        stage.addChild(floating);
        return { hud, hpText, statText, xpBar, aiText, aiBar, message, buildText, floating };
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
        const button = new Laya.Sprite();
        const bw = Math.min(340, W - 90);
        const bx = (W - bw) * 0.5;
        const by = H * 0.72;
        button.graphics.drawRoundRect(bx, by, bw, 64, 18, "#55e4c7");
        button.mouseEnabled = true;
        startLayer.addChild(button);
        const bt = makeText("开始反抗", 24, "#06121a", true);
        bt.width = bw;
        bt.align = "center";
        bt.pos(bx, by + 18);
        startLayer.addChild(bt);
        button.on(Laya.Event.CLICK, null, () => {
          startLayer.removeChildren();
          gameStarted = true;
          paused = false;
          probe.running = true;
          flash("老王：智能是吧？先交物业费。", "#ffd77b");
        });
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
        if (kind === "vacuum") {
          s.graphics.drawRoundRect(-21, -10, 42, 23, 10, "#91a8ba");
          s.graphics.drawCircle(0, -4, 8, "#263c50");
          s.graphics.drawCircle(0, -4, 3, "#ff5964");
          s.graphics.drawLine(-13, 12, 13, 12, "#c9d5dd", 3);
        } else if (kind === "delivery") {
          s.graphics.drawRoundRect(-19, -19, 38, 38, 8, "#e58b4b");
          s.graphics.drawRect(-14, -11, 28, 17, "#61392a");
          s.graphics.drawCircle(-12, 19, 6, "#273440");
          s.graphics.drawCircle(12, 19, 6, "#273440");
        } else if (kind === "dog") {
          s.graphics.drawRoundRect(-23, -13, 46, 26, 8, "#7b8fa6");
          s.graphics.drawCircle(16, -10, 8, "#a9bbca");
          s.graphics.drawLine(-16, 10, -23, 23, "#7b8fa6", 5);
          s.graphics.drawLine(13, 10, 21, 23, "#7b8fa6", 5);
          s.graphics.drawCircle(19, -12, 2, "#ff5964");
        } else {
          s.graphics.drawRoundRect(-18, -18, 36, 36, 8, "#65788c");
          s.graphics.drawCircle(2, -6, 5, "#ff5964");
          s.graphics.drawRoundRect(-34, -27, 15, 54, 6, "#3d8eb2");
          s.graphics.drawLine(-29, -21, -29, 21, "#9be7ff", 3);
          s.graphics.drawLine(-24, -21, -24, 21, "#2b637d", 2);
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
          kind,
          hp: d[0],
          maxHp: d[0],
          speed: d[1],
          radius: d[2],
          shield: kind === "shield",
          stunned: 0,
          contactCd: 0
        };
      }
      function spawnEnemy(forceShield = false) {
        if (enemies.length >= 180) return;
        const kind = chooseEnemyKind(forceShield);
        const side = Math.floor(Math.random() * 4);
        let x = 0;
        let y = 0;
        if (side === 0) {
          x = margin;
          y = playTop + Math.random() * (playBottom - playTop);
        }
        if (side === 1) {
          x = W - margin;
          y = playTop + Math.random() * (playBottom - playTop);
        }
        if (side === 2) {
          x = margin + Math.random() * (W - margin * 2);
          y = playTop;
        }
        if (side === 3) {
          x = margin + Math.random() * (W - margin * 2);
          y = playBottom;
        }
        enemies.push(makeEnemy(kind, x, y));
        if (kind === "shield") shieldSpawned++;
      }
      function spawnPickup(x, y, value) {
        const s = new Laya.Sprite();
        s.graphics.drawPoly(0, 0, [-8, 0, 0, -8, 8, 0, 0, 8], "#66d9ff");
        s.graphics.drawCircle(0, 0, 3, "#d8f7ff");
        s.pos(x, y);
        world.addChild(s);
        pickups.push({ sprite: s, value, life: 18 });
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
        const options = pickBuildOptions();
        options.forEach((o, i) => {
          const by = py + 91 + i * 91;
          const b = new Laya.Sprite();
          b.graphics.drawRoundRect(px + 28, by, panelW - 56, 72, 14, "#17344a");
          b.mouseEnabled = true;
          modalLayer.addChild(b);
          const name = makeText(o.name, 20, "#ffffff", true);
          name.pos(px + 47, by + 12);
          modalLayer.addChild(name);
          const desc = makeText(o.desc, 15, "#9fb5c5");
          desc.pos(px + 47, by + 42);
          modalLayer.addChild(desc);
          b.on(Laya.Event.CLICK, null, () => {
            applyBuild(o.id);
            modalLayer.removeChildren();
            paused = false;
            if (pendingLevelUps > 0) openLevelUp();
          });
        });
      }
      function fireBullet(dx, dy) {
        const len = Math.max(1e-3, Math.hypot(dx, dy));
        const s = new Laya.Sprite();
        s.graphics.drawRoundRect(-7, -2, 14, 4, 2, emergencyCounter === "EMP" ? "#69e8ff" : "#ffe08a");
        s.pos(player.x, player.y);
        s.rotation = Math.atan2(dy, dx) * 180 / Math.PI;
        world.addChild(s);
        shots++;
        bullets.push({
          sprite: s,
          vx: dx / len * 650,
          vy: dy / len * 650,
          damage: nailDamage,
          life: 1.65,
          pierce: emergencyCounter === "RICOCHET" ? 2 : 1,
          emp: emergencyCounter === "EMP" && shots % 4 === 0
        });
      }
      function fire() {
        if (!enemies.length) return;
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
      function showFloat(text, x, y, color) {
        if (ui.floating.numChildren > 24) return;
        const t = makeText(text, 15, color, true);
        t.pos(x - 24, y - 30);
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
        modalLayer.removeChildren();
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
        pickupRadius = 95;
        evolved = false;
        levelChoiceCount = 0;
        aiAnalyzed = false;
        emergencyShown = false;
        emergencyCounter = "";
        shieldSpawned = 0;
        blockCount = 0;
        blockBeforeProtocol = 0;
        aiBannerUntil = 0;
        gameOver = false;
        paused = false;
        gameStarted = true;
        player.pos(W * 0.5, H * 0.58);
        spawnEnemy(false);
        spawnEnemy(false);
        flash("重新连接人类神经网络。", "#72f5d0");
      }
      win.addEventListener("keydown", (ev) => {
        const k = String(ev.key || "").toLowerCase();
        keys[k] = true;
        if (k === "r" && gameOver) restart();
      });
      win.addEventListener("keyup", (ev) => {
        keys[String(ev.key || "").toLowerCase()] = false;
      });
      stage.on(Laya.Event.MOUSE_DOWN, null, () => {
        if (paused || !gameStarted) return;
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
      function updatePlayer(dt) {
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
        if (ml > 0) {
          player.x += mx / ml * moveSpeed * dt;
          player.y += my / ml * moveSpeed * dt;
        }
        player.x = Math.max(margin, Math.min(W - margin, player.x));
        player.y = Math.max(playTop, Math.min(playBottom, player.y));
      }
      function updateSpawner(dt) {
        spawnBudget += spawnRate() * dt;
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
            e.hp -= damage;
            b.pierce--;
            if (e.hp <= 0) killEnemy(j);
            if (b.pierce <= 0) consumed = true;
          }
          if (consumed || b.life <= 0 || b.sprite.x < -50 || b.sprite.x > W + 50 || b.sprite.y < playTop - 70 || b.sprite.y > H + 50) {
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
          if (e.stunned > 0) {
            e.stunned -= dt;
            e.sprite.alpha = 0.58;
            continue;
          }
          e.sprite.alpha = 1;
          const dx = player.x - e.sprite.x;
          const dy = player.y - e.sprite.y;
          const len = Math.max(1e-3, Math.hypot(dx, dy));
          e.sprite.x += dx / len * e.speed * dt;
          e.sprite.y += dy / len * e.speed * dt;
          if (e.shield) {
            e.sprite.rotation = Math.atan2(dy, dx) * 180 / Math.PI;
          }
          if (len < e.radius + 20 && hurtCooldown <= 0 && e.contactCd <= 0) {
            const raw = e.kind === "dog" ? 12 : e.kind === "shield" ? 10 : 7;
            const damage = Math.max(1, Math.round(raw * (1 - armor)));
            hp -= damage;
            hurtCooldown = 0.42;
            e.contactCd = 0.58;
            e.sprite.x -= dx / len * 30;
            e.sprite.y -= dy / len * 30;
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
        ui.statText.text = "击毁 " + kills + " · 敌人 " + enemies.length + " · " + Math.floor(elapsed) + "s";
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
        probe.enemies = enemies.length;
        probe.maxEnemiesSeen = maxEnemiesSeen;
        probe.pickups = pickups.length;
        probe.aiAnalyzed = aiAnalyzed;
        probe.shieldSpawned = shieldSpawned;
        probe.blockCount = blockCount;
        probe.blockBeforeProtocol = blockBeforeProtocol;
        probe.emergencyUpgrade = emergencyCounter;
        probe.evolved = evolved;
        probe.running = gameStarted && !gameOver;
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
          if (aiAnalyzed && !emergencyShown && elapsed >= emergencyEarliest && blockCount >= 3) {
            showEmergencyProtocol();
          }
          updateBullets(dt);
          updateEnemies(dt);
          updatePickups(dt);
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
