// Global variables
let allCategories = [];
let currentCategories = [];
let allProducts = [];
let selectedProductIds = [];
let filteredProducts = [];
let isLoading = false;
let currentSort = '';
let pageSize = 5;
let totalCategories = 0;
let currentPage = 1;
let pendingAction = null;
let currentCategoryId = null;
let isEditMode = false;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeData();
  setupEventListeners();
});

// Initialize data from backend
function initializeData() {
  // These will be passed from backend via EJS
  if (typeof categories !== 'undefined') {
    allCategories = categories || [];
    currentCategories = [...allCategories];
    totalCategories = allCategories.length;
  }

  if (typeof products !== 'undefined') {
    allProducts = products || [];
    filteredProducts = [...allProducts];
  }

  renderCategories();
  updatePagination();
  populateProductsList();
}

// Setup all event listeners
function setupEventListeners() {
  // Search input with Enter key support
  document.getElementById('searchInput').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Filter change listeners
  document.getElementById('typeFilter').addEventListener('change', handleFilters);
  document.getElementById('statusFilter').addEventListener('change', handleFilters);

  // Sort button listeners
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      handleFilters();
    });
  });

  // Product search in modal
  document.getElementById('productSearch').addEventListener('input', debounce(filterProducts, 300));

  // Form validation on input
  document.getElementById('categoryName').addEventListener('input', validateCategoryName);
  document.getElementById('categoryType').addEventListener('change', validateCategoryType);

  // Modal close on outside click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal(e.target.id);
    }
  });
}

// ==================== UTILITY FUNCTIONS ====================
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==================== VALIDATION FUNCTIONS ====================
function validateCategoryName() {
  const nameInput = document.getElementById('categoryName');
  const errorDiv = document.getElementById('categoryNameError');
  const name = nameInput.value.trim();

  if (!name) {
    showFieldError(errorDiv, 'Category name is required');
    return false;
  } else if (name.length < 2) {
    showFieldError(errorDiv, 'Category name must be at least 2 characters');
    return false;
  } else if (name.length > 50) {
    showFieldError(errorDiv, 'Category name must not exceed 50 characters');
    return false;
  } else {
    hideFieldError(errorDiv);
    return true;
  }
}

function validateCategoryType() {
  const typeSelect = document.getElementById('categoryType');
  const errorDiv = document.getElementById('categoryTypeError');

  if (!typeSelect.value) {
    showFieldError(errorDiv, 'Please select a category type');
    return false;
  } else {
    hideFieldError(errorDiv);
    return true;
  }
}

function showFieldError(errorDiv, message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function hideFieldError(errorDiv) {
  errorDiv.textContent = '';
  errorDiv.style.display = 'none';
}

function validateForm() {
  const isNameValid = validateCategoryName();
  const isTypeValid = validateCategoryType();

  return isNameValid && isTypeValid;
}

// ==================== SEARCH AND FILTER FUNCTIONS ====================
function handleSearch() {
  handleFilters();
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('typeFilter').value = 'All';
  document.getElementById('statusFilter').value = 'All';
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  currentSort = '';
  currentPage = 1;
  currentCategories = [...allCategories];
  renderCategories();
  updatePagination();
}

async function handleFilters() {
  if (isLoading) return;

  const filters = {
    search: document.getElementById('searchInput').value,
    type: document.getElementById('typeFilter').value,
    status: document.getElementById('statusFilter').value,
    sort: currentSort,
    page: currentPage,
    pagesize: pageSize
  };

  await fetchFilteredCategories(filters);
}

async function fetchFilteredCategories(filters) {
  isLoading = true;
  showLoading();

  try {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '' && filters[key] !== 'All') {
        params.append(key, filters[key]);
      }
    });

    params.append('page', currentPage);
    params.append('limit', pageSize);

    const response = await axios.get(`/admin/category/filter?${params}`);
    const data = response.data;

    if (data.success) {
      currentCategories = data.categories || [];
      totalCategories = data.totalCount || currentCategories.length;
      renderCategories();
      updatePagination();
    } else {
      showError('Failed to load categories');
    }
  } catch (error) {
    showError('Server error while fetching categories.');
    console.error('Filter fetch error:', error);
  } finally {
    isLoading = false;
  }
}

