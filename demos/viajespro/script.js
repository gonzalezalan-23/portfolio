// ==================== INICIALIZACIÓN DE DATOS ====================
function initData() {
    try {
        const guardados = JSON.parse(localStorage.getItem('products') || '[]');
        if (Array.isArray(guardados) && guardados.some(p => String(p.image).includes('picsum.photos'))) {
            const locales = ['bariloche.svg', 'iguazu.svg', 'salta.svg', 'mendoza.svg'];
            guardados.forEach((p, i) => {
                if (String(p.image).includes('picsum.photos')) {
                    p.image = 'assets/img/' + (locales[i] || 'destino.svg');
                }
            });
            localStorage.setItem('products', JSON.stringify(guardados));
        }
    } catch (e) { /* datos rotos: initData ya los repone */ }
    if (!localStorage.getItem('users')) {
        const users = [
            { id: 1, email: 'cliente@test.com', password: '123456', role: 'client', fullName: 'Cliente Demo', phone: '+54 9 11 1234-5678', isActive: true },
            { id: 2, email: 'ventas@viajespro.com', password: 'ventas123', role: 'employee', fullName: 'Jefe Ventas', phone: '', isActive: true }
        ];
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('nextUserId', '3');
    }
    if (!localStorage.getItem('products')) {
        const products = [
            { id: 1, code: 'PKG001', description: 'Bariloche 4 días', category: 'Paquete', price: 899.90, image: 'assets/img/bariloche.svg' },
            { id: 2, code: 'PKG002', description: 'Iguazú 3 días', category: 'Paquete', price: 745.00, image: 'assets/img/iguazu.svg' },
            { id: 3, code: 'PKG003', description: 'Salta y Jujuy 5 días', category: 'Paquete', price: 999.90, image: 'assets/img/salta.svg' },
            { id: 4, code: 'PKG004', description: 'Mendoza 4 días', category: 'Paquete', price: 849.00, image: 'assets/img/mendoza.svg' }
        ];
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('nextProductId', '5');
    }
    if (!localStorage.getItem('carts')) localStorage.setItem('carts', '{}');
    if (!localStorage.getItem('orders')) localStorage.setItem('orders', '[]');
    if (!localStorage.getItem('historicalOrders')) localStorage.setItem('historicalOrders', '[]');
    if (!localStorage.getItem('sales')) localStorage.setItem('sales', '[]');
    if (!localStorage.getItem('emailRecipients')) {
        const recipients = [
            { id: 1, email: 'ventas@viajespro.com', name: 'Ventas', department: 'Comercial', isActive: true }
        ];
        localStorage.setItem('emailRecipients', JSON.stringify(recipients));
        localStorage.setItem('nextRecipientId', '2');
    }
}
initData();

// ==================== AUTENTICACIÓN Y SESIÓN ====================
let currentUser = null;
function getCurrentUser() {
    if (currentUser) return currentUser;
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        return currentUser;
    }
    return null;
}
function setCurrentUser(user) {
    currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}
function clearCurrentUser() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
}

function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password && u.isActive);
    if (user) {
        setCurrentUser({ id: user.id, email: user.email, role: user.role, fullName: user.fullName });
        return true;
    }
    return false;
}
function register(fullName, email, password, phone) {
    const users = JSON.parse(localStorage.getItem('users'));
    if (users.find(u => u.email === email)) return false;
    const nextId = parseInt(localStorage.getItem('nextUserId'));
    const newUser = {
        id: nextId,
        email,
        password,
        role: 'client',
        fullName,
        phone,
        isActive: true
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('nextUserId', (nextId + 1).toString());
    // Crear carrito vacío
    const carts = JSON.parse(localStorage.getItem('carts'));
    carts[newUser.id] = [];
    localStorage.setItem('carts', JSON.stringify(carts));
    return true;
}
function logout() {
    clearCurrentUser();
    window.location.href = 'index.html';
}

// ==================== CARRITO ====================
function getCart(userId) {
    const carts = JSON.parse(localStorage.getItem('carts'));
    return carts[userId] || [];
}
function addToCart(userId, productId, quantity = 1) {
    const products = JSON.parse(localStorage.getItem('products'));
    const product = products.find(p => p.id == productId);
    if (!product) return false;
    const carts = JSON.parse(localStorage.getItem('carts'));
    let cart = carts[userId] || [];
    const existing = cart.find(item => item.productId == productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            productId,
            quantity,
            product: { id: product.id, description: product.description, price: product.price }
        });
    }
    carts[userId] = cart;
    localStorage.setItem('carts', JSON.stringify(carts));
    return true;
}
function updateCartItem(userId, productId, quantity) {
    const carts = JSON.parse(localStorage.getItem('carts'));
    let cart = carts[userId] || [];
    if (quantity <= 0) {
        cart = cart.filter(item => item.productId != productId);
    } else {
        const item = cart.find(i => i.productId == productId);
        if (item) item.quantity = quantity;
    }
    carts[userId] = cart;
    localStorage.setItem('carts', JSON.stringify(carts));
}
function clearCart(userId) {
    const carts = JSON.parse(localStorage.getItem('carts'));
    carts[userId] = [];
    localStorage.setItem('carts', JSON.stringify(carts));
}
function getCartTotal(cart) {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
}

