let designX = 200;
let designY = 250;
let designWidth = 200;
let designHeight = 200;

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

let products = [];
let cart = [];
let selectedProduct = null;
let selectedDesign = null;

// Load products
fetch('products.json')
  .then(res => res.json())
  .then(data => {
    products = data;
    displayProducts();
    displayDesigns();
  });

// Display products
function displayProducts() {
  const list = document.getElementById('product-list');
  products.forEach(product => {
    const div = document.createElement('div');
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" width="150">
      <h3>${product.name}</h3>
      <p>$${product.price.toFixed(2)}</p>
      <button onclick="selectProduct(${product.id})">Select</button>
    `;
    list.appendChild(div);
  });
}

function selectProduct(id) {
  selectedProduct = products.find(p => p.id === id);
  drawPreview();
}

// Display designs
const designFiles = ['designs/hollow knight.png','designs/sparta.png'];
function displayDesigns() {
  const designsDiv = document.getElementById('designs');
  designFiles.forEach(file => {
    const img = document.createElement('img');
    img.src = file;
    img.width = 80;
    img.onclick = () => {
      selectedDesign = file;
      drawPreview();
    };
    designsDiv.appendChild(img);
  });
}

// ------------------------------
// CANVAS & DRAG CONTROLS
// ------------------------------
const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

// Helper to get pointer position (mouse or touch)
function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  } else {
    return {
      x: e.offsetX,
      y: e.offsetY
    };
  }
}

// Start drag
function startDrag(e) {
  const pos = getPointerPos(e);
  if (
    pos.x > designX &&
    pos.x < designX + designWidth &&
    pos.y > designY &&
    pos.y < designY + designHeight
  ) {
    isDragging = true;
    dragOffsetX = pos.x - designX;
    dragOffsetY = pos.y - designY;
    canvas.classList.add("dragging");
    e.preventDefault();
  }
}

// Drag
function drag(e) {
  const pos = getPointerPos(e);

  // Cursor change on hover (desktop)
  if (
    pos.x > designX &&
    pos.x < designX + designWidth &&
    pos.y > designY &&
    pos.y < designY + designHeight
  ) {
    canvas.classList.add("can-move");
  } else {
    canvas.classList.remove("can-move");
  }

  if (!isDragging) return;
  designX = pos.x - dragOffsetX;
  designY = pos.y - dragOffsetY;
  drawPreview();
  e.preventDefault();
}

// Stop drag
function stopDrag() {
  isDragging = false;
  canvas.classList.remove("dragging");
}

// Mouse events
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseleave", stopDrag);

// Touch events (mobile)
canvas.addEventListener("touchstart", startDrag, { passive: false });
canvas.addEventListener("touchmove", drag, { passive: false });
canvas.addEventListener("touchend", stopDrag);
canvas.addEventListener("touchcancel", stopDrag);

// ------------------------------
// DRAW EVERYTHING
// ------------------------------
function drawPreview() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (selectedProduct) {
    const productImg = new Image();
    productImg.src = selectedProduct.image;

    productImg.onload = () => {
      let ratio = productImg.width / productImg.height;
      let newWidth = canvas.width;
      let newHeight = newWidth / ratio;

      if (newHeight > canvas.height) {
        newHeight = canvas.height;
        newWidth = newHeight * ratio;
      }

      let x = (canvas.width - newWidth) / 2;
      let y = (canvas.height - newHeight) / 2;

      ctx.drawImage(productImg, x, y, newWidth, newHeight);

      if (selectedDesign) {
        const designImg = new Image();
        designImg.src = selectedDesign;

        designImg.onload = () => {
          let dratio = designImg.width / designImg.height;
          designHeight = designWidth / dratio;

          ctx.drawImage(designImg, designX, designY, designWidth, designHeight);
        };
      }
    };
  }
}

// ------------------------------
// ADD TO CART
// ------------------------------
document.getElementById('add-to-cart').addEventListener('click', () => {
  if(selectedProduct && selectedDesign){
    cart.push({
      product: selectedProduct.name,
      design: selectedDesign,
      price: selectedProduct.price
    });
    updateCart();
    alert('Product added to cart!');
  } else {
    alert('Select a product and design first.');
  }
});

function updateCart() {
  const cartList = document.getElementById('cart-items');
  cartList.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.product} with design ${item.design.split('/').pop()} - $${item.price.toFixed(2)}`;
    cartList.appendChild(li);
  });

  const total = cart.reduce((sum,item)=>sum+item.price,0);
  document.getElementById('cart-total').textContent = total.toFixed(2);
}

document.getElementById('checkout-btn').addEventListener('click', () => {
  alert('Checkout feature goes here!');
});