// ==================== RENDERING FUNCTIONS ====================
function showLoading() {
  document.getElementById('loadingIndicator').style.display = 'block';
  document.getElementById('categoriesTable').style.display = 'none';
  document.getElementById('noCategoriesMessage').style.display = 'none';
}

function showError(message) {
  document.getElementById('loadingIndicator').style.display = 'none';
  document.getElementById('categoriesTable').style.display = 'none';
  document.getElementById('noCategoriesMessage').style.display = 'block';
  document.getElementById('noCategoriesMessage').textContent = message;
}

// function renderCategories() {
//   const loadingEl = document.getElementById('loadingIndicator');
//   const tableEl = document.getElementById('categoriesTable');
//   const noCategoriesEl = document.getElementById('noCategoriesMessage');
//   const tbody = document.getElementById('categoriesTableBody');

//   loadingEl.style.display = 'none';

//   if (!currentCategories.length) {
//     tableEl.style.display = 'none';
//     noCategoriesEl.style.display = 'block';
//     return;
//   }

//   noCategoriesEl.style.display = 'none';
//   tableEl.style.display = 'table';

//   tbody.innerHTML = currentCategories.map(category => `
//     <tr data-id="${category._id}">
//       <td class="category-cell">
//         <div class="category-info">
//           <div class="category-name">${category.categoryName}</div>
//           <div class="category-desc">${category.description ? category.description.substring(0, 50) + '...' : 'No description'}</div>
//         </div>
//       </td> 
//       <td>
//         <span class="type-badge type-${category.type.toLowerCase()}">${category.type}</span>
//       </td>
//       <td>
//         <span class="product-count">${category.productCount || 0}</span>
//       </td>
//       <td>
//         <span class="status-badge ${category.isBlocked ? 'status-blocked' : 'status-active'}">
//           ${category.isBlocked ? 'Blocked' : 'Active'}
//         </span>
//       </td>
//       <td>${formatDate(category.createdAt)}</td>
//       <td class="actions-cell">
//         <button class="action-btn btn-info" onclick="viewCategoryDetails('${category._id}')" title="View Details">
//           View
//         </button>
//         <button class="action-btn btn-warning" onclick="editCategory('${category._id}')" title="Edit">
//           Edit
//         </button>
//         <button class="action-btn ${category.isBlocked ? 'btn-success' : 'btn-danger'}" 
//                 onclick="showBlockModal('${category._id}', ${category.isBlocked})" 
//                 title="${category.isBlocked ? 'Unblock' : 'Block'}">
//           ${category.isBlocked ? 'Unblock' : 'Block'}
//         </button>
//         <button class="action-btn btn-danger" onclick="showDeleteModal('${category._id}')" title="Delete">
//           Delete
//         </button>
//       </td>
//     </tr>
//   `).join('');
// }

function renderCategories() {
  const loadingEl = document.getElementById('loadingIndicator');
  const tableEl = document.getElementById('categoriesTable');
  const noCategoriesEl = document.getElementById('noCategoriesMessage');
  const tbody = document.getElementById('categoriesTableBody');

  loadingEl.style.display = 'none';
  tbody.innerHTML = '';

  if (!currentCategories.length) {
    tableEl.style.display = 'none';
    noCategoriesEl.style.display = 'block';
    return;
  }

  noCategoriesEl.style.display = 'none';
  tableEl.style.display = 'table';

  tbody.innerHTML = currentCategories.map(category => {
    const name = category.categoryName || 'Unnamed';
    const type = category.type || 'N/A';
    const productCount = category.productCount || 0;
    const status = category.isBlocked ? 'Blocked' : 'Active';
    // console.log(category.isBlocked)
    const createdAt = category.createdAt ? formatDate(category.createdAt) : 'N/A';
    // console.log('Received categories:', currentCategories);

    return `
        <tr data-id="${category._id}">
          <td class="category-cell">
            <div class="category-info">
              <div class="category-name">${name}</div>
              <div class="category-desc">No description</div>
            </div>
          </td> 
          <td>
            <span class="type-badge type-${type.toLowerCase()}">${type}</span>
          </td>
          <td>
            <span class="product-count">${productCount}</span>
          </td>
          <td>
            <span class="status-badge ${category.isBlocked ? 'status-blocked' : 'status-active'}">
              ${status}
            </span>
          </td>
          <td>${createdAt}</td>
          <td class="actions-cell">
            <button class="action-btn btn-info" onclick="viewCategoryDetails('${category._id}')">View</button>
            <button class="action-btn btn-warning" onclick="editCategory('${category._id}')">Edit</button>
            <button class="action-btn ${category.isBlocked ? 'btn-success' : 'btn-danger'}" 
                    onclick="showBlockModal('${category._id}', ${category.isBlocked})">
              ${category.isBlocked ? 'Unblock' : 'Block'}
            </button>
            <button class="action-btn btn-danger" onclick="showDeleteModal('${category._id}')">Delete</button>
          </td>
        </tr>
      `;
  }).join('');
}



