// Sample Users Data
const sampleUsers = [
    { id: 1, name: 'Amal Kumar', email: 'amal@gmail.com', mobile: '12345678901', status: 'blocked' },
    { id: 2, name: 'Vimal Sharma', email: 'vimal@gmail.com', mobile: '12345678902', status: 'active' },
    { id: 3, name: 'Kiran Patel', email: 'kiran@gmail.com', mobile: '12345678903', status: 'blocked' },
    { id: 4, name: 'Anas Ahmed', email: 'anas@gmail.com', mobile: '12345678904', status: 'blocked' },
    { id: 5, name: 'Ziyad Rahman', email: 'ziyad@gmail.com', mobile: '12345678905', status: 'blocked' },
    { id: 6, name: 'Vishnu Nair', email: 'vishnu@gmail.com', mobile: '12345678906', status: 'blocked' },
    { id: 7, name: 'Rahul Gupta', email: 'rahul@gmail.com', mobile: '12345678907', status: 'active' },
    { id: 8, name: 'Arjun Singh', email: 'arjun@gmail.com', mobile: '12345678908', status: 'active' },
    { id: 9, name: 'Deepak Raj', email: 'deepak@gmail.com', mobile: '12345678909', status: 'blocked' },
    { id: 10, name: 'Suresh Kumar', email: 'suresh@gmail.com', mobile: '12345678910', status: 'active' },
    { id: 11, name: 'Mukesh Yadav', email: 'mukesh@gmail.com', mobile: '12345678911', status: 'active' },
    { id: 12, name: 'Ravi Chandra', email: 'ravi@gmail.com', mobile: '12345678912', status: 'blocked' },
    { id: 13, name: 'Pradeep Kumar', email: 'pradeep@gmail.com', mobile: '12345678913', status: 'active' },
    { id: 14, name: 'Santosh Pillai', email: 'santosh@gmail.com', mobile: '12345678914', status: 'active' },
    { id: 15, name: 'Naveen Reddy', email: 'naveen@gmail.com', mobile: '12345678915', status: 'blocked' },
    { id: 16, name: 'Ganesh Iyer', email: 'ganesh@gmail.com', mobile: '12345678916', status: 'active' },
    { id: 17, name: 'Mahesh Babu', email: 'mahesh@gmail.com', mobile: '12345678917', status: 'active' },
    { id: 18, name: 'Venkat Raman', email: 'venkat@gmail.com', mobile: '12345678918', status: 'blocked' },
    { id: 19, name: 'Kartik Aryan', email: 'kartik@gmail.com', mobile: '12345678919', status: 'active' },
    { id: 20, name: 'Ashwin Kumar', email: 'ashwin@gmail.com', mobile: '12345678920', status: 'blocked' },
    { id: 21, name: 'Bharat Singh', email: 'bharat@gmail.com', mobile: '12345678921', status: 'active' },
    { id: 22, name: 'Chandan Roy', email: 'chandan@gmail.com', mobile: '12345678922', status: 'active' },
    { id: 23, name: 'Dinesh Kumar', email: 'dinesh@gmail.com', mobile: '12345678923', status: 'blocked' },
    { id: 24, name: 'Eshan Sharma', email: 'eshan@gmail.com', mobile: '12345678924', status: 'active' },
    { id: 25, name: 'Faizal Khan', email: 'faizal@gmail.com', mobile: '12345678925', status: 'blocked' },
    { id: 26, name: 'Gopal Krishna', email: 'gopal@gmail.com', mobile: '12345678926', status: 'active' },
    { id: 27, name: 'Harish Chandra', email: 'harish@gmail.com', mobile: '12345678927', status: 'active' },
    { id: 28, name: 'Inderjeet Singh', email: 'inderjeet@gmail.com', mobile: '12345678928', status: 'blocked' },
    { id: 29, name: 'Jagdish Prasad', email: 'jagdish@gmail.com', mobile: '12345678929', status: 'active' },
    { id: 30, name: 'Krishna Murthy', email: 'krishna@gmail.com', mobile: '12345678930', status: 'blocked' },
    { id: 31, name: 'Lakshman Das', email: 'lakshman@gmail.com', mobile: '12345678931', status: 'active' },
    { id: 32, name: 'Mohan Lal', email: 'mohan@gmail.com', mobile: '12345678932', status: 'active' },
    { id: 33, name: 'Naresh Kumar', email: 'naresh@gmail.com', mobile: '12345678933', status: 'blocked' },
    { id: 34, name: 'Om Prakash', email: 'om@gmail.com', mobile: '12345678934', status: 'active' },
    { id: 35, name: 'Pankaj Sharma', email: 'pankaj@gmail.com', mobile: '12345678935', status: 'blocked' },
    { id: 36, name: 'Qasim Ali', email: 'qasim@gmail.com', mobile: '12345678936', status: 'active' },
    { id: 37, name: 'Rajesh Kumar', email: 'rajesh@gmail.com', mobile: '12345678937', status: 'active' },
    { id: 38, name: 'Sachin Tendulkar', email: 'sachin@gmail.com', mobile: '12345678938', status: 'blocked' },
    { id: 39, name: 'Tarun Mehta', email: 'tarun@gmail.com', mobile: '12345678939', status: 'active' },
    { id: 40, name: 'Umesh Yadav', email: 'umesh@gmail.com', mobile: '12345678940', status: 'blocked' },
    { id: 41, name: 'Vikram Singh', email: 'vikram@gmail.com', mobile: '12345678941', status: 'active' },
    { id: 42, name: 'Wasim Akram', email: 'wasim@gmail.com', mobile: '12345678942', status: 'active' },
    { id: 43, name: 'Xavier D\'Souza', email: 'xavier@gmail.com', mobile: '12345678943', status: 'blocked' },
    { id: 44, name: 'Yogesh Sharma', email: 'yogesh@gmail.com', mobile: '12345678944', status: 'active' },
    { id: 45, name: 'Zaheer Khan', email: 'zaheer@gmail.com', mobile: '12345678945', status: 'blocked' },
    { id: 46, name: 'Aarav Patel', email: 'aarav@gmail.com', mobile: '12345678946', status: 'active' },
    { id: 47, name: 'Bhuvan Bam', email: 'bhuvan@gmail.com', mobile: '12345678947', status: 'active' },
    { id: 48, name: 'Chirag Joshi', email: 'chirag@gmail.com', mobile: '12345678948', status: 'blocked' },
    { id: 49, name: 'Dhruv Rathee', email: 'dhruv@gmail.com', mobile: '12345678949', status: 'active' },
    { id: 50, name: 'Elvish Yadav', email: 'elvish@gmail.com', mobile: '12345678950', status: 'blocked' },
    { id: 51, name: 'Farhan Ali', email: 'farhan@gmail.com', mobile: '12345678951', status: 'active' },
    { id: 52, name: 'Gaurav Mishra', email: 'gaurav@gmail.com', mobile: '12345678952', status: 'blocked' },
    { id: 53, name: 'Hemant Kumar', email: 'hemant@gmail.com', mobile: '12345678953', status: 'active' },
    { id: 54, name: 'Irfan Pathan', email: 'irfan@gmail.com', mobile: '12345678954', status: 'blocked' },
    { id: 55, name: 'Jitendra Joshi', email: 'jitendra@gmail.com', mobile: '12345678955', status: 'active' },
    { id: 56, name: 'Kamal Haasan', email: 'kamal@gmail.com', mobile: '12345678956', status: 'blocked' },
    { id: 57, name: 'Lalit Sharma', email: 'lalit@gmail.com', mobile: '12345678957', status: 'active' },
    { id: 58, name: 'Manoj Tiwari', email: 'manoj@gmail.com', mobile: '12345678958', status: 'active' },
    { id: 59, name: 'Niraj Pandey', email: 'niraj@gmail.com', mobile: '12345678959', status: 'blocked' },
    { id: 60, name: 'Omkar Verma', email: 'omkar@gmail.com', mobile: '12345678960', status: 'active' },
    { id: 61, name: 'Prakash Raj', email: 'prakash@gmail.com', mobile: '12345678961', status: 'blocked' },
    { id: 62, name: 'Rakesh Menon', email: 'rakesh@gmail.com', mobile: '12345678962', status: 'active' },
    { id: 63, name: 'Sanjay Kapoor', email: 'sanjay@gmail.com', mobile: '12345678963', status: 'active' },
    { id: 64, name: 'Tanmay Bhat', email: 'tanmay@gmail.com', mobile: '12345678964', status: 'blocked' },
    { id: 65, name: 'Utkarsh Rana', email: 'utkarsh@gmail.com', mobile: '12345678965', status: 'active' },
    { id: 66, name: 'Vivek Oberoi', email: 'vivek@gmail.com', mobile: '12345678966', status: 'active' },
    { id: 67, name: 'Wasim Khan', email: 'wasimk@gmail.com', mobile: '12345678967', status: 'blocked' },
    { id: 68, name: 'Xahid Qureshi', email: 'xahid@gmail.com', mobile: '12345678968', status: 'active' },
    { id: 69, name: 'Yusuf Shaikh', email: 'yusuf@gmail.com', mobile: '12345678969', status: 'blocked' },
    { id: 70, name: 'Zubair Khan', email: 'zubair@gmail.com', mobile: '12345678970', status: 'active' },
    { id: 71, name: 'Abhay Joshi', email: 'abhay@gmail.com', mobile: '12345678971', status: 'active' },
    { id: 72, name: 'Bipin Reddy', email: 'bipin@gmail.com', mobile: '12345678972', status: 'blocked' },
    { id: 73, name: 'Chirantan Roy', email: 'chirantan@gmail.com', mobile: '12345678973', status: 'active' },
    { id: 74, name: 'Darshan Jha', email: 'darshan@gmail.com', mobile: '12345678974', status: 'active' },
    { id: 75, name: 'Eshan Verma', email: 'eshanv@gmail.com', mobile: '12345678975', status: 'blocked' },
    { id: 76, name: 'Faizan Shaikh', email: 'faizan@gmail.com', mobile: '12345678976', status: 'active' },
    { id: 77, name: 'Gitesh Nair', email: 'gitesh@gmail.com', mobile: '12345678977', status: 'blocked' },
    { id: 78, name: 'Harshal Mehta', email: 'harshal@gmail.com', mobile: '12345678978', status: 'active' },
    { id: 79, name: 'Imran Qadir', email: 'imran@gmail.com', mobile: '12345678979', status: 'active' },
    { id: 80, name: 'Jayant Sinha', email: 'jayant@gmail.com', mobile: '12345678980', status: 'blocked' },
    { id: 81, name: 'Kiran Rao', email: 'kiranr@gmail.com', mobile: '12345678981', status: 'active' },
    { id: 82, name: 'Lakshay Bhatia', email: 'lakshay@gmail.com', mobile: '12345678982', status: 'active' },
    { id: 83, name: 'Mahendra Singh', email: 'mahendra@gmail.com', mobile: '12345678983', status: 'blocked' },
    { id: 84, name: 'Nakul Sen', email: 'nakul@gmail.com', mobile: '12345678984', status: 'active' },
    { id: 85, name: 'Om Desai', email: 'omd@gmail.com', mobile: '12345678985', status: 'blocked' },
    { id: 86, name: 'Punit Malhotra', email: 'punit@gmail.com', mobile: '12345678986', status: 'active' },
    { id: 87, name: 'Quadir Hussain', email: 'quadir@gmail.com', mobile: '12345678987', status: 'blocked' },
    { id: 88, name: 'Rohit Shetty', email: 'rohit@gmail.com', mobile: '12345678988', status: 'active' },
    { id: 89, name: 'Suresh Raina', email: 'raina@gmail.com', mobile: '12345678989', status: 'blocked' },
    { id: 90, name: 'Tushar Deshmukh', email: 'tushar@gmail.com', mobile: '12345678990', status: 'active' },
    { id: 91, name: 'Uday Chopra', email: 'uday@gmail.com', mobile: '12345678991', status: 'active' },
    { id: 92, name: 'Vimal Jain', email: 'vimalj@gmail.com', mobile: '12345678992', status: 'blocked' },
    { id: 93, name: 'Wasim Sheikh', email: 'wasims@gmail.com', mobile: '12345678993', status: 'active' },
    { id: 94, name: 'Xavier Pinto', email: 'xavierp@gmail.com', mobile: '12345678994', status: 'blocked' },
    { id: 95, name: 'Yash Sharma', email: 'yash@gmail.com', mobile: '12345678995', status: 'active' },
    { id: 96, name: 'Zaid Khan', email: 'zaid@gmail.com', mobile: '12345678996', status: 'blocked' },
    { id: 97, name: 'Ankit Tiwari', email: 'ankit@gmail.com', mobile: '12345678997', status: 'active' },
    { id: 98, name: 'Bhavesh Patel', email: 'bhavesh@gmail.com', mobile: '12345678998', status: 'active' },
    { id: 99, name: 'Chetan Bhagat', email: 'chetan@gmail.com', mobile: '12345678999', status: 'blocked' },
    { id: 100, name: 'Deepika Rana', email: 'deepika@gmail.com', mobile: '12345678000', status: 'active' }
];

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