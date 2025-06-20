// Edit Product Form Handler JavaScript
let cropper = null;
let currentImageIndex = null;
let newImages = {}; // Store new uploaded images
let removedImages = []; // Track removed existing images
let existingImages = []; // Store existing images info

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadExistingImages();
    initializeImageUpload();
    initializeFormSubmission();
    initializeCropperModal();
    initializePriceValidation();
    initializeCategoryValidation();
    initializeFormValidation();
    populateExistingData();
});

// Load existing images from global variable
function loadExistingImages() {
    if (window.EXISTING_IMAGES && Array.isArray(window.EXISTING_IMAGES)) {
        existingImages = [...window.EXISTING_IMAGES];
    }
}

// Populate existing product data
function populateExistingData() {
    // Price validation on load
    validatePrices();
    
    // Category validation styling
    const checkedCategories = document.querySelectorAll('input[name="category"]:checked');
    const categoryContainer = document.getElementById('categoryCheckboxes');
    if (checkedCategories.length > 0 && categoryContainer) {
        categoryContainer.style.borderColor = 'transparent';
    }

    // Update image boxes with existing images
    updateImageBoxes();
}

// Update image boxes to show existing or new images
function updateImageBoxes() {
    for (let i = 0; i < 4; i++) {
        const uploadBox = document.querySelector(`[data-index="${i}"]`);
        if (!uploadBox) continue;

        // Check if this slot has a new image
        if (newImages[i]) {
            uploadBox.classList.add('has-image');
            uploadBox.innerHTML = `
                <img src="${newImages[i].dataURL}" alt="New Image ${i + 1}" class="image-preview" />
                <button type="button" class="remove-image" onclick="removeNewImage(${i})">Remove</button>
                <div class="upload-text" style="margin-top: 10px;">
                    <strong>Click to change image</strong>
                </div>
                <input type="file" accept="image/*" style="display: none;" data-index="${i}" />
            `;
        }
        // Check if this slot has an existing image (and wasn't removed)
        else if (existingImages[i] && !removedImages.includes(i)) {
            uploadBox.classList.add('has-image');
            uploadBox.innerHTML = `
                <img src="${existingImages[i].url}" alt="Existing Image ${i + 1}" class="image-preview" />
                <button type="button" class="remove-image" onclick="removeExistingImage(${i})">Remove</button>
                <div class="upload-text" style="margin-top: 10px;">
                    <strong>Click to change image</strong>
                </div>
                <input type="file" accept="image/*" style="display: none;" data-index="${i}" />
            `;
        }
        // Empty slot
        else {
            uploadBox.classList.remove('has-image');
            uploadBox.innerHTML = `
                <div class="upload-icon">📷</div>
                <div class="upload-text">
                    <strong>Image ${i + 1}</strong><br />
                    Click to upload
                </div>
                <input type="file" accept="image/*" style="display: none;" data-index="${i}" />
            `;
        }

        // Re-initialize event listeners for this box
        initializeBoxEvents(uploadBox, i);
    }
}

// Initialize events for a specific image box
function initializeBoxEvents(uploadBox, index) {
    const input = uploadBox.querySelector('input[type="file"]');
    
    // Click event for the box
    uploadBox.removeEventListener('click', uploadBox._clickHandler);
    uploadBox._clickHandler = (e) => {
        // Don't trigger if clicking on remove button
        if (e.target.classList.contains('remove-image')) {
            return;
        }
        input.click();
    };
    uploadBox.addEventListener('click', uploadBox._clickHandler);

    // File change event
    input.removeEventListener('change', input._changeHandler);
    input._changeHandler = (e) => {
        if (e.target.files && e.target.files[0]) {
            currentImageIndex = index;
            openCropper(e.target.files[0]);
        }
    };
    input.addEventListener('change', input._changeHandler);
}

