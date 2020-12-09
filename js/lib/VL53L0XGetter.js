let VL52L0XI2CPort = 1;
let VL52L0XI2CAddress = 0x29;
let VL53L0XGetParamInterval = 100;
let VL53L0XDistanceRangeMin = 0;
let VL53L0XDistanceRangeMax = 600;
let VL53L0XInRangeTimeDiff = 300;

let VL53L0XGetterRange_Correction = 0;

class VL53L0XGetter {
  constructor(debug = false) {
    /* コンストラクタ */
    this.vl = undefined;
    this._distance = 0;
    this.flg = false;
    this.inRangeLimitTime = undefined;
    this.moniterElem = undefined;
    this.distanceMoniterElem = undefined;
    this.debug = debug;
  }

  async getsensorParam() {
    this._distance = (await this.vl.getRange()) + VL53L0XGetterRange_Correction;

    this.distanceMoniterElem.innerHTML = this._distance;

    // チャタリング対応
    if (
      VL53L0XDistanceRangeMin <= this._distance &&
      VL53L0XDistanceRangeMax >= this._distance &&
      !this.inRangeLimitTime
    ) {
      if (this.debug) {
        console.log("cVL:check chattering start");
      }
      //チャタリングチェック開始
      this.inRangeLimitTime = new Date();
      this.inRangeLimitTime.setMilliseconds(
        this.inRangeLimitTime.getMilliseconds() + VL53L0XInRangeTimeDiff
      );
      this.flg = true;
    } else if (
      VL53L0XDistanceRangeMin <= this._distance &&
      VL53L0XDistanceRangeMax >= this._distance &&
      this.inRangeLimitTime &&
      new Date().getTime() <= this.inRangeLimitTime.getTime()
    ) {
      //距離範囲内でチャタリング時間内
      if (this.debug) {
        console.log("cVL:in range and in time");
      }
      this.flg = true;
    } else if (
      VL53L0XDistanceRangeMin <= this._distance &&
      VL53L0XDistanceRangeMax >= this._distance &&
      this.inRangeLimitTime &&
      new Date().getTime() > this.inRangeLimitTime.getTime()
    ) {
      if (this.debug) {
        console.log("cVL:in range and timeout");
      }
      //距離範囲内だけどチャタリング時間超過
      this.flg = true;
    } else if (
      VL53L0XDistanceRangeMin > this._distance &&
      VL53L0XDistanceRangeMax < this._distance &&
      this.inRangeLimitTime &&
      new Date().getTime() <= this.inRangeLimitTime.getTime()
    ) {
      if (this.debug) {
        console.log("cVL:out of range  and in time");
      }
      //距離範囲外だけどチャタリング時間内
      this.flg = true;
    } else {
      if (this.debug) {
        console.log("cVL:other case maybe out of range");
      }
      //その他
      this.inRangeLimitTime = undefined;
      this.flg = false;
    }

    if (this.moniterElem) {
      this.moniterElem.innerHTML = this.flg;
    }

    window.setTimeout(
      await (() => {
        this.getsensorParam();
      }),
      VL53L0XGetParamInterval
    );
  }

  async start(elem) {
    if (elem) {
      this.moniterElem = elem;
    }
    const i2cAccess = await navigator.requestI2CAccess();
    const port = i2cAccess.ports.get(VL52L0XI2CPort);
    this.vl = new VL53L0X(port, VL52L0XI2CAddress);
    await this.vl.init(); // for Long Range Mode (<2m) : await vl.init(true);

    this.distanceMoniterElem = document.getElementById("ddistDistance");

    window.setTimeout(
      await (() => {
        this.getsensorParam();
      }),
      VL53L0XGetParamInterval
    );
  }

  get distance() {
    return this._distance;
  }
  isRangeIn() {
    return this.flg;
  }
}

//テスト用センサー値ダミークラス
class VL53L0XGetterDummy extends VL53L0XGetter {
  constructor(debug = false) {
    super(debug);
    this.debugelem = undefined;
    this.debugret = false;

    this.debugBtvl = document.getElementById("btvl");
    var _this = this;
    this.debugBtvl.onclick = () => {
      _this.debugBtvl.value = _this.debugBtvl.value == 0 ? 1 : 0;
      _this.debugret = _this.debugBtvl.value == 1 ? true : false;
      if (_this.debugelem) _this.debugelem.innerHTML = _this.debugret;
    };
  }
  async getsensorParam() {
    return undefined;
  }
  async start(elem) {
    this.debugelem = elem;
    return undefined;
  }
  get distance() {
    return 100;
  }
  isRangeIn() {
    return this.debugret;
  }
}
