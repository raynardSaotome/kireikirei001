/*
// 処理名:main
// 機能概要:手洗い案内システムメイン
*/
let CHAPT_waiting = 0; // フェイズフラグ用定数　待ち受け
let CHAPT_handWashReady = 1; // フェイズフラグ用定数　手洗い準備
let CHAPT_handWashing = 2; // フェイズフラグ用定数　手洗い中
let CHAPT_handWashSuccess = 3; // フェイズフラグ用定数　手洗い成功
let CHAPT_handWashFault = 4; // フェイズフラグ用定数　手洗い失敗
let CHAPT_stopFlow = 5; // フェイズフラグ用定数　水停止
let HandWashReady_outOfRange_Wainting = 7000; // 手洗い準備フェイズ時のセンサー範囲外許容値（ミリ秒）
let HandWashSuccessEffectDispTime = 10000; // 手洗い成功演出時間
let HandWashFaultEffectDispTime = 10000; // 手洗い失敗演出時間

var nextChapter = 0; // 次に処理するフェイズのフラグ値を格納
var previousChapter = 0; // 次に処理するフェイズのフラグ値を格納時、現行の処理中フェイズのフラグ値を格納
const mainloopInterval = 100; // メイン処理の実行間隔

let mainRoutineDebug = true; // テスト用

