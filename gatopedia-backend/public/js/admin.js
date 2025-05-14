document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = 'http://localhost:3000/api/crud';
    const adminContent = document.getElementById('admin-content');
    const logoutBtn = document.getElementById('logout-btn');

    // Cerrar sesión
    logoutBtn.addEventListener('click', () => {
        document.cookie = 'isAdmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/';
    });

    // Cargar razas
    async function fetchBreeds() {
        try {
            const response = await fetch(`${API_BASE_URL}/breeds`);
            if (!response.ok) throw new Error('Error al cargar las razas');
            const breeds = await response.json();
            renderBreeds(breeds);
        } catch (error) {
            console.error('Error:', error);
            adminContent.innerHTML = `<p class="text-red-500">Error al cargar las razas.</p>`;
        }
    }

    // Renderizar razas
    function renderBreeds(breeds) {
        adminContent.innerHTML = `
            <button class="bg-green-500 text-white px-4 py-2 rounded-lg mb-4" onclick="addBreed()">Añadir Nueva Raza</button>
            <table class="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border border-gray-300 px-4 py-2">ID</th>
                        <th class="border border-gray-300 px-4 py-2">Nombre</th>
                        <th class="border border-gray-300 px-4 py-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${breeds.map(breed => `
                        <tr>
                            <td class="border border-gray-300 px-4 py-2">${breed.id}</td>
                            <td class="border border-gray-300 px-4 py-2">${breed.name}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <button class="bg-blue-500 text-white px-2 py-1 rounded" onclick="editBreed(${breed.id})">Editar</button>
                                <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="deleteBreed(${breed.id})">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Editar raza
    window.editBreed = async function (id) {
        try {
            // Obtener los datos de la raza seleccionada
            const response = await fetch(`${API_BASE_URL}/breeds/${id}`);
            if (!response.ok) throw new Error('Error al cargar los datos de la raza');
            const breed = await response.json();

            // Renderizar el formulario de edición
            adminContent.innerHTML = `
                <h2 class="text-xl font-bold mb-4">Editar Raza</h2>
                <form id="edit-breed-form" class="space-y-4">
                    <div>
                        <label for="name" class="block text-gray-700">Nombre</label>
                        <input type="text" id="name" name="name" value="${breed.name}" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label for="lifespan" class="block text-gray-700">Esperanza de vida</label>
                        <input type="text" id="lifespan" name="lifespan" value="${breed.lifespan}" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label for="characteristics" class="block text-gray-700">Características</label>
                        <textarea id="characteristics" name="characteristics" class="w-full px-4 py-2 border rounded-lg">${breed.characteristics}</textarea>
                    </div>
                    <div>
                        <label for="origin" class="block text-gray-700">Origen</label>
                        <input type="text" id="origin" name="origin" value="${breed.origin}" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label for="weight" class="block text-gray-700">Peso</label>
                        <input type="text" id="weight" name="weight" value="${breed.weight}" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label for="image" class="block text-gray-700">Imagen</label>
                        <input type="text" id="image" name="image" value="${breed.image}" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-gray-700">Colores</label>
                        <div id="colors-container" class="space-y-2">
                            ${breed.colors.map(color => `
                                <input type="text" class="color-input w-full px-4 py-2 border rounded-lg" value="${color}">
                            `).join('')}
                        </div>
                        <button type="button" id="add-color" class="bg-indigo-500 text-white px-4 py-2 rounded-lg mt-2">Añadir Color</button>
                    </div>
                    <div>
                        <label class="block text-gray-700">Patrones</label>
                        <div id="patterns-container" class="space-y-2">
                            ${breed.patterns.map(pattern => `
                                <input type="text" class="pattern-input w-full px-4 py-2 border rounded-lg" value="${pattern}">
                            `).join('')}
                        </div>
                        <button type="button" id="add-pattern" class="bg-indigo-500 text-white px-4 py-2 rounded-lg mt-2">Añadir Patrón</button>
                    </div>
                    <div>
                        <label class="block text-gray-700">Etiquetas</label>
                        <div id="tags-container" class="space-y-2">
                            ${breed.tags.map(tag => `
                                <input type="text" class="tag-input w-full px-4 py-2 border rounded-lg" value="${tag}">
                            `).join('')}
                        </div>
                        <button type="button" id="add-tag" class="bg-indigo-500 text-white px-4 py-2 rounded-lg mt-2">Añadir Etiqueta</button>
                    </div>
                    <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Guardar Cambios</button>
                    <button type="button" id="cancel-edit" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Cancelar</button>
                </form>
            `;

            // Manejar la adición de colores, patrones y etiquetas
            document.getElementById('add-color').addEventListener('click', () => {
                const container = document.getElementById('colors-container');
                container.insertAdjacentHTML('beforeend', `<input type="text" class="color-input w-full px-4 py-2 border rounded-lg" placeholder="Color">`);
            });

            document.getElementById('add-pattern').addEventListener('click', () => {
                const container = document.getElementById('patterns-container');
                container.insertAdjacentHTML('beforeend', `<input type="text" class="pattern-input w-full px-4 py-2 border rounded-lg" placeholder="Patrón">`);
            });

            document.getElementById('add-tag').addEventListener('click', () => {
                const container = document.getElementById('tags-container');
                container.insertAdjacentHTML('beforeend', `<input type="text" class="tag-input w-full px-4 py-2 border rounded-lg" placeholder="Etiqueta">`);
            });

            // Manejar el envío del formulario
            document.getElementById('edit-breed-form').addEventListener('submit', async (e) => {
                e.preventDefault();

                const updatedBreed = {
                    name: document.getElementById('name').value.trim(),
                    lifespan: document.getElementById('lifespan').value.trim(),
                    characteristics: document.getElementById('characteristics').value.trim(),
                    origin: document.getElementById('origin').value.trim(),
                    weight: document.getElementById('weight').value.trim(),
                    image: document.getElementById('image').value.trim(),
                    attributes: [
                        ...Array.from(document.querySelectorAll('.color-input')).map(input => ({ type: 'color', value: input.value.trim() })),
                        ...Array.from(document.querySelectorAll('.pattern-input')).map(input => ({ type: 'pattern', value: input.value.trim() })),
                        ...Array.from(document.querySelectorAll('.tag-input')).map(input => ({ type: 'tag', value: input.value.trim() }))
                    ].filter(attr => attr.value !== '') // Filtrar valores vacíos
                };

                try {
                    const response = await fetch(`${API_BASE_URL}/breeds/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedBreed),
                    });

                    if (!response.ok) throw new Error('Error al actualizar la raza');
                    alert('Raza actualizada correctamente');
                    fetchBreeds(); // Recargar la lista de razas
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al actualizar la raza');
                }
            });

            // Manejar la cancelación
            document.getElementById('cancel-edit').addEventListener('click', fetchBreeds);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los datos de la raza');
        }
    };

    // Eliminar raza
    window.deleteBreed = async function (id) {
        if (!confirm('¿Estás seguro de eliminar esta raza?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/breeds/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar la raza');
            alert('Raza eliminada correctamente');
            fetchBreeds();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la raza');
        }
    };

    // Mostrar formulario para agregar una nueva raza
    window.addBreed = function () {
        adminContent.innerHTML = `
            <h2 class="text-xl font-bold mb-4">Agregar Nueva Raza</h2>
            <form id="add-breed-form" class="space-y-4">
                <div>
                    <label for="name" class="block text-gray-700">Nombre</label>
                    <input type="text" id="name" name="name" class="w-full px-4 py-2 border rounded-lg" placeholder="Nombre de la raza">
                </div>
                <div>
                    <label for="lifespan" class="block text-gray-700">Esperanza de vida</label>
                    <input type="text" id="lifespan" name="lifespan" class="w-full px-4 py-2 border rounded-lg" placeholder="Ejemplo: 12-15 años">
                </div>
                <div>
                    <label for="characteristics" class="block text-gray-700">Características</label>
                    <textarea id="characteristics" name="characteristics" class="w-full px-4 py-2 border rounded-lg" placeholder="Características de la raza"></textarea>
                </div>
                <div>
                    <label for="origin" class="block text-gray-700">Origen</label>
                    <input type="text" id="origin" name="origin" class="w-full px-4 py-2 border rounded-lg" placeholder="País de origen">
                </div>
                <div>
                    <label for="weight" class="block text-gray-700">Peso</label>
                    <input type="text" id="weight" name="weight" class="w-full px-4 py-2 border rounded-lg" placeholder="Ejemplo: 3-5 kg">
                </div>
                <div>
                    <label for="image" class="block text-gray-700">Imagen</label>
                    <input type="text" id="image" name="image" class="w-full px-4 py-2 border rounded-lg" placeholder="Nombre del archivo de imagen (ejemplo: persa.jpg)">
                </div>
                <div>
                    <label class="block text-gray-700">Colores</label>
                    <div id="colors-container" class="space-y-2">
                        <input type="text" class="color-input w-full px-4 py-2 border rounded-lg" placeholder="Color (ejemplo: blanco)">
                    </div>
                    <button type="button" id="add-color" class="bg-indigo-500 text-white px-4 py-2 rounded-lg mt-2">Añadir Color</button>
                </div>
                <div>
                    <label class="block text-gray-700">Patrones</label>
                    <div id="patterns-container" class="space-y-2">
                        <input type="text" class="pattern-input w-full px-4 py-2 border rounded-lg" placeholder="Patrón (ejemplo: liso)">
                    </div>
                    <button type="button" id="add-pattern" class="bg-indigo-500 text-white px-4 py-2 rounded-lg mt-2">Añadir Patrón</button>
                </div>
                <div>
                    <label class="block text-gray-700">Etiquetas</label>
                    <div id="tags-container" class="space-y-2">
                        <input type="text" class="tag-input w-full px-4 py-2 border rounded-lg" placeholder="Etiqueta (ejemplo: tranquilo)">
                    </div>
                    <button type="button" id="add-tag" class="bg-indigo-500 text-white px-4 py-2 rounded-lg mt-2">Añadir Etiqueta</button>
                </div>
                <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Agregar Raza</button>
                <button type="button" id="cancel-add" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Cancelar</button>
            </form>
        `;

        // Manejar la adición de colores, patrones y etiquetas
        document.getElementById('add-color').addEventListener('click', () => {
            const container = document.getElementById('colors-container');
            container.insertAdjacentHTML('beforeend', `<input type="text" class="color-input w-full px-4 py-2 border rounded-lg" placeholder="Color">`);
        });

        document.getElementById('add-pattern').addEventListener('click', () => {
            const container = document.getElementById('patterns-container');
            container.insertAdjacentHTML('beforeend', `<input type="text" class="pattern-input w-full px-4 py-2 border rounded-lg" placeholder="Patrón">`);
        });

        document.getElementById('add-tag').addEventListener('click', () => {
            const container = document.getElementById('tags-container');
            container.insertAdjacentHTML('beforeend', `<input type="text" class="tag-input w-full px-4 py-2 border rounded-lg" placeholder="Etiqueta">`);
        });

        // Manejar el envío del formulario
        document.getElementById('add-breed-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const newBreed = {
                name: document.getElementById('name').value.trim(),
                lifespan: document.getElementById('lifespan').value.trim(),
                characteristics: document.getElementById('characteristics').value.trim(),
                origin: document.getElementById('origin').value.trim(),
                weight: document.getElementById('weight').value.trim(),
                image: document.getElementById('image').value.trim(),
                attributes: [
                    ...Array.from(document.querySelectorAll('.color-input')).map(input => ({ type: 'color', value: input.value.trim() })),
                    ...Array.from(document.querySelectorAll('.pattern-input')).map(input => ({ type: 'pattern', value: input.value.trim() })),
                    ...Array.from(document.querySelectorAll('.tag-input')).map(input => ({ type: 'tag', value: input.value.trim() }))
                ].filter(attr => attr.value !== '') // Filtrar valores vacíos
            };

            try {
                const response = await fetch(`${API_BASE_URL}/breeds`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBreed),
                });

                if (!response.ok) throw new Error('Error al agregar la raza');
                alert('Raza agregada correctamente');
                fetchBreeds(); // Recargar la lista de razas
            } catch (error) {
                console.error('Error:', error);
                alert('Error al agregar la raza');
            }
        });

        // Manejar la cancelación
        document.getElementById('cancel-add').addEventListener('click', fetchBreeds);
    };

    // Cargar razas al inicio
    fetchBreeds();
});