// ==================== PEDIDOS ====================
function createOrder(userId, cartItems, total) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const orderNumber = `ORD-${Date.now()}`;
    const newOrder = {
        id: Date.now(),
        orderNumber,
        userId,
        totalAmount: total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        items: cartItems.map(item => ({
            productId: item.productId,
            description: item.product.description,
            quantity: item.quantity,
            unitPrice: item.product.price,
            subtotal: item.product.price * item.quantity
        }))
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    // Registrar venta (simulación)
    const sales = JSON.parse(localStorage.getItem('sales'));
    sales.push({
        id: Date.now(),
        orderId: newOrder.id,
        userId,
        saleDate: new Date().toISOString(),
        totalAmount: total
    });
    localStorage.setItem('sales', JSON.stringify(sales));
    alert(`Compra confirmada. Se envió email a ${getUserEmail(userId)} y a los destinatarios internos.`);
    return newOrder;
}
function getUserOrders(userId, statusFilter = null) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    return orders.filter(o => o.userId === userId && (statusFilter ? o.status === statusFilter : true));
}
function getUserHistoricalOrders(userId) {
    const historical = JSON.parse(localStorage.getItem('historicalOrders'));
    return historical.filter(h => h.userId === userId);
}
function cancelOrder(orderId, userId) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const order = orders.find(o => o.id == orderId && o.userId == userId);
    if (order && order.status === 'pending') {
        order.status = 'cancelled';
        localStorage.setItem('orders', JSON.stringify(orders));
        return true;
    }
    return false;
}
function deliverOrder(orderId, userIdEmployee) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const order = orders.find(o => o.id == orderId);
    if (order && order.status === 'pending') {
        order.status = 'delivered';
        order.deliveredAt = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(orders));
        // Mover a histórico
        const historical = JSON.parse(localStorage.getItem('historicalOrders'));
        historical.push({
            id: Date.now(),
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            totalAmount: order.totalAmount,
            deliveredAt: order.deliveredAt,
            deliveredBy: getUserName(userIdEmployee)
        });
        localStorage.setItem('historicalOrders', JSON.stringify(historical));
        return true;
    }
    return false;
}
function getPendingOrdersForAdmin() {
    const orders = JSON.parse(localStorage.getItem('orders'));
    return orders.filter(o => o.status === 'pending');
}
function getAllSales() {
    return JSON.parse(localStorage.getItem('sales'));
}

// ==================== PRODUCTOS ====================
function getProducts() {
    return JSON.parse(localStorage.getItem('products'));
}
function addProduct(product) {
    const products = getProducts();
    const nextId = parseInt(localStorage.getItem('nextProductId'));
    const newProduct = { ...product, id: nextId };
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('nextProductId', (nextId + 1).toString());
}
function updateProduct(id, updated) {
    const products = getProducts();
    const index = products.findIndex(p => p.id == id);
    if (index !== -1) {
        products[index] = { ...products[index], ...updated };
        localStorage.setItem('products', JSON.stringify(products));
        return true;
    }
    return false;
}
function deleteProduct(id) {
    let products = getProducts();
    products = products.filter(p => p.id != id);
    localStorage.setItem('products', JSON.stringify(products));
}

