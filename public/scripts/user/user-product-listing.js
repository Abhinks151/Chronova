// Product Listing JavaScript
let currentPage = 1;
let totalPages = 1;
let totalProducts = 0;
let products = [];
let itemsPerPage = 9; // 3x3 grid
let filters = {
    search: '',
    sort: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: ''
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    // Get initial products from server
    products = window.initialProducts || [];

    // Initial load
    loadProducts();
    setupEventListeners();
    updateCartCount();
    updateWishlistCount();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality with Enter key
    const searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Real-time search (optional - uncomment if you want live search)
    // searchInput.addEventListener('input', debounce(performSearch, 500));
}

// Debounce function for search optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
        params.append('limit', itemsPerPage);

        const response = await fetch(`/user/products/filter?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
            products = data.products || [];
            totalPages = data.totalPages || 1;
            currentPage = data.currentPage || 1;
            totalProducts = data.totalProducts || 0;

            renderProducts();
            renderPagination();
            updateResultsCount();
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
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card" onclick="viewProduct('${product._id}')">
            <div class="product-image">
                <img src="${product.images && product.images[0] ? product.images[0].url : '/images/placeholder-watch.jpg'}" 
                     alt="${product.productName}" 
                     onerror="this.src='/images/placeholder-watch.jpg'">
                ${product.isNew ? '<span class="product-badge new">New</span>' : ''}
                ${product.salePrice < product.regularPrice ? '<span class="product-badge sale">Sale</span>' : ''}
                <button class="wishlist-btn-card" 
                    onclick="event.stopPropagation(); toggleWishlist('${product._id}')" 
                    title="Add to Wishlist">
                    <i class="${wishedProductIds.includes(product._id) ? 'fas fa-heart heart-icon filled' : 'far fa-heart heart-icon'}"></i>
                </button>

            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand || 'Premium'}</div>
                <h3 class="product-name">${product.productName}</h3>
                <p class="product-description">${truncateText(product.description || '', 60)}</p>
                
                <div class="product-rating">
                    <div class="stars">
                        ${generateStars(product.averageRating || 0)}
                    </div>
                    <span class="rating-text">(${product.reviewCount || 0} reviews)</span>
                </div>
                
                <div class="product-price">
                    <span class="current-price">₹${formatPrice(product.salePrice || product.regularPrice)}</span>
                    ${product.salePrice && product.salePrice < product.regularPrice ?
            `<span class="original-price">₹${formatPrice(product.regularPrice)}</span>
                         <span class="discount">${Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}% off</span>`
            : ''
        }
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

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    // Half star
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

// Format price with commas
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN').format(price);
}

// Truncate text to specified length
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Render pagination
function renderPagination() {
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Update navigation buttons
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    // Generate page numbers
    let paginationHTML = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
        paginationHTML += `<span class="page-number ${currentPage === 1 ? 'active' : ''}" onclick="goToPage(1)">1</span>`;
        if (startPage > 2) {
            paginationHTML += '<span class="page-ellipsis">...</span>';
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<span class="page-number ${currentPage === i ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>`;
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span class="page-ellipsis">...</span>';
        }
        paginationHTML += `<span class="page-number ${currentPage === totalPages ? 'active' : ''}" onclick="goToPage(${totalPages})">${totalPages}</span>`;
    }

    pageNumbers.innerHTML = paginationHTML;

    // Update page info
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalProducts);
    document.getElementById('page-info').textContent = `Showing ${startItem} - ${endItem} of ${totalProducts} products`;
}

// Go to specific page
function goToPage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        loadProducts();
        // Scroll to top of products section
        document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Update results count
function updateResultsCount() {
    const resultsElement = document.getElementById('resultsCount');
    if (totalProducts === 0) {
        resultsElement.textContent = 'No products found';
    } else if (totalProducts === 1) {
        resultsElement.textContent = '1 product found';
    } else {
        resultsElement.textContent = `${totalProducts} products found`;
    }
}

// Search functionality
function performSearch() {
    const searchValue = document.getElementById('searchInput').value.trim();
    filters.search = searchValue;
    currentPage = 1;
    loadProducts();
}

