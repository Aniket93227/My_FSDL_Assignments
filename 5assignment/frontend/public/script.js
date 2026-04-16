const API = "http://localhost:3000/api/trips";
const AUTH_API = "http://localhost:3000/api/auth";
let token = localStorage.getItem("token") || "";
let currentChart = null;
let allTrips = [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let bookingHistory = JSON.parse(localStorage.getItem("bookingHistory")) || [];
let userProfile = JSON.parse(localStorage.getItem("userProfile")) || {};
let currentRatingTripId = null;
let currentRating = 0;
let selectedCategory = null;
let promoDiscount = 0;

// PROMO CODES DATABASE
const promoCodes = {
    "TRAVEL20": { discount: 20, minPrice: 50000, code: "TRAVEL20" },
    "SUMMER50": { discount: 50, minPrice: 100000, code: "SUMMER50" },
    "BUDGET10": { discount: 10, minPrice: 0, code: "BUDGET10" },
    "FIRST100": { discount: 100, minPrice: 25000, code: "FIRST100" }
};

// CHECK IF ALREADY LOGGED IN
window.addEventListener("DOMContentLoaded", () => {
    loadDarkModeSetting();
    if (token) {
        showApp();
        loadTrips();
        updateWishlistCount();
    } else {
        showLogin();
    }
});

// SHOW/HIDE FUNCTIONS
function showLogin() {
    document.getElementById("loginSection").style.display = "flex";
    document.getElementById("appSection").style.display = "none";
}

function showApp() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
}

// DARK MODE
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

function loadDarkModeSetting() {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }
}

// NOTIFICATIONS
function showNotification(message, type = "info") {
    const container = document.getElementById("notificationContainer");
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
        ${message}
    `;
    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// TOGGLE BETWEEN LOGIN AND SIGNUP
function toggleSignUp(e) {
    e.preventDefault();
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    if (loginForm.style.display === "none") {
        loginForm.style.display = "block";
        signupForm.style.display = "none";
    } else {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
    }
}

// REGISTER
async function register(e) {
    e.preventDefault();
    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;
    const errorDiv = document.getElementById("loginError");

    try {
        const res = await fetch(`${AUTH_API}/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }

        errorDiv.style.display = "block";
        errorDiv.textContent = "✓ Account created successfully! Please login.";
        errorDiv.className = "alert alert-success";

        setTimeout(() => {
            toggleSignUp(e);
            document.getElementById("username").value = username;
            document.getElementById("signupForm").reset();
        }, 1500);
    } catch (err) {
        errorDiv.style.display = "block";
        errorDiv.textContent = "✗ Registration failed: " + err.message;
        errorDiv.className = "alert alert-danger";
    }
}

