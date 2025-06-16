// Global variables
let currentPage = 1;
let totalPages = 1;
let products = products;
let filteredProducts = [];
let filters = {
    search: '',
    sort: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: ''
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    updateCartCount();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filters.search = this.value;
            currentPage = 1;
            applyFilters();
        }, 300);
    });

    // Enter key for search
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Load products from API
async function loadProducts() {
    try {
        showLoading();
        
        // Construct query parameters
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.category) params.append('category', filters.category);
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        params.append('page', currentPage);
        params.append('limit', 9);

        const response = await fetch(`/user/products/filter?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
            products = data.products || [];
            totalPages = data.totalPages || 1;
            currentPage = data.currentPage || 1;
            
            renderProducts();
            renderPagination();
            updateResultsCount(data.totalProducts || 0);
        } else {
            showToaster(data.message || 'Failed to load products', 'error');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showToaster('Failed to load products. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Render products grid
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 48px; color: #bdc3c7; margin-bottom: 16px;"></i>
                <h3 style="color: #7f8c8d; margin-bottom: 8px;">No products found</h3>
                <p style="color: #95a5a6;">Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card" onclick="viewProduct('${product._id}')">
            <div class="product-image">
                <img src="${product.productImage?.[0] || '/images/placeholder-watch.jpg'}" 
                     alt="${product.productName || 'Product'}"
                     onerror="this.src='/images/placeholder-watch.jpg'">
                ${product.isNew ? '<div class="product-badge new">New</div>' : ''}
                ${product.discount > 0 ? '<div class="product-badge sale">Sale</div>' : ''}
                <button class="wishlist-btn-card" onclick="event.stopPropagation(); toggleWishlistItem('${product._id}')">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand || 'Unknown Brand'}</div>
                <h3 class="product-name">${product.productName || 'Unnamed Product'}</h3>
                <p class="product-description">${truncateText(product.description || 'No description available', 80)}</p>
                
                <div class="product-rating">
                    <div class="stars">
                        ${renderStars(product.rating || 0)}
                    </div>
                    <span class="rating-text">(${product.reviewCount || 0} reviews)</span>
                </div>
                
                <div class="product-price">
                    <span class="current-price">₹${formatPrice(product.salePrice || product.regularPrice || 0)}</span>
                    ${product.regularPrice && product.salePrice && product.regularPrice > product.salePrice ? 
                        `<span class="original-price">₹${formatPrice(product.regularPrice)}</span>
                         <span class="discount">${Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}% OFF</span>` 
                        : ''}
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart('${product._id}')">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); viewProduct('${product._id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Previous
        </button>
    `;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += `<button onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span>...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="goToPage(${i})" ${i === currentPage ? 'class="active"' : ''}>
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span>...</span>`;
        }
        paginationHTML += `<button onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    paginationHTML += `
        <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// Filter functions
function applySortFilter() {
    filters.sort = document.getElementById('sortFilter').value;
    currentPage = 1;
    loadProducts();
}

function applyCategoryFilter() {
    filters.category = document.getElementById('categoryFilter').value;
    currentPage = 1;
    loadProducts();
}

function applyBrandFilter() {
    filters.brand = document.getElementById('brandFilter').value;
    currentPage = 1;
    loadProducts();
}

function applyPriceFilter() {
    filters.minPrice = document.getElementById('minPrice').value;
    filters.maxPrice = document.getElementById('maxPrice').value;
    currentPage = 1;
    loadProducts();
}

function clearAllFilters() {
    // Reset all filter values
    filters = {
        search: '',
        sort: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: ''
    };
    
    // Reset form elements
    document.getElementById('searchInput').value = '';
    document.getElementById('sortFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    
    currentPage = 1;
    loadProducts();
}

// Navigation functions
function performSearch() {
    filters.search = document.getElementById('searchInput').value;
    currentPage = 1;
    loadProducts();
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        loadProducts();
        scrollToTop();
    }
}

function viewProduct(productId) {
    window.location.href = `/user/product/${productId}`;
}

// Cart functions
async function addToCart(productId) {
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToaster('Product added to cart successfully!', 'success');
            updateCartCount();
        } else {
            showToaster(data.message || 'Failed to add product to cart', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToaster('Failed to add product to cart', 'error');
    }
}

async function updateCartCount() {
    try {
        const response = await fetch('/api/cart/count');
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('cart-count').textContent = data.count || 0;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Wishlist functions
async function toggleWishlistItem(productId) {
    try {
        const response = await fetch('/api/wishlist/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId })
        });

        const data = await response.json();

        if (response.ok) {
            showToaster(data.message || 'Wishlist updated!', 'success');
            updateWishlistCount();
        } else {
            showToaster(data.message || 'Failed to update wishlist', 'error');
        }
    } catch (error) {
        console.error('Error updating wishlist:', error);
        showToaster('Failed to update wishlist', 'error');
    }
}

async function updateWishlistCount() {
    try {
        const response = await fetch('/api/wishlist/count');
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('wishlist-count').textContent = data.count || 0;
        }
    } catch (error) {
        console.error('Error updating wishlist count:', error);
    }
}

// Navigation menu functions
function toggleWishlist() {
    window.location.href = '/user/wishlist';
}

function toggleCart() {
    window.location.href = '/user/cart';
}

function toggleProfile() {
    // You can implement a dropdown menu here or redirect to profile page
    window.location.href = '/user/profile';
}

// Utility functions
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('productsGrid').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('productsGrid').style.display = 'grid';
}

