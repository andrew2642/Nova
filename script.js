/* =================================================
   🔧 CANVAS CONFIGURATION (PRINT AREA)
   🔴 EDIT HERE → change print area size
================================================= */
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;

/* =================================================
   🎯 CANVAS SETUP
================================================= */
const frontCanvas = document.getElementById("frontCanvas");
const backCanvas = document.getElementById("backCanvas");

frontCanvas.width = CANVAS_WIDTH;
frontCanvas.height = CANVAS_HEIGHT;
backCanvas.width = CANVAS_WIDTH;
backCanvas.height = CANVAS_HEIGHT;

const frontCtx = frontCanvas.getContext("2d");
const backCtx = backCanvas.getContext("2d");

/* =================================================
   🧠 GLOBAL STATE
================================================= */
let activeSide = "front";
let dragging = false;
let offsetX = 0;
let offsetY = 0;
let productImage = null;
let productName = "";

/* =================================================
   🧥 PRODUCTS
   🔴 EDIT HERE → Add / change products
================================================= */
const PRODUCTS = [
  {
    name: "White Hoodie",
    front: "products/Asset 1.png",
    back: "products/Asset 2.png",
    price: 500,
  },
  {
    name: "Black Hoodie",
    front: "products/Asset 3.png",
    back: "products/Asset 4.png",
    price: 550,
  },
];

/* =================================================
   🎨 FRONT & BACK STATE
================================================= */
const sides = {
  front: {
    canvas: frontCanvas,
    ctx: frontCtx,
    designImage: null,
    design: { x: 0, y: 0, width: 0, height: 0 },
    active: false
  },
  back: {
    canvas: backCanvas,
    ctx: backCtx,
    designImage: null,
    design: { x: 0, y: 0, width: 0, height: 0 },
    active: false
  }
};

/* =================================================
   🧥 SELECT PRODUCT
================================================= */
function selectProduct(index) {
  const product = PRODUCTS[index];
  productName = product.name;

  // Preload front and back images
  const frontImage = new Image();
  frontImage.src = product.front;
  frontImage.onload = () => {
    sides.front.productImage = frontImage;
    drawSide("front");
  };

  const backImage = new Image();
  backImage.src = product.back;
  backImage.onload = () => {
    sides.back.productImage = backImage;
    drawSide("back");
  };
}

/* =================================================
   🎨 SELECT DESIGN
   🔴 EDIT HERE → design behavior
================================================= */
function selectDesign(src) {
  const side = sides[activeSide];

  side.designImage = new Image();
  side.designImage.src = src;

  side.designImage.onload = () => {

    // 🔴 EDIT HERE → max design size (NO STRETCH)
    const MAX_SIZE = 200;

    let w = side.designImage.width;
    let h = side.designImage.height;

    const scale = Math.min(MAX_SIZE / w, MAX_SIZE / h, 1);

    side.design.width = w * scale;
    side.design.height = h * scale;

    side.design.x = (CANVAS_WIDTH - side.design.width) / 2;
    side.design.y = (CANVAS_HEIGHT - side.design.height) / 2;

    drawSide(activeSide);
  };
}

/* =================================================
   🖌️ DRAW FUNCTIONS
================================================= */
function drawSide(sideName) {
  const side = sides[sideName];
  const { canvas, ctx, designImage, design } = side;
  const frontButton = document.getElementById("front");
  const backButton = document.getElementById("back");

  // Update active side buttons
  frontButton.addEventListener("click", () => {
    activeSide = "front";
    drawSide("front");
  });
  backButton.addEventListener("click", () => {
    activeSide = "back";
    drawSide("back");
  });

  if (sideName === "front") {
    frontButton.classList.add("active");
    backButton.classList.remove("active");
  } else {
    frontButton.classList.remove("active");
    backButton.classList.add("active");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (side.productImage) {
  drawProduct(ctx, canvas, side.productImage);
}

  if (designImage) {
    ctx.drawImage(
      designImage,
      design.x,
      design.y,
      design.width,
      design.height
    );
  }
}

function drawProduct(ctx, canvas, productImage) {
  const imgRatio = productImage.width / productImage.height;
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

  ctx.drawImage(productImage, x, y, w, h);
}

/* =================================================
   🖱️ DRAGGING LOGIC (MOUSE + TOUCH)
================================================= */
function getPointerPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;

  return {
    x: (cx - rect.left) * (canvas.width / rect.width),
    y: (cy - rect.top) * (canvas.height / rect.height)
  };
}

