// Código limpo: pequenas melhorias de interação
const whatsappNumber = '5511993768869'; // Alterar conforme necessário

let products = [
    {
        id: 1,
        name: "Essência Luxury",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop",
        description: "Fragrância sofisticada com notas amadeiradas",
        tags: ["amadeirado", "unissex"]
    },
    {
        id: 2,
        name: "Noir Élégance",
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=500&fit=crop",
        description: "Perfume intenso com toque floral",
        tags: ["floral", "feminino"]
    },
    {
        id: 3,
        name: "Oud Royal",
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=500&fit=crop",
        description: "Aroma oriental exclusivo",
        tags: ["oriental", "unissex"]
    },
    {
        id: 4,
        name: "Citrus Fresh",
        image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop",
        description: "Fragrância cítrica revitalizante",
        tags: ["cítrico", "unissex"]
    },
    {
        id: 5,
        name: "Doce Paixão",
        image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop",
        description: "Um perfume doce e envolvente",
        tags: ["doce", "feminino"]
    },
    {
        id: 6,
        name: "Aventura Selvagem",
        image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop",
        description: "Fragrância masculina com notas de couro e especiarias",
        tags: ["especiado", "masculino"]
    }
];

let sizes = [
    { name: "De Bolso", ml: "15ml", price: 15 },
    { name: "Pequeno", ml: "30ml", price: 30 },
    { name: "Médio", ml: "50ml", price: 50 },
    { name: "Grande", ml: "100ml", price: 100 }
];

let customerName = '';
let cart = [];
let selectedProduct = null;

function startChat() {
    // const message = 'Olá! Gostaria de uma recomendação personalizada de fragrância. Pode me ajudar?';
    // const whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message);
    // window.open(whatsappUrl, '_blank');
}

// (arrays e variáveis definidos acima)

function init() {
    renderProducts();
}

