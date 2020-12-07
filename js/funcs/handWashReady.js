/*
// クラス名:handWashReady
// 機能概要:手洗い準備フェイズ
*/

class handWashReady extends funcBase {
  constructor(flagment, elem, debug = false) {
    super(flagment, elem, debug);
    this.OutOfRangeStartTime = undefined;
  }
  //フェイズ開始
  start(effectTime = 3000) {
    //演出
    super.start(effectTime);
  }

  //距離＆カメラの範囲から最初に外れた時間
  get outofRangeTime() {
    return this.OutOfRangeStartTime;
  }

  //距離＆カメラの範囲から最初に外れた時間
  set outofRangeTime(tm) {
    this.OutOfRangeStartTime = tm;
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
