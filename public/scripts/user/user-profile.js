
const Profile = {
    // Initialize the profile page
    init() {
        this.bindEvents();
        this.loadCartCount();
        this.loadWishlistCount();
        this.showWelcomeToast();
    },

    // Bind event listeners
    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        // Form validation on input
        this.setupFormValidation();
    },

    // Show welcome toast
    showWelcomeToast() {
        setTimeout(() => {
            this.showToast('Welcome to your profile!', 'info');
        }, 500);
    },

    // Toast functionality
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastIcon = document.getElementById('toast-icon');
        const toastMessage = document.getElementById('toast-message');

        if (!toast || !toastIcon || !toastMessage) return;

        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toastIcon.className = icons[type] || icons.success;
        toastMessage.textContent = message;
        toast.className = `toast toast-${type} show`;

        setTimeout(() => {
            this.hideToast();
        }, 4000);
    },

    // Hide toast
    hideToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.remove('show');
        }
    },

    // Toggle edit mode for forms
    async toggleEdit(section) {
        const form = document.getElementById(section + 'Form');
        const button = form.parentElement.querySelector('.edit-btn');
        const inputs = form.querySelectorAll('.form-input');

        if (inputs[0].readOnly) {
            // Enable editing mode
            inputs.forEach(input => {
                if (input.id !== 'email') { // Don't allow email editing
                    input.readOnly = false;
                    input.classList.add('editable');
                    input.style.backgroundColor = '#fff';
                    input.style.color = '#1f2937';
                    input.style.cursor = 'text';
                }
            });

            button.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            button.setAttribute('onclick', `Profile.saveChanges('${section}')`);
            button.classList.add('save-mode');

            this.showToast('Edit mode enabled. Make your changes and click Save.', 'info');
        }
    },

    // Save profile changes
    async saveChanges(section) {
        const form = document.getElementById(section + 'Form');
        const button = form.parentElement.querySelector('.edit-btn');
        const inputs = form.querySelectorAll('.form-input.editable');

        // Show loading state
        const originalButtonText = button.innerHTML;
        button.innerHTML = '<div class="loading"></div> Saving...';
        button.disabled = true;

        // Collect form data
        const data = {};
        inputs.forEach(input => {
            if (input.id !== 'email') {
                data[input.id] = input.value.trim();
            }
        });

        // Validate data before sending
        const validation = this.validateBasicInfo(data);
        if (!validation.isValid) {
            this.displayValidationErrors(validation.errors);
            this.resetSaveButton(button, originalButtonText);
            return;
        }

        try {
            const response = await axios.post('/user/profile/update', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000
            });

            if (response.data.success) {
                // Success - disable editing mode
                inputs.forEach(input => {
                    input.readOnly = true;
                    input.classList.remove('editable');
                    input.style.backgroundColor = '#f9fafb';
                    input.style.color = '#6b7280';
                    input.style.cursor = 'not-allowed';
                });

                button.innerHTML = '<i class="fas fa-edit"></i> Edit';
                button.setAttribute('onclick', `Profile.toggleEdit('${section}')`);
                button.classList.remove('save-mode');
                button.disabled = false;

                this.showToast('Profile updated successfully!', 'success');

                // Update avatar info if name changed
                this.updateAvatarInfo(data);
            } else {
                throw new Error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);

            let errorMessage = 'Failed to update profile. Please try again.';
            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;

                // Handle validation errors from server
                if (error.response.data?.errors) {
                    this.displayValidationErrors(error.response.data.errors);
                    this.resetSaveButton(button, originalButtonText);
                    return;
                }
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Please check your connection.';
            }

            this.showToast(errorMessage, 'error');
            this.resetSaveButton(button, originalButtonText);
        }
    },

    // Reset save button to original state
    resetSaveButton(button, originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    },

    // Update avatar info section
    updateAvatarInfo(data) {
        const avatarInfo = document.querySelector('.avatar-info h2');
        if (avatarInfo && (data.firstname || data.lastname)) {
            const fullName = `${data.firstname || ''} ${data.lastname || ''}`.trim();
            if (fullName) {
                avatarInfo.textContent = fullName;
            }
        }
    },

    // Validate basic information
    validateBasicInfo(data) {
        const errors = {};
        let isValid = true;

        // First name validation
        if (!data.firstname || data.firstname.length < 2) {
            errors.firstname = 'First name must be at least 2 characters long';
            isValid = false;
        } else if (!/^[a-zA-Z\s]+$/.test(data.firstname)) {
            errors.firstname = 'First name can only contain letters and spaces';
            isValid = false;
        }

        // Last name validation (optional but if provided, validate)
        if (data.lastname && data.lastname.length > 0) {
            if (data.lastname.length < 2) {
                errors.lastname = 'Last name must be at least 2 characters long';
                isValid = false;
            } else if (!/^[a-zA-Z\s]+$/.test(data.lastname)) {
                errors.lastname = 'Last name can only contain letters and spaces';
                isValid = false;
            }
        }

        // Phone validation (optional but if provided, validate)
        if (data.phone && data.phone.length > 0) {
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
            if (!phoneRegex.test(data.phone)) {
                errors.phone = 'Please enter a valid phone number';
                isValid = false;
            }
        }

        return { isValid, errors };
    },

    // Display validation errors
    displayValidationErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('.form-input').forEach(el => {
            el.classList.remove('error', 'success');
        });

        // Display new errors
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}-error`);
            const inputElement = document.getElementById(field);

            if (errorElement && inputElement) {
                errorElement.textContent = errors[field];
                inputElement.classList.add('error');
            }
        });

        this.showToast('Please fix the validation errors below', 'error');
    },

    // Setup form validation
    setupFormValidation() {
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.clearFieldError(input.id);
            });
        });
    },

    // Clear individual field error
    clearFieldError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        const inputElement = document.getElementById(fieldId);

        if (errorElement) errorElement.textContent = '';
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    },

    // Change password function
    changePassword() {
        this.showToast('Redirecting to change password...', 'info');
        setTimeout(() => {
            window.location.href = '/user/change-password';
        }, 1000);
    },

    // Resend verification email
    async resendVerification() {
        try {
            this.showToast('Sending verification email...', 'info');

            const response = await axios.post('/user/resend-verification', {}, {
                timeout: 10000
            });

            if (response.data.success) {
                this.showToast('Verification email sent successfully!', 'success');
            } else {
                throw new Error(response.data.message || 'Failed to send verification email');
            }
        } catch (error) {
            console.error('Error resending verification:', error);
            const errorMessage = error.response?.data?.message || 'Failed to send verification email';
            this.showToast(errorMessage, 'error');
        }
    },

    // Delete account (with confirmation)
    async deleteAccount() {
        const confirmed = confirm(
            'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.'
        );

        if (!confirmed) return;

        const doubleConfirm = confirm(
            'This is your final warning. Are you absolutely sure you want to delete your account? Type "DELETE" to confirm.'
        );

        if (!doubleConfirm) return;

        try {
            this.showToast('Processing account deletion...', 'warning');

            const response = await axios.delete('/user/account', {
                timeout: 15000
            });

            if (response.data.success) {
                this.showToast('Account deleted successfully. Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                throw new Error(response.data.message || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete account';
            this.showToast(errorMessage, 'error');
        }
    },

    // Search functionality
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();

        if (query) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        } else {
            this.showToast('Please enter a search term', 'warning');
        }
    },

    // Load cart count
    async loadCartCount() {
        try {
            const response = await axios.get('/user/cart/count');
            const cartCount = document.getElementById('cart-count');
            if (cartCount && response.data.count !== undefined) {
                cartCount.textContent = response.data.count;
                cartCount.style.display = response.data.count > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('Error loading cart count:', error);
        }
    },

    // Load wishlist count
    async loadWishlistCount() {
        try {
            const response = await axios.get('/user/wishlist/count');
            const wishlistCount = document.getElementById('wishlist-count');
            if (wishlistCount && response.data.count !== undefined) {
                wishlistCount.textContent = response.data.count;
                wishlistCount.style.display = response.data.count > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('Error loading wishlist count:', error);
        }
    }
};

// Global functions for onclick handlers
function performSearch() {
    Profile.performSearch();
}

function hideToast() {
    Profile.hideToast();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    Profile.init();
});

// Handle page visibility change
document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
        // Refresh counts when page becomes visible
        Profile.loadCartCount();
        Profile.loadWishlistCount();
    }
});