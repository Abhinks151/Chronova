// Edit Product Form Handler JavaScript
let cropper = null;
let currentImageIndex = null;
let croppedImages = {};
let hasNewImages = false;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeImageUpload();
    initializeFormSubmission();
    initializeCropperModal();
    initializePriceValidation();
    initializeCategoryValidation();
    initializeFormValidation();
    populateExistingData();
});

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
}

// Initialize image upload functionality
function initializeImageUpload() {
    const uploadBoxes = document.querySelectorAll('.image-upload-box');

    uploadBoxes.forEach(box => {
        const input = box.querySelector('input[type="file"]');
        const index = box.dataset.index;

        box.addEventListener('click', () => {
            if (!box.classList.contains('has-image')) {
                input.click();
            }
        });

        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                currentImageIndex = index;
                openCropper(e.target.files[0]);
            }
        });
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
            croppedImages[currentImageIndex] = blob;
            hasNewImages = true;
            updateImagePreview(currentImageIndex, canvas.toDataURL());
            closeCropper();
        }, 'image/jpeg', 0.9);
    }
}

// Update image preview after cropping
function updateImagePreview(index, dataURL) {
    const uploadBox = document.querySelector(`[data-index="${index}"]`);
    uploadBox.classList.add('has-image');
    uploadBox.innerHTML = `
        <img src="${dataURL}" alt="Preview" class="image-preview">
        <button type="button" class="remove-image" onclick="removeImage(${index})">Remove</button>
    `;
}

// Remove uploaded image
function removeImage(index) {
    const uploadBox = document.querySelector(`[data-index="${index}"]`);
    uploadBox.classList.remove('has-image');

    const imageLabels = ['New Image 1', 'New Image 2', 'New Image 3', 'New Image 4'];
    uploadBox.innerHTML = `
        <div class="upload-icon">📷</div>
        <div class="upload-text">
            <strong>${imageLabels[index]}</strong><br>
            Click to upload
        </div>
        <input type="file" accept="image/*" style="display: none;" data-index="${index}">
    `;

    delete croppedImages[index];

    // Check if we still have new images
    hasNewImages = Object.keys(croppedImages).length > 0;

    // Re-initialize event listener for this box
    const input = uploadBox.querySelector('input[type="file"]');
    uploadBox.addEventListener('click', () => {
        if (!uploadBox.classList.contains('has-image')) {
            input.click();
        }
    });

    input.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            currentImageIndex = index;
            openCropper(e.target.files[0]);
        }
    });
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

        // Add cropped images only if new images are uploaded
        if (hasNewImages) {
            Object.keys(croppedImages).forEach(index => {
                formData.append(`images`, croppedImages[index], `image_${index}.jpg`);
            });
        }

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
            errorMessage = 'Invalid data provided. Please check your inputs.';
        } else if (error.response?.status === 404) {
            errorMessage = 'Product not found.';
        } else if (error.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
        }
        
        showAlert(errorMessage, 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Form validation
function validateForm() {
    let isValid = true;
    const errors = [];

    // Check required fields
    const requiredFields = [
        { id: 'productName', name: 'Product Name' },
        { id: 'brand', name: 'Brand' },
        { id: 'productType', name: 'Product Type' },
        { id: 'sku', name: 'SKU' },
        { id: 'description', name: 'Description' },
        { id: 'strapType', name: 'Strap Type' },
        { id: 'color', name: 'Color' },
        { id: 'dialSize', name: 'Dial Size' },
        { id: 'dialShape', name: 'Dial Shape' },
        { id: 'movement', name: 'Movement' },
        { id: 'waterResistance', name: 'Water Resistance' },
        { id: 'warranty', name: 'Warranty' },
        { id: 'weight', name: 'Weight' },
        { id: 'price', name: 'Regular Price' },
        { id: 'salePrice', name: 'Sale Price' },
        { id: 'stockQuantity', name: 'Stock Quantity' }
    ];

    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element || !element.value.trim()) {
            if (element) {
                element.style.borderColor = '#e74c3c';
            }
            errors.push(`${field.name} is required`);
            isValid = false;
        } else {
            element.style.borderColor = '#e1e8ed';
        }
    });

    // Check if at least one category is selected
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
    const categoryContainer = document.getElementById('categoryCheckboxes');
    
    if (categoryCheckboxes.length === 0) {
        if (categoryContainer) {
            categoryContainer.style.borderColor = '#e74c3c';
        }
        errors.push('Please select at least one category');
        isValid = false;
    } else {
        if (categoryContainer) {
            categoryContainer.style.borderColor = 'transparent';
        }
    }

    // Price validation
    const priceElement = document.getElementById('price');
    const salePriceElement = document.getElementById('salePrice');
    
    if (priceElement && salePriceElement) {
        const price = parseFloat(priceElement.value) || 0;
        const salePrice = parseFloat(salePriceElement.value) || 0;

        if (price <= 0) {
            priceElement.style.borderColor = '#e74c3c';
            errors.push('Regular price must be greater than 0');
            isValid = false;
        }

        if (salePrice <= 0) {
            salePriceElement.style.borderColor = '#e74c3c';
            errors.push('Sale price must be greater than 0');
            isValid = false;
        }

        if (salePrice > price) {
            salePriceElement.style.borderColor = '#e74c3c';
            errors.push('Sale price cannot be greater than regular price');
            isValid = false;
        }
    }

    // Stock validation
    const stockElement = document.getElementById('stockQuantity');
    if (stockElement) {
        const stock = parseInt(stockElement.value) || 0;
        if (stock < 0) {
            stockElement.style.borderColor = '#e74c3c';
            errors.push('Stock quantity cannot be negative');
            isValid = false;
        }
    }

    // Dial size validation
    const dialSizeElement = document.getElementById('dialSize');
    if (dialSizeElement) {
        const dialSize = parseInt(dialSizeElement.value) || 0;
        if (dialSize < 20 || dialSize > 60) {
            dialSizeElement.style.borderColor = '#e74c3c';
            errors.push('Dial size must be between 20mm and 60mm');
            isValid = false;
        }
    }

    // Weight validation
    const weightElement = document.getElementById('weight');
    if (weightElement) {
        const weight = parseInt(weightElement.value) || 0;
        if (weight < 10 || weight > 1000) {
            weightElement.style.borderColor = '#e74c3c';
            errors.push('Weight must be between 10g and 1000g');
            isValid = false;
        }
    }

    if (!isValid) {
        showAlert(errors.join('<br>'), 'error');
        // Scroll to first error
        const firstErrorElement = document.querySelector('input[style*="border-color: rgb(231, 76, 60)"], select[style*="border-color: rgb(231, 76, 60)"], textarea[style*="border-color: rgb(231, 76, 60)"]');
        if (firstErrorElement) {
            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorElement.focus();
        }
    }

    return isValid;
}

