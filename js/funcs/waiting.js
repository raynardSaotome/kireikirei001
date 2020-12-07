/*
// クラス名:waiting
// 機能概要:待ち受けフェイズ
*/
class waiting extends funcBase {
  //フェイズ開始
  start(effectTime = 3000) {
    //effect
    super.start(effectTime);
  }

  //　手洗い準備フェイスへ移行できるかどうか
  isParsonHandWashReady() {
    if (
      !super.isWaterFlow() &&
      super.isRangeIn() &&
      super.isCamGetCurrentPosition()
    ) {
      return true;
    } else {
      return false;
    }
  }
}