// ==================== PAGINATION FUNCTIONS ====================
function updatePagination() {
  const totalPages = Math.ceil(totalCategories / pageSize);
  const startItem = ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalCategories);

  document.getElementById('paginationInfo').textContent =
    `Showing ${startItem} - ${endItem} of ${totalCategories} categories`;

  document.getElementById('prevPageBtn').disabled = currentPage <= 1;
  document.getElementById('nextPageBtn').disabled = currentPage >= totalPages;
}

function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    handleFilters();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(totalCategories / pageSize);
  if (currentPage < totalPages) {
    currentPage++;
    handleFilters();
  }
}

// ==================== MODAL FUNCTIONS ====================
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  if (modalId === 'categoryModal') {
    resetCategoryForm();
  }
  pendingAction = null;
}

function resetCategoryForm() {
  document.getElementById('categoryForm').reset();
  selectedProductIds = [];
  isEditMode = false;
  document.getElementById('categoryModalTitle').textContent = 'Add New Category';
  document.getElementById('submitCategoryBtn').textContent = 'Add Category';
  updateSelectedProducts();

  // Clear all error messages
  document.querySelectorAll('.error-message').forEach(error => {
    error.style.display = 'none';
    error.textContent = '';
  });
}

// ==================== CATEGORY MODAL FUNCTIONS ====================
function openAddCategoryModal() {
  resetCategoryForm();
  populateProductsList();
  document.getElementById('categoryModal').style.display = 'block';
}

function editCategory(categoryId) {
  const category = currentCategories.find(c => c._id === categoryId);
  if (!category) return;

  isEditMode = true;
  currentCategoryId = categoryId;

  document.getElementById('categoryModalTitle').textContent = 'Edit Category';
  document.getElementById('submitCategoryBtn').textContent = 'Update Category';

  // Populate form fields
  document.getElementById('categoryName').value = category.name;
  document.getElementById('categoryType').value = category.type;
  document.getElementById('categoryDescription').value = category.description || '';

  // Set selected products
  selectedProductIds = category.products ? category.products.map(p => p._id || p) : [];

  populateProductsList();
  updateSelectedProducts();

  document.getElementById('categoryModal').style.display = 'block';
}

function populateProductsList() {
  const productsList = document.getElementById('productsList');

  productsList.innerHTML = filteredProducts.map(product => `
    <div class="product-item ${selectedProductIds.includes(product._id) ? 'selected' : ''}" 
         data-id="${product._id}" 
         onclick="toggleProductSelection('${product._id}')">
      <img src="${product.images && product.images[0] ? product.images[0].url : '/images/placeholder-watch.jpg'}" 
           class="product-thumb" 
           onerror="this.src='/images/placeholder-watch.jpg'" 
           alt="${product.productName}">
      <div class="product-details">
        <div class="product-name">${product.productName}</div>
        <div class="product-brand">${product.brand}</div>
        <div class="product-price">₹${product.salePrice}</div>
      </div>
      <div class="selection-indicator">
        <span class="checkmark">✓</span>
      </div>
    </div>
  `).join('');
}

function filterProducts() {
  const query = document.getElementById('productSearch').value.toLowerCase();

  if (!query) {
    filteredProducts = [...allProducts];
  } else {
    filteredProducts = allProducts.filter(product =>
      product.productName.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    );
  }

  populateProductsList();
}

function toggleProductSelection(productId) {
  const index = selectedProductIds.indexOf(productId);

  if (index === -1) {
    selectedProductIds.push(productId);
  } else {
    selectedProductIds.splice(index, 1);
  }

  populateProductsList();
  updateSelectedProducts();
}