// Filter functions
function applySortFilter() {
    const sortValue = document.getElementById('sortFilter').value;
    filters.sort = sortValue;
    currentPage = 1;
    loadProducts();
}

function applyCategoryFilter() {
    const categoryValue = document.getElementById('categoryFilter').value;
    filters.category = categoryValue;
    currentPage = 1;
    loadProducts();
}

function applyBrandFilter() {
    const brandValue = document.getElementById('brandFilter').value;
    filters.brand = brandValue;
    currentPage = 1;
    loadProducts();
}

function applyPriceFilter() {
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;

    // Validate price range
    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
        showToaster('Minimum price cannot be greater than maximum price', 'error');
        return;
    }

    filters.minPrice = minPrice;
    filters.maxPrice = maxPrice;
    currentPage = 1;
    loadProducts();
}

// Clear all filters
function clearAllFilters() {
    // Reset filter object
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

    // Reset page and reload
    currentPage = 1;
    loadProducts();
}

// Product actions
async function addToCart(productId) {
    try {
        const response = await fetch('/user/cart/add', {
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
        showToaster('Failed to add product to cart. Please try again.', 'error');
    }
}

async function toggleWishlist(productId) {
    try {
        const response = await fetch('/user/profile/wishlist/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId
            })
        });

        const data = await response.json();

        if (response.ok) {
            const action = data.action || 'updated';
            const message = action === 'added' ? 'Product added to wishlist!' : 'Product removed from wishlist!';
            showToaster(message, 'success');
            updateWishlistCount();

            // Update heart icon
            const heartIcon = document.querySelector(`[onclick*="${productId}"] i`);
            if (heartIcon) {
                heartIcon.classList.toggle('filled');
                heartIcon.classList.toggle('fas');
                heartIcon.classList.toggle('far');
            }
        } else {
            showToaster(data.message || 'Failed to update wishlist', 'error');
        }
    } catch (error) {
        console.error('Error updating wishlist:', error);
        showToaster('Failed to update wishlist. Please try again.', 'error');
    }
}

function viewProduct(productId) {
    window.location.href = `/user/product/${productId}`;
}

// Update cart count
async function updateCartCount() {
    try {
        const response = await fetch('/user/cart/count');
        if (response.ok) {
            const data = await response.json();
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = data.count || 0;
                cartCountElement.style.display = data.count > 0 ? 'flex' : 'none';
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Update wishlist count
async function updateWishlistCount() {
    try {
        const response = await fetch('/user/profile/wishlist/count');
        if (response.ok) {
            const data = await response.json();
            const wishlistCountElement = document.getElementById('wishlist-count');
            if (wishlistCountElement) {
                wishlistCountElement.textContent = data.wishlistCount || 0;
                wishlistCountElement.style.display = data.wishlistCount > 0 ? 'flex' : 'none';
            }
        }
    } catch (error) {
        console.error('Error updating wishlist count:', error);
    }
}

// Loading states
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('productsGrid');

    if (spinner) spinner.style.display = 'block';
    if (grid) grid.style.opacity = '0.5';
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('productsGrid');

    if (spinner) spinner.style.display = 'none';
    if (grid) grid.style.opacity = '1';
}

// Toaster notifications
function showToaster(message, type = 'success') {
    const container = document.getElementById('toaster-container');

    const toaster = document.createElement('div');
    toaster.className = `toaster ${type}`;
    toaster.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    container.appendChild(toaster);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toaster.parentNode) {
            toaster.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                container.removeChild(toaster);
            }, 300);
        }
    }, 3000);
}

// Handle window resize for responsive behavior
window.addEventListener('resize', debounce(() => {
    // Recalculate items per page based on screen size
    const screenWidth = window.innerWidth;
    let newItemsPerPage;

    if (screenWidth <= 768) {
        newItemsPerPage = 6; // 2 columns on mobile
    } else if (screenWidth <= 1024) {
        newItemsPerPage = 8; // 2 columns on tablet
    } else {
        newItemsPerPage = 9; // 3 columns on desktop
    }

    if (newItemsPerPage !== itemsPerPage) {
        itemsPerPage = newItemsPerPage;
        currentPage = 1;
        loadProducts();
    }
}, 250));

// Add CSS animation for slide out
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);