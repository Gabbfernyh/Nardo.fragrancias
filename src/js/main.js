// main.js - Onde a mágica começa
let todosProdutos = [];

// main.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('./src/data/produtos.json');
        todosProdutos = await response.json();

        // Verificação de segurança: espera um pequeno instante ou verifica se a função existe
        const checkReady = setInterval(() => {
            if (typeof window.renderizarProdutos === 'function') {
                clearInterval(checkReady);
                mostrarPopulares();
                setupSearch();
            }
        }, 50); // Checa a cada 50ms se o outro arquivo carregou

    } catch (error) {
        console.error("Erro ao carregar banco de dados:", error);
    }
});

// main.js
document.addEventListener('DOMContentLoaded', () => {
    // Configura a busca
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const filtrados = products.filter(p =>
                p.nome.toLowerCase().includes(termo) ||
                p.linha.toLowerCase().includes(termo)
            );
            if (typeof renderizarProdutos === 'function') {
                renderizarProdutos(filtrados, "productsGrid");
            }
        });
    }
});

// --- FUNÇÕES DE FILTRO (Conforme sua organização solicitada) ---

function mostrarPopulares() {
    const populares = todosProdutos.filter(p => p.popular === true);
    // Aqui chamamos a sua função que já está no render.js/index.js
    renderizarProdutos(populares, "productsGrid");
}

function filtrarPorGenero(genero) {
    const filtrados = todosProdutos.filter(p => p.genero === genero);
    renderizarProdutos(filtrados, "productsGrid");
}

function filtrarPorNota(nota) {
    const filtrados = todosProdutos.filter(p => p.tipo === nota);
    renderizarProdutos(filtrados, "productsGrid");
}

function filtrarPorLinha(linha) {
    const filtrados = todosProdutos.filter(p => p.linha === linha);
    renderizarProdutos(filtrados, "productsGrid");
}

// Configuração da barra de pesquisa
function setupSearch() {
    const input = document.querySelector('.search-input');
    if (input) {
        input.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const filtrados = todosProdutos.filter(p =>
                p.nome.toLowerCase().includes(termo) ||
                p.linha.toLowerCase().includes(termo)
            );
            renderizarProdutos(filtrados, "productsGrid");
        });
    }
}