// Menu toggle (mobile)
document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.querySelector('.nav-toggle');
    const headerNav = document.querySelector('.header-nav');
    if (navToggle && headerNav) {
        // ensure initial ARIA state
        navToggle.setAttribute('aria-expanded', 'false');
        headerNav.setAttribute('aria-hidden', 'true');
        // toggle open/close with ARIA and focus management
        navToggle.addEventListener('click', function () {
            const isOpen = headerNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen);
            headerNav.setAttribute('aria-hidden', !isOpen);
            // prevent background scroll when mobile nav open
            if (isOpen) document.body.classList.add('no-scroll'); else document.body.classList.remove('no-scroll');
            if (isOpen) {
                // focus first link
                const firstLink = headerNav.querySelector('a');
                if (firstLink) firstLink.focus();
                // add key handlers for accessibility
                document.addEventListener('keydown', navKeyHandler);
            } else {
                navToggle.focus();
                document.removeEventListener('keydown', navKeyHandler);
            }
        });
        // close nav when link clicked
        headerNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            headerNav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', false);
            headerNav.setAttribute('aria-hidden', true);
            document.body.classList.remove('no-scroll');
            navToggle.focus();
            document.removeEventListener('keydown', navKeyHandler);
        }));
        // keyboard navigation / focus trap for the mobile nav
        function navKeyHandler(e) {
            if (!headerNav.classList.contains('open')) return;
            const focusable = headerNav.querySelectorAll('a');
            if (e.key === 'Escape') {
                headerNav.classList.remove('open');
                navToggle.setAttribute('aria-expanded', false);
                headerNav.setAttribute('aria-hidden', true);
                navToggle.focus();
                document.removeEventListener('keydown', navKeyHandler);
                return;
            }
            if (e.key === 'Tab' && focusable.length) {
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    }
    // Attach listeners for header/cart/modal actions (replacing inline onclicks)
    const cartBtn = document.getElementById('cartBtn');
    const cartClose = document.getElementById('cartClose');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const modalClose = document.getElementById('modalClose');
    const formSubmitBtn = document.getElementById('formSubmitBtn');
    const startChatBtn = document.getElementById('startChatBtn');
    const gptmakerBtn = document.getElementById('gptmakerBtn');
    const clearCartBtn = document.getElementById('clearCart');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    let currentSort = 'default';
    let activeFilters = [];

    function getUniqueTags() {
        const allTags = products.flatMap(p => p.tags);
        return [...new Set(allTags)];
    }

    function createFilterButtons() {
        const container = document.getElementById('filter-tags');
        if (!container) return;
        const tags = getUniqueTags();
        tags.forEach(tag => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = tag;
            btn.dataset.tag = tag;
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                if (activeFilters.includes(tag)) {
                    activeFilters = activeFilters.filter(t => t !== tag);
                } else {
                    activeFilters.push(tag);
                }
                applyFiltersAndSort();
            });
            container.appendChild(btn);
        });
    }

    function applyFiltersAndSort() {
        let filteredProducts = [...products];

        // Apply filters
        if (activeFilters.length > 0) {
            filteredProducts = filteredProducts.filter(p =>
                activeFilters.every(filter => p.tags.includes(filter))
            );
        }

        // Apply search term
        const term = searchInput.value.toLowerCase();
        if (term) {
            filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(term));
        }

        // Apply sort
        switch (currentSort) {
            case 'alpha-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'alpha-desc':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }

        renderProducts(filteredProducts);
    }



    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (cartClose) cartClose.addEventListener('click', toggleCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', finalizeOrder);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (formSubmitBtn) formSubmitBtn.addEventListener('click', submitForm);
    if (startChatBtn) startChatBtn.addEventListener('click', startChat);

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFiltersAndSort();
        });
    }

    // Lógica da Pesquisa
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function () {
            const searchContainer = document.querySelector('.search');
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                searchInput.focus();
            } else {
                searchInput.value = ''; // Limpa o input quando fecha pelo botão
                applyFiltersAndSort(); // Reaplica filtros para mostrar todos os produtos
            }
        });

        searchInput.addEventListener('keyup', function () {
            applyFiltersAndSort();
        });

        // Adicionar event listener para 'blur' no searchInput
        searchInput.addEventListener('blur', function () {
            const searchContainer = document.querySelector('.search');
            // Fechar se estiver vazio e o searchContainer estiver ativo
            if (searchInput.value.trim() === '' && searchContainer.classList.contains('active')) {
                searchContainer.classList.remove('active');
                applyFiltersAndSort(); // Reaplica filtros para mostrar todos os produtos
            }
        });
    }

    // Lógica para fechar a barra de pesquisa ao clicar fora do container da pesquisa e do botão
    document.addEventListener('click', function (event) {
        const searchContainer = document.querySelector('.search'); // Container .search
        const searchBtnElement = document.getElementById('searchBtn'); // O botão (lupa)
        const searchInput = document.getElementById('searchInput'); // O input de texto

        // Se o searchContainer existe e está ativo
        if (searchContainer && searchContainer.classList.contains('active')) {
            // Se o clique foi fora do searchContainer E fora do searchBtn
            if (!searchContainer.contains(event.target) && (!searchBtnElement || !searchBtnElement.contains(event.target))) {
                searchContainer.classList.remove('active');
                searchInput.value = ''; // Limpa o input quando fecha
                applyFiltersAndSort(); // Reaplica filtros
            }
        }
    });

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function () {
            if (cart.length === 0) {
                showNotification('Sua sacola já está vazia!', 'info');
                return;
            }

            // Se o diálogo já existe, não faz nada
            if (document.querySelector('.cart-confirmation-dialog')) {
                return;
            }

            const dialog = document.createElement('div');
            dialog.className = 'cart-confirmation-dialog';
            dialog.innerHTML = `
                <p>Tem certeza que deseja esvaziar sua sacola?</p>
                <div class="cart-confirmation-actions">
                    <button class="btn-confirm">Sim</button>
                    <button class="btn-cancel">Não</button>
                </div>
            `;

            const cartSidebar = document.getElementById('cartSidebar');
            cartSidebar.appendChild(dialog);

            dialog.querySelector('.btn-confirm').addEventListener('click', () => {
                cart = [];
                updateCart();
                dialog.remove();
            });

            dialog.querySelector('.btn-cancel').addEventListener('click', () => {
                dialog.remove();
            });
        });
    }
    if (gptmakerBtn) {
        gptmakerBtn.addEventListener('click', function () {
            // Trigger GPTMaker widget
            if (window.__GPTMaker__) {
                window.__GPTMaker__.open();
            }
        });
    }

    createFilterButtons();
    applyFiltersAndSort();

    // Manage cart placement: desktop -> header, mobile -> floating button
    const floatingContainer = document.querySelector('.floating-btns');
    let floatCartBtn = null;

    function createFloatingCart() {
        if (!floatingContainer) return null;
        if (document.getElementById('floatCartBtn')) return document.getElementById('floatCartBtn');
        const btn = document.createElement('button');
        btn.id = 'floatCartBtn';
        btn.className = 'float-btn float-cart-btn';
        btn.setAttribute('aria-label', 'Abrir sacola');
        btn.innerHTML = '<i class="fas fa-shopping-bag"></i>';
        const span = document.createElement('span');
        span.className = 'cart-count hidden';
        span.id = 'floatCartCount';
        span.textContent = '0';
        const closeSpan = document.createElement('span');
        closeSpan.className = 'float-close';
        closeSpan.setAttribute('aria-hidden', 'true');
        closeSpan.textContent = '\u00d7';
        closeSpan.style.display = 'none';
        btn.appendChild(span);
        btn.appendChild(closeSpan);
        floatingContainer.appendChild(btn);
        btn.addEventListener('click', function (e) { e.stopPropagation(); toggleCart(); });
        return btn;
    }

    function manageCartPlacement() {
        if (!cartBtn) return;
        if (window.innerWidth <= 1024) {
            // ensure header cart hidden via CSS; add floating
            if (!floatCartBtn) floatCartBtn = createFloatingCart();
            // sync counts
            const headerCount = document.getElementById('cartCount');
            const floatCount = document.getElementById('floatCartCount');
            if (headerCount && floatCount) {
                if (headerCount.classList.contains('hidden')) floatCount.classList.add('hidden'); else floatCount.classList.remove('hidden');
                floatCount.textContent = headerCount.textContent;
            }
            // ensure close state matches; use class for styling
            const fbtn = document.getElementById('floatCartBtn');
            if (fbtn) {
                if (document.getElementById('cartSidebar').classList.contains('active')) fbtn.classList.add('opened'); else fbtn.classList.remove('opened');
            }
        } else {
            // remove floating cart if exists
            if (floatCartBtn) {
                floatCartBtn.remove();
                floatCartBtn = null;
            }
            // ensure header cart visible (CSS handles it)
        }
    }

    // initial placement and on resize (debounced)
    manageCartPlacement();
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(manageCartPlacement, 120);
    });

    // Close mobile nav when clicking outside it
    document.addEventListener('click', function (e) {
        if (!headerNav) return;
        const isOpen = headerNav.classList.contains('open');
        if (!isOpen) return;
        const clickInsideNav = headerNav.contains(e.target);
        const clickToggle = navToggle && navToggle.contains(e.target);
        if (!clickInsideNav && !clickToggle) {
            headerNav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', false);
            headerNav.setAttribute('aria-hidden', true);
            document.body.classList.remove('no-scroll');
            document.removeEventListener('keydown', navKeyHandler);
            navToggle.focus();
        }
    });

    // Close nav when clicking the close button inside the mobile nav
    const navCloseBtn = document.querySelector('.nav-close');
    if (navCloseBtn) {
        navCloseBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (headerNav.classList.contains('open')) {
                // simulate the toggle click to ensure ARIA and handlers are correctly updated
                if (navToggle) navToggle.click();
            }
        });
    }
});