window.onload = () => {
  // 初期化関数
  function init() {
    //Webカメラ用要素取得
    var video = document.querySelector("#video");
    var canvas = document.querySelector("#overlay");
    var constraints = {
      audio: false,
      video: { width: { exact: 1280 }, height: { exact: 720 } }
    };
    var flag = {};

    if (mainRoutineDebug) {
      //メインルーティンテスト
      //メインルーティンテスト用ダミークラス
      flag.flow = new waterflowGetterDummy(
        WATERFLOWSIGPORT,
        WATERFLOWFLAG,
        true
      );
      flag.vl = new VL53L0XGetterDummy(false);
      flag.webcam = new webcamDummy(video, canvas, constraints, true);
    } else {
      //本番
      var debugElem = document.getElementById("#debug");
      debugElem.style.visibility = "hidden";

      flag.flow = new waterflowGetter(WATERFLOWSIGPORT, WATERFLOWFLAG, true);
      flag.vl = new VL53L0XGetter(false);
      flag.webcam = new webcam(video, canvas, constraints, true);
    }

    return flag;
  }

  // 待ち受け処理関数
  const funcWaiting = (chapter) => {
    //待ち受け
    if (chapter == CHAPT_waiting) {
      if (_waiting.isWaterFlow()) {
        // 水が流れている場合は、水停止に
        chapter = CHAPT_stopFlow;
        // 呼び出し元を保存
        previousChapter = CHAPT_waiting;
      } else {
        if (_waiting.isParsonHandWashReady()) {
          chapter = CHAPT_handWashReady;
        } else if (!_waiting.isYetStart()) {
          //最初に呼ばれた場合のみ、表示処理
          _waiting.start();
        }
      }
    }
    return chapter;
  };

  // 手洗い開始準備処理関数
  const funcHandWashReady = (chapter) => {
    // 手洗い開始準備案内
    if (chapter == CHAPT_handWashReady) {
      if (_handWashReady.isOutOfRange()) {
        if (!_handWashReady.outofRangeTime) {
          _handWashReady.outofRangeTime = new Date();
        }
        //距離　顔認識反応外
        if (_handWashReady.isWaterFlow()) {
          _handWashReady.stop();
          // 水が流れている場合は、水停止に
          chapter = CHAPT_stopFlow;
          // 呼び出し元を保存
          previousChapter = CHAPT_handWashReady;
        } else {
          //距離　顔認識反応外で水停止
          //人がいないので一定時間で、待ち受けに戻る
          if (_handWashReady.isYetStart) {
            var now = new Date();
            now.setMilliseconds(
              now.getMilliseconds() - HandWashReady_outOfRange_Wainting
            );
            //            if (now.getTime() > _handWashReady.getFuncStartTime().getTime()) {
            if (now.getTime() > _handWashReady.outofRangeTime.getTime()) {
              _handWashReady.stop();
              chapter = CHAPT_waiting;
            }
          }
        }
      } else {
        _handWashReady.outofRangeTime = undefined;
        //距離　顔認識反応内
        if (!_handWashReady.isWaterFlow()) {
          // 水停止中
          if (!_handWashReady.isYetStart()) {
            //最初に呼ばれた場合のみ、処理
            _handWashReady.start();
          }
          // 認識はしているが一定時間手洗い開始しない場合の案内はいるか？
        } else {
          // 本画面の案内開始前に水が出ている場合
          if (!_handWashReady.isYetStart()) {
            //水が流れている場合は、水停止に
            chapter = CHAPT_stopFlow;
            // 呼び出し元を保存
            previousChapter = CHAPT_handWashReady;
          } else {
            // 認識範囲内で案内した後に水が出る
            // 手洗い中へ
            chapter = CHAPT_handWashing;
          }
          _handWashReady.stop();
        }
      }
    }
    return chapter;
  };

  // 手洗い中処理関数
  const funcHandWashing = (chapter) => {
    if (chapter == CHAPT_handWashing) {
      // 手洗い中
      if (!_handWashing.isYetStart()) {
        _handWashing.start();
      }

      if (!_handWashing.timeOver()) {
        // 時間内
        if (_handWashing.isOutOfRange()) {
          // 距離センサ、カメラ認識範囲外
          if (!_handWashing.isWaterFlow()) {
            _handWashing.stop();
            //待ち受けに
            chapter = CHAPT_waiting;
            previousChapter = CHAPT_handWashing;
          } else {
            _handWashing.stop();
            //水停止へ
            chapter = CHAPT_stopFlow;
            // 呼び出し元を保存
            previousChapter = CHAPT_handWashing;
          }
        } else {
          // 距離センサ、カメラ認識範囲内
          if (!_handWashing.isWaterFlow()) {
            if (_handWashing.isHandWashSuccess()) {
              //手洗い成功へ
              _handWashing.stop();
              chapter = CHAPT_handWashSuccess;
            } else {
              //手洗い失敗へ
              _handWashing.stop();
              chapter = CHAPT_handWashFault;
            }
          }
        }
      } else {
        _handWashing.stop();
        //水停止へ
        chapter = CHAPT_stopFlow;
        // 呼び出し元を保存
        previousChapter = CHAPT_handWashing;
      }
    }
    return chapter;
  };

  // 手洗い成功処理関数
  const funcHandWashSuccess = (chapter) => {
    //手洗い成功
    if (chapter == CHAPT_handWashSuccess) {
      if (!_handWashSuccess.isYetStart()) {
        _handWashSuccess.start(HandWashSuccessEffectDispTime);
      } else if (_handWashSuccess.effectDisplaied) {
        _handWashSuccess.stop();
        //演出終了で、待ち受けに
        chapter = CHAPT_waiting;
      }
    }
    return chapter;
  };

  // 手洗い失敗処理関数
  const funcHandWashFault = (chapter) => {
    //手洗い失敗
    if (chapter == CHAPT_handWashFault) {
      if (!_handWashFault.isYetStart()) {
        _handWashFault.start(HandWashFaultEffectDispTime);
      } else if (_handWashFault.effectDisplaied) {
        _handWashFault.stop();
        //演出終了で、待ち受けに
        chapter = CHAPT_waiting;
      }
    }
    return chapter;
  };

  // 水停止処理関数
  const funcStopFlow = (chapter) => {
    //水停止
    if (chapter == CHAPT_stopFlow) {
      if (!_stopFlow.isWaterFlow()) {
        _stopFlow.stop();
        //呼び出しもと（待ち受け、手洗い準備、手洗い中）によって移動先を変更
        //ただし呼び出し元が手洗い中の場合は、高確率で人がいないので、待ち受けに戻る
        if (previousChapter == CHAPT_handWashing) {
          chapter = CHAPT_waiting;
        } else {
          chapter = previousChapter;
        }
      } else if (!_stopFlow.isYetStart()) {
        //最初に呼ばれた場合のみ、処理
        _stopFlow.start();
      }
    }
    return chapter;
  };

  // メインループ
  const mainloop = () => {
    var debugChptElem = document.getElementById("debugChpt");
    debugChptElem.innerHTML = nextChapter;

    nextChapter = funcWaiting(nextChapter);
    nextChapter = funcHandWashReady(nextChapter);
    nextChapter = funcHandWashing(nextChapter);
    nextChapter = funcHandWashSuccess(nextChapter);
    nextChapter = funcHandWashFault(nextChapter);
    nextChapter = funcStopFlow(nextChapter);
    window.setTimeout(mainloop, mainloopInterval);
  };

  // 処理開始
  //kira();

  //開始時は待ち受けフェイズに
  nextChapter = CHAPT_waiting;

  ///センサー類オブジェクトの宣言
  var flagment = init();

  // デバッグ用センサー値表示用要素の取得
  (async () => {
    var dist = document.getElementById("ddist");
    await flagment.vl.start(dist);
  })();

  (async () => {
    var dist = document.getElementById("fdist");
    await flagment.flow.start(dist);
  })();

  flagment.webcam.start(
    (() => {
      var dist = document.getElementById("cdist");
      return dist;
    })()
  );

  // 各フェイズ処理用クラスの宣言　第二引数は演出用要素
  const _waiting = new waiting(flagment, undefined);
  const _handWashReady = new handWashReady(
    flagment,
    (() => {
      var elem = document.getElementById("elemHandWashReady");
      return elem;
    })()
  );
  const _handWashing = new handWashing(
    flagment,
    (() => {
      var elem = document.getElementById("elemHandWashing");
      return elem;
    })()
  );
  const _handWashSuccess = new handWashSuccess(
    flagment,
    (() => {
      var elem = document.getElementById("elemHandWashSuccess");
      return elem;
    })()
  );
  const _handWashFault = new handWashFault(
    flagment,
    (() => {
      var elem = document.getElementById("elemHandWashFault");
      return elem;
    })()
  );
  const _stopFlow = new stopFlow(
    flagment,
    (() => {
      var elem = document.getElementById("elemStopFlow");
      return elem;
    })()
  );

  // ループ用関数の呼び出し
  window.setTimeout(mainloop, mainloopInterval);
};