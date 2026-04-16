// ============ CONFIGURATION ============
const API_BASE = "http://localhost:3000/api";
let authToken = localStorage.getItem("authToken");
let currentUser = localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")) : null;
let currentBookingEquipmentId = null;
let editingEquipmentId = null;
let allEquipment = [];
let currentSort = "newest";


// ============ INITIALIZATION ============
document.addEventListener("DOMContentLoaded", () => {
    if (authToken) {
        updateUserUI();
        loadUserBookings();
    }
    loadEquipment();
    loadStatistics();
    attachEventListeners();
});

function attachEventListeners() {
    document.getElementById("searchInput").addEventListener("input", loadEquipment);
    document.getElementById("categoryFilter").addEventListener("change", loadEquipment);

    // Character counter for description
    const descField = document.getElementById("description");
    if (descField) {
        descField.addEventListener("input", () => {
            document.getElementById("charCount").textContent = descField.value.length;
        });
    }
}

// ============ AUTHENTICATION ============

function showLoginModal() {
    if (authToken) return;
    const modal = new bootstrap.Modal(document.getElementById("loginModal"));
    modal.show();
}

function showRegisterModal() {
    if (authToken) return;
    const modal = new bootstrap.Modal(document.getElementById("registerModal"));
    modal.show();
}

async function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem("authToken", authToken);
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            alert("✅ Login successful!");
            bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
            updateUserUI();
            loadUserBookings();
            document.getElementById("loginEmail").value = "";
            document.getElementById("loginPassword").value = "";
        } else {
            alert("❌ " + (data.error || "Login failed"));
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

async function register() {
    const fullName = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const phone = document.getElementById("registerPhone").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!fullName || !email || !phone || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, email, phone, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem("authToken", authToken);
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            alert("✅ Registration successful!");
            bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
            updateUserUI();
            document.getElementById("registerName").value = "";
            document.getElementById("registerEmail").value = "";
            document.getElementById("registerPhone").value = "";
            document.getElementById("registerPassword").value = "";
        } else {
            alert("❌ " + (data.error || "Registration failed"));
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        authToken = null;
        currentUser = null;
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        alert("✅ Logged out successfully");
        location.reload();
    }
}

function updateUserUI() {
    const userSection = document.getElementById("userSection");
    userSection.style.display = authToken ? "block" : "none";
    if (currentUser) {
        document.getElementById("userNameDisplay").textContent = currentUser.fullName || currentUser.email;
    }
    document.getElementById("loginBtn").style.display = authToken ? "none" : "inline-block";
    document.getElementById("registerBtn").style.display = authToken ? "none" : "inline-block";

    // Show/hide add equipment section based on auth status
    const addEquipmentSection = document.getElementById("addEquipmentSection");
    addEquipmentSection.style.display = authToken ? "block" : "none";
}

// ============ EQUIPMENT MANAGEMENT ============

