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
            // Eventos para carrito y logout
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