// ==================== EMAIL RECIPIENTS ====================
function getEmailRecipients() {
    return JSON.parse(localStorage.getItem('emailRecipients'));
}
function addEmailRecipient(recipient) {
    const recipients = getEmailRecipients();
    const nextId = parseInt(localStorage.getItem('nextRecipientId'));
    const newRecipient = { ...recipient, id: nextId };
    recipients.push(newRecipient);
    localStorage.setItem('emailRecipients', JSON.stringify(recipients));
    localStorage.setItem('nextRecipientId', (nextId + 1).toString());
}
function deleteEmailRecipient(id) {
    let recipients = getEmailRecipients();
    recipients = recipients.filter(r => r.id != id);
    localStorage.setItem('emailRecipients', JSON.stringify(recipients));
}

// ==================== HELPERS ====================
function getUserEmail(userId) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.id == userId);
    return user ? user.email : '';
}
function getUserName(userId) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.id == userId);
    return user ? user.fullName : '';
}
function getUserById(userId) {
    const users = JSON.parse(localStorage.getItem('users'));
    return users.find(u => u.id == userId);
}
function updateCartCountDisplay() {
    const user = getCurrentUser();
    if (user && user.role === 'client') {
        const cart = getCart(user.id);
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
    } else {
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = '0');
    }
}

// ==================== HEADER DINÁMICO ====================
function updateHeader() {
    const user = getCurrentUser();
    const headerActions = document.getElementById('headerActions');
    if (!headerActions) return;

    if (user) {
        if (user.role === 'client') {
            headerActions.innerHTML = `
                <span class="user-name">Hola, ${user.fullName}</span>
                <a href="client.html" class="btn btn-outline">Mi cuenta</a>
                <a href="#" id="cartIconHeader" class="cart-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <span class="cart-count">0</span>
                </a>
                <a href="#" id="logoutHeaderBtn" class="btn btn-outline">Salir</a>
            `;
            const cartIcon = document.getElementById('cartIconHeader');
            if (cartIcon) {
                cartIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'client.html#carrito';
                });
            }
            const logoutBtn = document.getElementById('logoutHeaderBtn');
            if (logoutBtn) logoutBtn.addEventListener('click', () => logout());
        } else if (user.role === 'employee') {
            headerActions.innerHTML = `
                <span class="user-name">Admin: ${user.fullName}</span>
                <a href="admin.html" class="btn btn-outline">Panel</a>
                <a href="#" id="logoutHeaderBtn" class="btn btn-outline">Salir</a>
            `;
            const logoutBtn = document.getElementById('logoutHeaderBtn');
            if (logoutBtn) logoutBtn.addEventListener('click', () => logout());
        }
    } else {
        headerActions.innerHTML = `
            <a href="login.html" class="btn btn-outline">Iniciar sesión</a>
            <a href="register.html" class="btn btn-primary">Registrarse</a>
            <a href="#" id="cartIconHeader" class="cart-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span class="cart-count">0</span>
            </a>
        `;
        const cartIcon = document.getElementById('cartIconHeader');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Debes iniciar sesión para ver tu carrito.');
            });
        }
    }
    updateCartCountDisplay();
}

// ==================== RENDERIZADO DE PÁGINAS ====================
// ----- PÁGINA PRINCIPAL (home) -----
function initHome() {
    updateHeader();
    renderFeaturedProducts();
    setupHomeEvents();
}
function renderFeaturedProducts() {
    const products = getProducts();
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;
    grid.innerHTML = products.slice(0, 4).map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.description}">
            <h3>${p.description}</h3>
            <p class="description">${p.category}</p>
            <div class="price">USD ${p.price.toFixed(2)}</div>
            <button class="btn btn-add-cart" data-id="${p.id}">Agregar al carrito</button>
        </div>
    `).join('');
    attachAddToCartEvents();
}
function attachAddToCartEvents() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const user = getCurrentUser();
            if (!user) {
                alert('Debes iniciar sesión.');
                window.location.href = 'login.html';
                return;
            }
            if (user.role !== 'client') {
                alert('Solo los clientes pueden comprar.');
                return;
            }
            addToCart(user.id, btn.getAttribute('data-id'), 1);
            updateCartCountDisplay();
            alert('Producto agregado al carrito.');
        });
    });
}
function setupHomeEvents() {
    const heroSearch = document.getElementById('heroSearchForm');
    if (heroSearch) {
        heroSearch.addEventListener('submit', (e) => {
            e.preventDefault();
            const dest = document.getElementById('heroDestination').value;
            window.location.href = `catalog.html?search=${encodeURIComponent(dest)}`;
        });
    }
}

// ----- CATÁLOGO -----
function initCatalog() {
    updateHeader();
    renderCatalogProducts();
    setupCatalogEvents();
}
function renderCatalogProducts() {
    let products = getProducts();
    const typeFilter = document.getElementById('filterType')?.value || 'all';
    const priceMax = parseFloat(document.getElementById('priceMax')?.value) || 2000;
    if (typeFilter !== 'all') products = products.filter(p => p.category === typeFilter);
    products = products.filter(p => p.price <= priceMax);
    const grid = document.getElementById('catalogGrid');
    const noResults = document.getElementById('noResults');
    if (!grid) return;
    if (products.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    noResults.style.display = 'none';
    grid.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.description}">
            <h3>${p.description}</h3>
            <p class="description">${p.category}</p>
            <div class="price">USD ${p.price.toFixed(2)}</div>
            <button class="btn btn-add-cart" data-id="${p.id}">Agregar al carrito</button>
        </div>
    `).join('');
    attachAddToCartEvents();
}
function setupCatalogEvents() {
    const filterForm = document.getElementById('filterForm');
    if (filterForm) filterForm.addEventListener('submit', (e) => { e.preventDefault(); renderCatalogProducts(); });
    const priceSlider = document.getElementById('priceMax');
    const priceSpan = document.getElementById('priceValue');
    if (priceSlider && priceSpan) {
        priceSlider.addEventListener('input', () => {
            priceSpan.textContent = priceSlider.value;
            renderCatalogProducts();
        });
    }
}

