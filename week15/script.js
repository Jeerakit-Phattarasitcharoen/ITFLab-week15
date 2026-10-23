/* ====== ใส่รูปของตัวเองที่ช่อง img (เช่น "images/khaomangai.jpg" หรือลิงก์รูป) ====== */
const MENUS = [
  {
    name: "ข้าวมันไก่",
    desc: "น้ำจิ้มเด็ด น้ำซุปเข้มๆ หอมมุ่ม",
    price: "50-65 บาท",
    img: "ข้าวมันไก่.jpg",
    color: "#4b69ff",
  },
  {
    name: "กะเพราหมูสับไข่ดาว",
    desc: "เผ็ดจัดจ้าน หอมกลิ่นกะเพราไฟแรง",
    price: "50-60 บาท",
    img: "กระเพรา.jpg",
    color: "#8847ff",
  },
  {
    name: "ก๋วยเตี๋ยวเรือ",
    desc: "น้ำซุปเข้มข้น เครื่องแน่นชามเล็กกินได้เพลิน",
    price: "45-60 บาท",
    img: "อาโป่.jpg",
    color: "#d32ee6",
  },
  {
    name: "ข้าวขาหมู",
    desc: "ขาหมูเปื่อยนุ่ม ราดน้ำพะโล้หอมๆ",
    price: "60-80 บาท",
    img: "ขาหมู.jpg",
    color: "#eb4b4b",
  },
  {
    name: "ส้มตำไก่ย่าง",
    desc: "ส้มตำรสแซ่บ คู่ไก่ย่างหนังกรอบ",
    price: "70-100 บาท",
    img: "ตำๆ.jpg",
    color: "#ffd700",
  },
];

const ITEM_W    = 160;
const WIN_INDEX = 48;
const TOTAL     = 60;
const DURATION  = 6500;

const $ = (id) => document.getElementById(id);

const track  = $("track");
const caseEl = $("case");
const btn    = $("spinBtn");
const card   = $("card");

let current = 0;
let pos     = 0;
let audio;

function ctx() {
  if (!audio) {
    audio = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audio;
}

function tick() {
  const a = ctx();
  const t = a.currentTime;
  const o = a.createOscillator();
  const g = a.createGain();

  o.type = "square";
  o.frequency.setValueAtTime(1100, t);
  o.frequency.exponentialRampToValueAtTime(500, t + 0.04);

  g.gain.setValueAtTime(0.09, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + 0.06);
}

function winSound() {
  const a = ctx();
  const t = a.currentTime;

  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const o = a.createOscillator();
    const g = a.createGain();
    const s = t + i * 0.09;

    o.type = "triangle";
    o.frequency.value = freq;

    g.gain.setValueAtTime(0, s);
    g.gain.linearRampToValueAtTime(0.18, s + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, s + 0.9);

    o.connect(g).connect(a.destination);
    o.start(s);
    o.stop(s + 1);
  });
}

function pic(m) {
  if (!m.img) {
    return m.emoji;
  }

  return `<img src="${m.img}" alt="${m.name}"
               onerror="this.replaceWith(document.createTextNode('${m.emoji}'))">`;
}

function showIdle() {
  card.style.setProperty("--rc", "#8b95a5");

  $("cPic").textContent  = "?";
  $("cName").textContent = "สุ่มเมนูของคุณ";
  $("cDesc").textContent = "";
  $("cPrice").hidden     = true;
}

function showCard(i, animate) {
  const m = MENUS[i];

  card.style.setProperty("--rc", m.color);

  $("cPic").innerHTML    = pic(m);
  $("cName").textContent = m.name;
  $("cDesc").textContent = m.desc;
  $("cPrice").hidden     = false;
  $("cPrice").textContent = "ราคา " + m.price;

  if (animate) {
    card.classList.remove("pop");
    void card.offsetWidth;
    card.classList.add("pop");
  }
}

function buildReel(startIdx, winIdx) {
  const seq = [];

  for (let n = 0; n < TOTAL; n++) {
    seq.push(Math.floor(Math.random() * MENUS.length));
  }

  seq[0]         = startIdx;
  seq[WIN_INDEX] = winIdx;

  track.innerHTML = seq
    .map((i, n) => {
      const m = MENUS[i];

      return `
        <div class="item${n === WIN_INDEX ? " win-slot" : ""}" style="--rc:${m.color}">
          <div class="pic">${pic(m)}</div>
          <div class="nm">${m.name}</div>
        </div>`;
    })
    .join("");
}

function setPos(p) {
  pos = p;
  track.style.transform = `translateX(${-p}px)`;
}

function centerOf(idx) {
  return idx * ITEM_W + ITEM_W / 2 - caseEl.clientWidth / 2;
}

function spin() {
  if (btn.disabled) {
    return;
  }

  ctx().resume();

  btn.disabled   = true;
  caseEl.hidden  = false;
  caseEl.classList.remove("done");
  showIdle();

  const winIdx = Math.floor(Math.random() * MENUS.length);
  buildReel(current, winIdx);

  const start = centerOf(0);
  const end   = centerOf(WIN_INDEX) + (Math.random() * 0.8 - 0.4) * ITEM_W; // หยุดตำแหน่งสุ่มในช่อง เหมือน CS2

  setPos(start);

  let last = Math.floor((start + caseEl.clientWidth / 2) / ITEM_W);
  const t0 = performance.now();

  function frame(now) {
    const k = Math.min((now - t0) / DURATION, 1);
    const e = 1 - Math.pow(1 - k, 4); // ease-out

    setPos(start + (end - start) * e);

    const idx = Math.floor((pos + caseEl.clientWidth / 2) / ITEM_W);

    if (idx !== last) {
      last = idx;
      tick();
    }

    if (k < 1) {
      requestAnimationFrame(frame);
      return;
    }

    current = winIdx;
    track.children[WIN_INDEX].classList.add("win");
    caseEl.classList.add("done");

    winSound();
    showCard(winIdx, true);

    btn.disabled = false;
  }

  frame(t0);
}

btn.addEventListener("click", spin);
window.addEventListener("resize", () => {
  if (btn.disabled) {
    return;
  }
  const won = track.children[WIN_INDEX]?.classList.contains("win");
  setPos(centerOf(won ? WIN_INDEX : 0));
});
showIdle();