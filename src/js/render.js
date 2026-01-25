// render.js
// render.js
export function renderizarProdutos(listaProdutos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Limpa o container antes de renderizar novos itens
    container.innerHTML = "";

    listaProdutos.forEach(prod => {
        const isPopular = prod.popular === true;

        const cardHTML = `
            <div class="product-card">
                ${isPopular ? '<span class="badge-popular">🔥 Popular</span>' : ''}
                
                <div class="product-image-container">
                    <img src="${prod.imagem}" alt="${prod.nome}" class="product-img">
                </div>
                
                <div class="product-info">
                    <p class="brand-name">${prod.marca.toUpperCase()} - ${prod.linha}</p>
                    <h3 class="product-title">${prod.nome}</h3>
                    
                    <div class="rating">
                        <span class="stars">★★★★★</span>
                    </div>
                    
                    <div class="price-container">
                        <span>A partir de</span>
                        <div class="current-price-row">
                            <span class="current-price">R$ 15,00</span>
                        </div>
                    </div>

                    <div class="product-actions">
                        <button class="add-to-cart-btn" onclick="window.openProductModal(${prod.id})">
                            Adicionar à sacola
                        </button>

                        <button class="btn-description" onclick="window.abrirDescricao(${prod.id})">
                            Ver detalhes do perfume
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML += cardHTML;
    });
}
// Deixa a função disponível globalmente para o index.js e main.js
window.renderizarProdutos = renderizarProdutos;
window.applyFiltersAndSort = applyFiltersAndSort;