// ----- LOGIN -----
function initLogin() {
    updateHeader();
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPassword').value;
            if (login(email, pass)) {
                const user = getCurrentUser();
                if (user.role === 'employee') window.location.href = 'admin.html';
                else window.location.href = 'client.html';
            } else {
                alert('Credenciales incorrectas');
            }
        });
    }
}

// ----- REGISTRO -----
function initRegister() {
    updateHeader();
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('regFullName').value;
            const email = document.getElementById('regEmail').value;
            const pass = document.getElementById('regPassword').value;
            const phone = document.getElementById('regPhone').value;
            if (register(fullName, email, pass, phone)) {
                alert('Registro exitoso. Inicia sesión.');
                window.location.href = 'login.html';
            } else {
                alert('El email ya existe.');
            }
        });
    }
}

// ----- DASHBOARD CLIENTE -----
function initClient() {
    updateHeader();
    const user = getCurrentUser();
    if (!user || user.role !== 'client') {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('clientUserName').innerHTML = `Hola, <strong>${user.fullName}</strong>`;
    renderClientResumen();
    renderClientOrders();
    renderClientCart();
    renderClientHistory();
    renderClientProfile();
    setupClientEvents();
    updateCartCountDisplay();
}
function renderClientResumen() {
    const pending = getUserOrders(currentUser.id, 'pending');
    const nextTrip = pending.length ? pending[0].items[0]?.description : 'No hay viajes próximos';
    const points = Math.floor(Math.random() * 5000);
    document.getElementById('clientKpis').innerHTML = `
        <div class="kpi-card"><h3>Pedidos activos</h3><p>${pending.length}</p></div>
        <div class="kpi-card"><h3>Próximo viaje</h3><p>${nextTrip}</p></div>
        <div class="kpi-card"><h3>Puntos acumulados</h3><p>${points}</p></div>
    `;
    const proximos = pending.slice(0, 3).map(order => `
        <div class="order-card">
            <p><strong>${order.orderNumber}</strong> - ${order.items[0]?.description}</p>
            <p>Fecha: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Estado: <span class="status-pending">Pendiente</span></p>
            <button class="btn btn-sm view-order" data-order="${order.id}">Ver detalles</button>
        </div>
    `).join('');
    document.getElementById('proximosViajes').innerHTML = proximos || '<p>No tienes pedidos pendientes.</p>';
}
function renderClientOrders() {
    const pending = getUserOrders(currentUser.id, 'pending');
    const container = document.getElementById('pendingOrdersList');
    if (!container) return;
    if (pending.length === 0) {
        container.innerHTML = '<p>No tienes pedidos pendientes.</p>';
        return;
    }
    container.innerHTML = pending.map(order => `
        <div class="order-card" data-order-id="${order.id}">
            <p><strong>${order.orderNumber}</strong> - Total: USD ${order.totalAmount.toFixed(2)}</p>
            <p>Fecha: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Estado: <span class="status-pending">Pendiente</span></p>
            <p>Productos: ${order.items.map(i => `${i.description} x${i.quantity}`).join(', ')}</p>
            <div class="order-actions">
                <button class="btn btn-sm modify-order" data-id="${order.id}">Modificar</button>
                <button class="btn btn-sm btn-danger cancel-order" data-id="${order.id}">Cancelar</button>
            </div>
        </div>
    `).join('');
    document.querySelectorAll('.modify-order').forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Funcionalidad de modificación: en esta demo se cancela y se crea un nuevo pedido.');
        });
    });
    document.querySelectorAll('.cancel-order').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.getAttribute('data-id');
            if (confirm('¿Cancelar este pedido?')) {
                cancelOrder(orderId, currentUser.id);
                renderClientOrders();
                renderClientResumen();
                alert('Pedido cancelado.');
            }
        });
    });
}
function renderClientCart() {
    const cart = getCart(currentUser.id);
    const container = document.getElementById('cartItemsList');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = '<p>No hay productos en el carrito.</p>';
        document.getElementById('cartTotal').innerHTML = '';
        return;
    }
    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-product="${item.productId}">
            <span><strong>${item.product.description}</strong></span>
            <span>USD ${item.product.price.toFixed(2)}</span>
            <input type="number" value="${item.quantity}" min="1" style="width:70px" class="cart-qty" data-id="${item.productId}">
            <button class="btn btn-sm btn-danger remove-item" data-id="${item.productId}">Eliminar</button>
        </div>
    `).join('');
    const total = getCartTotal(cart);
    document.getElementById('cartTotal').innerHTML = `Total: USD ${total.toFixed(2)}`;
    document.querySelectorAll('.cart-qty').forEach(inp => {
        inp.addEventListener('change', (e) => {
            const productId = inp.getAttribute('data-id');
            const newQty = parseInt(inp.value);
            updateCartItem(currentUser.id, productId, newQty);
            renderClientCart();
            updateCartCountDisplay();
        });
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-id');
            updateCartItem(currentUser.id, productId, 0);
            renderClientCart();
            updateCartCountDisplay();
        });
    });
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (cart.length === 0) return alert('Carrito vacío');
            const total = getCartTotal(cart);
            if (confirm(`Total: USD ${total.toFixed(2)}. ¿Confirmar compra?`)) {
                createOrder(currentUser.id, cart, total);
                clearCart(currentUser.id);
                renderClientCart();
                renderClientOrders();
                renderClientResumen();
                updateCartCountDisplay();
                alert('Pedido creado. Revisa "Mis pedidos".');
            }
        };
    }
}
function renderClientHistory() {
    const historical = getUserHistoricalOrders(currentUser.id);
    const container = document.getElementById('orderHistoryList');
    if (!container) return;
    if (historical.length === 0) {
        container.innerHTML = '<p>No hay pedidos entregados aún.</p>';
        return;
    }
    container.innerHTML = historical.map(order => `
        <div class="order-card">
            <p><strong>${order.orderNumber}</strong> - USD ${order.totalAmount.toFixed(2)}</p>
            <p>Entregado: ${new Date(order.deliveredAt).toLocaleDateString()}</p>
            <p>Entregado por: ${order.deliveredBy}</p>
        </div>
    `).join('');
}
function renderClientProfile() {
    const user = getUserById(currentUser.id);
    document.getElementById('profileName').value = user.fullName;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profilePhone').value = user.phone || '';
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const updated = {
                fullName: document.getElementById('profileName').value,
                email: document.getElementById('profileEmail').value,
                phone: document.getElementById('profilePhone').value
            };
            const users = JSON.parse(localStorage.getItem('users'));
            const index = users.findIndex(u => u.id == currentUser.id);
            if (index !== -1) {
                users[index] = { ...users[index], ...updated };
                localStorage.setItem('users', JSON.stringify(users));
                setCurrentUser({ ...currentUser, ...updated });
                alert('Perfil actualizado.');
            }
        });
    }
    const changePassForm = document.getElementById('changePasswordForm');
    if (changePassForm) {
        changePassForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const current = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const users = JSON.parse(localStorage.getItem('users'));
            const user = users.find(u => u.id == currentUser.id);
            if (user.password === current) {
                user.password = newPass;
                localStorage.setItem('users', JSON.stringify(users));
                alert('Contraseña cambiada.');
                changePassForm.reset();
            } else {
                alert('Contraseña actual incorrecta.');
            }
        });
    }
}
function setupClientEvents() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => logout());
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.dashboard-section');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            if (sectionId === 'carrito') renderClientCart();
            if (sectionId === 'pedidos') renderClientOrders();
            if (sectionId === 'historial') renderClientHistory();
        });
    });
    const clientCartIcon = document.getElementById('clientCartIcon');
    if (clientCartIcon) {
        clientCartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            const carritoLink = document.querySelector('.sidebar a[data-section="carrito"]');
            if (carritoLink) carritoLink.click();
        });
    }
}

// ----- DASHBOARD ADMIN -----
function initAdmin() {
    updateHeader();
    const user = getCurrentUser();
    if (!user || user.role !== 'employee') {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('adminUserName').innerText = user.fullName;
    renderAdminKpis();
    renderAdminProducts();
    renderAdminPendingOrders();
    renderAdminAccountStatement();
    renderAdminEmailRecipients();
    setupAdminEvents();
}
function renderAdminKpis() {
    const orders = getPendingOrdersForAdmin();
    const sales = getAllSales();
    const todaySales = sales.filter(s => new Date(s.saleDate).toDateString() === new Date().toDateString())
        .reduce((sum, s) => sum + s.totalAmount, 0);
    const monthlySales = sales.filter(s => new Date(s.saleDate).getMonth() === new Date().getMonth())
        .reduce((sum, s) => sum + s.totalAmount, 0);
    document.getElementById('adminKpis').innerHTML = `
        <div class="kpi-card"><h3>Ventas del día</h3><p>USD ${todaySales.toFixed(2)}</p></div>
        <div class="kpi-card"><h3>Pedidos pendientes</h3><p>${orders.length}</p></div>
        <div class="kpi-card"><h3>Ingresos mensuales</h3><p>USD ${monthlySales.toFixed(2)}</p></div>
    `;
    document.getElementById('recentActivity').innerHTML = `<p>Último pedido: ${orders.length ? orders[0].orderNumber : 'ninguno'}</p>`;
}
function renderAdminProducts() {
    const products = getProducts();
    const table = document.getElementById('productsTable');
    if (!table) return;
    table.innerHTML = `
        <table>
            <thead>
                <tr><th>Código</th><th>Descripción</th><th>Categoría</th><th>Precio (USD)</th><th>Acciones</th></tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr>
                        <td>${p.code}</td>
                        <td>${p.description}</td>
                        <td>${p.category}</td>
                        <td>${p.price.toFixed(2)}</td>
                        <td><button class="btn-edit" data-id="${p.id}">Editar</button> <button class="btn-danger" data-id="${p.id}">Eliminar</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openProductModal(btn.getAttribute('data-id')));
    });
    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('¿Eliminar producto?')) {
                deleteProduct(btn.getAttribute('data-id'));
                renderAdminProducts();
            }
        });
    });
    const newBtn = document.getElementById('newProductBtn');
    if (newBtn) newBtn.onclick = () => openProductModal(null);
}
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');
    if (!modal) return;
    if (productId) {
        const product = getProducts().find(p => p.id == productId);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productCode').value = product.code;
            document.getElementById('productDesc').value = product.description;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            title.innerText = 'Editar producto';
        }
    } else {
        document.getElementById('productId').value = '';
        document.getElementById('productCode').value = '';
        document.getElementById('productDesc').value = '';
        document.getElementById('productCategory').value = 'Paquete';
        document.getElementById('productPrice').value = '';
        title.innerText = 'Nuevo producto';
    }
    modal.style.display = 'flex';
    const close = modal.querySelector('.close-modal');
    close.onclick = () => modal.style.display = 'none';
    form.onsubmit = (e) => {
        e.preventDefault();
        const data = {
            code: document.getElementById('productCode').value,
            description: document.getElementById('productDesc').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            image: 'assets/img/bariloche.svg'
        };
        const id = document.getElementById('productId').value;
        if (id) {
            updateProduct(id, data);
        } else {
            addProduct(data);
        }
        modal.style.display = 'none';
        renderAdminProducts();
    };
}
function renderAdminPendingOrders() {
    const orders = getPendingOrdersForAdmin();
    const container = document.getElementById('pendingOrdersAdmin');
    if (!container) return;
    if (orders.length === 0) {
        container.innerHTML = '<p>No hay pedidos pendientes.</p>';
        return;
    }
    container.innerHTML = `
        <table>
            <thead>
                <tr><th>N° Pedido</th><th>Cliente</th><th>Total</th><th>Acciones</th></tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>${order.orderNumber}</td>
                        <td>${getUserName(order.userId)}</td>
                        <td>USD ${order.totalAmount.toFixed(2)}</td>
                        <td><button class="btn-deliver" data-id="${order.id}">Entregar</button> <button class="btn-danger cancel-order-admin" data-id="${order.id}">Anular</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.querySelectorAll('.btn-deliver').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.getAttribute('data-id');
            if (confirm('¿Marcar como entregado?')) {
                deliverOrder(orderId, currentUser.id);
                renderAdminPendingOrders();
                renderAdminKpis();
                alert('Pedido entregado y movido a histórico.');
            }
        });
    });
    document.querySelectorAll('.cancel-order-admin').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.getAttribute('data-id');
            if (confirm('¿Anular pedido?')) {
                const orders = JSON.parse(localStorage.getItem('orders'));
                const order = orders.find(o => o.id == orderId);
                if (order) order.status = 'cancelled';
                localStorage.setItem('orders', JSON.stringify(orders));
                renderAdminPendingOrders();
                renderAdminKpis();
                alert('Pedido anulado.');
            }
        });
    });
}
function renderAdminAccountStatement() {
    const sales = getAllSales();
    const users = JSON.parse(localStorage.getItem('users'));
    const container = document.getElementById('accountStatement');
    if (!container) return;
    if (sales.length === 0) {
        container.innerHTML = '<p>No hay ventas registradas.</p>';
        return;
    }
    const rows = sales.map(sale => {
        const user = users.find(u => u.id == sale.userId);
        return `
            <tr>
                <td>${new Date(sale.saleDate).toLocaleDateString()}</td>
                <td>${user ? user.fullName : 'Usuario'}</td>
                <td>Factura-${sale.id}</td>
                <td>USD ${sale.totalAmount.toFixed(2)}</td>
                <td><span class="status-pending">Pendiente</span></td>
            </tr>
        `;
    }).join('');
    container.innerHTML = `
        <table>
            <thead>
                <tr><th>Fecha</th><th>Cliente</th><th>Factura</th><th>Monto</th><th>Estado</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}
