// ========================================================
        //    Global Variables
        // ========================================================
        const productContainer = document.getElementById("productContainer");
        const cartCount = document.getElementById("cartCount");
        
        let cart = {};
        let products = [];

        // ========================================================
        //    Helper Functions
        // ========================================================

        // Escape HTML to prevent XSS attacks
        function escapeHtml(txt) {
            return String(txt)
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        }

        // Save cart to localStorage
        function saveCart() {
            localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
        }

        // Load cart from localStorage
        function loadCart() {
            const savedCart = localStorage.getItem('ecommerce_cart');
            if (savedCart) {
                try {
                    cart = JSON.parse(savedCart);
                    updateCartCount();
                } catch (e) {
                    console.error('Error loading cart:', e);
                    cart = {};
                }
            }
        }

        // Update cart count in header
        function updateCartCount() {
            const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }

        // Update button states based on cart contents
        function updateButtonsState() {
            document.querySelectorAll('.add-cart-js').forEach(btn => {
                const id = btn.dataset.id;
                if (cart[id]) {
                    btn.textContent = 'In Cart';
                    btn.disabled = true;
                } else {
                    btn.textContent = 'Add to Cart';
                    btn.disabled = false;
                }
            });
        }

        // ========================================================
        //    Load API Products
        // ========================================================

        async function loadApiProducts() {
            try {
                // Fetch products from API
                const res = await fetch("https://fakestoreapi.com/products");
                const data = await res.json();

                // Hide loading text
                document.querySelector(".loading").style.display = "none";

                // Create document fragment for better performance
                const fragment = document.createDocumentFragment();

                // Loop through products and create cards
                data.forEach(item => {
                    const id = "api-" + item.id;

                    const col = document.createElement("div");
                    col.className = "col-md-3 product-item";
                    col.dataset.category = item.category;

                    col.innerHTML = `
                        <div class="product-card">
                            <img src="${item.image}" alt="${escapeHtml(item.title)}">
                            <h4 class="mt-3">${escapeHtml(item.title)}</h4>
                            <p>${escapeHtml(item.description.substring(0, 90))}...</p>
                            <div class="price-tag">$${item.price.toFixed(2)}</div>

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

                // Append all products at once
                productContainer.appendChild(fragment);

                // Bind click events to "Add to Cart" buttons
                document.querySelectorAll(".add-cart-js").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const id = btn.dataset.id;
                        addToCart(id, {
                            title: btn.dataset.title,
                            price: parseFloat(btn.dataset.price),
                            image: btn.dataset.image
                        });
                    });
                });

                // Update button states based on existing cart
                updateButtonsState();

            } catch (err) {
                console.error("API Error:", err);
                document.querySelector(".loading").textContent = "Failed to load products. Please try again.";
            }
        }

        // ========================================================
        //    Cart Functions
        // ========================================================

        // Add item to cart
        function addToCart(id, product) {
            if (cart[id]) {
                // If item already exists, increase quantity
                cart[id].quantity++;
            } else {
                // Add new item to cart
                cart[id] = {
                    title: product.title,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                };
            }
            
            // Update UI and save
            updateCartCount();
            updateButtonsState();
            saveCart();
            
            // Show visual feedback
            const btn = document.querySelector(`[data-id="${id}"]`);
            if (btn) {
                btn.textContent = 'Added!';
                btn.style.background = '#28a745';
                btn.style.color = 'white';
                btn.style.borderColor = '#28a745';
                
                setTimeout(() => {
                    btn.textContent = 'In Cart';
                    btn.disabled = true;
                    btn.style.background = '#28a745';
                }, 800);
            }
        }

        // Update item quantity in cart
        function updateQuantity(id, change) {
            if (cart[id]) {
                cart[id].quantity += change;
                
                // Remove item if quantity reaches 0
                if (cart[id].quantity <= 0) {
                    delete cart[id];
                }
                
                // Update UI and save
                updateCartCount();
                updateButtonsState();
                saveCart();
                renderCart();
            }
        }

        // Render cart page
        function renderCart() {
            const cartContent = document.getElementById('cartContent');
            const cartItems = Object.entries(cart);

            // Show empty cart message if no items
            if (cartItems.length === 0) {
                cartContent.innerHTML = `
                    <div class="empty-cart">
                        <h3>Your cart is empty</h3>
                        <p>Add some products to get started!</p>
                        <a href="#" class="continue-shopping" onclick="showPage('products'); return false;">Continue Shopping</a>
                    </div>
                `;
                return;
            }

            // Calculate totals
            const subtotal = cartItems.reduce((sum, [id, item]) => {
                return sum + (item.price * item.quantity);
            }, 0);
            
            const shipping = 30;
            const total = subtotal + shipping;
            const totalItems = cartItems.reduce((sum, [, item]) => sum + item.quantity, 0);

            // Render cart with items
            cartContent.innerHTML = `
                <div class="cart-container">
                    <div class="item-list">
                        <h3>Item List</h3>
                        ${cartItems.map(([id, item]) => `
                            <div class="cart-item">
                                <img src="${item.image}" alt="${escapeHtml(item.title)}">
                                <div class="cart-item-info">
                                    <div class="cart-item-title">${escapeHtml(item.title)}</div>
                                    <div class="cart-item-controls">
                                        <div class="quantity-control">
                                            <button class="qty-btn" onclick="updateQuantity('${id}', -1)">−</button>
                                            <span>${item.quantity}</span>
                                            <button class="qty-btn" onclick="updateQuantity('${id}', 1)">+</button>
                                        </div>
                                        <div class="cart-item-price">${item.quantity} x $${item.price.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-summary">
                        <h3>Order Summary</h3>
                        <div class="summary-row">
                            <span>Products (${totalItems})</span>
                            <span>$${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping</span>
                            <span>$${shipping.toFixed(2)}</span>
                        </div>
                        <div class="summary-total">
                            <span>Total amount</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                        <button class="checkout-btn" onclick="checkout()">Go to checkout</button>
                    </div>
                </div>
            `;
        }

        // Handle checkout
        function checkout() {
            const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
            const total = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0) + 30;
            
            alert(`Proceeding to checkout...\n\nTotal items: ${totalItems}\nTotal amount: $${total.toFixed(2)}`);
            
            // Optionally: Clear cart after successful checkout
            // cart = {};
            // saveCart();
            // updateCartCount();
            // updateButtonsState();
            // showPage('products');
        }

        // ========================================================
        //    Page Navigation
        // ========================================================

        function showPage(pageName) {
            // Hide all pages
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            
            // Show selected page
            if (pageName === 'cart') {
                document.getElementById('cartPage').classList.add('active');
                renderCart();
            } else {
                document.getElementById('productsPage').classList.add('active');
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // ========================================================
        //    Initialize Application
        // ========================================================

        // Load cart from storage and fetch products when page loads
        window.addEventListener('DOMContentLoaded', () => {
            loadCart();
            loadApiProducts();
        });

