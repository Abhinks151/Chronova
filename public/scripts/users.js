// Sample Users Data


// Global variables
let users = [...sampleUsers];
let filteredUsers = [...users];
let currentPage = 1;
let usersPerPage = 10;
let currentSort = 'none';
let currentFilter = 'all';
let currentSearch = '';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const sortAZ = document.getElementById('sortAZ');
const sortZA = document.getElementById('sortZA');
const usersTableBody = document.getElementById('usersTableBody');
const paginationInfo = document.getElementById('paginationInfo');
const pageNumbers = document.getElementById('pageNumbers');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Modal elements
const statusModal = document.getElementById('statusModal');
const statusModalTitle = document.getElementById('statusModalTitle');
const statusModalMessage = document.getElementById('statusModalMessage');
const statusModalUserName = document.getElementById('statusModalUserName');
const statusModalUserEmail = document.getElementById('statusModalUserEmail');
const statusModalCancel = document.getElementById('statusModalCancel');
const statusModalConfirm = document.getElementById('statusModalConfirm');

const deleteModal = document.getElementById('deleteModal');
const deleteModalUserName = document.getElementById('deleteModalUserName');
const deleteModalUserEmail = document.getElementById('deleteModalUserEmail');
const deleteModalCancel = document.getElementById('deleteModalCancel');
const deleteModalConfirm = document.getElementById('deleteModalConfirm');

// Modal state
let currentModalAction = null;
let currentUserId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    renderUsers();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', function () {
        currentSearch = this.value.toLowerCase();
        currentPage = 1;
        applyFilters();
    });

    // Filter functionality
    statusFilter.addEventListener('change', function () {
        currentFilter = this.value;
        currentPage = 1;
        applyFilters();
    });

    // Sort functionality
    sortAZ.addEventListener('click', function () {
        currentSort = 'asc';
        updateSortButtons();
        applyFilters();
    });

    sortZA.addEventListener('click', function () {
        currentSort = 'desc';
        updateSortButtons();
        applyFilters();
    });

    // Pagination
    prevBtn.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            renderUsers();
        }
    });

    nextBtn.addEventListener('click', function () {
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderUsers();
        }
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });

    // Modal cancel buttons
    statusModalCancel.addEventListener('click', closeModals);
    deleteModalCancel.addEventListener('click', closeModals);

    // Modal confirm buttons
    statusModalConfirm.addEventListener('click', confirmStatusChange);
    deleteModalConfirm.addEventListener('click', confirmDelete);

    // Close modals when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target === statusModal || e.target === deleteModal) {
            closeModals();
        }
    });
}

// Apply filters and sorting
function applyFilters() {
    filteredUsers = [...users];

    // Apply search filter
    if (currentSearch) {
        filteredUsers = filteredUsers.filter(user =>
            user.name.toLowerCase().includes(currentSearch) ||
            user.email.toLowerCase().includes(currentSearch) ||
            user.mobile.includes(currentSearch)
        );
    }

    // Apply status filter
    if (currentFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === currentFilter);
    }

    // Apply sorting
    if (currentSort === 'asc') {
        filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'desc') {
        filteredUsers.sort((a, b) => b.name.localeCompare(a.name));
    }

    renderUsers();
}

// Update sort button states
function updateSortButtons() {
    sortAZ.classList.remove('active');
    sortZA.classList.remove('active');

    if (currentSort === 'asc') {
        sortAZ.classList.add('active');
    } else if (currentSort === 'desc') {
        sortZA.classList.add('active');
    }
}