function submitForm() {
    var nameInput = document.getElementById('customerName');
    if (nameInput.value.trim()) {
        customerName = nameInput.value.trim();
        document.getElementById('formOverlay').classList.add('hidden');
    } else {
        showNotification('Por favor, informe seu nome!', 'error');
    }
}

function renderProducts(productList = products) {
    var grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (productList.length === 0) {
        grid.innerHTML = `
            <div class="not-found-message">
                <i class="bi bi-x-circle"></i>
                <h3>Produto não Encontrado :(</h3>
                <p style="color: #888; font-size: 0.9rem;">Tente buscar por outro nome ou verifique a ortografia.</p>
            </div>
        `;
        return;
    }

    for (var i = 0; i < productList.length; i++) {
        var product = productList[i];
        var card = document.createElement('div');
        card.className = 'product-card';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.addEventListener('click', (function (id) { return function () { openProductModal(id); }; })(product.id));

        var imgWrap = document.createElement('div');
        imgWrap.className = 'product-image';
        var img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        imgWrap.appendChild(img);

        var info = document.createElement('div');
        info.className = 'product-info';
        info.innerHTML = '<h4>' + product.name + '</h4><p>' + product.description + '</p><div class="product-price">A partir de R$ 15</div>';

        card.appendChild(imgWrap);
        card.appendChild(info);
        grid.appendChild(card);
    }
}

function openProductModal(productId) {
    if (!customerName) {
        showNotification('Por favor, preencha seu nome primeiro!', 'error');
        return;
    }

    for (var i = 0; i < products.length; i++) {
        if (products[i].id === productId) {
            selectedProduct = products[i];
            break;
        }
    }

    document.getElementById('modalProductName').textContent = selectedProduct.name;
    document.getElementById('modalProductDescription').textContent = selectedProduct.description;

    var sizesGrid = document.getElementById('sizesGrid');
    sizesGrid.innerHTML = '';
    for (var i = 0; i < sizes.length; i++) {
        var size = sizes[i];
        var opt = document.createElement('div');
        opt.className = 'size-option';
        opt.tabIndex = 0;
        opt.innerHTML = '<div class="size-name">' + size.name + '</div><div class="size-ml">' + size.ml + '</div><div class="size-price">R$ ' + size.price + '</div>';
        (function (idx) { opt.addEventListener('click', function () { addToCart(idx); }); })(i);
        sizesGrid.appendChild(opt);
    }

    document.getElementById('productModal').classList.add('active');
    // prevenir scroll de fundo enquanto modal aberto
    document.body.classList.add('no-scroll');
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.classList.remove('no-scroll');
}

