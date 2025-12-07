// ======================================================
// 1. DADOS INICIAIS 
// ======================================================
const initialData = [
    {id: 1, 
        name: "PS5", 
        price: "R$ 3.500,00", 
        image: "src/img/PS5.jpeg", 
        category: "tech", 
        done: false
    },

];

// VARIÁVEIS GLOBAIS
let gifts = JSON.parse(localStorage.getItem('myGifts')) || initialData;
let currentFilter = 'all';
let editingId = null;
let idToDelete = null;

// ======================================================
// 2. INICIALIZAÇÃO
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    renderGifts();
    atualizarContador();
    
    const priceInput = document.getElementById('giftPrice');
    if (priceInput) {
        priceInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value === "") { e.target.value = ""; return; }
            value = (parseInt(value) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            e.target.value = value;
        });
    }

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
});

// ======================================================
// 3. ANIMAÇÃO (Observer)
// ======================================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
});

// ======================================================
// 4. FUNÇÕES DA LISTA
// ======================================================
function renderGifts() {
    const container = document.getElementById('gift-container');
    if (!container) return;
    
    container.innerHTML = '';
    const filtered = gifts.filter(item => currentFilter === 'all' || item.category === currentFilter);

    filtered.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `gift-item hidden ${item.done ? 'done' : ''}`;
        card.style.transitionDelay = `${index * 0.1}s`;
        
        const imgUrl = item.image || 'https://placehold.co/150?text=Sem+Foto';

        card.innerHTML = `
            <img src="${imgUrl}" alt="${item.name}">
            <div class="gift-info">
                <h4>${item.name}</h4>
                <span class="price">${item.price}</span>
                <div class="card-actions">
                    <button class="btn-icon btn-check" onclick="toggleDone(${item.id})"><i class="fa-solid fa-check"></i></button>
                    <button class="btn-icon btn-edit" onclick="editItem(${item.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon btn-delete" onclick="openDeleteModal(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
        observer.observe(card); 
    });
}

function filterGifts(category) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${category}'`)) {
            btn.classList.add('active');
        }
    });
    renderGifts();
}

// ======================================================
// 5. MODAIS E AÇÕES
// ======================================================
function openModal() {
    const modal = document.getElementById('giftModal');
    if (modal) {
        document.getElementById('modalTitle').innerText = "Novo Desejo";
        // Limpa campos
        if(document.getElementById('giftName')) document.getElementById('giftName').value = '';
        if(document.getElementById('giftPrice')) document.getElementById('giftPrice').value = '';
        if(document.getElementById('giftCategory')) document.getElementById('giftCategory').value = 'casa';
        if(document.getElementById('giftFileInput')) document.getElementById('giftFileInput').value = '';
        if(document.getElementById('giftImageBase64')) document.getElementById('giftImageBase64').value = '';
        
        const preview = document.getElementById('imagePreview');
        if(preview) { preview.src = ''; preview.style.display = 'none'; }
        
        editingId = null;
        modal.classList.add('open');
    }
}

function closeModal() {
    const modal = document.getElementById('giftModal');
    if (modal) modal.classList.remove('open');
}

function openDeleteModal(id) {
    idToDelete = id;
    document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
    idToDelete = null;
    document.getElementById('deleteModal').classList.remove('open');
}

function confirmDelete() {
    if (idToDelete) {
        gifts = gifts.filter(g => g.id !== idToDelete);
        saveAndUpdate();
        closeDeleteModal();
    }
}

// ======================================================
// 6. SALVAMENTO E IMAGEM
// ======================================================
function previewImage() {
    const fileInput = document.getElementById('giftFileInput');
    const preview = document.getElementById('imagePreview');
    const hiddenInput = document.getElementById('giftImageBase64');

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onloadend = function () {
            preview.src = reader.result;
            preview.style.display = "block";
            hiddenInput.value = reader.result; 
        }
        reader.readAsDataURL(fileInput.files[0]); 
    }
}

function saveGift() {
    const name = document.getElementById('giftName').value;
    const price = document.getElementById('giftPrice').value;
    const category = document.getElementById('giftCategory').value;
    let image = document.getElementById('giftImageBase64').value;

    if (!name) return alert("Digite o nome!");

    if (editingId) {
        const index = gifts.findIndex(g => g.id === editingId);
        if (index > -1) {
            const oldImage = gifts[index].image;
            const finalImage = image ? image : oldImage;
            gifts[index] = { ...gifts[index], name, price, category, image: finalImage };
        }
    } else {
        if (!image) image = 'https://placehold.co/150?text=Sem+Foto';
        const newId = Date.now();
        gifts.push({ id: newId, name, price, image, category, done: false });
    }

    saveAndUpdate();
    closeModal();
}

function editItem(id) {
    const item = gifts.find(g => g.id === id);
    if (!item) return;
    document.getElementById('modalTitle').innerText = "Editar";
    document.getElementById('giftName').value = item.name;
    document.getElementById('giftPrice').value = item.price;
    document.getElementById('giftCategory').value = item.category;
    
    const preview = document.getElementById('imagePreview');
    if (item.image && item.image.startsWith('data:image')) {
        preview.src = item.image; preview.style.display = "block";
    } else {
        preview.src = ""; preview.style.display = "none";
    }
    
    document.getElementById('giftFileInput').value = '';
    document.getElementById('giftImageBase64').value = '';
    editingId = id;
    document.getElementById('giftModal').classList.add('open');
}

function toggleDone(id) {
    const index = gifts.findIndex(g => g.id === id);
    if (index > -1) { gifts[index].done = !gifts[index].done; saveAndUpdate(); }
}

function saveAndUpdate() {
    localStorage.setItem('myGifts', JSON.stringify(gifts));
    renderGifts();
}

// ======================================================
// 7. CONTADOR
// ======================================================
function atualizarContador() {
    const dataInicio = new Date(2025, 8, 13);
    const dataAtual = new Date();
    const diff = Math.floor((dataAtual - dataInicio) / (1000 * 60 * 60 * 24));
    
    if(document.getElementById('texto-total-dias')) 
        document.getElementById('texto-total-dias').textContent = (dataAtual >= dataInicio) ? `${diff} Dias Juntos` : "Em Breve...";
    
    let anos = dataAtual.getFullYear() - dataInicio.getFullYear();
    let meses = dataAtual.getMonth() - dataInicio.getMonth();
    let dias = dataAtual.getDate() - dataInicio.getDate();
    if (dias < 0) { meses--; dias += 30; }
    if (meses < 0) { anos--; meses += 12; }
    const totalMeses = (anos * 12) + meses;
    
    if(document.getElementById('months-count')) document.getElementById('months-count').innerText = (dataAtual >= dataInicio) ? totalMeses : "0";
    if(document.getElementById('days-count')) document.getElementById('days-count').innerText = (dataAtual >= dataInicio) ? dias : "0";
}

window.onclick = function (event) {
    const modalAdd = document.getElementById('giftModal');
    const modalDel = document.getElementById('deleteModal');
    if (event.target === modalAdd) closeModal();
    if (event.target === modalDel) closeDeleteModal();
}