// LOGIN
async function login(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("loginError");

    try {
        const res = await fetch(`${AUTH_API}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }

        const data = await res.json();
        token = data.token;
        localStorage.setItem("token", token);
        userProfile.username = username;
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
        document.getElementById("welcomeUser").textContent = `👤 ${username}`;

        errorDiv.style.display = "none";
        showApp();
        loadTrips();
        updateWishlistCount();
        showNotification("✓ Login successful! Welcome back!", "success");
    } catch (err) {
        errorDiv.style.display = "block";
        errorDiv.textContent = "✗ Login failed: " + err.message;
    }
}

// LOGOUT
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        token = "";
        localStorage.removeItem("token");
        document.getElementById("loginForm").reset();
        document.getElementById("signupForm").reset();
        document.getElementById("loginForm").style.display = "block";
        document.getElementById("signupForm").style.display = "none";
        showLogin();
        showNotification("Logged out successfully", "info");
    }
}

// LOAD TRIPS
async function loadTrips() {
    try {
        const res = await fetch(API, {
            headers: {"Authorization": `Bearer ${token}`}
        });

        if (!res.ok) throw new Error("Failed to load trips");

        allTrips = await res.json();
        displayTrips(allTrips);
        updateStats();
        loadChart(allTrips);
    } catch (err) {
        console.error("Error loading trips:", err);
        showNotification("Failed to load trips", "error");
    }
}

// DISPLAY TRIPS WITH ENHANCED CARDS
function displayTrips(trips) {
    const list = document.getElementById("tripList");
    const emptyTips = document.getElementById("emptyTips");

    if (trips.length === 0) {
        list.innerHTML = "";
        emptyTips.style.display = "block";
    } else {
        emptyTips.style.display = "none";
        list.innerHTML = "";

        trips.forEach(trip => {
            const tripRating = getTripsAverageRating(trip._id);
            const isInWishlist = wishlist.some(w => w._id === trip._id);
            const card = document.createElement("div");
            card.className = "trip-card";

            const description = trip.description || "Amazing destination awaits you!";
            const imageEmoji = trip.imageUrl ? "" : getDestinationEmoji(trip.category || "Beach");

            card.innerHTML = `
                <div class="trip-card-image" style="${trip.imageUrl ? `background-image: url('${trip.imageUrl}'); background-size: cover;` : 'color: white; font-size: 2.5rem;'}">${imageEmoji}</div>
                <div class="trip-card-header">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <p class="destination">${trip.destination}</p>
                            <p class="price">₹${trip.price}</p>
                            <span class="trip-category-badge">${trip.category || "Travel"}</span>
                            ${trip.discount ? `<span class="trip-category-badge" style="background: #ff6b6b; color: white;">-${trip.discount}%</span>` : ''}
                        </div>
                        <span class="trip-wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="toggleWishlist(event, '${trip._id}', '${trip.destination}')">❤️</span>
                    </div>
                </div>
                <div class="trip-card-body">
                    <p class="text-muted small mb-2">${description.substring(0, 80)}...</p>
                    <div class="trip-info">
                        <div class="trip-info-item">
                            <i class="fas fa-calendar"></i>
                            <span>${trip.duration}</span>
                        </div>
                        <div class="trip-rating">
                            ${tripRating.count > 0 ? `⭐ ${tripRating.avg.toFixed(1)} (${tripRating.count} reviews)` : 'No reviews yet'}
                        </div>
                    </div>
                </div>
                <div class="trip-card-footer">
                    <button class="btn btn-info btn-sm" onclick="showTripDetails('${trip._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-success btn-sm" onclick="openReviewModal('${trip._id}', '${trip.destination}')">
                        <i class="fas fa-star"></i> Review
                    </button>
                    <button class="btn btn-success btn-sm" onclick="bookTrip('${trip._id}', '${trip.destination}', ${trip.price})">
                        <i class="fas fa-credit-card"></i> Book
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTrip('${trip._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(card);
        });
    }
}

// GET DESTINATION EMOJI BASED ON CATEGORY
function getDestinationEmoji(category) {
    const emojis = {
        "Beach": "🏖️",
        "Mountain": "⛰️",
        "Adventure": "🏔️",
        "Cultural": "🏛️",
        "Luxury": "💎",
        "Budget": "💰"
    };
    return emojis[category] || "✈️";
}

