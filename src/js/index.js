// Código limpo: pequenas melhorias de interação
const whatsappNumber = '5511993768869'; // Alterar conforme necessário
let customerName = '';
let cart = [];
let selectedProduct = null;
let products = [];  //Carregado do produtos.json
let sizes = [];    // Carregado do price.json

// let products = [
//     {
//         id: 1,
//         name: "Essência Luxury",
//         image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop",
//         description: "Fragrância sofisticada com notas amadeiradas",
//         tags: ["Populares"]
//     },
//     {
//         id: 2,
//         name: "Noir Élégance",
//         image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=500&fit=crop",
//         description: "Perfume intenso com toque floral",
//         tags: ["floral", "feminino"]
//     },
//     {
//         id: 3,
//         name: "Oud Royal",
//         image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=500&fit=crop",
//         description: "Aroma oriental exclusivo",
//         tags: ["oriental", "unissex"]
//     },
//     {
//         id: 4,
//         name: "Citrus Fresh",
//         image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop",
//         description: "Fragrância cítrica revitalizante",
//         tags: ["cítrico", "unissex"]
//     },
//     {
//         id: 5,
//         name: "Doce Paixão",
//         image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop",
//         description: "Um perfume doce e envolvente",
//         tags: ["doce", "feminino"]
//     },
//     {
//         id: 6,
//         name: "Aventura Selvagem",
//         image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop",
//         description: "Fragrância masculina com notas de couro e especiarias",
//         tags: ["especiado", "masculino"]
//     }
// ];


// (arrays e variáveis definidos acima)

