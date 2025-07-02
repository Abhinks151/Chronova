const Profile = {
    // Initialize the profile page
    init() {
        this.bindEvents();
        this.loadCartCount();
        this.loadWishlistCount();
        this.showWelcomeToast();
        this.initializeAvatarUpload();
    },

    // Initialize avatar upload functionality
    initializeAvatarUpload() {
        const avatarInput = document.getElementById('avatarInput');
        if (avatarInput) {
            avatarInput.addEventListener('change', this.handleAvatarSelect.bind(this));
        }

        // Close modal on outside click
        const modal = document.getElementById('avatarModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAvatarModal();
                }
            });
        }
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

    // Avatar Modal Functions
    openAvatarModal() {
        const modal = document.getElementById('avatarModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },

    closeAvatarModal() {
        const modal = document.getElementById('avatarModal');
        const cropSection = document.getElementById('cropSection');
        const avatarInput = document.getElementById('avatarInput');
        const saveBtn = document.getElementById('saveAvatarBtn');

        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }

        // Reset modal state
        if (cropSection) {
            cropSection.style.display = 'none';
        }
        if (avatarInput) {
            avatarInput.value = '';
        }
        if (saveBtn) {
            saveBtn.disabled = true;
        }

        // Destroy cropper if exists
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
    },

    // Handle avatar file selection
    handleAvatarSelect(event) {
        const file = event.target.files[0];
        
        if (!file) return;

        // Validate file type
        if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
            this.showToast('Please select a valid image file (JPG, PNG, or GIF)', 'error');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Image size must be less than 5MB', 'error');
            return;
        }

        // Read and display file for cropping
        const reader = new FileReader();
        reader.onload = (e) => {
            this.initializeCropper(e.target.result);
        };
        reader.readAsDataURL(file);
    },

    // Initialize cropper
    initializeCropper(imageSrc) {
        const cropImage = document.getElementById('cropImage');
        const cropSection = document.getElementById('cropSection');
        const saveBtn = document.getElementById('saveAvatarBtn');

        if (!cropImage || !cropSection) return;

        // Show crop section
        cropSection.style.display = 'block';
        saveBtn.disabled = false;

        // Set image source
        cropImage.src = imageSrc;

        // Destroy existing cropper
        if (this.cropper) {
            this.cropper.destroy();
        }

        // Initialize new cropper
        this.cropper = new Cropper(cropImage, {
            aspectRatio: 1,
            viewMode: 2,
            dragMode: 'move',
            autoCropArea: 0.8,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            ready: () => {
                // Cropper is ready
                this.showToast('Drag to position and resize the crop area', 'info');
            }
        });
    },

    // Rotate crop
    rotateCrop(degrees) {
        if (this.cropper) {
            this.cropper.rotate(degrees);
        }
    },

    // Reset crop
    resetCrop() {
        if (this.cropper) {
            this.cropper.reset();
        }
    },

    // Save avatar
    async saveAvatar() {
        if (!this.cropper) {
            this.showToast('No image selected', 'error');
            return;
        }

        const saveBtn = document.getElementById('saveAvatarBtn');
        const originalText = saveBtn.innerHTML;

        try {
            // Show loading state
            saveBtn.innerHTML = '<div class="loading"></div> Saving...';
            saveBtn.disabled = true;

            // Get cropped canvas
            const canvas = this.cropper.getCroppedCanvas({
                width: 400,
                height: 400,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            // Convert to blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.8);
            });

            // Create form data
            const formData = new FormData();
            formData.append('avatar', blob, 'avatar.jpg');

            // Upload avatar
            const response = await axios.post('/user/profile/change/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000
            });

            if (response.data && response.data.success) {
                // Update avatar in UI
                this.updateAvatarDisplay(response.data.avatarUrl);
                this.showToast('Avatar updated successfully!', 'success');
                this.closeAvatarModal();
                window.location.reload();
            } else {
                throw new Error(response.data?.message || 'Failed to update avatar');
            }

        } catch (error) {
            console.error('Error updating avatar:', error);
            
            let errorMessage = 'Failed to update avatar. Please try again.';
            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Upload timeout. Please check your connection and try again.';
            }

            this.showToast(errorMessage, 'error');
        } finally {
            // Reset button state
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    },

    // Update avatar display in UI
    updateAvatarDisplay(avatarUrl) {
        const profileAvatar = document.getElementById('profileAvatarImg');
        
        if (profileAvatar) {
            if (profileAvatar.tagName === 'IMG') {
                // Update existing image
                profileAvatar.src = avatarUrl;
            } else {
                // Replace default avatar div with image
                const newImg = document.createElement('img');
                newImg.src = avatarUrl;
                newImg.alt = 'Profile Avatar';
                newImg.className = 'profile-avatar';
                newImg.id = 'profileAvatarImg';
                
                profileAvatar.parentNode.replaceChild(newImg, profileAvatar);
            }
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
                if (input.id !== 'email' && input.id !== 'accountType') { // Don't allow email editing
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
            const response = await axios.patch('/user/profile/update', data, {
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

    async sentEmailChangeLink(){
        try {
            const response = await axios.get('/user/send-reset-link')
            if(response.data && response.data.success){
                this.showToast('Reset link sent to registered email', 'success');
            }else{
                this.showToast('Something went wrong', 'error');
            }
        } catch (error) {
            console.log(error);
            this.showToast('Failed to reset password', 'error');
        }
    },

    // Search functionality
    // Search functionality (completing the cut-off part)
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        if (query) {
            // Redirect to search page or perform search
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
    },

    // Load cart count
    loadCartCount() {
        // This would typically fetch from an API
        // For now, just a placeholder
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            // You can implement actual cart count fetching here
            cartCountElement.textContent = '0';
        }
    },

    // Load wishlist count
    loadWishlistCount() {
        // This would typically fetch from an API
        // For now, just a placeholder
        const wishlistCountElement = document.getElementById('wishlistCount');
        if (wishlistCountElement) {
            // You can implement actual wishlist count fetching here
            wishlistCountElement.textContent = '0';
        }
    },

    // Resend verification email
    async resendVerification() {
        try {
            const response = await axios.post('/user/resend-verification');
            if (response.data && response.data.success) {
                this.showToast('Verification email sent successfully!', 'success');
            } else {
                this.showToast('Failed to send verification email', 'error');
            }
        } catch (error) {
            console.error('Error resending verification:', error);
            this.showToast('Failed to send verification email', 'error');
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Profile.init();
});