function updateSelectedProducts() {
  const selectedItems = document.getElementById('selectedItems');
  const selectedCount = document.getElementById('selectedCount');

  selectedCount.textContent = selectedProductIds.length;

  if (selectedProductIds.length === 0) {
    selectedItems.innerHTML = '<p class="no-selection">No products selected</p>';
    return;
  }

  const selectedProducts = allProducts.filter(p => selectedProductIds.includes(p._id));

  selectedItems.innerHTML = selectedProducts.map(product => `
    <div class="selected-item">
      <img src="${product.images && product.images[0] ? product.images[0].url : '/images/placeholder-watch.jpg'}" 
           class="selected-thumb" 
           onerror="this.src='/images/placeholder-watch.jpg'" 
           alt="${product.productName}">
      <span class="selected-name">${product.productName}</span>
      <button class="remove-btn" onclick="toggleProductSelection('${product._id}')" title="Remove">×</button>
    </div>
  `).join('');
}

async function submitCategory() {
  if (!validateForm()) {
    showToast('Please fix the validation errors', 'error');
    return;
  }

  const formData = {
    categoryName: document.getElementById('categoryName').value.trim(),
    type: document.getElementById('categoryType').value,
    description: document.getElementById('categoryDescription').value.trim(),
    products: selectedProductIds
  };

  try {
    let response;

    if (isEditMode) {
      response = await axios.put(`/admin/category/edit/${currentCategoryId}`, formData);
    } else {
      response = await axios.post('/admin/category/add', formData);
    }

    if (response.data.success) {
      closeModal('categoryModal');
      showToast(response.data.message || `Category ${isEditMode ? 'updated' : 'added'} successfully!`);

      // Redirect to backend specified route
      if (response.data.redirect) {
        window.location.href = response.data.redirect;
      } else {
        // Refresh the page data
        handleFilters();
      }
    } else {
      showToast(response.data.message || `Failed to ${isEditMode ? 'update' : 'add'} category`, 'error');
    }
  } catch (error) {
    console.error('Error submitting category:', error);
    showToast('Error submitting category. Please try again.', 'error');
  }
}

// ==================== CATEGORY DETAILS MODAL ====================
function viewCategoryDetails(categoryId) {
  const category = currentCategories.find(c => c._id === categoryId);
  if (!category) return;

  currentCategoryId = categoryId;

  const modalBody = document.getElementById('categoryDetailsBody');
  const modalFooter = document.getElementById('categoryDetailsFooter');

  const associatedProducts = category.products || [];

  modalBody.innerHTML = `
    <div class="category-details">
      <div class="detail-grid">
        <div class="detail-section">
          <h3>Category Information</h3>
          <div class="detail-item">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${category.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Type:</span>
            <span class="detail-value">
              <span class="type-badge type-${category.type.toLowerCase()}">${category.type}</span>
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${category.description || 'No description available'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status:</span>
            <span class="detail-value">
              <span class="status-badge ${category.isBlocked ? 'status-blocked' : 'status-active'}">
                ${category.isBlocked ? 'Blocked' : 'Active'}
              </span>
            </span>
          </div>
        </div>

        <div class="detail-section">
          <h3>Statistics</h3>
          <div class="detail-item">
            <span class="detail-label">Product Count:</span>
            <span class="detail-value">${category.productCount || 0}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Created:</span>
            <span class="detail-value">${formatDate(category.createdAt)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Updated:</span>
            <span class="detail-value">${formatDate(category.updatedAt)}</span>
          </div>
        </div>

        ${associatedProducts.length > 0 ? `
          <div class="detail-section full-width">
            <h3>Associated Products (${associatedProducts.length})</h3>
            <div class="products-grid">
              ${associatedProducts.slice(0, 6).map(product => `
                <div class="product-card">
                  <img src="${product.images && product.images[0] ? product.images[0].url : '/images/placeholder-watch.jpg'}" 
                       class="product-image" 
                       onerror="this.src='/images/placeholder-watch.jpg'" 
                       alt="${product.productName}">
                  <div class="product-info">
                    <div class="product-name">${product.productName}</div>
                    <div class="product-price">₹${product.salePrice}</div>
                  </div>
                </div>
              `).join('')}
              ${associatedProducts.length > 6 ? `
                <div class="more-products">
                  +${associatedProducts.length - 6} more products
                </div>
              ` : ''}
            </div>
          </div>
        ` : `
          <div class="detail-section full-width">
            <h3>Associated Products</h3>
            <p class="no-products">No products associated with this category.</p>
          </div>
        `}
      </div>
    </div>
  `;

  modalFooter.innerHTML = `
    <div class="modal-actions">
      <button class="btn btn-warning" onclick="editCategory('${category._id}')">
        Edit Category
      </button>
      <button class="btn ${category.isBlocked ? 'btn-success' : 'btn-danger'}" 
              onclick="showBlockModal('${category._id}', ${category.isBlocked})">
        ${category.isBlocked ? 'Unblock' : 'Block'} Category
      </button>
      <button class="btn btn-danger" onclick="showDeleteModal('${category._id}')">
        Delete Category
      </button>
      <button class="btn btn-secondary" onclick="closeModal('categoryDetailsModal')">
        Close
      </button>
    </div>
  `;

  document.getElementById('categoryDetailsModal').style.display = 'block';
}