// 1. INICIALIZAÇÃO E CARREGAMENTO DE DADOS (Dual JSON)
async function init() {
    try {
        // Carregamento simultâneo dos dois arquivos JSON
        const [prodRes, priceRes] = await Promise.all([
            fetch('src/data/produtos.json'),
            fetch('src/data/price.json')
        ]);

        products = await prodRes.json();
        sizes = await priceRes.json();

        // Renderização inicial
        renderProducts(products);

        // Conexão do sistema de pesquisa original
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function (e) {
                const termo = e.target.value.toLowerCase();
                const filtrados = products.filter(p =>
                    p.nome.toLowerCase().includes(termo) ||
                    p.marca.toLowerCase().includes(termo)
                );
                renderProducts(filtrados);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
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
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
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

    // function applyFiltersAndSort() {
    //     let filteredProducts = [...products];

    //     // Apply filters
    //     if (activeFilters.length > 0) {
    //         filteredProducts = filteredProducts.filter(p =>
    //             activeFilters.every(filter => p.tags.includes(filter))
    //         );
    //     }

    //     // Apply search term
    //     const term = searchInput.value.toLowerCase();
    //     if (term) {
    //         filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(term));
    //     }

    //     // Apply sort
    //     switch (currentSort) {
    //         case 'alpha-asc':
    //             filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    //             break;
    //         case 'alpha-desc':
    //             filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    //             break;
    //     }

    //     renderProducts(filteredProducts);
    // }

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
    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', function () {
            const searchContainer = document.querySelector('.search');
            if (searchContainer) {
                searchContainer.classList.toggle('active');
                if (searchContainer.classList.contains('active') && searchInput) {
                    searchInput.focus();
                }
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            const searchContainer = document.querySelector('.search');
            if (searchContainer) {
                searchContainer.classList.toggle('active');
                if (searchContainer.classList.contains('active') && searchInput) {
                    searchInput.focus();
                }
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', function () {
            applyFiltersAndSort();
        });
    }

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

// 2. FUNÇÃO DE RENDERIZAÇÃO (SUA LÓGICA ORIGINAL PRESERVADA)
function renderProducts(productList = products) {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;
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

        // 1. Badge de Popular (Inserido no topo do card)
        if (product.popular) {
            // Usando a classe badge-popular que definimos para o estilo premium
            var badge = document.createElement('span');
            badge.className = 'badge-popular';
            badge.innerHTML = `🔥 Popular`;
            card.appendChild(badge);
        }

        // 2. Container de imagem
        var imgWrap = document.createElement('div');
        imgWrap.className = 'product-image-container';

        var img = document.createElement('img');
        img.src = product.imagem;
        img.alt = product.nome;
        img.className = 'product-img';
        imgWrap.appendChild(img);

        // 3. Div de informações
        var info = document.createElement('div');
        info.className = 'product-info';

        info.innerHTML = `
            <p class="brand-name">${product.marca.toUpperCase()} - ${product.linha}</p>
            <h3 class="product-title">${product.nome}</h3>
            <div class="rating">
                <span class="stars">★★★★★</span>
            </div>
            <div class="price-container">
                <span>A partir de</span>
                <div class="current-price-row">
                    <span class="current-price">R$ 15,00</span>
                </div>
            </div>
        `;

        // 4. Container de ações (Para empilhar os botões via CSS)
        var actionsContainer = document.createElement('div');
        actionsContainer.className = 'product-actions';

        // Botão Adicionar à Sacola
        var btnAdd = document.createElement('button');
        btnAdd.className = 'add-to-cart-btn';
        btnAdd.textContent = 'Adicionar à sacola';

        btnAdd.addEventListener('click', (function (id) {
            return function () {
                if (typeof openProductModal === 'function') {
                    openProductModal(id);
                }
            };
        })(product.id));

        // Botão de Detalhes (O que abre o novo modal de descrição)
        var btnDesc = document.createElement('button');
        btnDesc.className = 'btn-description';
        btnDesc.textContent = 'Ver detalhes do perfume';

        btnDesc.addEventListener('click', (function (id) {
            return function () {
                if (typeof abrirDescricao === 'function') {
                    abrirDescricao(id);
                } else {
                    console.log("Função abrirDescricao não encontrada.");
                }
            };
        })(product.id));

        // 5. Montagem Final do Card
        actionsContainer.appendChild(btnAdd);
        actionsContainer.appendChild(btnDesc);

        info.appendChild(actionsContainer);
        card.appendChild(imgWrap);
        card.appendChild(info);

        grid.appendChild(card);
    }
}

// 1. A função fica aqui
// index.js

function abrirDescricao(id) {
    // 1. Verifica se a lista 'products' tem algo
    if (!products || products.length === 0) {
        console.error("A lista 'products' está vazia ou não foi carregada.");
        return;
    }

    // 2. Procura o perfume pelo ID
    const perfume = products.find(p => String(p.id) === String(id));

    if (perfume) {
        // 3. Captura os elementos do modal (IDs que criamos antes)
        const modal = document.getElementById('perfumeDetailOverlay');
        const img = document.getElementById('detailPerfumeImg');
        const brand = document.getElementById('detailPerfumeBrand');
        const title = document.getElementById('detailPerfumeTitle');
        const text = document.getElementById('detailPerfumeText');
        const price = document.getElementById('detailPerfumePrice');

        const acordesContainer = document.getElementById('detailPerfumeAcordes');
        // 4. Preenche apenas se o elemento existir no HTML
        if (img) img.src = perfume.imagem;
        if (brand) brand.textContent = `${perfume.marca} - ${perfume.linha}`;
        if (title) title.textContent = perfume.nome;
        if (text) text.textContent = perfume.descricao || "Descrição indisponível.";
        if (price) price.textContent = "R$ 15,00"; // Ou perfume.preco se tiver no JSON

        if (acordesContainer) {
            acordesContainer.innerHTML = gerarGraficoAcordes(perfume.acordes);
        }

        // 5. Abre o modal
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            console.error("Não encontrei o ID 'perfumeDetailOverlay' no HTML.");
        }
    } else {
        console.error("Perfume com ID " + id + " não encontrado em 'products'.");
    }

    setTimeout(() => {
        aplicarZoom();
    }, 100); // Dá um tempo para o modal renderizar
    // function gerarHTMLClima(estacoes) {
    //     if (!estacoes) return '';

    //     const configs = [
    //         { chave: 'inverno', label: 'Inverno', icon: 'bi-snow', cor: '#90caf9' },
    //         { chave: 'primavera', label: 'Primavera', icon: 'bi-leaf', cor: '#a5d6a7' },
    //         { chave: 'verao', label: 'Verão', icon: 'bi-umbrella', cor: '#ef9a9a' },
    //         { chave: 'outono', label: 'Outono', icon: 'bi-reception-1', cor: '#ffcc80' },
    //         { chave: 'dia', label: 'Dia', icon: 'bi-sun', cor: '#ffb300' },
    //         { chave: 'noite', label: 'Noite', icon: 'bi-moon-stars', cor: '#9fa8da' }
    //     ];

    //     return configs.map(c => `
    //     <div class="estacao-item">
    //         <i class="bi ${c.icon}"></i>
    //         <span>${c.label}</span>
    //         <div class="mini-progress-bg">
    //             <div class="mini-progress-fill" style="width: ${estacoes[c.chave]}%; background-color: ${c.cor};"></div>
    //         </div>
    //     </div>
    // `).join('');
    // }

    // // Chame assim no abrirDescricao:
    // document.getElementById('detailEstacoesGrid').innerHTML = gerarHTMLClima(perfume.estacoes);
}

function aplicarZoom() {
    const container = document.querySelector('.detail-modal-visual');
    const img = document.querySelector('#detailPerfumeImg');

    if (!container || !img) return;

    container.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = container.getBoundingClientRect();

        // Calcula a posição do rato em percentagem dentro da imagem
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        img.style.transformOrigin = `${x}% ${y}%`;
        img.style.transform = "scale(2)"; // Nível de zoom
    });

    container.addEventListener('mouseleave', () => {
        img.style.transform = "scale(1)";
        img.style.transformOrigin = "center center";
    });
}

// ATENÇÃO: Deves chamar esta função dentro da tua abrirDescricao(id)
// logo após preencheres o src da imagem!

document.addEventListener('DOMContentLoaded', function () {
    const imgContainer = document.querySelector('.detail-modal-visual');
    const img = document.querySelector('[data-zoom]');

    if (imgContainer && img) {
        imgContainer.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = imgContainer.getBoundingClientRect();
            const x = ((e.pageX - left) / width) * 100;
            const y = ((e.pageY - top) / height) * 100;

            img.style.transformOrigin = `${x}% ${y}%`;
        });
    }
});

