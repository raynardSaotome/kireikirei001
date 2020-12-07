/*
// クラス名:funcBase
// 機能概要:手洗い案内システム各フェイズの基底クラス
*/
class funcBase {
  constructor(flagment, elem, debug = false) {
    /* コンストラクタ */
    this.vl = flagment.vl; //距離センサ　インスタンス
    this.flow = flagment.flow; //水流センサ　インスタンス
    this.cam = flagment.webcam; //Webカメラ　インスタンス
    this.isStart = false; //おのおののフェイズがフェイズ管理フラグ変更後、1度でも呼び出しされたか
    this.funcStartTime = undefined; //おのおののフェイズが呼び出しされた時間
    this.effectElem = elem; //おのおののフェイズのもつ演出用要素
    this.effectDisplaied = false; //おのおののフェイズの演出完了時True
    this.effectTimeourId = 0; //おのおののフェイズの演出完了時にeffectDisplaiedをtrueにする為のsetTimeoutのID
  }

  //水が流れているかどうかを返す
  isWaterFlow() {
    return this.flow.isFlow();
  }

  //距離センサが範囲に入っているかどうかを返す
  isRangeIn() {
    return this.vl.isRangeIn();
  }

  //Webカメラが認識できてるかどうかを返す
  isCamGetCurrentPosition() {
    return this.cam.isTracked();
  }

  //フェイズ処理クラスの実行開始（start()）した時間
  getFuncStartTime() {
    return this.funcStartTime;
  }

  //フェイズの処理開始
  start(effectTime = 3000) {
    var _this = this;
    this.isStart = true;

    if (this.effectElem) {
      //演出用要素がある場合（待ち受け以外）、要素を表示
      $(this.effectElem).removeClass("fout");
      $(this.effectElem).addClass("fin");
      $(this.effectElem).removeClass("fade");

      // 手洗い成功と失敗は、イベントの割り込み関係なく演出終了まで表示させる為の処理
      this.effectTimeourId = window.setTimeout(() => {
        _this.effectDisplaied = true;
      }, effectTime);
    }
    this.funcStartTime = new Date();
  }

  //フェイズが処理開始されたかどうか
  isYetStart() {
    return this.isStart;
  }

  //フェイズの処理終了
  stop() {
    this.effectDisplaied = false;
    //　演出中の場合、演出完了フラグをクリア
    window.clearTimeout(this.effectTimeourId);
    if (this.effectElem) {
      $(this.effectElem).removeClass("fin");
      $(this.effectElem).addClass("fout");
      $(this.effectElem).addClass("fade");
    }
    this.isStart = false;
  }
}
