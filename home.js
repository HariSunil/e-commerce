         const productContainer = document.getElementById("productContainer");
         const cartBtn = document.getElementById("cartBtn");
         const cartModal = document.getElementById("cartModal");
         const closeCart = document.getElementById("closeCart");
         const cartCount = document.getElementById("cartCount");
         const cartItems = document.getElementById("cartItems");
         const cartTotal = document.getElementById("cartTotal");
        
         let cart = {};
         let products = [];
// ========================================================
//    Load API Products
//    ========================================================= */
async function loadApiProducts() {
  try {
    // API link: https://fakestoreapi.com/products added
    const res = await fetch("https://fakestoreapi.com/products");
    const data = await res.json();

    const fragment = document.createDocumentFragment();

    data.forEach(item => {
      const id = "api-" + item.id;

      const col = document.createElement("div");
      col.className = "col-md-3 product-item";
      col.dataset.category = item.category;

      col.innerHTML = `
                <div class="product-card">
                    <img src="${item.image}">
                    <h4 class="mt-3">${escapeHtml(item.title)}</h4>
                    <p>${escapeHtml(item.description.substring(0, 90))}...</p>
                    <div class="price-tag">$${item.price}</div>

                    <div class="d-flex justify-content-center gap-3">
                        <button class="btn-1 btn-dark btn-outline-dark">Details</button>
                        <button
                            class="btn-1 btn-dark add-cart-js"
                            data-id="${id}"
                            data-title="${escapeHtml(item.title)}"
                            data-price="${item.price}"
                            data-image="${item.image}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;

      fragment.appendChild(col);
    });

    productContainer.appendChild(fragment);

    // Bind API buttons
    document.querySelectorAll(".add-cart-js").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        addToCart(id, {
          title: btn.dataset.title,
          price: btn.dataset.price,
          image: btn.dataset.image
        });
      });
    });

        // Update initial state
 
    updateButtonsState();

  } catch (err) {
    console.error("API Error:", err);
    document.querySelector(".loading").textContent = "Failed to load products. Please try again.";

  }



// Escape HTML
function escapeHtml(txt) {
  return String(txt)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
}