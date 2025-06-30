const products = [
    { id: 1, name: "Fresh Kiwifruit", price: 4.99, image: "images/kiwifruit.jpg" },
    { id: 2, name: "Organic Kumara", price: 2.49, image: "images/kumara.jpg" },
    { id: 3, name: "Full Cream Milk", price: 3.29, image: "images/milk.jpg" },
    { id: 4, name: "Sourdough Bread", price: 3.99, image: "images/bread.jpg" },
    { id: 5, name: "Manuka Honey", price: 19.99, image: "images/honey.jpg" },
    { id: 6, name: "Hokey Pokey Ice Cream", price: 6.49, image: "images/icecream.jpg" },
];

const users = [
    { username: "customer", password: "password123" },
    { username: "Arun", password: "@Arun@" },
    { username: "Mike", password: "@Mike@" }
];

let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

function displayProducts(containerId, limit = products.length) {
    const productList = document.getElementById(containerId);
    if (!productList) return;
    productList.innerHTML = '';
    products.slice(0, limit).forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card p-4 rounded-lg shadow-md';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image mb-4">
            <h3 class="text-lg font-semibold text-white">${product.name}</h3>
            <p class="text-gray-200">NZ$${product.price.toFixed(2)}</p>
            <button onclick="addToCart(${product.id})" class="bg-coral-400 text-white px-4 py-2 rounded mt-2 hover:bg-coral-500 transition-colors">Add to Cart</button>
        `;
        productList.appendChild(productCard);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

function updateCart() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotalElements = document.querySelectorAll('#cart-total');

    cartCountElements.forEach(el => el.textContent = cart.length);

    if (cartItems) {
        cartItems.innerHTML = '';
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="text-white text-center">Your cart is empty.</p>';
        } else {
            const table = document.createElement('table');
            table.className = 'w-full text-white';
            table.innerHTML = `
                <thead>
                    <tr class="border-b border-gray-300">
                        <th class="py-2 text-left">Item</th>
                        <th class="py-2 text-right">Price (NZ$)</th>
                        <th class="py-2 text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map((item, index) => `
                        <tr class="border-b border-gray-300">
                            <td class="py-2">${item.name}</td>
                            <td class="py-2 text-right">${item.price.toFixed(2)}</td>
                            <td class="py-2 text-right">
                                <button onclick="removeFromCart(${index})" class="text-coral-400 hover:text-coral-500">Remove</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            cartItems.appendChild(table);
        }
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotalElements.forEach(el => el.textContent = total.toFixed(2));
}

function removeFromCart(index) {
    cart.splice(index, 1);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

function saveOrderHistory() {
    const username = sessionStorage.getItem('username');
    if (!username || cart.length === 0) return;

    const order = {
        date: new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' }),
        items: cart.map(item => ({ name: item.name, price: item.price })),
        total: cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)
    };

    const history = JSON.parse(localStorage.getItem(`orderHistory_${username}`)) || [];
    history.push(order);
    localStorage.setItem(`orderHistory_${username}`, JSON.stringify(history));
}

function updateNavLinks() {
    const navLinks = document.getElementById('nav-links');
    const loginLink = document.getElementById('login-link');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const username = sessionStorage.getItem('username') || '';

    if (navLinks && loginLink) {
        if (isLoggedIn && username) {
            const history = JSON.parse(localStorage.getItem(`orderHistory_${username}`)) || [];
            loginLink.className = 'relative hover:text-coral-400 transition-colors';
            loginLink.innerHTML = `
                <span class="flex items-center">
                    <i class="fas fa-user mr-1"></i> Welcome ${username}
                    <span class="ml-2 cursor-pointer text-coral-400 hover:text-coral-500" onclick="logout()">Logout</span>
                </span>
                <div id="history-dropdown" class="absolute hidden top-full right-0 mt-2 w-64 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg shadow-lg p-4 z-20">
                    <h3 class="text-lg font-semibold mb-2">Order History</h3>
                    ${history.length === 0 ? '<p>No orders yet.</p>' : history.map((order, index) => `
                        <div class="mb-2">
                            <p class="font-semibold">Order ${index + 1} - ${order.date}</p>
                            <ul class="list-disc pl-4">
                                ${order.items.map(item => `<li>${item.name}: NZ$${item.price.toFixed(2)}</li>`).join('')}
                            </ul>
                            <p class="font-semibold">Total: NZ$${order.total}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            loginLink.onmouseenter = () => {
                const dropdown = loginLink.querySelector('#history-dropdown');
                if (dropdown) dropdown.classList.remove('hidden');
            };
            loginLink.onmouseleave = () => {
                const dropdown = loginLink.querySelector('#history-dropdown');
                if (dropdown) dropdown.classList.add('hidden');
            };
        } else {
            loginLink.href = 'login.html';
            loginLink.innerHTML = '<i class="fas fa-user mr-1"></i> Login';
            loginLink.className = 'hover:text-coral-400 transition-colors';
            loginLink.onmouseenter = null;
            loginLink.onmouseleave = null;
        }
    }
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    alert('Logged out successfully! Kia ora.');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavLinks();

    if (document.getElementById('featured-products')) {
        displayProducts('featured-products', 4);
    }
    if (document.getElementById('product-list')) {
        displayProducts('product-list');
    }
    updateCart();

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveOrderHistory();
            alert('Order placed successfully! Kia ora for shopping with Trendy Groceries NZ.');
            cart = [];
            sessionStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
            window.location.href = 'index.html';
        });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Message sent successfully! We’ll get back to you soon, kia ora.');
            contactForm.reset();
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username);
                alert('Login successful! Kia ora.');
                window.location.href = 'index.html';
            } else {
                alert('Invalid username or password. Please try again.');
            }
        });
    }
});