function renderAdminEmailRecipients() {
    const recipients = getEmailRecipients();
    const container = document.getElementById('emailRecipientsTable');
    if (!container) return;
    if (recipients.length === 0) {
        container.innerHTML = '<p>No hay destinatarios configurados.</p>';
        return;
    }
    container.innerHTML = `
        <table>
            <thead>
                <tr><th>Email</th><th>Nombre</th><th>Departamento</th><th>Activo</th><th>Acciones</th></tr>
            </thead>
            <tbody>
                ${recipients.map(r => `
                    <tr>
                        <td>${r.email}</td>
                        <td>${r.name}</td>
                        <td>${r.department}</td>
                        <td>${r.isActive ? '✅' : '❌'}</td>
                        <td><button class="btn-danger delete-recipient" data-id="${r.id}">Eliminar</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.querySelectorAll('.delete-recipient').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('¿Eliminar destinatario?')) {
                deleteEmailRecipient(btn.getAttribute('data-id'));
                renderAdminEmailRecipients();
            }
        });
    });
    const addBtn = document.getElementById('addRecipientBtn');
    if (addBtn) {
        addBtn.onclick = () => {
            const email = prompt('Email del destinatario:');
            const name = prompt('Nombre:');
            const department = prompt('Departamento:');
            if (email && name) {
                addEmailRecipient({ email, name, department, isActive: true });
                renderAdminEmailRecipients();
            }
        };
    }
}
function setupAdminEvents() {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => logout());
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.admin-section');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            if (sectionId === 'productos') renderAdminProducts();
            if (sectionId === 'pedidos') renderAdminPendingOrders();
            if (sectionId === 'cuenta') renderAdminAccountStatement();
            if (sectionId === 'email') renderAdminEmailRecipients();
        });
    });
}

// ==================== PUNTO DE ENTRADA ====================
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('client.html')) {
        initClient();
    } else if (path.includes('admin.html')) {
        initAdmin();
    } else if (path.includes('catalog.html')) {
        initCatalog();
    } else if (path.includes('login.html')) {
        initLogin();
    } else if (path.includes('register.html')) {
        initRegister();
    } else {
        initHome();
    }
});