async function loadEquipment() {
    try {
        const search = document.getElementById("searchInput").value;
        const category = document.getElementById("categoryFilter").value;

        let url = `${API_BASE}/equipment?sort=${currentSort}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (category) url += `&category=${category}`;

        const response = await fetch(url);
        allEquipment = await response.json();

        displayEquipment();
    } catch (err) {
        console.error("Error loading equipment:", err);
    }
}

function displayEquipment() {
    const container = document.getElementById("equipmentList");
    const noResults = document.getElementById("noResults");

    if (allEquipment.length === 0) {
        container.innerHTML = "";
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";
    container.innerHTML = allEquipment.map(item => {
        const isOwner = currentUser && item.owner && item.owner._id === currentUser._id;
        const ownerName = item.owner?.fullName || 'Unknown';
        const ownerRating = item.owner?.rating || 5;

        return `
        <div class="col-lg-3 col-md-4 col-sm-6">
            <div class="equipment-card card position-relative">
                <img src="${item.image || 'https://via.placeholder.com/300?text=' + encodeURIComponent(item.category)}"
                     class="card-img-top card-img" alt="${item.name}">
                <div class="badge ${item.available ? 'bg-success' : 'bg-danger'}">
                    ${item.available ? '✓ Available' : '✗ Booked'}
                </div>

                <!-- Owner Info Badge (only if not owner) -->
                ${!isOwner ? `
                <div class="owner-badge">
                    <i class="bi bi-person-circle"></i>
                    <small>${ownerName}</small>
                    <span class="owner-rating">⭐${ownerRating}</span>
                </div>
                ` : `
                <div class="owner-badge bg-primary text-white">
                    <i class="bi bi-star-fill"></i> Your Item
                </div>
                `}

                <div class="card-body">
                    <h6 class="card-title mb-1 text-uppercase text-muted">${item.category || 'MISC'}</h6>
                    <h5 class="card-title text-truncate-2">${item.name}</h5>

                    ${item.brand ? `<p class="text-muted mb-2" style="font-size: 0.85rem;"><i class="bi bi-tag"></i> ${item.brand}</p>` : ''}

                    <div class="rating mb-2">
                        ${'⭐'.repeat(Math.round(item.averageRating || 0))}
                        <small class="text-muted">(${item.reviewCount || 0})</small>
                    </div>

                    <p class="card-text text-muted text-truncate-2" style="font-size: 0.9rem;">
                        ${item.description || 'Quality sports equipment for rent'}
                    </p>

                    <div class="price-tag">₹${item.pricePerDay}/day</div>
                    <div class="deposit-tag">Deposit: ₹${item.deposit}</div>

                    <!-- Action Buttons -->
                    <div class="d-grid gap-2 mt-3">
                        ${isOwner ? `
                        <div class="btn-group-vertical" role="group">
                            <button class="btn btn-warning btn-sm" onclick="openEditModal('${item._id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteEquipment('${item._id}', '${item.name}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                        ` : `
                        <button class="btn btn-primary w-100"
                                onclick="openBookingModal('${item._id}')"
                                ${!item.available ? 'disabled' : ''}>
                            <i class="bi bi-calendar-plus"></i> Book Now
                        </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join("");
}

function sortEquipment(sortType) {
    currentSort = sortType;
    loadEquipment();
}

async function addItem() {
    if (!authToken) {
        showAlert("Please login to add equipment", "error");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const price = parseFloat(document.getElementById("price").value);
    const deposit = parseFloat(document.getElementById("deposit").value);
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    const brand = document.getElementById("brand").value.trim();
    const size = document.getElementById("size").value.trim();
    const condition = document.getElementById("condition").value;
    const pricePerWeek = parseFloat(document.getElementById("pricePerWeek").value) || 0;

    // Validation
    if (!name || !category || !price || !deposit) {
        showAlert("Please fill all required fields", "error");
        return;
    }

    if (name.length < 3) {
        showAlert("Equipment name must be at least 3 characters", "error");
        return;
    }

    if (price < 0 || deposit < 0) {
        showAlert("Price and deposit cannot be negative", "error");
        return;
    }

    const addBtn = event.target;
    const originalText = addBtn.innerHTML;
    addBtn.disabled = true;
    addBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Adding...';

    try {
        const response = await fetch(`${API_BASE}/equipment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name,
                category,
                description,
                pricePerDay: price,
                pricePerWeek,
                deposit,
                quantity,
                brand,
                size,
                condition,
                image: `https://via.placeholder.com/300?text=${encodeURIComponent(category)}`
            })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert("✅ Equipment added successfully!", "success");
            // Clear form
            document.getElementById("name").value = "";
            document.getElementById("category").value = "";
            document.getElementById("description").value = "";
            document.getElementById("price").value = "";
            document.getElementById("deposit").value = "";
            document.getElementById("brand").value = "";
            document.getElementById("size").value = "";
            document.getElementById("quantity").value = "1";
            document.getElementById("pricePerWeek").value = "";
            document.getElementById("charCount").textContent = "0";
            loadEquipment();
        } else {
            showAlert("❌ " + (data.error || "Failed to add equipment"), "error");
        }
    } catch (err) {
        showAlert("Error: " + err.message, "error");
    } finally {
        addBtn.disabled = false;
        addBtn.innerHTML = originalText;
    }
}