function updateResultsCount(count) {
    const resultsElement = document.getElementById('resultsCount');
    if (count === 0) {
        resultsElement.textContent = 'No products found';
    } else if (count === 1) {
        resultsElement.textContent = '1 product found';
    } else {
        resultsElement.textContent = `${count} products found`;
    }
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-IN').format(price);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Toaster functionality
function showToaster(message, type = 'error') {
    const container = document.getElementById('toaster-container');
    const toaster = document.createElement('div');
    toaster.className = `toaster ${type}`;
    
    toaster.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas ${getToasterIcon(type)}" style="color: ${getToasterColor(type)};"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: #7f8c8d; cursor: pointer; font-size: 18px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(toaster);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toaster.parentElement) {
            toaster.remove();
        }
    }, 5000);
}

function getToasterIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-exclamation-circle';
    }
}

function getToasterColor(type) {
    switch (type) {
        case 'success': return '#27ae60';
        case 'warning': return '#f39c12';
        case 'info': return '#3498db';
        default: return '#e74c3c';
    }
}

// Handle server-sent error messages
function handleServerError(errorMessage) {
    if (errorMessage) {
        showToaster(errorMessage, 'error');
    }
}

// Check for error messages from server (if passed via URL params or global variable)
document.addEventListener('DOMContentLoaded', function() {
    // Check if there's an error message from the server
    const urlParams = new URLSearchParams(window.location.search);
    const errorMessage = urlParams.get('error');
    if (errorMessage) {
        showToaster(decodeURIComponent(errorMessage), 'error');
    }
    
    // Check for success message
    const successMessage = urlParams.get('success');
    if (successMessage) {
        showToaster(decodeURIComponent(successMessage), 'success');
    }
    
    // Check for global error variable (if set by server)
    if (typeof window.errorMessage !== 'undefined' && window.errorMessage) {
        showToaster(window.errorMessage, 'error');
    }
    
    // Check for global success variable (if set by server)
    if (typeof window.successMessage !== 'undefined' && window.successMessage) {
        showToaster(window.successMessage, 'success');
    }
});

// Additional utility functions for future enhancements
function applyFilters() {
    currentPage = 1;
    loadProducts();
}

function resetFilters() {
    clearAllFilters();
}

// Export functions for potential use in other scripts
window.ecommerceUtils = {
    showToaster,
    addToCart,
    toggleWishlistItem,
    viewProduct,
    updateCartCount,
    updateWishlistCount
};