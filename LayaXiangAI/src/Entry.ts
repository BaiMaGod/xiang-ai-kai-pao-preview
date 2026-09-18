export async function main() {
    const stage = Laya.stage;
    stage.bgColor = "#101722";

    const marker = new Laya.Sprite();
    marker.name = "CodeFirstProbe";
    marker.graphics.drawRoundRect(40, 40, 420, 130, 24, "#1b3140");
    marker.graphics.drawCircle(105, 105, 34, "#73f5cf");
    stage.addChild(marker);

    const title = new Laya.Text();
    title.text = "LayaAir Code First OK";
    title.color = "#ffffff";
    title.fontSize = 30;
    title.pos(165, 82);
    stage.addChild(title);

    const sub = new Laya.Text();
    sub.text = "《向AI开炮》V0.2 技术验证";
    sub.color = "#9db2c5";
    sub.fontSize = 20;
    sub.pos(165, 122);
    stage.addChild(sub);

    (Laya.Browser.window as any).__LAYA_PROBE__ = {
        ok: true,
        engine: "LayaAir",
        codeFirst: true
    };
}