// SHOW TRIP DETAILS
function showTripDetails(tripId) {
    const trip = allTrips.find(t => t._id === tripId);
    if (!trip) return;

    const tripRating = getTripsAverageRating(trip._id);
    const content = document.getElementById("tripDetailsContent");
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; font-size: 4rem;">
            ${getDestinationEmoji(trip.category || "Beach")}
        </div>
        <h3>${trip.destination}</h3>
        <p class="text-muted">${trip.category || "Travel"} | ${trip.duration}</p>

        <div class="row mb-3">
            <div class="col-md-6">
                <h6>Price</h6>
                <h4 class="text-success">₹${trip.price.toLocaleString()}</h4>
            </div>
            <div class="col-md-6">
                <h6>Rating</h6>
                <h4 class="text-warning">${tripRating.avg.toFixed(1)} ⭐ (${tripRating.count} reviews)</h4>
            </div>
        </div>

        <div class="mb-3">
            <h6>Description</h6>
            <p>${trip.description || "Explore this amazing destination with all its beauty and charm."}</p>
        </div>

        <button class="btn btn-success w-100" onclick="bookTrip('${trip._id}', '${trip.destination}', ${trip.price})">
            <i class="fas fa-credit-card"></i> Book This Trip
        </button>
    `;

    const modal = new bootstrap.Modal(document.getElementById("tripDetailsModal"));
    modal.show();
}

// ADD TRIP
async function addTrip(e) {
    e.preventDefault();
    const destination = document.getElementById("destination").value;
    const price = document.getElementById("price").value;
    const duration = document.getElementById("duration").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const imageUrl = document.getElementById("imageUrl").value;

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                destination,
                price,
                duration,
                category,
                description,
                imageUrl
            })
        });

        if (!res.ok) throw new Error("Failed to add trip");

        document.querySelector("form[onsubmit='addTrip(event)']").reset();
        loadTrips();
        showNotification("✓ Trip added successfully!", "success");
    } catch (err) {
        showNotification("Error adding trip: " + err.message, "error");
    }
}

// DELETE TRIP
async function deleteTrip(id) {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
        const res = await fetch(`${API}/${id}`, {
            method: "DELETE",
            headers: {"Authorization": `Bearer ${token}`}
        });

        if (!res.ok) throw new Error("Failed to delete trip");

        loadTrips();
        showNotification("✓ Trip deleted successfully!", "success");
    } catch (err) {
        showNotification("Error deleting trip: " + err.message, "error");
    }
}

// WISHLIST MANAGEMENT
function toggleWishlist(event, tripId, destination) {
    event.stopPropagation();
    const trip = allTrips.find(t => t._id === tripId);
    const index = wishlist.findIndex(w => w._id === tripId);

    if (index === -1) {
        wishlist.push(trip);
        showNotification(`❤️ Added '${destination}' to wishlist!`, "success");
    } else {
        wishlist.splice(index, 1);
        showNotification(`Removed '${destination}' from wishlist`, "info");
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlistCount();
    displayTrips(allTrips);
}

function updateWishlistCount() {
    document.getElementById("wishlistCount").textContent = wishlist.length;
}

function showWishlist() {
    const wishlistList = document.getElementById("wishlistList");
    const emptyWishlist = document.getElementById("emptyWishlist");

    if (wishlist.length === 0) {
        wishlistList.innerHTML = "";
        emptyWishlist.style.display = "block";
    } else {
        emptyWishlist.style.display = "none";
        wishlistList.innerHTML = wishlist.map(trip => `
            <div class="wishlist-item card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${trip.destination}</h6>
                            <p class="text-muted small mb-1">₹${trip.price.toLocaleString()} | ${trip.duration}</p>
                            <p class="text-muted small">${trip.category || "Travel"}</p>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-success me-2" onclick="bookTrip('${trip._id}', '${trip.destination}', ${trip.price})">
                                Book
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="toggleWishlist(event, '${trip._id}', '${trip.destination}')">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join("");
    }

    const modal = new bootstrap.Modal(document.getElementById("wishlistModal"));
    modal.show();
}

// USER PROFILE
function showUserProfile() {
    document.getElementById("profileUsername").value = userProfile.username || "";
    document.getElementById("profileEmail").value = userProfile.email || "";
    document.getElementById("profilePhone").value = userProfile.phone || "";
    document.getElementById("profileCountry").value = userProfile.country || "";

    const modal = new bootstrap.Modal(document.getElementById("profileModal"));
    modal.show();
}

function saveProfile() {
    userProfile.username = document.getElementById("profileUsername").value;
    userProfile.email = document.getElementById("profileEmail").value;
    userProfile.phone = document.getElementById("profilePhone").value;
    userProfile.country = document.getElementById("profileCountry").value;

    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    bootstrap.Modal.getInstance(document.getElementById("profileModal")).hide();
    showNotification("✓ Profile updated successfully!", "success");
}

// SEARCH
function searchTrips() {
    const search = document.getElementById("search").value.toLowerCase();
    const filtered = allTrips.filter(trip => trip.destination.toLowerCase().includes(search));
    displayTrips(filtered);
}

// SORT TRIPS
function sortTrips() {
    const sortBy = document.getElementById("sortBy").value;
    let sorted = [...allTrips];

    switch(sortBy) {
        case "price-low":
            sorted.sort((a, b) => a.price - b.price);
            break;
        case "price-high":
            sorted.sort((a, b) => b.price - a.price);
            break;
        case "rating":
            sorted.sort((a, b) => {
                const ratingA = getTripsAverageRating(a._id).avg || 0;
                const ratingB = getTripsAverageRating(b._id).avg || 0;
                return ratingB - ratingA;
            });
            break;
        default:
            sorted = allTrips;
    }

    displayTrips(sorted);
}

