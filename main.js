const MODEL_BASE_URL = "https://teachablemachine.withgoogle.com/models/UbWxdKHuG/";
const MODEL_URL = `${MODEL_BASE_URL}model.json`;
const METADATA_URL = `${MODEL_BASE_URL}metadata.json`;

const modelStatus = document.getElementById("modelStatus");
const appState = document.getElementById("appState");
const fileInput = document.getElementById("fileInput");
const imagePreview = document.getElementById("imagePreview");
const previewHint = document.getElementById("previewHint");
const predictImageBtn = document.getElementById("predictImageBtn");
const topResult = document.getElementById("topResult");
const resultBars = document.getElementById("resultBars");
const resultPhoto = document.getElementById("resultPhoto");
const guineaCutout = document.getElementById("guineaCutout");

let model;

async function applyGuineaCutout() {
  if (!guineaCutout) return;

  const src = guineaCutout.getAttribute("src");
  if (!src) return;

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Light background removal with soft edge.
    if (r > 225 && g > 225 && b > 225) {
      data[i + 3] = 0;
    } else if (r > 205 && g > 205 && b > 205) {
      data[i + 3] = 90;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  guineaCutout.src = canvas.toDataURL("image/png");
}

function setStatus(message) {
  modelStatus.textContent = message;
  appState.textContent = message;
}

function setPredictEnabled() {
  predictImageBtn.disabled = !(model && imagePreview.src);
}

function renderBars(predictions) {
  resultBars.innerHTML = "";

  predictions.forEach((item) => {
    const row = document.createElement("div");
    row.className = "result-row";

    const label = document.createElement("span");
    label.textContent = item.className;

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${(item.probability * 100).toFixed(1)}%`;

    const score = document.createElement("span");
    score.textContent = `${(item.probability * 100).toFixed(1)}%`;

    track.appendChild(fill);
    row.append(label, track, score);
    resultBars.appendChild(row);
  });
}

function renderTopResult(predictions) {
  const top = predictions[0];
  topResult.textContent = `예측: ${top.className} (${(top.probability * 100).toFixed(1)}%)`;
  updateResultPhoto(top.className);
}

function updateResultPhoto(className) {
  if (!resultPhoto) return;

  const name = String(className || "").toLowerCase();
  let src = "";

  // User requested mapping:
  // 기니피그 -> Image #1 (S1.jpg), 강성원 -> Image #2 (G1.jpg)
  if (name.includes("기니피그") || name.includes("guinea")) {
    src = "/S1.jpg";
  } else if (name.includes("강성원") || name.includes("sungwon") || name.includes("kang")) {
    src = "/G1.jpg";
  }

  if (!src) {
    resultPhoto.removeAttribute("src");
    resultPhoto.style.display = "none";
    return;
  }

  resultPhoto.src = src;
  resultPhoto.style.display = "block";
}

async function predictFromImage() {
  if (!model) {
    setStatus("모델 로딩 중입니다. 잠시만 기다려주세요.");
    return;
  }

  if (!imagePreview.src) {
    setStatus("먼저 이미지를 업로드해 주세요.");
    return;
  }

  const predictions = await model.predict(imagePreview);
  predictions.sort((a, b) => b.probability - a.probability);
  renderTopResult(predictions);
  renderBars(predictions);
}

async function autoLoadModel() {
  try {
    setStatus("모델 자동 로딩 중...");
    model = await tmImage.load(MODEL_URL, METADATA_URL);
    const labels = model.getClassLabels();
    setStatus(`모델 준비 완료 (${labels.length}개 클래스)`);
  } catch (error) {
    console.error(error);
    setStatus("모델 로드 실패. 새로고침 후 다시 시도해 주세요.");
  } finally {
    setPredictEnabled();
  }
}

fileInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.src = reader.result;
    imagePreview.style.display = "block";
    previewHint.style.display = "none";
    setPredictEnabled();
  };
  reader.readAsDataURL(file);
});

predictImageBtn.addEventListener("click", async () => {
  await predictFromImage();
});

window.addEventListener("DOMContentLoaded", async () => {
  await Promise.allSettled([applyGuineaCutout(), autoLoadModel()]);
});
