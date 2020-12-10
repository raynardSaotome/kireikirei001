//const webcamTrackingInterval = 20;
class webcam {
  constructor(
    videoElem,
    canvasElem,
    constraints = {
      audio: false,
      video: { width: { exact: 320 }, height: { exact: 240 } }
    },
    postponement = 3000,
    debug = false
  ) {
    /* コンストラクタ */
    this.video = videoElem;
    this.canvas = canvasElem;
    this.constraints = constraints;
    this.context = this.canvas.getContext("2d");
    this.track = new clm.tracker({
      useWebGL: true
    });
    this.postponement = postponement;
    this.trackingLimiitTime = undefined;
    this._isTracked = false;
    this.debug = debug;
  }

  start(elem) {
    var adjustVideo = () => {
      // 映像が画面幅いっぱいに表示されるように調整
      var ratio = window.innerWidth / this.video.videoWidth;

      this.video.width = window.innerWidth;
      this.video.height = this.video.videoHeight * ratio;
      this.canvas.width = this.video.width;
      this.canvas.height = this.video.height;
    };

    var startTracking = () => {
      // トラッキング開始
      this.track.start(this.video);
      drawLoop();
    };

    var drawLoop = () => {
      //    function drawLoop(obj) {
      // 描画をクリア
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // videoをcanvasにトレース
      this.context.drawImage(
        this.video,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      if (this.track.getCurrentPosition()) {
        // 顔のパーツの現在位置が存在

        if (this.debug) {
          console.log("cCam:now Track");
        }
        this._isTracked = true;
        if (this.debug) {
          this.track.draw(this.canvas);
        }
        this.trackingLimiitTime = undefined;
      } else {
        if (this.trackingLimiitTime === undefined) {
          this.trackingLimiitTime = new Date();
          this.trackingLimiitTime.setMilliseconds(
            this.trackingLimiitTime.getMilliseconds() + this.postponement
          );
        } else if (new Date().getTime() >= this.trackingLimiitTime.getTime()) {
          this._isTracked = false;
          this.trackingLimiitTime = undefined;
        }
      }
      if (elem) {
        elem.innerHTML = this._isTracked;
      }
      requestAnimationFrame(drawLoop);
    };

    this.track.init(pModel);

    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then((stream) => {
        this.video.srcObject = stream;
        // 動画のメタ情報のロードが完了したら実行
        this.video.onloadedmetadata = function () {
          adjustVideo();
          startTracking();
        };
      })
      .catch((err) => {
        window.alert(this.name + ": " + err.name + ": " + err.message);
      });
  }

  isTracked() {
    return this._isTracked;
  }
}

//テスト用センサー値ダミークラス
class webcamDummy extends webcam {
  constructor(
    videoElem,
    canvasElem,
    constraints,
    postponement = 3000,
    debug = false
  ) {
    super(videoElem, canvasElem, constraints, postponement, debug);
    this.debugelem = undefined;
    this.debugBtcam = document.getElementById("btcam");
    this.debugret = false;
    this.debugBtcam.onclick = () => {
      this.debugBtcam.value = this.debugBtcam.value == 0 ? 1 : 0;
      this.debugret = this.debugBtcam.value == 1 ? true : false;
      if (this.debugelem) this.debugelem.innerHTML = this.debugret;
    };
  }

  start(elem) {
    this.debugelem = elem;
    return undefined;
  }

  isTracked() {
    return this.debugret;
  }
}