// FILTER BY CATEGORY
function filterByCategory(button, category) {
    button.classList.toggle("active");

    if (selectedCategory === category) {
        selectedCategory = null;
    } else {
        selectedCategory = category;
    }

    if (selectedCategory) {
        const filtered = allTrips.filter(trip => trip.category === selectedCategory);
        displayTrips(filtered);
    } else {
        displayTrips(allTrips);
    }
}

// FILTER BY PRICE
function filterByPrice() {
    const maxPrice = parseInt(document.getElementById("priceFilter").value);
    document.getElementById("priceValue").textContent = maxPrice > 0 ? `₹${maxPrice.toLocaleString()}` : "All";

    const filtered = allTrips.filter(trip => maxPrice === 0 || trip.price <= maxPrice);
    displayTrips(filtered);
}

// PROMO CODE
function applyPromoCode() {
    const code = document.getElementById("promoCode").value.toUpperCase();
    const message = document.getElementById("promoMessage");

    if (promoCodes[code]) {
        const promo = promoCodes[code];
        promoDiscount = promo.discount;
        message.textContent = `✓ Applied! ${promo.discount}₹ off on purchases above ₹${promo.minPrice}`;
        message.className = "success";
        showNotification(`✓ Promo code '${code}' applied! Save ₹${promo.discount}!`, "success");
    } else {
        message.textContent = "✗ Invalid promo code";
        message.className = "error";
        showNotification("Invalid promo code", "error");
    }
}

// BOOKING
function bookTrip(tripId, destination, price, isFromWishlist = false) {
    const trip = allTrips.find(t => t._id === tripId);
    const finalPrice = Math.max(0, price - promoDiscount);
    const confirmed = confirm(`Confirm Booking\n\nDestination: ${destination}\nOriginal Price: ₹${price}\nDiscount: ₹${promoDiscount}\nFinal Amount: ₹${finalPrice}\n\nProceed?`);

    if (confirmed) {
        const booking = {
            id: tripId,
            destination: destination,
            price: price,
            finalPrice: finalPrice,
            discount: promoDiscount,
            date: new Date().toLocaleString(),
            status: "Completed",
            bookingId: "TRV" + Math.random().toString(36).substr(2, 9).toUpperCase()
        };
        bookingHistory.push(booking);
        localStorage.setItem("bookingHistory", JSON.stringify(bookingHistory));

        showNotification(`✅ Booking confirmed! Reference: ${booking.bookingId}`, "success");
        alert(`✅ Booking Successful!\n\nTrip: ${destination}\nOriginal Price: ₹${price}\nDiscount Applied: ₹${promoDiscount}\nFinal Amount: ₹${finalPrice}\n\nBooking ID: ${booking.bookingId}\n\nConfirmation sent to your email!`);

        promoDiscount = 0;
        document.getElementById("promoCode").value = "";
        document.getElementById("promoMessage").textContent = "";
        updateStats();
    }
}

// REVIEWS
function openReviewModal(tripId, destination) {
    currentRatingTripId = tripId;
    currentRating = 0;
    document.getElementById("reviewText").value = "";

    const modal = new bootstrap.Modal(document.getElementById("reviewModal"));
    modal.show();
}

function setRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll("#ratingStars i");
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add("active");
        } else {
            star.classList.remove("active");
        }
    });
}

function submitReview() {
    if (currentRating === 0) {
        showNotification("Please select a rating", "error");
        return;
    }

    const reviews = JSON.parse(localStorage.getItem("tripReviews")) || {};
    if (!reviews[currentRatingTripId]) {
        reviews[currentRatingTripId] = [];
    }

    reviews[currentRatingTripId].push({
        rating: currentRating,
        comment: document.getElementById("reviewText").value,
        date: new Date().toLocaleString()
    });

    localStorage.setItem("tripReviews", JSON.stringify(reviews));
    bootstrap.Modal.getInstance(document.getElementById("reviewModal")).hide();
    loadTrips();
    showNotification("✓ Thank you for your review!", "success");
}

