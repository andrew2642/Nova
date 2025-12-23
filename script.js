/* =================================================
   🔧 BASIC CANVAS SETUP
   🔴 CHANGE HERE → canvas size (matches print area)
================================================= */
const CANVAS_WIDTH = 500;   // px
const CANVAS_HEIGHT = 600;  // px

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
let productImage = null;
let dragging = false;
let offsetX = 0;
let offsetY = 0;

/* =================================================
   🎯 FRONT / BACK DATA
================================================= */
const sides = {
  front: {
    canvas: frontCanvas,
    ctx: frontCtx,
    designImage: null,
    design: { x: 150, y: 200, width: 120, height: 120 }
  },
  back: {
    canvas: backCanvas,
    ctx: backCtx,
    designImage: null,
    design: { x: 150, y: 200, width: 120, height: 120 }
  }
};

/* =================================================
   🧥 PRODUCT SELECTION
   🔴 CHANGE HERE → add / replace product images
================================================= */
function selectProduct(index) {

  productImage = new Image();

  const PRODUCTS = [
    "products/Asset 4.png",               // index 0
    "products/black-t-shirt-mockup.jpg"  // index 1
    // 🔴 ADD MORE PRODUCTS HERE
  ];

  productImage.src = PRODUCTS[index];

  productImage.onload = () => {
    drawSide("front");
    drawSide("back");
  };
}

/* =================================================
   🔄 ACTIVE SIDE SWITCH
================================================= */
frontCanvas.addEventListener("click", () => activeSide = "front");
backCanvas.addEventListener("click", () => activeSide = "back");

/* =================================================
   🎨 DESIGN SELECTION
   🔴 CHANGE HERE → design upload logic
================================================= */
function selectDesign(src) {
  const side = sides[activeSide];
  side.designImage = new Image();
  side.designImage.src = src;

  side.designImage.onload = () => {

    // 🔴 CHANGE HERE → default design size
    const MAX_DESIGN_SIZE = 200; // px (no stretch)

    side.design.width = side.designImage.width;
    side.design.height = side.designImage.height;

    const scale = Math.min(
      MAX_DESIGN_SIZE / side.design.width,
      MAX_DESIGN_SIZE / side.design.height,
      1
    );

    side.design.width *= scale;
    side.design.height *= scale;

    side.design.x =
      (side.canvas.width - side.design.width) / 2;
    side.design.y =
      (side.canvas.height - side.design.height) / 2;

    drawSide(activeSide);
  };
}

/* =================================================
   🖌️ DRAW FUNCTIONS
================================================= */
function drawSide(sideName) {
  const side = sides[sideName];
  const { canvas, ctx, designImage, design } = side;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (productImage) drawProduct(ctx, canvas);

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

function drawProduct(ctx, canvas) {

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
    y = 0;
    x = (canvas.width - w) / 2;
  }

  ctx.drawImage(productImage, x, y, w, h);
}

/* =================================================
   🖱️ DRAGGING LOGIC
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

function isInside(d, pos) {
  return (
    pos.x >= d.x &&
    pos.x <= d.x + d.width &&
    pos.y >= d.y &&
    pos.y <= d.y + d.height
  );
}

function clamp(d, canvas) {
  d.x = Math.max(0, Math.min(canvas.width - d.width, d.x));
  d.y = Math.max(0, Math.min(canvas.height - d.height, d.y));
}

function startDrag(e, sideName) {
  const side = sides[sideName];
  if (!side.designImage) return;

  const pos = getPointerPos(e, side.canvas);

  if (isInside(side.design, pos)) {
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

  clamp(side.design, side.canvas);
  drawSide(sideName);
}

function stopDrag() {
  dragging = false;
}

/* =================================================
   📡 EVENT LISTENERS
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
   📏 SIZE BUTTONS
================================================= */
document.querySelectorAll(".size-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".size-btn")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

/* =================================================
    ADD TO CART BUTTON
================================================= */
document.getElementById("add-to-cart-btn").addEventListener("click", () => {
  const cartItems = document.getElementById("cart-items");
  const li = document.createElement("li");
  li.textContent = `${activeSide === "front" ? "Front" : "Back"} Side - ${document.querySelector(".size-btn.active").dataset.size}`;
  cartItems.appendChild(li);
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => {
    cartItems.removeChild(li);
  });
  li.appendChild(removeBtn);

  document.getElementById("remove-all-btn").addEventListener("click", () => {
    const cartItems = document.getElementById("cart-items");
    while (cartItems.firstChild) {
      cartItems.removeChild(cartItems.firstChild);
    }
  });
});
