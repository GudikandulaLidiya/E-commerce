
var products = [];
var cart = [];
var wishlist = [];
var username = localStorage.getItem("username");

var username = localStorage.getItem("username");

if (!username) {
    window.location.href = "login.html";
}
else {
    document.getElementById("welcomeUser").innerHTML = username;
}

function logout() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
}
// Load products

async function loadProducts() {

    try {

        var response = await fetch(
            "https://dummyjson.com/products?limit=0"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        var data = await response.json();

        products = data.products;

        loadCategories();
        displayProducts();

    } catch (error) {

        document.getElementById("products").innerHTML =
            "Unable to load products. Check internet connection.";

        console.log(error);

    }
}

// Load categories


function loadCategories() {

    var categories = [];

    products.forEach(function(product) {

        if (!categories.includes(product.category)) {
            categories.push(product.category);
        }

    });

    var output = '<option value="all">All Categories</option>';

    var buttonOutput = `
        <button class="selected"
            data-category="all"
            onclick="selectCategory('all')">
            All
        </button>
    `;

    categories.forEach(function(category) {

        output += `
            <option value="${category}">${category}</option>
        `;

        buttonOutput += `
            <button
                data-category="${category}"
                onclick="selectCategory('${category}')">
                ${category}
            </button>
        `;

    });

    document.getElementById("categoryFilter").innerHTML = output;

    document.getElementById("categoryButtons").innerHTML =
        buttonOutput;
}

// Display products


function displayProducts(list = products) {

    var output = "";

    if (list.length === 0) {
        output = "<p>No products found!</p>";
    }

    list.forEach(function(product) {

        var isWishlisted = wishlist.some(function(item) {
            return item.id === product.id;
        });

        var discount = Math.round(product.discountPercentage || 0);

        var originalPrice = product.price /
            (1 - discount / 100);

        var stars = "★".repeat(Math.round(product.rating || 0));

        var reviewCount = product.reviews ?
            product.reviews.length : 0;

        output += `
            <div class="product">

                <button
                    class="heart-btn ${isWishlisted ? 'active' : ''}"
                    onclick="toggleWishlist(${product.id})">
                    ${isWishlisted ? '♥' : '♡'}
                </button>

                <span class="discount-badge">
                    ${discount}% OFF
                </span>

                <img src="${product.thumbnail}" alt="${product.title}">

                <h3>${product.title}</h3>

                <div class="product-rating">
                    ${stars}
                    <span>${product.rating || 0} (${reviewCount})</span>
                </div>

                <p class="old-price">
                    $${originalPrice.toFixed(2)}
                </p>

                <p class="new-price">
                    $${product.price.toFixed(2)}
                </p>

                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

            </div>
        `;

    });

    document.getElementById("products").innerHTML = output;
}

// Search and category filter


function filterProducts() {

    var searchValue = document.getElementById("searchInput")
        .value.toLowerCase();

    var categoryValue = document.getElementById("categoryFilter").value;

    var filteredProducts = products.filter(function(product) {

        var matchesSearch = product.title.toLowerCase()
            .includes(searchValue);

        var matchesCategory = categoryValue === "all" ||
            product.category === categoryValue;

        return matchesSearch && matchesCategory;

    });

    displayProducts(filteredProducts);

    var buttons = document.querySelectorAll(".category-buttons button");

    buttons.forEach(function(button) {

        if (button.getAttribute("data-category") === categoryValue) {
            button.classList.add("selected");
        } else {
            button.classList.remove("selected");
        }

    });
}

function selectCategory(category) {

    document.getElementById("categoryFilter").value = category;

    filterProducts();
}

// Wishlist functions

function toggleWishlist(id) {

    var item = wishlist.find(function(product) {
        return product.id === id;
    });

    if (item) {

        wishlist = wishlist.filter(function(product) {
            return product.id !== id;
        });

    } else {

        var product = products.find(function(p) {
            return p.id === id;
        });

        if (product) {
            wishlist.push(product);
        }

    }

    filterProducts();
    displayWishlist();
}
// Display wishlist

function displayWishlist() {

    var output = "";

    document.getElementById("wishlistCount").innerHTML =
        wishlist.length;

    if (wishlist.length === 0) {

        output = "<p>Your wishlist is empty.</p>";

    }

    wishlist.forEach(function(item) {

        output += `
            <div class="wishlist-item">

                <img src="${item.thumbnail}" alt="${item.title}">

                <div class="wishlist-details">

                    <h4>${item.title}</h4>

                    <p>$${item.price}</p>

                    <button onclick="addToCart(${item.id})">
                        Add to Cart
                    </button>

                    <button class="remove-btn"
                        onclick="toggleWishlist(${item.id})">
                        Remove
                    </button>

                </div>

            </div>
        `;

    });

    document.getElementById("wishlistItems").innerHTML = output;
}
function toggleWishlistPanel() {

    var panel = document.getElementById("wishlistPanel");

    if (panel.style.display === "block") {

        panel.style.display = "none";

    } else {

        panel.style.display = "block";
        displayWishlist();

    }
}
// Add to cart

function addToCart(id) {

    var item = cart.find(function(product) {
        return product.id === id;
    });

    if (item) {

        item.quantity++;

    } else {

        var product = products.find(function(p) {
            return p.id === id;
        });

        if (!product) {
            return;
        }

        cart.push({
            id: product.id,
            title: product.title,
           price: product.price *
    (1 - (product.discountPercentage || 0) / 100),
            quantity: 1
        });

    }

    displayCart();
}

// Display cart

function displayCart() {

    var output = "";
    var total = 0;

    cart.forEach(function(item, index) {

        var itemTotal = item.price * item.quantity;

        total += itemTotal;

        output += `
            <tr>

                <td>${item.title}</td>

                <td>
                    <button class="qty-btn"
                    onclick="changeQuantity(${index}, -1)">-</button>

                    ${item.quantity}

                    <button class="qty-btn"
                    onclick="changeQuantity(${index}, 1)">+</button>
                </td>

                <td>$${item.price}</td>

                <td>$${itemTotal.toFixed(2)}</td>

                <td>
                    <button class="remove-btn"
                    onclick="removeItem(${index})">X</button>
                </td>

            </tr>
        `;

    });

    if (cart.length === 0) {
        output = '<tr><td colspan="5">Cart is empty</td></tr>';
    }

    document.getElementById("cartItems").innerHTML = output;

    document.getElementById("grandTotal").innerHTML =
        "Total: $" + total.toFixed(2);
}

// Change quantity

function changeQuantity(index, value) {

    cart[index].quantity += value;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    displayCart();
}

// Remove cart item

function removeItem(index) {

    cart.splice(index, 1);

    displayCart();
}

// Start application

loadProducts();
displayCart();
displayWishlist();