// Initialize image upload functionality
function initializeImageUpload() {
    const uploadBoxes = document.querySelectorAll('.image-upload-box');
    uploadBoxes.forEach((box, index) => {
        initializeBoxEvents(box, index);
    });
}

// Open image cropper modal
function openCropper(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const cropperImage = document.getElementById('cropperImage');
        cropperImage.src = e.target.result;

        document.getElementById('cropperModal').style.display = 'block';

        // Initialize cropper
        if (cropper) {
            cropper.destroy();
        }

        cropper = new Cropper(cropperImage, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.8,
            restore: false,
            guides: false,
            center: false,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
        });
    };
    reader.readAsDataURL(file);
}

// Initialize cropper modal functionality
function initializeCropperModal() {
    const modal = document.getElementById('cropperModal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelCrop');
    const applyBtn = document.getElementById('applyCrop');

    closeBtn.addEventListener('click', closeCropper);
    cancelBtn.addEventListener('click', closeCropper);
    applyBtn.addEventListener('click', applyCrop);

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCropper();
        }
    });
}

// Close cropper modal
function closeCropper() {
    document.getElementById('cropperModal').style.display = 'none';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    currentImageIndex = null;
}

// Apply crop and save image
function applyCrop() {
    if (cropper && currentImageIndex !== null) {
        const canvas = cropper.getCroppedCanvas({
            width: 400,
            height: 400,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });

        canvas.toBlob(function(blob) {
            const dataURL = canvas.toDataURL('image/jpeg', 0.9);
            
            // Store the new image
            newImages[currentImageIndex] = {
                blob: blob,
                dataURL: dataURL
            };

            // If this slot had an existing image, mark it for removal
            if (existingImages[currentImageIndex] && !removedImages.includes(currentImageIndex)) {
                removedImages.push(currentImageIndex);
            }

            updateImageBoxes();
            closeCropper();
        }, 'image/jpeg', 0.9);
    }
}

// Remove existing image
function removeExistingImage(index) {
    // Add to removed images if not already there
    if (!removedImages.includes(index)) {
        removedImages.push(index);
    }
    
    // Remove any new image for this slot
    delete newImages[index];
    
    updateImageBoxes();
}

// Remove new image
function removeNewImage(index) {
    // Remove the new image
    delete newImages[index];
    
    // Remove from removed images list if it was there (in case of replacement)
    const removedIndex = removedImages.indexOf(index);
    if (removedIndex > -1) {
        removedImages.splice(removedIndex, 1);
    }
    
    updateImageBoxes();
}

// Initialize price validation
function initializePriceValidation() {
    const priceInput = document.getElementById('price');
    const salePriceInput = document.getElementById('salePrice');

    priceInput.addEventListener('input', validatePrices);
    salePriceInput.addEventListener('input', validatePrices);
}

// Validate prices
function validatePrices() {
    const price = parseFloat(document.getElementById('price').value) || 0;
    const salePrice = parseFloat(document.getElementById('salePrice').value) || 0;
    const priceInfo = document.getElementById('priceInfo');

    if (price > 0 && salePrice > 0) {
        if (salePrice >= price) {
            priceInfo.innerHTML = '<div class="alert alert-error">Sale price must be less than regular price</div>';
            priceInfo.style.display = 'block';
            return false;
        } else {
            const discount = ((price - salePrice) / price * 100).toFixed(1);
            priceInfo.innerHTML = `<div class="alert alert-success">Discount: ${discount}% off</div>`;
            priceInfo.style.display = 'block';
            return true;
        }
    } else {
        priceInfo.style.display = 'none';
        return true;
    }
}

// Initialize category validation
function initializeCategoryValidation() {
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', validateCategories);
    });
}

// Validate categories
function validateCategories() {
    const checkedCategories = document.querySelectorAll('input[name="category"]:checked');
    const categoryContainer = document.getElementById('categoryCheckboxes');

    if (checkedCategories.length === 0) {
        categoryContainer.style.borderColor = '#e74c3c';
        return false;
    } else {
        categoryContainer.style.borderColor = '#e1e8ed';
        return true;
    }
}

