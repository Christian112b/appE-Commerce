function submitRegisterForm() {
    const form = document.getElementById('registerForm');
    const errorMessage = validateRegisterInputs(form);

    if (errorMessage) {
        alert(errorMessage);
        return;
    }

    const formData = new FormData(form);

    fetch('/registerUser', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 200) {
            alert("Usuario registrado correctamente.");
            window.location.href = '/login';
        } else {
            alert("No se pudo registrar el usuario.");
        }
    })
    .catch(error => {
        console.error("Error durante el registro:", error);
        alert("Error del servidor. Intenta más tarde.");
    });
}


function validateRegisterInputs(form) {
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (!name || !email || !phone || !password || !confirmPassword) {
        return "Por favor completa todos los campos.";
    }

    if (name.length > 100) {
        return "El nombre no debe exceder los 100 caracteres.";
    }

    if (email.length > 100 || !email.includes('@')) {
        return "Ingresa un correo electrónico válido.";
    }

    if (phone.length > 20) {
        return "El número telefónico no debe exceder los 20 caracteres.";
    }

    if (password.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres.";
    }

    if (password !== confirmPassword) {
        return "Las contraseñas no coinciden.";
    }

    return null; // Todo está validado
}
