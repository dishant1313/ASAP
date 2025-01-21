// Demo credentials and user data
const users = {
    'rider@demo.com': {
        password: 'rider123',
        name: 'Demo Rider',
        role: 'rider',
        prn: 'PRN001',
        license: 'LIC001',
        vehicle: 'MH12AB1234',
        emailVerified: true
    },
    'passenger@demo.com': {
        password: 'passenger123',
        name: 'Demo Passenger',
        role: 'passenger',
        prn: 'PRN002',
        emailVerified: true
    }
};

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    setupFormValidation();
    setupInteractiveElements();
    setupRoleSelection();
});

// Authentication initialization
function initializeAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPath = window.location.pathname;

    if (isLoggedIn && (currentPath.includes('login.html') || currentPath.includes('signup.html'))) {
        window.location.href = 'dashboard.html';
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Clear previous error messages
    clearErrors();
    
    // Add loading state to button
    const button = e.target.querySelector('button');
    button.classList.add('loading');
    
    try {
        // Validate credentials
        if (!users[email]) {
            throw new Error('User not found');
        }

        if (users[email].password !== password) {
            throw new Error('Invalid password');
        }

        if (!users[email].emailVerified) {
            localStorage.setItem('pendingVerificationEmail', email);
            window.location.href = `otp-verification.html?email=${encodeURIComponent(email)}`;
            return;
        }

        // Store user info in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', users[email].name);
        localStorage.setItem('userRole', users[email].role);
        
        // Show success message and redirect
        showSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showError(document.getElementById('email'), error.message);
        button.classList.remove('loading');
    }
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    
    // Clear previous error messages
    clearErrors();
    
    // Validate form
    if (!validateSignupForm(userData)) {
        return;
    }
    
    // Add loading state to button
    const button = e.target.querySelector('button');
    button.classList.add('loading');

    try {
        // Check if email already exists
        if (users[userData.email]) {
            throw new Error('Email already registered');
        }
        
        // Store new user
        users[userData.email] = {
            password: userData.password,
            name: userData.name,
            role: userData.role,
            prn: userData.prn,
            emailVerified: false,
            ...(userData.role === 'rider' && {
                license: userData.license,
                vehicle: userData.vehicle
            })
        };
        
        // Store email temporarily for verification
        localStorage.setItem('pendingVerificationEmail', userData.email);
        
        // Show success message and redirect to OTP verification
        showSuccessMessage('Account created! Redirecting to verification...');
        setTimeout(() => {
            window.location.href = `otp-verification.html?email=${encodeURIComponent(userData.email)}`;
        }, 1500);
    } catch (error) {
        showError(document.getElementById('email'), error.message);
        button.classList.remove('loading');
    }
}

// Validate signup form
function validateSignupForm(data) {
    let isValid = true;
    
    // Validate name
    if (!data.name || data.name.length < 2) {
        showError(document.getElementById('name'), 'Name must be at least 2 characters');
        isValid = false;
    }
    
    // Validate PRN
    if (!data.prn || !/^PRN\d{3,}$/i.test(data.prn)) {
        showError(document.getElementById('prn'), 'Invalid PRN format (e.g., PRN001)');
        isValid = false;
    }
    
    // Validate email
    if (!validateEmail(data.email)) {
        showError(document.getElementById('email'), 'Invalid email format');
        isValid = false;
    }
    
    // Validate password
    if (data.password.length < 6) {
        showError(document.getElementById('password'), 'Password must be at least 6 characters');
        isValid = false;
    }
    
    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
        showError(document.getElementById('confirmPassword'), 'Passwords do not match');
        isValid = false;
    }
    
    // Validate rider-specific fields
    if (data.role === 'rider') {
        if (!data.license) {
            showError(document.getElementById('license'), 'Vehicle license is required for riders');
            isValid = false;
        }
        if (!validateVehicleNumber(data.vehicle)) {
            showError(document.getElementById('vehicle'), 'Invalid vehicle number format (e.g., MH12AB1234)');
            isValid = false;
        }
    }
    
    return isValid;
}

// Validate email format
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate vehicle number format
function validateVehicleNumber(number) {
    return /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(number);
}

// Show error message
function showError(input, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    input.classList.add('error');
    input.parentNode.insertBefore(errorElement, input.nextSibling);
}

// Clear all error messages
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    document.querySelectorAll('.error').forEach(input => input.classList.remove('error'));
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Handle logout
function handleLogout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Setup form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            const errorMessage = input.nextElementSibling;
            if (errorMessage && errorMessage.classList.contains('error-message')) {
                errorMessage.remove();
            }
        });
    });
}

// Setup role selection for signup
function setupRoleSelection() {
    const roleSelect = document.getElementById('role');
    const vehicleInfo = document.getElementById('vehicleInfo');
    
    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            if (e.target.value === 'rider') {
                vehicleInfo.style.display = 'block';
                document.getElementById('license').required = true;
                document.getElementById('vehicle').required = true;
            } else {
                vehicleInfo.style.display = 'none';
                document.getElementById('license').required = false;
                document.getElementById('vehicle').required = false;
            }
        });
    }
}

// Setup interactive elements
function setupInteractiveElements() {
    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Add password visibility toggle
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'password-toggle';
        toggleButton.innerHTML = '👁️';
        toggleButton.onclick = () => {
            input.type = input.type === 'password' ? 'text' : 'password';
        };
        input.parentNode.appendChild(toggleButton);
    });
}