// ============ BOOKING SYSTEM ============

function openBookingModal(equipmentId) {
    if (!authToken) {
        alert("Please login to book equipment");
        showLoginModal();
        return;
    }

    currentBookingEquipmentId = equipmentId;
    const equipment = allEquipment.find(e => e._id === equipmentId);

    const today = new Date().toISOString().split('T')[0];
    document.getElementById("startDate").value = today;
    document.getElementById("endDate").value = today;
    document.getElementById("startDate").min = today;
    document.getElementById("endDate").min = today;

    // Update price info
    document.getElementById("startDate").addEventListener("change", updatePriceInfo);
    document.getElementById("endDate").addEventListener("change", updatePriceInfo);

    updatePriceInfo();

    const modal = new bootstrap.Modal(document.getElementById("bookingModal"));
    modal.show();
}

function updatePriceInfo() {
    const equipment = allEquipment.find(e => e._id === currentBookingEquipmentId);
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);

    if (startDate && endDate && startDate < endDate) {
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const rentCost = days * equipment.pricePerDay;
        const total = rentCost + equipment.deposit;

        document.getElementById("priceInfo").innerHTML = `
            Duration: ${days} days<br>
            Daily Rate: ₹${equipment.pricePerDay}<br>
            Rent Cost: ₹${rentCost}<br>
            Deposit (refundable): ₹${equipment.deposit}<br>
            <strong>Total Amount: ₹${total}</strong>
        `;
    }
}

async function confirmBooking() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (!startDate || !endDate) {
        alert("Please select dates");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/booking`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                equipmentId: currentBookingEquipmentId,
                rentalStartDate: startDate,
                rentalEndDate: endDate
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ Booking confirmed! Booking ID: " + data.booking._id);
            bootstrap.Modal.getInstance(document.getElementById("bookingModal")).hide();
            loadEquipment();
            loadUserBookings();
        } else {
            alert("❌ " + (data.error || "Booking failed"));
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

async function loadUserBookings() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_BASE}/booking/user/bookings`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error("Failed to load bookings");

        const bookings = await response.json();
        displayUserBookings(bookings);
    } catch (err) {
        console.error("Error loading bookings:", err);
    }
}

function displayUserBookings(bookings) {
    const bookingsSection = document.getElementById("bookingsSection");
    const bookingsList = document.getElementById("bookingsList");

    if (bookings.length === 0) {
        bookingsSection.style.display = "none";
        return;
    }

    bookingsSection.style.display = "block";

    bookingsList.innerHTML = bookings.map(booking => `
        <div class="col-12">
            <div class="booking-card">
                <div class="booking-status status-${booking.status}">
                    ${booking.status.toUpperCase()}
                </div>
                <h6><strong>${booking.equipmentId?.name || 'Equipment'}</strong></h6>
                <div class="booking-dates">
                    📅 ${new Date(booking.rentalStartDate).toLocaleDateString()} to
                    ${new Date(booking.rentalEndDate).toLocaleDateString()}
                </div>
                <p class="text-muted mb-2">Duration: ${booking.days} days</p>
                <div class="booking-amount">₹${booking.totalAmount}</div>
            </div>
        </div>
    `).join("");
}

function showDashboard() {
    const bookingsSection = document.getElementById("bookingsSection");
    bookingsSection.scrollIntoView({ behavior: "smooth" });
}

// ============ STATISTICS ============

