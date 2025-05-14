document.addEventListener('DOMContentLoaded', function() {
    // Configuración
    const API_BASE_URL = 'http://localhost:3000';
    const breedsContainer = document.getElementById('breeds-container');
    const searchInput = document.getElementById('search-input');
    const filterBtn = document.getElementById('filter-btn');
    const filterContent = document.getElementById('filter-content');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const breedModal = document.getElementById('breed-modal');
    const closeModalBtn = document.getElementById('close-modal');
    
    // Variables de estado
    let currentFilters = {
        search: '',
        colors: [],
        patterns: []
    };

    // Event Listeners
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    filterBtn.addEventListener('click', toggleFilterDropdown);
    applyFiltersBtn.addEventListener('click', applyFilters);
    closeModalBtn.addEventListener('click', closeModal);
    breedModal.addEventListener('click', function(e) {
        if (e.target === breedModal) closeModal();
    });

    // Cargar razas al inicio
    fetchBreeds();

    // Funciones
    function toggleFilterDropdown() {
        console.log('Botón de filtros clickeado');
        if (filterContent.classList.contains('hidden')) {
            filterContent.classList.remove('hidden');
            filterContent.classList.add('show');
        } else {
            filterContent.classList.add('hidden');
            filterContent.classList.remove('show');
        }
        console.log('Clases del contenedor:', filterContent.classList);
    }

    function handleSearch() {
        currentFilters.search = searchInput.value.trim();
        fetchBreeds();
    }

    function applyFilters() {
        currentFilters.colors = Array.from(document.querySelectorAll('.color-filter:checked')).map(el => el.value);
        currentFilters.patterns = Array.from(document.querySelectorAll('.pattern-filter:checked')).map(el => el.value);
        fetchBreeds();
        filterContent.classList.remove('show');
    }

    async function fetchBreeds() {
        try {
            // Construir URL con filtros
            let url = `${API_BASE_URL}/api/breeds?`;
            if (currentFilters.search) url += `search=${encodeURIComponent(currentFilters.search)}&`;
            if (currentFilters.colors.length) url += `color=${encodeURIComponent(currentFilters.colors.join(','))}&`;
            if (currentFilters.patterns.length) url += `pattern=${encodeURIComponent(currentFilters.patterns.join(','))}&`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar las razas');
            
            const breeds = await response.json();
            renderBreeds(breeds);
        } catch (error) {
            console.error('Error:', error);
            breedsContainer.innerHTML = `
                <div class="col-span-full text-center py-8 text-red-500">
                    Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.
                </div>
            `;
        }
    }

    function renderBreeds(breeds) {
        if (breeds.length === 0) {
            breedsContainer.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    No se encontraron razas con los filtros aplicados.
                </div>
            `;
            return;
        }

        breedsContainer.innerHTML = breeds.map(breed => `
            <div class="breed-card">
                <div class="breed-card__inner">
                    <div class="breed-card__front bg-white rounded-xl shadow-md overflow-hidden transition-all duration-500">
                        <img src="./img/${breed.image}" alt="${breed.name}" class="w-full h-64 object-cover">
                        <div class="p-4">
                            <h3 class="text-xl font-bold text-indigo-900">${breed.name}</h3>
                            <div class="flex justify-center gap-2 mt-2">
                                ${breed.tags.map(tag => `
                                    <span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">${tag}</span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="breed-card__back bg-indigo-900 text-white rounded-xl p-6 flex flex-col justify-center">
                        <h3 class="text-xl font-bold mb-3">${breed.name}</h3>
                        <p class="mb-2"><span class="font-semibold">Vida promedio:</span> ${breed.lifespan}</p>
                        <p class="mb-2"><span class="font-semibold">Origen:</span> ${breed.origin}</p>
                        <p class="mb-2"><span class="font-semibold">Peso:</span> ${breed.weight}</p>
                        <p class="mb-4"><span class="font-semibold">Colores:</span> ${breed.colors.join(', ')}</p>
                        <button onclick="showBreedDetail(${breed.id})" class="breed-card__button self-center px-4 py-2 bg-white text-indigo-900 rounded-lg hover:bg-indigo-100 transition-colors">
                            Ver detalles completos
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Mostrar detalles completos de una raza
    window.showBreedDetail = async function(breedId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/breeds/${breedId}`);
            if (!response.ok) throw new Error('Error al cargar los detalles');
            
            const breed = await response.json();
            
            document.querySelector('.modal__body').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <img src="./img/${breed.image}" alt="${breed.name}" class="w-full rounded-lg shadow-md">
                    </div>
                    <div>
                        <h2 class="text-3xl font-bold text-indigo-900 mb-4">${breed.name}</h2>
                        <div class="space-y-4">
                            <div>
                                <h3 class="text-xl font-semibold text-indigo-800 mb-2">Características</h3>
                                <p>${breed.characteristics}</p>
                            </div>
                            <div>
                                <h4 class="font-semibold text-indigo-800">Vida promedio</h4>
                                <p>${breed.lifespan}</p>
                            </div>
                            <div>
                                <h4 class="font-semibold text-indigo-800">Peso</h4>
                                <p>${breed.weight}</p>
                            </div>
                            <div>
                                <h4 class="font-semibold text-indigo-800">Origen</h4>
                                <p>${breed.origin}</p>
                            </div>
                            <div>
                                <h4 class="font-semibold text-indigo-800">Colores</h4>
                                <p>${breed.colors.join(', ')}</p>
                            </div>
                            <div>
                                <h4 class="font-semibold text-indigo-800">Patrones</h4>
                                <p>${breed.patterns.join(', ')}</p>
                            </div>
                            <div>
                                <h4 class="font-semibold text-indigo-800">Etiquetas</h4>
                                <p>${breed.tags.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-6">
                    <h3 class="text-2xl font-bold text-indigo-900 mb-4">Comportamiento y Personalidad</h3>
                    <p>El ${breed.name} es conocido por ser ${breed.tags.includes('activo') ? 'activo y juguetón' : 'tranquilo y relajado'}. Es una raza que ${breed.tags.includes('vocal') ? 'suele ser muy vocal y comunicativa' : 'es más reservada y silenciosa'}.</p>
                </div>
                <div class="mt-6">
                    <h3 class="text-2xl font-bold text-indigo-900 mb-4">Recomendaciones de Alimentación</h3>
                    <p>El gato ${breed.name} es un animal carnívoro. Se recomienda alimentarlo con comida seca de alta calidad y evitar alimentos crudos. Asegúrate de que siempre tenga agua fresca disponible.</p>
                </div>
                <div class="mt-6">
                    <h3 class="text-2xl font-bold text-indigo-900 mb-4">Cuidados y Aseo</h3>
                    <p>Para mantener el pelaje de un ${breed.name} saludable, cepíllalo regularmente y utiliza arena de calidad para su higiene. También es importante realizar visitas regulares al veterinario.</p>
                </div>
                <div class="mt-6">
                    <h3 class="text-2xl font-bold text-indigo-900 mb-4">Enfermedades Comunes</h3>
                    <ul class="list-disc list-inside">
                        <li>Problemas dentales: Mantén una buena higiene dental.</li>
                        <li>Obesidad: Controla su dieta y fomenta el ejercicio.</li>
                        <li>Enfermedades genéticas: Consulta al veterinario regularmente.</li>
                    </ul>
                </div>
                <div class="mt-6">
                    <div class="flex justify-center">
                        <img src="./img/publicidad.jpg" alt="Publicidad" class="rounded-lg shadow-md">
                    </div>
                </div>
            `;
            
            breedModal.classList.add('show');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los detalles de la raza');
        }
    };

    function closeModal() {
        breedModal.classList.remove('show');
    }
});