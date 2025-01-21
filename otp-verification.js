// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const userEmail = urlParams.get('email') || localStorage.getItem('pendingVerificationEmail');

// Display user's email
document.getElementById('userEmailDisplay').textContent = userEmail;

// Store email for verification
localStorage.setItem('pendingVerificationEmail', userEmail);

// OTP Input Handling
const otpInputs = document.querySelectorAll('.otp-input');
let verificationInProgress = false;

otpInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        const index = parseInt(e.target.dataset.index);

        if (value) {
            input.classList.add('filled');
            // Move to next input
            if (index < otpInputs.length) {
                const nextInput = document.querySelector(`[data-index="${index + 1}"]`);
                if (nextInput) nextInput.focus();
            }
        } else {
            input.classList.remove('filled');
        }
    });

    input.addEventListener('keydown', (e) => {
        const index = parseInt(e.target.dataset.index);

        if (e.key === 'Backspace' && !e.target.value) {
            // Move to previous input on backspace
            if (index > 1) {
                const prevInput = document.querySelector(`[data-index="${index - 1}"]`);
                if (prevInput) prevInput.focus();
            }
        }
    });
});

// Form Submission
const otpForm = document.getElementById('otpForm');
otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (verificationInProgress) return;

    const otp = Array.from(otpInputs).map(input => input.value).join('');
    if (otp.length !== 6) {
        showError('Please enter the complete verification code');
        return;
    }

    verificationInProgress = true;
    const verifyBtn = document.querySelector('.verify-btn');
    verifyBtn.classList.add('loading');

    try {
        // Simulate API call for verification
        await verifyOTP(otp);
        
        // Success - redirect to dashboard
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.setItem('isEmailVerified', 'true');
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(error.message);
        verifyBtn.classList.remove('loading');
        verificationInProgress = false;
    }
});

// Resend Code Functionality
const resendBtn = document.getElementById('resendBtn');
const countdownSpan = document.getElementById('countdown');
let countdownInterval;
let timeLeft = 0;

resendBtn.addEventListener('click', async () => {
    if (timeLeft > 0) return;

    try {
        await resendVerificationCode();
        startResendCountdown();
        showSuccess('Verification code resent successfully');
    } catch (error) {
        showError('Failed to resend verification code');
    }
});

function startResendCountdown() {
    timeLeft = 30;
    resendBtn.disabled = true;
    updateCountdown();

    countdownInterval = setInterval(() => {
        timeLeft--;
        updateCountdown();

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            resendBtn.disabled = false;
            countdownSpan.textContent = '';
        }
    }, 1000);
}

function updateCountdown() {
    countdownSpan.textContent = timeLeft > 0 ? `(${timeLeft}s)` : '';
}

// API Simulation Functions
async function verifyOTP(otp) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo purposes, accept any 6-digit code
    if (otp.length === 6 && /^\d+$/.test(otp)) {
        return true;
    }
    throw new Error('Invalid verification code');
}

async function resendVerificationCode() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
}

// Error Handling
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.getElementById('otpForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Initialize countdown if there was a recent resend
if (localStorage.getItem('lastResendTime')) {
    const lastResend = parseInt(localStorage.getItem('lastResendTime'));
    const now = Date.now();
    const diff = Math.floor((now - lastResend) / 1000);
    
    if (diff < 30) {
        timeLeft = 30 - diff;
        startResendCountdown();
    }
}