// BOOKING HISTORY
function showBookingHistory() {
    const historyList = document.getElementById("bookingHistoryList");
    const emptyHistory = document.getElementById("emptyHistory");

    if (bookingHistory.length === 0) {
        historyList.innerHTML = "";
        emptyHistory.style.display = "block";
    } else {
        emptyHistory.style.display = "none";
        historyList.innerHTML = bookingHistory.map((booking, index) => `
            <div class="card mb-3 border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">${booking.destination}</h6>
                            <p class="text-muted small mb-1"><i class="fas fa-calendar"></i> ${booking.date}</p>
                        </div>
                        <span class="badge bg-success">${booking.status}</span>
                    </div>
                    <div class="d-flex gap-3">
                        <div>
                            <small class="text-muted">Original Price</small>
                            <p class="mb-0">₹${booking.price.toLocaleString()}</p>
                        </div>
                        ${booking.discount ? `<div>
                            <small class="text-muted">Discount</small>
                            <p class="mb-0" style="color: #11998e;">-₹${booking.discount}</p>
                        </div>` : ''}
                        <div>
                            <small class="text-muted">Final Amount</small>
                            <p class="mb-0" style="color: #667eea; font-weight: 600;">₹${booking.finalPrice.toLocaleString()}</p>
                        </div>
                    </div>
                    <hr>
                    <small class="text-muted"><i class="fas fa-ticket"></i> Booking ID: ${booking.bookingId}</small>
                    <button class="btn btn-sm btn-outline-primary float-end" onclick="downloadBooking(${index})">
                        <i class="fas fa-download"></i> PDF
                    </button>
                </div>
            </div>
        `).join("");
    }

    const modal = new bootstrap.Modal(document.getElementById("historyModal"));
    modal.show();
}

function downloadBooking(index) {
    const booking = bookingHistory[index];
    const content = `
TRAVEL AGENCY BOOKING CONFIRMATION
===================================

Booking ID: ${booking.bookingId}
Date: ${booking.date}
Status: ${booking.status}

PASSENGER INFORMATION
=====================
Name: ${userProfile.username}
Email: ${userProfile.email}
Phone: ${userProfile.phone}

TRIP DETAILS
============
Destination: ${booking.destination}
Price: ₹${booking.price}
Discount: ₹${booking.discount}
Final Amount: ₹${booking.finalPrice}

Thank you for choosing us!
    `;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", `booking_${booking.bookingId}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showNotification("✓ Booking downloaded successfully!", "success");
}

// STATS
function updateStats() {
    document.getElementById("totalTrips").textContent = allTrips.length;
    document.getElementById("bookedTrips").textContent = bookingHistory.length;

    const totalSpent = bookingHistory.reduce((sum, booking) => sum + booking.finalPrice, 0);
    document.getElementById("totalSpent").textContent = "₹" + totalSpent.toLocaleString();

    const avgRating = calculateAverageRating();
    document.getElementById("avgRating").textContent = avgRating.toFixed(1);
}

// HELPER FUNCTIONS
function getTripsAverageRating(tripId) {
    const reviews = JSON.parse(localStorage.getItem("tripReviews")) || {};
    if (!reviews[tripId] || reviews[tripId].length === 0) {
        return { avg: 0, count: 0 };
    }

    const ratings = reviews[tripId].map(r => r.rating);
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    return { avg, count: reviews[tripId].length };
}

function calculateAverageRating() {
    const reviews = JSON.parse(localStorage.getItem("tripReviews")) || {};
    const allRatings = [];

    Object.values(reviews).forEach(tripReviews => {
        tripReviews.forEach(review => {
            allRatings.push(review.rating);
        });
    });

    if (allRatings.length === 0) return 0;
    return allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
}

// CHART
function loadChart(trips) {
    const ctx = document.getElementById("chart");

    if (currentChart) {
        currentChart.destroy();
    }

    if (trips.length === 0) {
        ctx.style.display = "none";
        return;
    }

    ctx.style.display = "block";

    const labels = trips.map(t => t.destination);
    const prices = trips.map(t => t.price);
    const colors = [
        "rgba(102, 126, 234, 0.8)",
        "rgba(118, 75, 162, 0.8)",
        "rgba(17, 153, 142, 0.8)",
        "rgba(56, 239, 125, 0.8)",
        "rgba(240, 147, 251, 0.8)"
    ];

    currentChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Trip Prices (₹)",
                data: prices,
                backgroundColor: colors.slice(0, prices.length),
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        font: {size: 12, weight: "bold"},
                        color: "#333",
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return "₹" + value;
                        }
                    }
                }
            }
        }
    });
}