function addToCart(sizeIndex) {
    var size = sizes[sizeIndex];
    var item = {
        id: Date.now(),
        productName: selectedProduct.name,
        size: size.ml,
        price: size.price
    };
    cart.push(item);
    updateCart();
    closeModal();
    showNotification('Produto adicionado à sacola!');
}

function removeFromCart(itemId) {
    var newCart = [];
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id !== itemId) {
            newCart.push(cart[i]);
        }
    }
    cart = newCart;
    updateCart();
}


function updateCart() {
    var cartCount = document.getElementById('cartCount');
    var cartItems = document.getElementById('cartItems');
    var cartTotal = document.getElementById('cartTotal');
    var checkoutBtn = document.getElementById('checkoutBtn');
    var totalPrice = document.getElementById('totalPrice');

    if (cart.length === 0) {
        cartCount.classList.add('hidden');
        cartItems.innerHTML = '<div class="cart-empty">Sua sacola está vazia</div>';
        cartTotal.classList.add('hidden');
        checkoutBtn.classList.add('hidden');
    } else {
        cartCount.classList.remove('hidden');
        cartCount.textContent = cart.length;

        var html = '';
        for (var i = 0; i < cart.length; i++) {
            var item = cart[i];
            html += '<div class="cart-item">';
            html += '<div class="cart-item-header">';
            html += '<div>';
            html += '<h4>' + item.productName + '</h4>';
            html += '<p>' + item.size + '</p>';
            html += '</div>';
            html += '<button class="remove-item" data-item-id="' + item.id + '">';
            html += '<i class="fas fa-times"></i>';
            html += '</button>';
            html += '</div>';
            html += '<div class="cart-item-price">R$ ' + item.price + '</div>';
            html += '</div>';
        }
        cartItems.innerHTML = html;
        // attach listeners to remove buttons
        cartItems.querySelectorAll('.remove-item').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = Number(btn.getAttribute('data-item-id'));
                removeFromCart(id);
            });
        });

        var total = 0;
        for (var i = 0; i < cart.length; i++) {
            total += cart[i].price;
        }
        totalPrice.textContent = 'R$ ' + total;
        cartTotal.classList.remove('hidden');
        checkoutBtn.classList.remove('hidden');
    }
    // Sync floating cart count if present
    const floatCount = document.getElementById('floatCartCount');
    const headerCount = document.getElementById('cartCount');
    if (floatCount && headerCount) {
        if (headerCount.classList.contains('hidden')) floatCount.classList.add('hidden'); else floatCount.classList.remove('hidden');
        floatCount.textContent = headerCount.textContent;
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    sidebar.classList.toggle('active');
    const isActive = sidebar.classList.contains('active');
    // bloquear scroll de fundo quando a sacola estiver aberta
    if (isActive) {
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
    // atualizar estado do botão flutuante (trocar ícone por X quando aberto)
    const fbtn = document.getElementById('floatCartBtn');
    if (fbtn) {
        if (isActive) {
            fbtn.classList.add('opened');
            fbtn.setAttribute('aria-label', 'Fechar sacola');
        } else {
            fbtn.classList.remove('opened');
            fbtn.setAttribute('aria-label', 'Abrir sacola');
        }
    }
}

function finalizeOrder() {
    if (cart.length === 0) {
        showNotification('Sua sacola está vazia!', 'info');
        return;
    }

    let addressInput = document.getElementById('customerAddress');
    let adressClient = addressInput.value.trim();

    if (!adressClient) {
        showNotification('Por favor, informe o endereço de entrega!', 'error');
        addressInput.classList.add('is-invalid');
        addressInput.focus();
        return;
    }
    addressInput.classList.remove('is-invalid');

    var message = 'Olá! Meu nome é ' + ' ' + '*' + customerName + '*' + '\n' + 'Endereço de Entrega: ' + '*' + adressClient + '*' + '\n' + '*Pedido*:' + '\n';
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        message += '' + (i + 1) + '. ' + item.productName + ' - ' + item.size + ' - R$ ' + ' ' + ' ' + item.price + '\n';
    }
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
        total += cart[i].price;
    }
    message += '*Total: R$ ' + ' ' + total + '*';

    const url = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank');
}



init();