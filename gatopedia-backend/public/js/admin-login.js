document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        // Redirigir al administrador a la página principal con permisos
        window.location.href = '/admin';
    } else {
        // Mostrar mensaje de error
        document.getElementById('error-message').classList.remove('hidden');
    }
});