async function loadStatistics() {
    try {
        // Equipment count
        const equipRes = await fetch(`${API_BASE}/equipment`);
        const equipment = await equipRes.json();
        document.getElementById("totalEquipment").textContent = equipment.length;

        // Booking statistics
        const bookingRes = await fetch(`${API_BASE}/booking/stats`);
        const stats = await bookingRes.json();
        document.getElementById("totalBookings").textContent = stats.totalBookings;
        document.getElementById("activeBookings").textContent = stats.activeBookings;
        document.getElementById("totalRevenue").textContent = "₹" + stats.totalRevenue.toLocaleString('en-IN');
    } catch (err) {
        console.error("Error loading statistics:", err);
    }
}

function deleteEquipment(id, name) {
    if (!authToken) {
        showAlert("Please login first", "error");
        return;
    }

    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
        return;
    }

    const deleteBtn = event.target.closest('button');
    const originalText = deleteBtn.innerHTML;
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Deleting...';

    fetch(`${API_BASE}/equipment/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            showAlert("✅ Equipment deleted successfully", "success");
            loadEquipment();
        } else {
            showAlert("❌ " + (data.error || "Failed to delete"), "error");
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalText;
        }
    })
    .catch(err => {
        showAlert("Error: " + err.message, "error");
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = originalText;
    });
}

function openEditModal(equipmentId) {
    if (!authToken) {
        showAlert("Please login first", "error");
        return;
    }

    editingEquipmentId = equipmentId;
    const equipment = allEquipment.find(e => e._id === equipmentId);

    if (!equipment) {
        showAlert("Equipment not found", "error");
        return;
    }

    // Populate form with equipment data
    document.getElementById("editName").value = equipment.name || "";
    document.getElementById("editCategory").value = equipment.category || "";
    document.getElementById("editBrand").value = equipment.brand || "";
    document.getElementById("editCondition").value = equipment.condition || "good";
    document.getElementById("editDescription").value = equipment.description || "";
    document.getElementById("editPrice").value = equipment.pricePerDay || "";
    document.getElementById("editDeposit").value = equipment.deposit || "";
    document.getElementById("editQuantity").value = equipment.quantity || 1;

    const modal = new bootstrap.Modal(document.getElementById("editEquipmentModal"));
    modal.show();
}

async function updateEquipment() {
    if (!editingEquipmentId || !authToken) {
        showAlert("Invalid request", "error");
        return;
    }

    const name = document.getElementById("editName").value.trim();
    const category = document.getElementById("editCategory").value;
    const description = document.getElementById("editDescription").value;
    const price = parseFloat(document.getElementById("editPrice").value);
    const deposit = parseFloat(document.getElementById("editDeposit").value);
    const quantity = parseInt(document.getElementById("editQuantity").value) || 1;
    const brand = document.getElementById("editBrand").value.trim();
    const condition = document.getElementById("editCondition").value;

    // Validation
    if (!name || !category || !price || !deposit) {
        showAlert("Please fill all required fields", "error");
        return;
    }

    const updateBtn = event.target;
    const originalText = updateBtn.innerHTML;
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Updating...';

    try {
        const response = await fetch(`${API_BASE}/equipment/${editingEquipmentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name,
                category,
                description,
                pricePerDay: price,
                deposit,
                quantity,
                brand,
                condition
            })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert("✅ Equipment updated successfully!", "success");
            bootstrap.Modal.getInstance(document.getElementById("editEquipmentModal")).hide();
            editingEquipmentId = null;
            loadEquipment();
        } else {
            showAlert("❌ " + (data.error || "Failed to update equipment"), "error");
            updateBtn.disabled = false;
            updateBtn.innerHTML = originalText;
        }
    } catch (err) {
        showAlert("Error: " + err.message, "error");
        updateBtn.disabled = false;
        updateBtn.innerHTML = originalText;
    }
}

// ============ UTILITY FUNCTIONS ============

function showAlert(message, type = "info") {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = "top: 20px; right: 20px; max-width: 400px; z-index: 9999; animation: slideInRight 0.3s ease-out;";
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

