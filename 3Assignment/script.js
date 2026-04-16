// ==================== CART SYSTEM ====================
let cart = [];
function addToCart(name, price) {
  cart.push({ name, price });
  updateCart();
  showNotification(`${name} added to cart! 🛒`);
}
function updateCart() {
  const cartItemsEl = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");
  if (cart.length === 0) {
    cartItemsEl.innerText = "None";
    totalEl.innerText = "0";
    return;
  }
  const summary = cart.reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + 1;
    return acc;
  }, {});
  cartItemsEl.innerText = Object.entries(summary)
    .map(([name, count]) => `${name} (x${count})`)
    .join(", ");
  totalEl.innerText = cart.reduce((sum, item) => sum + item.price, 0);
}
function clearCart() {
  cart = [];
  updateCart();
  showNotification("Cart cleared! 🗑️");
}

// ==================== APPOINTMENT SYSTEM ====================
function bookAppointment() {
  const date = document.getElementById("date").value;
  const slot = document.getElementById("slot").value;
  const confirmationEl = document.getElementById("confirmation");
  if (!date || !slot) {
    showNotification("Please select date and slot! ⚠️");
    confirmationEl.innerText = "";
    return;
  }
  confirmationEl.innerText = `Booked for ${date} at ${slot}`;
  showNotification("Appointment booked! ✅");
}

// ==================== BMI CALCULATOR ====================
function calculateBMI() {
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);
  const resultEl = document.getElementById("bmi-result");
  if (!height || !weight || height <= 0 || weight <= 0) {
    showNotification("Enter valid height and weight! ⚠️");
    resultEl.innerText = "";
    return;
  }
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";
  resultEl.innerText = `BMI: ${bmi} (${category})`;
  showNotification(`Your BMI is ${bmi} (${category})`);
}

// ==================== FITNESS CHART ====================
window.onload = function () {
  const ctx = document.getElementById("fitnessChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Steps",
        data: [4000, 5000, 7000, 6000, 8000, 9000, 7500],
        backgroundColor: "#00b894",
        borderColor: "#0984e3",
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: "#0984e3"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#0984e3" },
          grid: { color: "rgba(0,184,148,0.1)" }
        },
        x: {
          ticks: { color: "#0984e3" },
          grid: { display: false }
        }
      }
    }
  });
};

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.innerHTML = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.5s";
    setTimeout(() => notification.remove(), 500);
  }, 2500);
}

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll("a[href^='#']").forEach(link => {
  link.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href.length > 1) {
      e.preventDefault();
      const section = document.querySelector(href);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ==================== FORM INPUT VALIDATION ====================
document.querySelectorAll("input,select").forEach(input => {
  input.addEventListener("focus", function () {
    this.style.borderColor = "#00b894";
  });
  input.addEventListener("blur", function () {
    if (!this.value) this.style.borderColor = "#b2bec3";
  });
});

// ==================== PAGE LOAD ANIMATION ====================
window.addEventListener("load", function () {
  document.body.style.opacity = "1";
});