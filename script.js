/* =================================================
   🔧 CANVAS CONFIGURATION
================================================= */
const SINGLE_WIDTH = 500;
const SINGLE_HEIGHT = 600;

// EXPORT / PREVIEW CANVAS (SIDE BY SIDE)
const EXPORT_WIDTH = SINGLE_WIDTH * 2;
const EXPORT_HEIGHT = SINGLE_HEIGHT;

/* =================================================
   🎯 CANVAS SETUP
================================================= */
const frontCanvas = document.getElementById("frontCanvas");
const backCanvas = document.getElementById("backCanvas");

// IMPORTANT: allow touch input
frontCanvas.style.touchAction = "none";
backCanvas.style.touchAction = "none";

frontCanvas.width = SINGLE_WIDTH;
frontCanvas.height = SINGLE_HEIGHT;
backCanvas.width = SINGLE_WIDTH;
backCanvas.height = SINGLE_HEIGHT;

const frontCtx = frontCanvas.getContext("2d");
const backCtx = backCanvas.getContext("2d");

/* =================================================
   🧠 GLOBAL STATE
================================================= */
let activeSide = "front";
let dragging = false;
let offsetX = 0;
let offsetY = 0;

/* =================================================
   🧥 PRODUCTS
================================================= */
const PRODUCTS = [
  { name: "White Hoodie", front: "products/Asset 1.png", back: "products/Asset 2.png" },
  { name: "Black Hoodie", front: "products/Asset 3.png", back: "products/Asset 4.png" },
];

const currentProduct = { front: null, back: null };
const getProductByName = (name) => PRODUCTS.find(p => p.name === name);

/* =================================================
   🎨 SIDE STATE
================================================= */
function createSide(canvas, ctx) {
  return {
    canvas,
    ctx,
    designImage: null,
    baseWidth: 0,
    baseHeight: 0,
    scale: 0.1,
    design: { x: 0, y: 0, width: 0, height: 0 },
  };
}

const sides = {
  front: createSide(frontCanvas, frontCtx),
  back: createSide(backCanvas, backCtx),
};

/* =================================================
   🧥 SELECT PRODUCT
================================================= */
function selectProduct(index) {
  const product = PRODUCTS[index];
  const frontImg = new Image();
  const backImg = new Image();

  frontImg.src = product.front;
  backImg.src = product.back;

  frontImg.onload = () => drawSide("front");
  backImg.onload = () => drawSide("back");

  currentProduct.front = frontImg;
  currentProduct.back = backImg;
}

/* =================================================
   🎨 SELECT DESIGN
================================================= */
function selectDesign(src) {
  const side = sides[activeSide];
  side.designImage = new Image();
  side.designImage.src = src;

  side.designImage.onload = () => {
    side.baseWidth = side.designImage.width;
    side.baseHeight = side.designImage.height;

    updateDesignSize(side);

    side.design.x = (SINGLE_WIDTH - side.design.width) / 2;
    side.design.y = (SINGLE_HEIGHT - side.design.height) / 2;

    drawSide(activeSide);
  };
}

/* =================================================
   📏 DESIGN SIZE CONTROL
================================================= */
const sizeSlider = document.getElementById("designSize");
if (sizeSlider) {
  sizeSlider.addEventListener("input", () => {
    const side = sides[activeSide];
    if (!side.designImage) return;

    side.scale = sizeSlider.value / 700;
    updateDesignSize(side);
    clampDesign(side);
    drawSide(activeSide);
  });
}

function updateDesignSize(side) {
  side.design.width = side.baseWidth * side.scale;
  side.design.height = side.baseHeight * side.scale;
}

/* =================================================
   🖌️ DRAW SINGLE SIDE
================================================= */
function drawSide(sideName) {
  const side = sides[sideName];
  const ctx = side.ctx;
  const canvas = side.canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const productImg = currentProduct[sideName];
  if (productImg) drawProduct(ctx, canvas, productImg);

  if (side.designImage) {
    ctx.drawImage(
      side.designImage,
      side.design.x,
      side.design.y,
      side.design.width,
      side.design.height
    );
  }
}

function drawProduct(ctx, canvas, img) {
  const imgRatio = img.width / img.height;
  const canvasRatio = canvas.width / canvas.height;

  let w, h, x, y;

  if (imgRatio > canvasRatio) {
    w = canvas.width;
    h = w / imgRatio;
    x = 0;
    y = (canvas.height - h) / 2;
  } else {
    h = canvas.height;
    w = h * imgRatio;
    x = (canvas.width - w) / 2;
    y = 0;
  }

  ctx.drawImage(img, x, y, w, h);
}

/* =================================================
   🧩 DRAW BOTH SIDES SIDE-BY-SIDE
================================================= */
function drawBothSides() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = EXPORT_WIDTH;
  exportCanvas.height = EXPORT_HEIGHT;
  const ctx = exportCanvas.getContext("2d");

  ctx.drawImage(frontCanvas, 0, 0);
  ctx.drawImage(backCanvas, SINGLE_WIDTH, 0);

  return exportCanvas;
}