function insideDesign(d, p) {
  return (
    p.x >= d.x &&
    p.x <= d.x + d.width &&
    p.y >= d.y &&
    p.y <= d.y + d.height
  );
}

function clampDesign(d, canvas) {
  d.x = Math.max(0, Math.min(canvas.width - d.width, d.x));
  d.y = Math.max(0, Math.min(canvas.height - d.height, d.y));
}

function startDrag(e, sideName) {
  const side = sides[sideName];
  if (!side.designImage) return;

  const pos = getPointerPos(e, side.canvas);

  if (insideDesign(side.design, pos)) {
    dragging = true;
    activeSide = sideName;
    offsetX = pos.x - side.design.x;
    offsetY = pos.y - side.design.y;
  }
}

function drag(e, sideName) {
  if (!dragging || activeSide !== sideName) return;

  const side = sides[sideName];
  const pos = getPointerPos(e, side.canvas);

  side.design.x = pos.x - offsetX;
  side.design.y = pos.y - offsetY;

  clampDesign(side.design, side.canvas);
  drawSide(sideName);
}

function stopDrag() {
  dragging = false;
}

/* =================================================
   📡 EVENTS
================================================= */
["mousedown", "touchstart"].forEach(ev => {
  frontCanvas.addEventListener(ev, e => startDrag(e, "front"));
  backCanvas.addEventListener(ev, e => startDrag(e, "back"));
});

["mousemove", "touchmove"].forEach(ev => {
  frontCanvas.addEventListener(ev, e => drag(e, "front"));
  backCanvas.addEventListener(ev, e => drag(e, "back"));
});

["mouseup", "mouseleave", "touchend"].forEach(ev => {
  frontCanvas.addEventListener(ev, stopDrag);
  backCanvas.addEventListener(ev, stopDrag);
});

/* =================================================
   📏 SIZE SELECTION
================================================= */
document.querySelectorAll(".size-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".size-btn")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  };
});

/* =================================================
   🛒 CART
================================================= */
document.getElementById("add-to-cart-btn").onclick = () => {
  const cart = document.getElementById("cart-items");
  const sizeBtn = document.querySelector(".size-btn.active");

  const li = document.createElement("li");
  li.textContent = `${productName} - Size: ${sizeBtn ? sizeBtn.dataset.size : "N/A"}`;

  const remove = document.createElement("button");
  remove.textContent = "Remove";
  remove.onclick = () => cart.removeChild(li);

  li.appendChild(remove);
  cart.appendChild(li);
};

document.getElementById("remove-all-btn").onclick = () => {
  document.getElementById("cart-items").innerHTML = "";
};

/* =================================================
   📤 EXPORT FRONT + BACK AS ONE HORIZONTAL IMAGE
================================================= */

document.getElementById("export-both").onclick = () => {
  if (!productName) productName = "product";

  // Create a temporary canvas
  const combinedCanvas = document.createElement("canvas");
  const padding = 20; // space between front and back
  combinedCanvas.width = CANVAS_WIDTH * 2 + padding;
  combinedCanvas.height = CANVAS_HEIGHT;

  const ctx = combinedCanvas.getContext("2d");

  // Draw front canvas on the left
  ctx.drawImage(frontCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw back canvas on the right
  ctx.drawImage(backCanvas, CANVAS_WIDTH + padding, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Export combined image
  const link = document.createElement("a");
  link.download = `${productName}-front-back.png`;
  link.href = combinedCanvas.toDataURL("image/png", 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

