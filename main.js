const MODEL_BASE_URL = "https://teachablemachine.withgoogle.com/models/UbWxdKHuG/";
const MODEL_URL = `${MODEL_BASE_URL}model.json`;
const METADATA_URL = `${MODEL_BASE_URL}metadata.json`;

const loadModelBtn = document.getElementById("loadModelBtn");
const modelStatus = document.getElementById("modelStatus");
const fileInput = document.getElementById("fileInput");
const imagePreview = document.getElementById("imagePreview");
const previewHint = document.getElementById("previewHint");
const predictImageBtn = document.getElementById("predictImageBtn");
const topResult = document.getElementById("topResult");
const resultBars = document.getElementById("resultBars");

let model;

function setStatus(message) {
  modelStatus.textContent = message;
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
}

async function predictFromElement(element) {
  if (!model) {
    setStatus("먼저 모델을 불러와 주세요.");
    return;
  }

  const predictions = await model.predict(element);
  predictions.sort((a, b) => b.probability - a.probability);
  renderTopResult(predictions);
  renderBars(predictions);
}

async function loadModel() {
  try {
    loadModelBtn.disabled = true;
    setStatus("모델 로딩 중...");

    model = await tmImage.load(MODEL_URL, METADATA_URL);
    const labels = model.getClassLabels();

    setStatus(`모델 로드 완료 (${labels.length}개 클래스)`);
    predictImageBtn.disabled = !imagePreview.src;
  } catch (error) {
    console.error(error);
    setStatus("모델 로드 실패: 네트워크/URL를 확인하세요.");
  } finally {
    loadModelBtn.disabled = false;
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
    predictImageBtn.disabled = !model;
  };
  reader.readAsDataURL(file);
});

predictImageBtn.addEventListener("click", async () => {
  if (!imagePreview.src) {
    setStatus("먼저 이미지를 업로드해 주세요.");
    return;
  }

  await predictFromElement(imagePreview);
});

loadModelBtn.addEventListener("click", loadModel);
