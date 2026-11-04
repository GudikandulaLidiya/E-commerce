
var products = [];
var cart = [];
var wishlist = [];
var checkoutItems = [];
var checkoutType = "";
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

    var buttonOutput = `
        <button class="selected"
            data-category="all"
            onclick="selectCategory('all')">
            All
        </button>
    `;

    categories.forEach(function(category) {

        buttonOutput += `
            <button
                data-category="${category}"
                onclick="selectCategory('${category}')">
                ${category}
            </button>
        `;

    });

    document.getElementById("categoryButtons").innerHTML = buttonOutput;
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

<button onclick="buyNow(${product.id})">
    Buy Now
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

    var categoryValue = document.querySelector(
        ".category-buttons button.selected"
    ).getAttribute("data-category");

    var filteredProducts = products.filter(function(product) {

        var matchesSearch = product.title.toLowerCase()
            .includes(searchValue);

        var matchesCategory = categoryValue === "all" ||
            product.category === categoryValue;

        return matchesSearch && matchesCategory;

    });

    displayProducts(filteredProducts);
}
function selectCategory(category) {

    var buttons = document.querySelectorAll(".category-buttons button");

    buttons.forEach(function(button) {

        if (button.getAttribute("data-category") === category) {
            button.classList.add("selected");
        } else {
            button.classList.remove("selected");
        }

    });

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
function toggleProfile() {
    var profile = document.getElementById("profileDropdown");

    if (profile.style.display == "block") {
        profile.style.display = "none";
    }
    else {
        profile.style.display = "block";
    }

    document.getElementById("profileUsername").innerHTML =
        localStorage.getItem("username");
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
function showProfile() {
    var username = localStorage.getItem("username");

    document.getElementById("profileDetails").style.display = "block";

    document.getElementById("profileDetails").innerHTML =
        "<h2>My Profile</h2>" +
        "<p><b>Username:</b> " + username + "</p>" +
        "<button onclick='closeProfile()'>Close</button>";
}

function closeProfile() {
    document.getElementById("profileDetails").style.display = "none";
}
function changeProfilePicture() {
    var file = document.getElementById("profileUpload").files[0];

    if (file) {
        var reader = new FileReader();

        reader.onload = function() {
            localStorage.setItem(username + "_profilePicture", reader.result);
            document.querySelector(".profile-pic").src = reader.result;
        };

        reader.readAsDataURL(file);
    }
}
function loadProfilePicture() {
    var picture = localStorage.getItem(username + "_profilePicture");

    if (picture) {
        document.querySelector(".profile-pic").src = picture;
    }
}

document.addEventListener("click", function(event) {

    var profile = document.querySelector(".profile-menu");
    var dropdown = document.getElementById("profileDropdown");

    if (!profile.contains(event.target)) {
        dropdown.style.display = "none";
    }

});
loadProfilePicture();

// Buy Now - Direct purchase

function buyNow(id) {
    var product = products.find(function(p) {
        return p.id === id;
    });

    if (!product) {
        return;
    }

    checkoutItems = [{
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1
    }];

    checkoutType = "buyNow";

    openCheckout();
}


// Cart Checkout

function checkoutCart() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    checkoutItems = cart.map(function(item) {
        return {
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity
        };
    });

    checkoutType = "cart";

    openCheckout();
}


// Open Checkout

function openCheckout() {
    document.getElementById("checkoutSection").style.display = "block";
    document.getElementById("orderConfirmation").style.display = "none";
    document.getElementById("myOrdersSection").style.display = "none";

    var total = 0;

    checkoutItems.forEach(function(item) {
        total += item.price * item.quantity;
    });

    document.getElementById("checkoutTotal").innerHTML =
        "Total: $" + total.toFixed(2);


}


// Close Checkout

function closeCheckout() {
    document.getElementById("checkoutSection").style.display = "none";
}
function playOrderSound() {
    var audio = new (window.AudioContext || window.webkitAudioContext)();

    var notes = [523.25, 659.25, 783.99];

    notes.forEach(function(frequency, index) {
        var oscillator = audio.createOscillator();
        var volume = audio.createGain();

        oscillator.connect(volume);
        volume.connect(audio.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        var startTime = audio.currentTime + index * 0.18;

        volume.gain.setValueAtTime(0.3, startTime);
        volume.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.25);
    });

    setTimeout(function() {
        audio.close();
    }, 1000);
}


// Place Order

function placeOrder(event) {
    event.preventDefault();

    var customerName = document.getElementById("customerName").value;
    var customerPhone = document.getElementById("customerPhone").value;
    var customerAddress = document.getElementById("customerAddress").value;
    var customerCity = document.getElementById("customerCity").value;
    var customerPincode = document.getElementById("customerPincode").value;

    var payment = document.querySelector(
        'input[name="payment"]:checked'
    ).value;

    var total = 0;

    checkoutItems.forEach(function(item) {
        total += item.price * item.quantity;
    });

    var order = {
        orderId: "BB" + Date.now(),
        username: username,
        customerName: customerName,
        phone: customerPhone,
        address: customerAddress,
        city: customerCity,
        pincode: customerPincode,
        payment: payment,
        items: checkoutItems,
        total: total,
        status: "Ordered",
        date: new Date().toLocaleString()
    };

    var orders = JSON.parse(
        localStorage.getItem(username + "_orders")
    ) || [];

    orders.push(order);

    localStorage.setItem(
        username + "_orders",
        JSON.stringify(orders)
    );

    if (checkoutType === "cart") {
        cart = [];
        displayCart();
    }

    document.getElementById("checkoutSection").style.display = "none";

    document.getElementById("orderConfirmation").style.display = "block";

    // Play order confirmation sound
    playOrderSound();

    // Show confirmation message
    document.getElementById("orderConfirmation").innerHTML =
        "<div class='success-box'>" +
            "<div class='success-icon'>✓</div>" +
            "<h2>Yay! Order Confirmed!</h2>" +
            "<p>Your order has been placed successfully.</p>" +
            "<h3>Thank you for shopping with Beauty Bliss! 💗</h3>" +
            "<p><b>Order ID:</b> " + order.orderId + "</p>" +
            "<button onclick=\"showOrderDetails('" + order.orderId + "')\">" +
                "View Details" +
            "</button>" +
        "</div>";

    document.getElementById("checkoutForm").reset();

    document.getElementById("orderConfirmation").scrollIntoView({
        behavior: "smooth"
    });
}
function showOrderDetails(orderId) {

    var orders = JSON.parse(
        localStorage.getItem(username + "_orders")
    ) || [];

    var order = orders.find(function(item) {
        return item.orderId === orderId;
    });

    if (!order) {
        alert("Order details not found!");
        return;
    }

    var productDetails = "";

    order.items.forEach(function(item) {
        productDetails +=
            "<p><b>" + item.title + "</b></p>" +
            "<p>Quantity: " + item.quantity + "</p>" +
            "<p>Price: $" + item.price.toFixed(2) + "</p>" +
            "<hr>";
    });

    document.getElementById("orderConfirmation").innerHTML =
        "<div class='success-box'>" +
            "<h2>📦 Order Details</h2>" +
            "<p><b>Order ID:</b> " + order.orderId + "</p>" +
            "<p><b>Customer:</b> " + order.customerName + "</p>" +
            "<p><b>Phone:</b> " + order.phone + "</p>" +
            "<p><b>Address:</b> " + order.address + ", " +
                order.city + " - " + order.pincode + "</p>" +
            "<p><b>Order Date:</b> " + order.date + "</p>" +
            "<hr>" +
            "<h3>Products Ordered</h3>" +
            productDetails +
            "<h3>Total Amount: $" + order.total.toFixed(2) + "</h3>" +
            "<p><b>Payment:</b> " + order.payment + "</p>" +
            "<p><b>Status:</b> " + order.status + "</p>" +
            "<button onclick='showMyOrders()'>My Orders</button>" +
            "<button onclick='closeOrderDetails()' class='close-order-details'>&times;</button>" +
        "</div>";
}
function closeOrderDetails() {
    document.getElementById("orderConfirmation").style.display = "none";
}
// Show My Orders

function showMyOrders() {
    var orders = JSON.parse(
        localStorage.getItem(username + "_orders")
    ) || [];

    document.getElementById("checkoutSection").style.display = "none";
    document.getElementById("orderConfirmation").style.display = "none";
    document.getElementById("myOrdersSection").style.display = "block";

    var output = "<h2>My Orders 📦</h2>";

    if (orders.length === 0) {
        output += "<p>You have not placed any orders yet.</p>";
    }

    orders.forEach(function(order) {
        output +=
            "<div class='order-item'>" +
            "<h3>Order ID: " + order.orderId + "</h3>" +
            "<p><b>Date:</b> " + order.date + "</p>" +
            "<p><b>Total:</b> $" + order.total.toFixed(2) + "</p>" +
            "<p><b>Status:</b> " + order.status + "</p>" +
            "<p><b>Payment:</b> " + order.payment + "</p>" +
            "<button onclick='viewOrder(\"" + order.orderId + "\")'>" +
            "View Details</button>" +
            "</div>";
    });

    output += "<button onclick='closeMyOrders()'>Close</button>";

    document.getElementById("myOrdersSection").innerHTML = output;

    document.getElementById("myOrdersSection").scrollIntoView({
        behavior: "smooth"
    });

    document.getElementById("profileDropdown").style.display = "none";
}


// View Order Details

function viewOrder(orderId) {
    var orders = JSON.parse(
        localStorage.getItem(username + "_orders")
    ) || [];

    var order = orders.find(function(item) {
        return item.orderId === orderId;
    });

    if (!order) {
        return;
    }

    var output = "<h2>Order Details</h2>";

    output += "<p><b>Order ID:</b> " + order.orderId + "</p>";
    output += "<p><b>Name:</b> " + order.customerName + "</p>";
    output += "<p><b>Phone:</b> " + order.phone + "</p>";
    output += "<p><b>Address:</b> " + order.address + ", " +
        order.city + " - " + order.pincode + "</p>";

    output += "<h3>Products</h3>";

    order.items.forEach(function(item) {
        output += "<p>" + item.title +
            " - Quantity: " + item.quantity +
            " - $" + (item.price * item.quantity).toFixed(2) +
            "</p>";
    });

    output += "<h3>Total: $" + order.total.toFixed(2) + "</h3>";
    output += "<p><b>Payment:</b> " + order.payment + "</p>";
    output += "<p><b>Status:</b> " + order.status + "</p>";
    output += "<button onclick='showMyOrders()'>Back to Orders</button>";

    document.getElementById("myOrdersSection").innerHTML = output;
}


// Close My Orders

function closeMyOrders() {
    document.getElementById("myOrdersSection").style.display = "none";
}
