// ✅ 寶寶名字（第 5 點）
const babyName = "洋洋";
document.getElementById("babyName").textContent = babyName;

// ✅ 圖片/影片清單（影片也放在 images/ 內）
// type: "image" | "video"
// poster(選填)：影片封面圖，沒有也可以（會顯示播放標示）
const items = [
  { type: "image", src: "/images/01.jpg", caption: "第 1 張" },
  { type: "image", src: "/images/02.jpg", caption: "第 2 張" },
  { type: "video", src: "/images/01.mp4", caption: "可愛影片 1", poster: "/images/01_poster.jpg" },
  { type: "image", src: "/images/03.jpg", caption: "第 3 張" },
];

const LS_KEY = "baby_slider_index_v2";
let index = Math.max(0, Math.min(items.length - 1, Number(localStorage.getItem(LS_KEY) || 0)));

const captionText = document.getElementById("captionText");
const counter = document.getElementById("counter");
const thumbs = document.getElementById("thumbs");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const toggleAutoBtn = document.getElementById("toggleAuto");
const stage = document.getElementById("stage");
const frame = document.getElementById("frame");
const media = document.getElementById("media");

let auto = true;
let timer = null;
const intervalMs = 3500;

function clamp(i){ return (i + items.length) % items.length; }

function setFrameOrientation(isLandscape){
  frame.classList.toggle("landscape", !!isLandscape);
}

function renderThumbs(){
  thumbs.innerHTML = "";
  items.forEach((it, i) => {
    const t = document.createElement("button");
    t.type = "button";
    t.className = "thumb" + (i === index ? " active" : "") + (it.type === "video" ? " video" : "");
    // 縮圖：圖片用自己，影片用 poster（若無 poster 用一張通用封面也可）
    const thumbSrc = it.type === "video" ? (it.poster || "/images/video-poster.jpg") : it.src;
    t.innerHTML = `<img src="${thumbSrc}" alt="縮圖 ${i+1}">`;
    t.addEventListener("click", () => go(i, true));
    thumbs.appendChild(t);
  });
}

function stopAuto(){
  auto = false;
  toggleAutoBtn.textContent = "自動播放：關";
  if (timer) clearInterval(timer);
  timer = null;
}
function startAuto(){
  auto = true;
  toggleAutoBtn.textContent = "自動播放：開";
  if (timer) clearInterval(timer);
  timer = setInterval(() => next(false), intervalMs);
}
function restartAuto(){
  if (!auto) return;
  startAuto();
}

// ✅ 影片播放時，自動停止輪播（不然會跳走）
function pauseAutoWhenVideoPlays(el){
  if (!el || el.tagName !== "VIDEO") return;
  el.addEventListener("play", () => stopAuto());
}

function render(){
  if (!items.length){
    captionText.textContent = "尚未加入照片/影片";
    counter.textContent = "0 / 0";
    media.innerHTML = "";
    return;
  }

  const it = items[index];
  captionText.textContent = it.caption || "";
  counter.textContent = `${index + 1} / ${items.length}`;
  localStorage.setItem(LS_KEY, String(index));

  // 清空容器
  media.innerHTML = "";

  if (it.type === "video"){
    const v = document.createElement("video");
    v.src = it.src;
    v.controls = true;
    v.playsInline = true;
    if (it.poster) v.poster = it.poster;

    // 影片載入 metadata 後判斷直橫（第 4 點）
    v.addEventListener("loadedmetadata", () => {
      const isLandscape = v.videoWidth >= v.videoHeight;
      setFrameOrientation(isLandscape);
    });

    pauseAutoWhenVideoPlays(v);
    media.appendChild(v);

    // 影片預設先橫式容器較常見，但仍以 metadata 為準
    setFrameOrientation(true);
  } else {
    const img = document.createElement("img");
    img.src = it.src;
    img.alt = "寶寶照片";

    // 圖片載入後判斷直橫（第 4 點）
    img.addEventListener("load", () => {
      const isLandscape = img.naturalWidth >= img.naturalHeight;
      setFrameOrientation(isLandscape);
    });

    media.appendChild(img);
  }

  // 更新 active thumb
  [...thumbs.children].forEach((el, i) => el.classList.toggle("active", i === index));

  const active = thumbs.children[index];
  if (active?.scrollIntoView) active.scrollIntoView({behavior:"smooth", inline:"center", block:"nearest"});
}

function go(i, userAction=false){
  index = clamp(i);
  render();
  if (userAction) restartAuto();
}
function next(userAction=false){ go(index + 1, userAction); }
function prev(userAction=false){ go(index - 1, userAction); }

prevBtn.addEventListener("click", () => prev(true));
nextBtn.addEventListener("click", () => next(true));

toggleAutoBtn.addEventListener("click", () => {
  if (auto) stopAuto();
  else startAuto();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") prev(true);
  if (e.key === "ArrowRight") next(true);
});

// swipe (mobile)
let startX = 0, startY = 0, moved = false;
stage.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  startX = t.clientX; startY = t.clientY;
  moved = false;
}, { passive:true });

stage.addEventListener("touchmove", () => { moved = true; }, { passive:true });

stage.addEventListener("touchend", (e) => {
  if (!moved) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - startX;
  const dy = t.clientY - startY;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)){
    if (dx < 0) next(true);
    else prev(true);
  }
}, { passive:true });

// init
renderThumbs();
render();
startAuto();