// Initialize form validation
function initializeFormValidation() {
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', validateField);
    });
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    
    if (field.value.trim() === '') {
        field.style.borderColor = '#e74c3c';
        return false;
    } else {
        field.style.borderColor = '#e1e8ed';
        return true;
    }
}

// Validate entire form
function validateForm() {
    let isValid = true;
    const errors = [];

    // Check required fields
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    requiredFields.forEach(field => {
        if (field.value.trim() === '') {
            field.style.borderColor = '#e74c3c';
            isValid = false;
            errors.push(`${field.previousElementSibling.textContent.replace('*', '').trim()} is required`);
        }
    });

    // Check categories
    if (!validateCategories()) {
        isValid = false;
        errors.push('At least one category must be selected');
    }

    // Check prices
    if (!validatePrices()) {
        isValid = false;
        errors.push('Sale price must be less than regular price');
    }

    // Check SKU format
    const sku = document.getElementById('sku').value.trim();
    if (sku && !/^[A-Z0-9-]+$/i.test(sku)) {
        document.getElementById('sku').style.borderColor = '#e74c3c';
        isValid = false;
        errors.push('SKU should contain only letters, numbers, and hyphens');
    }

    if (!isValid) {
        showAlert('Please fix the following errors:\n• ' + errors.join('\n• '), 'error');
    }

    return isValid;
}

// Initialize form submission
function initializeFormSubmission() {
    const form = document.getElementById('productForm');
    form.addEventListener('submit', handleFormSubmission);
}

// Handle form submission
async function handleFormSubmission(e) {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating Product...';

    try {
        const formData = new FormData();

        // Add form fields
        const formElements = e.target.elements;
        for (let element of formElements) {
            if (element.type === 'checkbox' && element.name === 'category') {
                if (element.checked) {
                    formData.append('category[]', element.value);
                }
            } else if (element.type !== 'file' && element.type !== 'submit' && element.name && element.type !== 'checkbox') {
                if (element.value.trim()) {
                    formData.append(element.name, element.value.trim());
                }
            }
        }

        // Add new images
        Object.keys(newImages).forEach(index => {
            formData.append('newImages', newImages[index].blob, `image_${index}.jpg`);
            formData.append('imagePositions[]', index);
        });

        // Add removed images indices
        if (removedImages.length > 0) {
            removedImages.forEach(index => {
                formData.append('removedImages[]', index);
            });
        }

        // Add existing images info (for backend reference)
        formData.append('existingImagesCount', existingImages.length);

        // Get product ID from global variable
        const productId = window.PRODUCT_ID;
        
        const response = await axios.patch(`/admin/products/edit/${productId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            showAlert(response.data.message || 'Product updated successfully!', 'success');
            
            // Redirect after showing success message
            setTimeout(() => {
                window.location.href = response.data.redirect || '/admin/products';
            }, 1500);
        } else {
            showAlert(response.data.message || 'Error updating product', 'error');
        }

    } catch (error) {
        console.error('Error updating product:', error);
        let errorMessage = 'Error updating product. Please try again.';
        
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 400) {
            errorMessage = 'Invalid product data. Please check all fields.';
        } else if (error.response?.status === 413) {
            errorMessage = 'File size too large. Please use smaller images.';
        } else if (error.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
        }

        showAlert(errorMessage, 'error');
    } finally {
        // Reset button state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Show alert messages
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.toast');
    existingAlerts.forEach(alert => alert.remove());

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Hide toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);

    // Also show in alert container if it exists
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
    }
}

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to validate image file
function validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
        showAlert('Please select a valid image file (JPEG, PNG, or WebP)', 'error');
        return false;
    }

    if (file.size > maxSize) {
        showAlert(`File size too large. Maximum size allowed is ${formatFileSize(maxSize)}`, 'error');
        return false;
    }

    return true;
}