/* =================================================
   ▶ DESIGNS SCROLL CONTROL
================================================= */
function scrollDesigns(direction) {
  const container = document.getElementById("designs");
  const scrollAmount = 500;
  container.scrollLeft += direction * scrollAmount;
}

/* =================================================
   🖱️ / TOUCH DRAGGING (Pointer Events)
================================================= */
function getPos(e, canvas) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height),
  };
}

function pointerDown(e, sideName) {
  if (activeSide !== sideName) return;
  const side = sides[sideName];
  if (!side.designImage) return;

  const pos = getPos(e, side.canvas);
  const d = side.design;

  if (
    pos.x >= d.x &&
    pos.x <= d.x + d.width &&
    pos.y >= d.y &&
    pos.y <= d.y + d.height
  ) {
    dragging = true;
    offsetX = pos.x - d.x;
    offsetY = pos.y - d.y;
    e.target.setPointerCapture(e.pointerId);
  }
}

function pointerMove(e, sideName) {
  if (!dragging || activeSide !== sideName) return;
  const side = sides[sideName];
  const pos = getPos(e, side.canvas);

  side.design.x = pos.x - offsetX;
  side.design.y = pos.y - offsetY;

  clampDesign(side);
  drawSide(sideName);
}

function pointerUp(e) {
  dragging = false;
  if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
}

function clampDesign(side) {
  side.design.x = Math.max(0, Math.min(side.canvas.width - side.design.width, side.design.x));
  side.design.y = Math.max(0, Math.min(side.canvas.height - side.design.height, side.design.y));
}

// Attach pointer events
[frontCanvas, backCanvas].forEach((canvas, index) => {
  const sideName = index === 0 ? "front" : "back";
  canvas.addEventListener("pointerdown", (e) => pointerDown(e, sideName));
  canvas.addEventListener("pointermove", (e) => pointerMove(e, sideName));
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
});

/* =================================================
   🔁 FRONT / BACK BUTTONS
================================================= */
const frontBtn = document.getElementById("front");
const backBtn = document.getElementById("back");

frontBtn.onclick = () => switchSide("front");
backBtn.onclick = () => switchSide("back");

function switchSide(side) {
  activeSide = side;
  frontBtn.classList.toggle("clicked", side === "front");
  backBtn.classList.toggle("clicked", side === "back");
}

/* =================================================
   🔰 DEFAULT VIEW
================================================= */
switchSide("front");

/* =================================================
   Export front + back as one horizontal image
================================================= */
document.getElementById("export-btn").onclick = exportBoth;
const CANVAS_WIDTH = SINGLE_WIDTH;
const CANVAS_HEIGHT = SINGLE_HEIGHT;
let productName = null;

function exportBoth() {
  if (!productName) productName = "product";

  const combinedCanvas = document.createElement("canvas");
  const padding = 20;
  combinedCanvas.width = CANVAS_WIDTH * 2 + padding;
  combinedCanvas.height = CANVAS_HEIGHT;

  const ctx = combinedCanvas.getContext("2d");
  ctx.drawImage(frontCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.drawImage(backCanvas, CANVAS_WIDTH + padding, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Convert to data URL
  const dataUrl = combinedCanvas.toDataURL("image/png");

  // Show it on screen for screenshotting
  const screenshotWindow = window.open("", "_blank");
  screenshotWindow.document.body.style.margin = "0";
  screenshotWindow.document.body.style.display = "flex";
  screenshotWindow.document.body.style.justifyContent = "center";
  screenshotWindow.document.body.style.alignItems = "center";
  screenshotWindow.document.body.style.height = "100vh";
  screenshotWindow.document.body.style.background = "#fff";
  screenshotWindow.document.body.innerHTML = `<img src="${dataUrl}" style="max-width:95%; max-height:95%;">`;

  // Download it
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${productName}.png`;
  a.click();

  alert("Your design is ready! Take a screenshot to save it.");
}



/* =================================================
   📏 SIZE SELECTION
================================================= */
document.querySelectorAll(".size-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  };
});

/* =================================================
   🛒 CART
================================================= */
function addToCart() {
  const cart = document.getElementById("cart-items");
  const sizeBtn = document.querySelector(".size-btn.active");
  const selectedProduct = document.querySelector("#product-list > input:checked");
  const productName = selectedProduct ? selectedProduct.value : "N/A";
  const size = sizeBtn ? sizeBtn.dataset.size : "N/A";

  const li = document.createElement("li");
  li.textContent = `${productName} - Size: ${size}`;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.onclick = () => cart.removeChild(li);

  li.appendChild(removeBtn);
  cart.appendChild(li);
}

document.getElementById("add-to-cart-btn").onclick = addToCart;

function removeAllFromCart() {
  const cart = document.getElementById("cart-items");
  while (cart.firstChild) cart.removeChild(cart.firstChild);
}

document.getElementById("remove-all-btn").onclick = removeAllFromCart;