// Initialize form validation (real-time)
function initializeFormValidation() {
    const form = document.getElementById('productForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') || this.value.trim()) {
                validateField(this);
            }
        });
        
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(231, 76, 60)') {
                validateField(this);
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    let isValid = true;
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        isValid = false;
    } else {
        field.style.borderColor = '#e1e8ed';
    }
    
    // Specific validations
    if (field.id === 'price' || field.id === 'salePrice') {
        const value = parseFloat(field.value) || 0;
        if (value <= 0) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
        }
    }
    
    if (field.id === 'stockQuantity') {
        const value = parseInt(field.value) || 0;
        if (value < 0) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
        }
    }
    
    return isValid;
}

// Show alert messages
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    
    // Clear existing alerts
    alertContainer.innerHTML = '';
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button type="button" class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    alertContainer.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
    
    // Scroll to top to show alert
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize price validation
function initializePriceValidation() {
    const priceInput = document.getElementById('price');
    const salePriceInput = document.getElementById('salePrice');
    const priceInfo = document.getElementById('priceInfo');

    if (!priceInput || !salePriceInput || !priceInfo) return;

    function validatePrices() {
        const price = parseFloat(priceInput.value) || 0;
        const salePrice = parseFloat(salePriceInput.value) || 0;

        if (price > 0 && salePrice > 0) {
            if (salePrice > price) {
                priceInfo.style.display = 'block';
                priceInfo.style.backgroundColor = '#f8d7da';
                priceInfo.style.color = '#721c24';
                priceInfo.style.border = '1px solid #f5c6cb';
                priceInfo.style.padding = '10px';
                priceInfo.style.borderRadius = '4px';
                priceInfo.style.marginTop = '10px';
                priceInfo.textContent = 'Sale price cannot be greater than regular price';
                salePriceInput.style.borderColor = '#e74c3c';
            } else {
                const discount = ((price - salePrice) / price * 100).toFixed(1);
                const savings = (price - salePrice).toFixed(2);
                priceInfo.style.display = 'block';
                priceInfo.style.backgroundColor = '#e8f4fd';
                priceInfo.style.color = '#0c5460';
                priceInfo.style.border = '1px solid #bee5eb';
                priceInfo.style.padding = '10px';
                priceInfo.style.borderRadius = '4px';
                priceInfo.style.marginTop = '10px';
                priceInfo.innerHTML = `<strong>Discount:</strong> ${discount}% off (₹${savings} savings)`;
                salePriceInput.style.borderColor = '#e1e8ed';
            }
        } else {
            priceInfo.style.display = 'none';
            salePriceInput.style.borderColor = '#e1e8ed';
        }
    }

    priceInput.addEventListener('input', validatePrices);
    salePriceInput.addEventListener('input', validatePrices);
    
    // Initial validation
    validatePrices();
}

// Initialize category validation
function initializeCategoryValidation() {
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    const categoryContainer = document.getElementById('categoryCheckboxes');

    if (!categoryContainer) return;

    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkedCategories = document.querySelectorAll('input[name="category"]:checked');

            if (checkedCategories.length === 0) {
                categoryContainer.style.borderColor = '#e74c3c';
            } else {
                categoryContainer.style.borderColor = 'transparent';
            }
        });
    });
}

// Global functions for inline event handlers
window.removeImage = removeImage;