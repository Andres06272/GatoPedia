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

            function getLinks(breed) {
                const name = breed.name.toLowerCase().replace(/ /g, "-");
                return [
                    { label: "Videos en YouTube", url: `https://www.youtube.com/results?search_query=gato+${encodeURIComponent(breed.name)}` },
                    { label: "Hill's Pet", url: `https://www.hillspet.es/cat-care/cat-breeds/${name}` },
                    { label: "Purina", url: `https://www.purina.es/encuentra-mascota/razas-de-gato/${name}` },
                    { label: "TiendaAnimal", url: `https://www.tiendanimal.es/articulos/${name}-caracteristicas-cuidados-y-curiosidades/` },
                    { label: "Royal Canin", url: `https://www.royalcanin.com/es/cats/breeds/${name}` }
                ];
            }
            const links = getLinks(breed);

            function link(label) {
                const l = links.find(l => l.label.toLowerCase().includes(label.toLowerCase()));
                return l ? `<a href="${l.url}" target="_blank" class="text-indigo-600 underline hover:text-indigo-800">${l.label}</a>` : '';
            }

            function extraInfo(breed) {
                if (breed.name === "Británico de Pelo Corto") {
                    return `
                        <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Historia Real Británica</h3>
                        <p>
                            Originalmente criados como gatos de trabajo en Gran Bretaña, se hicieron populares durante la era victoriana.
                            Sobrevivieron a las guerras mundiales y ayudaron a proteger las reservas de alimentos de los roedores.
                            Más historia en ${link('Hill\'s Pet')}.
                        </p>
                        <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Características Distintivas</h3>
                        <ul class="list-disc list-inside mb-2">
                            <li>Cara redonda con mejillas prominentes ("cara de osito").</li>
                            <li>Constitución robusta y compacta.</li>
                            <li>Pelaje denso y suave como el terciopelo.</li>
                            <li>Famosos por su "sonrisa británica".</li>
                        </ul>
                        <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Temperamento Único</h3>
                        <p>
                            Conocidos como los "caballeros británicos" por su comportamiento digno y reservado.
                            Independientes pero afectuosos, prefieren estar cerca pero no encima de sus dueños.
                            Más sobre su personalidad en ${link('Purina')}.
                        </p>
                    `;
                }
                
                if (breed.name === "Bosque de Noruega") {
                    return `
                        <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Legado Vikingo</h3>
                        <p>
                            Descendientes de los gatos que viajaban en los barcos vikingos, evolucionaron para sobrevivir
                            en el duro clima nórdico. Son considerados tesoros nacionales en Noruega.
                            Más sobre su herencia en ${link('Royal Canin')}.
                        </p>
                        <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Adaptaciones al Frío</h3>
                        <ul class="list-disc list-inside mb-2">
                            <li>Doble capa de pelo resistente al agua y al frío.</li>
                            <li>Patas grandes con pelo entre los dedos para caminar en la nieve.</li>
                            <li>Cola larga y espesa para envolverse al dormir.</li>
                        </ul>
                        <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Habilidades Únicas</h3>
                        <p>
                            Excelentes trepadores gracias a sus garras fuertes y patas musculosas.
                            Capaces de escalar rocas verticales y árboles altos con facilidad.
                        </p>
                    `;
                }

                if (breed.name === "Sagrado de Birmania") {
                    return `
                        <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Leyenda del Templo</h3>
                        <p>
                            Según la leyenda, estos gatos eran guardianes de los templos budistas en Birmania.
                            Se dice que obtuvieron sus puntos dorados y ojos azules por la bendición de una diosa.
                            Detalles en ${link('Hill\'s Pet')}.
                        </p>
                        <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Marcas Sagradas</h3>
                        <ul class="list-disc list-inside mb-2">
                            <li>"Guantes" blancos en las patas (característica única de la raza).</li>
                            <li>Máscara facial oscura con ojos zafiro.</li>
                            <li>Pelaje sedoso que raramente se enreda.</li>
                        </ul>
                        <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Personalidad Mística</h3>
                        <p>
                            Conocidos por su naturaleza gentil y meditativa.
                            Desarrollan fuertes vínculos emocionales con sus familias.
                            Ver más en ${link('YouTube')}.
                        </p>
                    `;
                }

                // ... Add more breeds with specific information ...

                // Generic fallback for other breeds
                return `
                    <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Historia y Origen</h3>
                    <p>
                        El ${breed.name} es una raza apreciada tanto por su aspecto como por su personalidad. 
                        Su origen y evolución han sido influenciados por la selección natural y la crianza selectiva.
                        Más información en ${link('TiendaAnimal')} y ${link('Hill\'s Pet')}.
                    </p>
                    <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Personalidad y Comportamiento</h3>
                    <p>
                        Esta raza suele ser ${breed.tags && breed.tags.length ? breed.tags.join(', ') : 'versátil y adaptable'}.
                        Se adapta bien a la vida en familia y puede convivir con otros animales si se socializa desde pequeño.
                        Descubre videos y experiencias en ${link('YouTube')} y consejos en ${link('Hill\'s Pet')}.
                    </p>
                    <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Cuidados y Salud</h3>
                    <ul class="list-disc list-inside mb-2">
                        <li>Requiere cuidados básicos de higiene, alimentación balanceada y visitas regulares al veterinario.</li>
                        <li>Consulta recomendaciones específicas en ${link('Purina')} y ${link('TiendaAnimal')}.</li>
                    </ul>
                    <h3 class="text-xl font-bold text-indigo-900 mt-6 mb-2">Curiosidades y Recomendaciones</h3>
                    <ul class="list-disc list-inside mb-2">
                        <li>Algunas líneas de esta raza han participado en exposiciones felinas internacionales.</li>
                        <li>Para más información y recursos, visita ${link('Royal Canin')} y ${link('YouTube')}.</li>
                    </ul>
                `;
            }

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
                                <p>${breed.colors && breed.colors.length ? breed.colors.join(', ') : 'N/A'}</p>
                            </div>
                            <div>
                                <h4 class="font-semibold text-indigo-800">Patrones</h4>
                                <p>${breed.patterns && breed.patterns.length ? breed.patterns.join(', ') : 'N/A'}</p>
                            </div>
                            <div>
                                <h4 class="font-semibold text-indigo-800">Etiquetas</h4>
                                <p>${breed.tags && breed.tags.length ? breed.tags.join(', ') : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-6">
                    ${extraInfo(breed)}
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