// ==================== BLOCK/UNBLOCK FUNCTIONS ====================
function showBlockModal(categoryId, isBlocked) {
  const category = currentCategories.find(c => c._id === categoryId);
  if (!category) return;

  currentCategoryId = categoryId;
  pendingAction = isBlocked ? 'unblock' : 'block';

  const modalTitle = document.getElementById('blockModalTitle');
  const modalMessage = document.getElementById('blockModalMessage');
  const confirmBtn = document.getElementById('blockConfirmBtn');

  if (isBlocked) {
    modalTitle.textContent = 'Unblock Category';
    modalMessage.textContent = `Are you sure you want to unblock "${category.name}"? This will make it available again.`;
    confirmBtn.textContent = 'Unblock';
    confirmBtn.className = 'btn btn-success';
  } else {
    modalTitle.textContent = 'Block Category';
    modalMessage.textContent = `Are you sure you want to block "${category.name}"? This will make it unavailable.`;
    confirmBtn.textContent = 'Block';
    confirmBtn.className = 'btn btn-danger';
  }

  document.getElementById('blockModal').style.display = 'block';
}

async function confirmBlockAction() {
  if (!currentCategoryId || !pendingAction) return;

  try {
    const response = await axios.put(`/admin/category/${pendingAction}/${currentCategoryId}`);

    if (response.data.success) {
      const updatedCategory = response.data.updatedCategory;

      closeModal('blockModal');
      showToast(response.data.message || `Category ${pendingAction}ed successfully!`);

      // Safely update category status with server-validated value
      currentCategories = currentCategories.map(cat =>
        cat._id === updatedCategory._id
          ? { ...cat, isBlocked: updatedCategory.isBlocked }
          : cat
      );

      // console.log(currentCategories);
      renderCategories();
    } else {
      showToast(response.data.message || `Failed to ${pendingAction} category`, 'error');
    }
  } catch (error) {
    console.error(`Error ${pendingAction}ing category:`, error);
    showToast(`Error ${pendingAction}ing category. Please try again.`, 'error');
  }
}

// ==================== DELETE FUNCTIONS ====================
function showDeleteModal(categoryId) {
  const category = currentCategories.find(c => c._id === categoryId);
  if (!category) return;

  currentCategoryId = categoryId;
  pendingAction = 'delete';

  document.getElementById('deleteModal').style.display = 'block';
}

async function confirmDeleteAction() {
  if (!currentCategoryId) return;

  try {
    const response = await axios.delete(`/admin/category/delete/${currentCategoryId}`);

    if (response.data.success) {
      closeModal('deleteModal');
      showToast(response.data.message || 'Category deleted successfully!');

      // Remove from local data
      currentCategories = currentCategories.filter(c => c._id !== currentCategoryId);
      allCategories = allCategories.filter(c => c._id !== currentCategoryId);
      totalCategories--;

      renderCategories();
      updatePagination();
    } else {
      showToast(response.data.message || 'Failed to delete category', 'error');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    showToast('Error deleting category. Please try again.', 'error');
  }
}