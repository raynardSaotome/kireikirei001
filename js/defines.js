//Webカメラトラッキング後範囲外許容時間
const webcamPostponement = 5000;

//優先Webカメラ
const useWebcamDevice = {
  devices: [
    {
      name: "Qcam for Notebooks Pro", //はぎはら個人持ち
      width: 1280,
      height: 960
    },
    {
      name: "USB Camera", //本番用
      width: 1920,
      height: 1080
    }
  ]
};