// Render users table
function renderUsers() {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    // Clear table body
    usersTableBody.innerHTML = '';

    // Render users
    currentUsers.forEach((user, index) => {
    const row = document.createElement('tr');
    const globalIndex = startIndex + index + 1;

    row.innerHTML = `
        
    `;

    usersTableBody.appendChild(row);
});


    // Update pagination
    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage + 1;
    const endIndex = Math.min(startIndex + usersPerPage - 1, filteredUsers.length);

    // Update pagination info
    if (filteredUsers.length === 0) {
        paginationInfo.textContent = 'No users found';
    } else {
        paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${filteredUsers.length} users`;
    }

    // Update pagination buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Generate page numbers
    generatePageNumbers(totalPages);
}

// Generate page numbers
function generatePageNumbers(totalPages) {
    pageNumbers.innerHTML = '';

    if (totalPages <= 1) return;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
        addPageButton(1);
        if (startPage > 2) {
            addEllipsis();
        }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            addEllipsis();
        }
        addPageButton(totalPages);
    }
}

// Add page button
function addPageButton(pageNum) {
    const button = document.createElement('button');
    button.className = `page-btn ${pageNum === currentPage ? 'active' : ''}`;
    button.textContent = pageNum;
    button.addEventListener('click', () => {
        currentPage = pageNum;
        renderUsers();
    });
    pageNumbers.appendChild(button);
}

// Add ellipsis
function addEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'page-ellipsis';
    ellipsis.textContent = '...';
    pageNumbers.appendChild(ellipsis);
}

// Toggle user status
function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    currentUserId = userId;
    currentModalAction = 'toggleStatus';

    // Update modal content
    statusModalUserName.textContent = user.name;
    statusModalUserEmail.textContent = user.email;

    if (user.status === 'active') {
        statusModalTitle.textContent = 'Block User';
        statusModalMessage.textContent = 'Are you sure you want to block this user?';
        statusModalConfirm.textContent = 'Block User';
        statusModalConfirm.className = 'btn btn-danger';
    } else {
        statusModalTitle.textContent = 'Unblock User';
        statusModalMessage.textContent = 'Are you sure you want to unblock this user?';
        statusModalConfirm.textContent = 'Unblock User';
        statusModalConfirm.className = 'btn btn-success';
    }

    // Show modal
    statusModal.style.display = 'flex';
}

// Delete user
function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    currentUserId = userId;
    currentModalAction = 'delete';

    // Update modal content
    deleteModalUserName.textContent = user.name;
    deleteModalUserEmail.textContent = user.email;

    // Show modal
    deleteModal.style.display = 'flex';
}

// Confirm status change
function confirmStatusChange() {
    if (currentModalAction === 'toggleStatus' && currentUserId) {
        const user = users.find(u => u.id === currentUserId);
        if (user) {
            user.status = user.status === 'active' ? 'blocked' : 'active';
            applyFilters();
            showNotification(`User ${user.status === 'active' ? 'unblocked' : 'blocked'} successfully`);
        }
    }
    closeModals();
}

// Confirm delete
function confirmDelete() {
    if (currentModalAction === 'delete' && currentUserId) {
        const userIndex = users.findIndex(u => u.id === currentUserId);
        if (userIndex !== -1) {
            const userName = users[userIndex].name;
            users.splice(userIndex, 1);

            // Reset to first page if current page becomes empty
            const totalPages = Math.ceil(users.length / usersPerPage);
            if (currentPage > totalPages && totalPages > 0) {
                currentPage = totalPages;
            }

            applyFilters();
            showNotification(`User "${userName}" deleted successfully`);
        }
    }
    closeModals();
}

// Close modals
function closeModals() {
    statusModal.style.display = 'none';
    deleteModal.style.display = 'none';
    currentModalAction = null;
    currentUserId = null;
}

// Show notification (you can customize this)
function showNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .status-active {
        background-color: #d4edda;
        color: #155724;
    }
    
    .status-blocked {
        background-color: #f8d7da;
        color: #721c24;
    }
    
    .actions {
        display: flex;
        gap: 8px;
        justify-content: center;
    }
    
    .action-btn {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    
    .action-btn:hover {
        background-color: #f8f9fa;
    }
    
    .sort-btn.active {
        background-color: #007bff;
        color: white;
    }
    
    .page-btn.active {
        background-color: #007bff;
        color: white;
    }
    
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        max-height: 90%;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 20px;
        border-top: 1px solid #eee;
    }
    
    .user-info {
        margin-top: 15px;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .delete-warning {
        text-align: center;
        margin-bottom: 15px;
    }
    
    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
    }
    
    .btn-primary { background-color: #007bff; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
    .btn-danger { background-color: #dc3545; color: white; }
    .btn-success { background-color: #28a745; color: white; }
    
    .btn:hover {
        opacity: 0.9;
    }
`;
document.head.appendChild(style);