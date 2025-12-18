// 1) 在這裡列出你的照片（放在 /images 資料夾）
const photos = [
  { src: "/images/01.JPG", caption: "第 1 張" },
  { src: "/images/02.JPG", caption: "第 2 張" },
  { src: "/images/03.JPG", caption: "第 3 張" },
];

const LS_KEY = "baby_slider_index_v1";
let index = Math.max(0, Math.min(photos.length - 1, Number(localStorage.getItem(LS_KEY) || 0)));

const mainImg = document.getElementById("mainImg");
const captionText = document.getElementById("captionText");
const counter = document.getElementById("counter");
const thumbs = document.getElementById("thumbs");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const toggleAutoBtn = document.getElementById("toggleAuto");
const stage = document.getElementById("stage");

let auto = true;
let timer = null;
const intervalMs = 3500;

function clamp(i){ return (i + photos.length) % photos.length; }

function renderThumbs(){
  thumbs.innerHTML = "";
  photos.forEach((p, i) => {
    const t = document.createElement("button");
    t.className = "thumb" + (i === index ? " active" : "");
    t.type = "button";
    t.innerHTML = `<img src="${p.src}" alt="縮圖 ${i+1}">`;
    t.addEventListener("click", () => go(i, true));
    thumbs.appendChild(t);
  });
}

function render(){
  if (!photos.length){
    captionText.textContent = "尚未加入照片";
    counter.textContent = "0 / 0";
    mainImg.removeAttribute("src");
    return;
  }
  const p = photos[index];
  mainImg.src = p.src;
  captionText.textContent = p.caption || "";
  counter.textContent = `${index + 1} / ${photos.length}`;
  localStorage.setItem(LS_KEY, String(index));

  // 更新 active thumb
  [...thumbs.children].forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });

  // 滾動縮圖讓 active 出現在視野中
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

// controls
prevBtn.addEventListener("click", () => prev(true));
nextBtn.addEventListener("click", () => next(true));

toggleAutoBtn.addEventListener("click", () => {
  if (auto) stopAuto();
  else startAuto();
});

// keyboard
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

stage.addEventListener("touchmove", (e) => {
  moved = true;
}, { passive:true });

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