function gerarGraficoAcordes(acordes) {
    if (!acordes) return '';

    let html = '<div class="acordes-container"><p style="color:white; text-align:center;">Principais Acordes</p>';

    acordes.forEach(acorde => {
        html += `
        <div class="acorde-item">
            <div class="bar-fill" style="width: ${acorde.valor}%; background-color: ${acorde.cor};">
                ${acorde.nome.toLowerCase()}
            </div>
        </div>
    `;
    });

    html += '</div>';
    return html;
}

function closePerfumeDetail() {
    const modal = document.getElementById('perfumeDetailOverlay');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// TORNAR GLOBAL (Obrigatório por estar em módulo)
window.abrirDescricao = abrirDescricao;
window.closePerfumeDetail = closePerfumeDetail;

// Fechar ao clicar fora da caixa branca
window.addEventListener('click', (e) => {
    const overlay = document.getElementById('perfumeDetailOverlay');
    if (e.target === overlay) {
        window.closePerfumeDetail();
    }
});

// Fechar ao apertar a tecla ESC
window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        window.closePerfumeDetail();
    }
});

window.filtrarCatalogo = function (tipo, valor, elementoClicado) {
    // 1. Feedback visual imediato nos botões
    document.querySelectorAll('.filter-chip, .filter-sub-item').forEach(btn => {
        btn.classList.remove('active');
    });

    if (elementoClicado) {
        elementoClicado.classList.add('active');
    }

    // 2. Filtragem silenciosa (sem mover a tela)
    if (tipo === 'todos') {
        currentProducts = [...products];
    } else if (tipo === 'popular') {
        currentProducts = products.filter(p => p.popular === true);
    } else {
        currentProducts = products.filter(p => {
            if (!p[tipo]) return false;
            return p[tipo].toString().toLowerCase() === valor.toString().toLowerCase();
        });
    }

    // 3. Renderiza os novos cards
    renderProducts(currentProducts);

    // DICA: Em vez de rolar a página, podemos dar um pequeno "fade" no grid 
    // para o usuário perceber que os produtos mudaram.
    const grid = document.getElementById('productsGrid');
    if (grid) {
        grid.style.opacity = '0';
        setTimeout(() => {
            grid.style.transition = 'opacity 0.4s ease';
            grid.style.opacity = '1';
        }, 10);
    }
};

// ORDENAÇÃO (Chamada pelo seu Select)
window.ordenarProdutos = function (criterio) {
    if (criterio === 'alpha-asc') {
        currentProducts.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (criterio === 'alpha-desc') {
        currentProducts.sort((a, b) => b.nome.localeCompare(a.nome));
    } else {
        // Reset para ordem original do JSON
        currentProducts = [...products];
    }
    renderProducts(currentProducts);
};

// 4. MODAL DE PRODUTO (ALIMENTADO PELO PRICE.JSON)
window.openProductModal = function (productId) {
    if (!customerName) {
        if (typeof showNotification === 'function') showNotification('Por favor, preencha seu nome!', 'error');
        return;
    }

    // Busca o produto selecionado no array de produtos
    for (var i = 0; i < products.length; i++) {
        if (products[i].id === productId) {
            selectedProduct = products[i];
            break;
        }
    }

    document.getElementById('modalProductName').textContent = selectedProduct.nome;
    document.getElementById('modalProductDescription').textContent = selectedProduct.tipo;

    var sizesGrid = document.getElementById('sizesGrid');
    if (!sizesGrid) return;
    sizesGrid.innerHTML = '';

    // Usa o array 'sizes' que veio do price.json
    for (var i = 0; i < sizes.length; i++) {
        var size = sizes[i];
        var opt = document.createElement('div');
        opt.className = 'size-option';
        opt.tabIndex = 0;
        opt.innerHTML = `
            <div class="size-name">${size.name}</div>
            <div class="size-ml">${size.ml}</div>
            <div class="size-price">R$ ${size.price}</div>
        `;

        (function (idx) {
            opt.addEventListener('click', function () { addToCart(idx); });
        })(i);

        sizesGrid.appendChild(opt);
    }

    document.getElementById('productModal').classList.add('active');
    document.body.classList.add('no-scroll');
};

window.addToCart = function (sizeIndex) {
    var size = sizes[sizeIndex];
    var item = {
        id: Date.now(),
        productName: selectedProduct.nome,
        size: size.ml,
        price: size.price
    };
    cart.push(item);

    // Funções que estarão no seu novo arquivo de sacola/interface
    if (typeof updateCart === 'function') updateCart();
    if (typeof closeModal === 'function') {
        closeModal();
    } else {
        // Fallback caso closeModal não esteja definido
        document.getElementById('productModal').classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    showNotification('Produto adicionado à sacola!');
};

// 6. UTILITÁRIOS ORIGINAIS (FECHAR MODAL E NOTIFICAÇÃO)
window.closeModal = function () {
    document.getElementById('productModal').classList.remove('active');
    document.body.classList.remove('no-scroll');
};

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