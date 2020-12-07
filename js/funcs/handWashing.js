let HandWashing_TimeRangeMin = 5000; // 手洗い最小時間　これより短いと失敗
let HandWashing_OverTime = 10000; //　手洗い最大時間　これより長いと水停止
/*
// クラス名:handWashing
// 機能概要:手洗い中フェイズ
*/
class handWashing extends funcBase {
  constructor(flagment, elem, debug = false) {
    /* コンストラクタ */
    super(flagment, elem, debug);
    this.handWashingStartTime = undefined;
  }

  //フェイズ開始
  start(effectTime = 3000) {
    //演出
    super.start(effectTime);
    this.handWashingStartTime = new Date();
  }

  //手洗いが成功したかどうか
  isHandWashSuccess() {
    var min = new Date();
    min.setMilliseconds(min.getMilliseconds() - HandWashing_TimeRangeMin);
    if (min.getTime() >= this.handWashingStartTime.getTime()) {
      return true;
    } else {
      return false;
    }
  }

  //手洗いが成功したかどうか
  timeOver() {
    var nowDate = new Date();
    nowDate.setMilliseconds(nowDate.getMilliseconds() - HandWashing_OverTime);
    if (nowDate.getTime() > this.handWashingStartTime.getTime()) {
      return true;
    } else {
      return false;
    }
  }

  //距離＆カメラの範囲から外れたかどうか
  isOutOfRange() {
    if (!super.isRangeIn() || !super.isCamGetCurrentPosition()) {
      return true;
    } else {
      return false;
    }
  }
}
