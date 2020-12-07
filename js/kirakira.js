const kira = function (window) {
  var PARAM = new Object();
  $.canvas = {
    init: function () {
      PARAM = {
        main: { id: $("#elemHandWashSuccess") },
        canvas: {
          id: $("#kirakira_canvas"),
          size: { width: 1280, height: 720 } // !!画像サイズと一致させる!!
        },
        velocity: { x: 0, y: 0 },
        circle: new Shape(),
        stage: ""
      };
      $.canvas.seting();
    },
    seting: function () {
      var canvasObject = PARAM.canvas.id.get(0);
      var context = canvasObject.getContext("2d");

      PARAM.stage = new Stage(canvasObject);
      PARAM.velocity.x = Math.floor(Math.random() * 5) + 5;
      PARAM.velocity.y = Math.floor(Math.random() * 5) + 5;

      setInterval(function () {
        $.canvas.star();
      }, 1);

      Ticker.on("tick", $.canvas.tick);
    },
    star: function () {
      var shape = new Shape();
      var g = shape.graphics;
      var color = Math.random() * 360;
      var glowColor1 = Graphics.getHSL(0, 100, 100, 1);
      var glowColor2 = Graphics.getHSL(color, 100, 75, 0.5);
      var radius = Math.random() * 50; // 星の大きさ
      var position = {
        x: Math.random() * PARAM.canvas.size.width,
        y: Math.random() * PARAM.canvas.size.height
      };

      g.beginRadialGradientFill(
        [glowColor1, glowColor2],
        [0.1, 0.5],
        0,
        0,
        1,
        0,
        0,
        (Math.random() * 10 + 13) * 2
      );
      g.drawPolyStar(0, 0, radius, 5, 0.95, Math.random() * 360);
      g.endFill();

      g.beginRadialGradientFill(
        [
          Graphics.getHSL(color, 100, 75, 0.5),
          Graphics.getHSL(color, 100, 75, 0)
        ],
        [0, 0.5],
        0,
        0,
        0,
        0,
        0,
        radius
      );
      g.drawCircle(0, 0, radius);
      g.endFill();

      shape.compositeOperation = "lighter";

      shape.x = position.x;
      shape.y = position.y;
      shape.scaleX = 0;
      shape.scaleY = 0;
      shape.alpha = 0;

      PARAM.stage.addChild(shape);
      $.canvas.tween(shape);
    },
    tween: function (SHAPE) {
      var tween = Tween.get(SHAPE)
        .to({ scaleX: 1, scaleY: 1, alpha: 1 }, 500, Ease.sineOut)
        .to({ scaleX: 0, scaleY: 0, alpha: 0 }, 800, Ease.sineIn);
      tween.call(function () {
        $.canvas.remove(this);
      });
    },
    remove: function (SHAPE) {
      PARAM.stage.removeChild(SHAPE);
    },
    tick: function () {
      PARAM.stage.update();
    }
  };

  $.canvas.init();

  /*
  window.addEventListener(
    "load",
    function (e) {
      $.canvas.init();
    },
    false
  );
  */
};
