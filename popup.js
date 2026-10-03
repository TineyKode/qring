const $ = (id) => document.getElementById(id);
const input = $("input"), canvas = $("canvas"), ctx = canvas.getContext("2d");
let current = null; // { qr, text }

qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"]; // emoji / non-Latin text

function build(text, ecc) {
  const qr = qrcode(0, ecc); // 0 = auto version
  qr.addData(text, "Byte");
  qr.make();
  return qr;
}

function drawTo(c, qr, px, margin) {
  const n = qr.getModuleCount();
  const cell = Math.floor(px / (n + margin * 2));
  const size = cell * (n + margin * 2);
  c.width = size; c.height = size;
  const g = c.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, size, size);
  g.fillStyle = "#000";
  for (let r = 0; r < n; r++)
    for (let col = 0; col < n; col++)
      if (qr.isDark(r, col)) g.fillRect((col + margin) * cell, (r + margin) * cell, cell, cell);
}

function toSvg(qr, margin = 4) {
  const n = qr.getModuleCount(), total = n + margin * 2;
  let d = "";
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (qr.isDark(r, c)) d += `M${c + margin},${r + margin}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

function render() {
  const text = input.value.trim();
  $("count").textContent = `${input.value.length} chars`;
  $("warn").hidden = true;
  ["dlPng", "dlSvg", "copy"].forEach((id) => ($(id).disabled = true));
  current = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.visibility = "hidden";
  $("empty").hidden = false;
  if (!text) return;
  try {
    const qr = build(text, $("ecc").value);
    drawTo(canvas, qr, 240, 0);
    canvas.style.visibility = "visible";
    $("empty").hidden = true;
    current = { qr, text };
    ["dlPng", "dlSvg", "copy"].forEach((id) => ($(id).disabled = false));
  } catch (e) {
    $("warn").hidden = false; // text exceeds QR capacity
  }
}

function say(msg) { $("status").textContent = msg; setTimeout(() => ($("status").textContent = ""), 2500); }

function pngBlob() {
  const c = document.createElement("canvas");
  drawTo(c, current.qr, parseInt($("size").value, 10), 4);
  return new Promise((res) => c.toBlob(res, "image/png"));
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$("dlPng").onclick = async () => { download(await pngBlob(), "qr-code.png"); say("Saved PNG"); };
$("dlSvg").onclick = () => { download(new Blob([toSvg(current.qr)], { type: "image/svg+xml" }), "qr-code.svg"); say("Saved SVG"); };
$("copy").onclick = async () => {
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": await pngBlob() })]);
    say("Copied image to clipboard");
  } catch { say("Copy failed — use Download instead"); }
};
$("useTab").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) { input.value = tab.url; render(); }
};

input.addEventListener("input", render);
$("ecc").addEventListener("change", render);

(async function init() {
  const { pending } = await chrome.storage.session.get("pending");
  if (pending) {
    input.value = pending;
    await chrome.storage.session.remove("pending");
  } else {
    // Default to the current tab's URL for one-click use
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && /^https?:/.test(tab.url || "")) input.value = tab.url;
  }
  render();
})();
