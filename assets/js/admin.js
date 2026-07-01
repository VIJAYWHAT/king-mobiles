import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBW-skkBmdt3a1oy9l7pyMaR7LI78K4mVU",
  authDomain: "king-mobiles-ucp.firebaseapp.com",
  projectId: "king-mobiles-ucp",
  storageBucket: "king-mobiles-ucp.firebasestorage.app",
  messagingSenderId: "80949270421",
  appId: "1:80949270421:web:f0102c362c22121f09489c",
  measurementId: "G-1PBHNWPRX7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Google Drive Image Utilities
function extractDriveId(input) {
  if (!input) return "";
  input = input.trim();
  
  // Check if it's already a thumbnail URL
  if (input.includes("drive.google.com/thumbnail")) {
    const match = input.match(/[?&]id=([a-zA-Z0-9_-]{25,100})/);
    if (match && match[1]) return match[1];
  }
  
  // Check for standard file share URLs
  if (input.includes("drive.google.com") || input.includes("docs.google.com")) {
    // Match /file/d/ID
    let match = input.match(/\/d\/([a-zA-Z0-9_-]{25,100})/);
    if (match && match[1]) return match[1];
    
    // Match ?id=ID
    match = input.match(/[?&]id=([a-zA-Z0-9_-]{25,100})/);
    if (match && match[1]) return match[1];
  }
  
  // If it matches alphanumeric pattern of standard Drive ID length
  if (/^[a-zA-Z0-9_-]{25,100}$/.test(input)) {
    return input;
  }
  
  return input;
}

function isDriveThumbnailUrl(url) {
  return url && typeof url === 'string' && url.includes("drive.google.com/thumbnail");
}

function formatDateTimeLocal(dateString) {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    return "";
  }
}

// Application State
let loggedIn = false;
let currentTab = "shop-info";
let localDataStore = {}; // Holds local copy of the fetched Firebase documents
let editingItemIndex = null; // Keeps track of index when editing array item in a modal

// Authentication Config
const AUTH_USERNAME = "ADMIN";
const AUTH_PASSWORD = "Admin@123";

// Toast Notification Helper
function showToast(title, desc, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "✓";
  if (type === "error") icon = "✕";

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${desc}</div>
    </div>
    <div class="toast-close">✕</div>
  `;

  container.appendChild(toast);
  
  // Slide in
  setTimeout(() => toast.classList.add("show"), 10);

  // Close handler
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 350);
  });

  // Auto remove
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 350);
    }
  }, 4000);
}

// Check Authentication on Page Load
function checkAuth() {
  const sessionToken = sessionStorage.getItem("king_admin_session");
  if (sessionToken === "authenticated") {
    loggedIn = true;
    showDashboard();
  } else {
    loggedIn = false;
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById("auth-section").style.display = "flex";
  document.getElementById("dashboard-section").style.display = "none";
}

function showDashboard() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("dashboard-section").style.display = "flex";
  
  // Transition class trigger
  setTimeout(() => {
    document.getElementById("dashboard-section").classList.add("show");
  }, 50);

  // Load the initial tab data
  loadTab(currentTab);
}

// Login verification
window.handleLogin = function(e) {
  e.preventDefault();
  
  const userEl = document.getElementById("username");
  const passEl = document.getElementById("password");
  const errEl = document.getElementById("login-error");
  
  const username = userEl.value.trim();
  const password = passEl.value;
  
  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
    sessionStorage.setItem("king_admin_session", "authenticated");
    loggedIn = true;
    errEl.style.display = "none";
    userEl.value = "";
    passEl.value = "";
    showDashboard();
    showToast("Login Success", "Welcome back, Administrator.");
  } else {
    errEl.textContent = "Invalid Admin ID or Password.";
    errEl.style.display = "flex";
  }
};

// Logout Function
window.handleLogout = function() {
  sessionStorage.removeItem("king_admin_session");
  loggedIn = false;
  
  const dashboard = document.getElementById("dashboard-section");
  dashboard.classList.remove("show");
  
  setTimeout(() => {
    dashboard.style.display = "none";
    showLoginScreen();
    showToast("Logged Out", "You have been safely logged out.");
  }, 350);
};

// Tab Switch Handler
window.switchTab = function(tabName) {
  if (currentTab === tabName) return;
  
  // Update UI Sidebar selection
  document.querySelectorAll(".menu-item").forEach(item => {
    if (item.getAttribute("data-tab") === tabName) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Close sidebar on mobile after clicking
  const sidebar = document.getElementById("sidebar");
  if (sidebar && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
  }

  // Fade out old content and load new
  const activePanel = document.querySelector(".content-section.active");
  if (activePanel) {
    activePanel.classList.remove("active");
  }
  
  currentTab = tabName;
  loadTab(tabName);
};

// Firebase Data Fetching
async function loadTab(tabName) {
  const container = document.getElementById(`${tabName}-panel`);
  if (!container) return;

  // Add active state to container
  container.classList.add("active");

  // Show loading indicator in panel content
  const contentBody = container.querySelector(".panel-content-body");
  if (contentBody) {
    contentBody.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; gap: 15px; color: var(--gray);">
        <div class="spinner" style="width: 40px; height: 40px; border-width: 3px; color: var(--gold);"></div>
        <p style="font-size: 0.9rem;">Fetching data from Firestore...</p>
      </div>
    `;
  }

  try {
    let data = null;

    if (tabName === "shop-info") {
      // Get base-info doc
      const docRef = doc(db, "shop-info", "base-info");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        data = docSnap.data();
      }
    } else {
      // Get website collections
      const docRef = doc(db, "website", tabName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        data = docSnap.data();
      }
    }

    // Save fetched data to local store for edits
    localDataStore[tabName] = data || getFallbackData(tabName);
    
    // Render the custom edit panel UI
    renderEditPanel(tabName, localDataStore[tabName], contentBody);
  } catch (error) {
    console.error("Error fetching Firestore document: ", error);
    showToast("Error", "Could not fetch document. Please try again.", "error");
    if (contentBody) {
      contentBody.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #ff8880;">
          <p>⚠️ Failed to load content from Firebase. Verify database connectivity.</p>
          <button class="btn btn-secondary" onclick="loadTab('${tabName}')" style="margin-top: 15px;">Retry Fetch</button>
        </div>
      `;
    }
  }
}

// Fallback data generators in case Firestore document is empty
function getFallbackData(tabName) {
  switch (tabName) {
    case "shop-info":
      return {
        phone: "+91 73394 80350",
        whatsapp: "+91 73394 80350",
        mail: "kingmobiles@gmail.com",
        address: "ST Complex, Van stand Opposite; Uchipuli, Ramanathapuram; Tamil Nadu — 623534",
        short_address: "ST Complex, Van stand Opp, Uchipuli",
        business_hours: "9:00 AM – 9:30 PM",
        weekdays_timing: "9 AM – 9.30 PM",
        weekend_timing: "9 AM – 9.30 PM",
      };
    case "reviews":
      return { reviews: [] };
    case "gallery":
      return {
        cards: [
          { image: "assets/images/king-mobiles-and-communications-front-view.jpg", title: "Store Front — Uchipuli", heightClass: "h1" },
          { image: "assets/images/king-mobiles-and-communications-front-view.jpg", title: "Smartphone Showroom", heightClass: "h2" },
          { image: "", title: "Premium Accessories Rack", heightClass: "h3" },
          { image: "", title: "Expert Service Center", heightClass: "h2" },
          { image: "", title: "Friendly Customer Service", heightClass: "h4" }
        ]
      };
    case "faq":
      return { slogan: "Everything you need to know before visiting us.", items: [] };
    default:
      return { slogan: "", cards: [] };
  }
}

// Render dynamic forms for editing
function renderEditPanel(tabName, data, container) {
  if (!container) return;
  container.innerHTML = "";

  if (tabName === "shop-info") {
    // Render Shop Info inputs
    container.innerHTML = `
      <form id="shop-info-form" onsubmit="saveShopInfo(event)">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" class="form-input" id="shop-phone" value="${data.phone || ''}" placeholder="e.g. +91 73394 80350" required>
          </div>
          <div class="form-group">
            <label class="form-label">WhatsApp Number</label>
            <input type="text" class="form-input" id="shop-whatsapp" value="${data.whatsapp || ''}" placeholder="e.g. +91 73394 80350" required>
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-input" id="shop-email" value="${data.mail || ''}" placeholder="e.g. kingmobiles@gmail.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Business Hours Short Text (e.g. 9:00 AM – 9:30 PM)</label>
            <input type="text" class="form-input" id="shop-hours" value="${data.business_hours || ''}" placeholder="e.g. 9:00 AM – 9:30 PM" required>
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Weekdays Hours</label>
            <input type="text" class="form-input" id="shop-weekdays" value="${data.weekdays_timing || ''}" placeholder="e.g. 9 AM – 9.30 PM" required>
          </div>
          <div class="form-group">
            <label class="form-label">Weekend Hours (Sunday)</label>
            <input type="text" class="form-input" id="shop-weekend" value="${data.weekend_timing || ''}" placeholder="e.g. 9 AM – 9.30 PM" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Short Address (for sub-headings)</label>
          <input type="text" class="form-input" id="shop-short-address" value="${data.short_address || ''}" placeholder="ST Complex, Van stand Opp, Uchipuli" required>
        </div>
        <div class="form-group">
          <label class="form-label">Full Address (Use semicolons ';' to break lines)</label>
          <textarea class="form-input" id="shop-address" placeholder="ST Complex, Van stand Opposite; Uchipuli, Ramanathapuram; Tamil Nadu — 623534" required>${data.address || ''}</textarea>
        </div>
        <div class="actions-footer">
          <button type="submit" class="btn btn-save" id="btn-save-shop">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            Save Address & Contacts
          </button>
        </div>
      </form>
    `;
    return;
  }

  // For other collections, we typically have a section-level slogan, and a list of cards/items.
  let listHtml = "";
  const items = data.cards || data.items || data.services || data.reviews || [];
  
  if (items.length === 0) {
    listHtml = `
      <div style="text-align: center; padding: 40px; color: var(--gray); border: 1px dashed var(--glass-border); border-radius: var(--radius-sm); margin-bottom: 20px;">
         No items added yet. Click "+ Add New Item" to create one.
      </div>
    `;
  } else {
    listHtml = `<div class="items-list-container">`;
    items.forEach((item, index) => {
      let displayName = item.name || item.title || item.question || item.text || `Item ${index + 1}`;
      let subText = item.desc || item.answer || item.description || (item.stars ? `${item.stars} - by ${item.name}` : "");
      if (tabName === "gallery") {
        subText = `Layout Height: ${item.heightClass || 'none'} | Image: ${item.image ? (item.image.includes('drive.google.com') ? 'Google Drive' : item.image) : 'No Image (Text Placeholder)'}`;
      }
      
      // Clean display values
      if (displayName.length > 50) displayName = displayName.slice(0, 50) + "...";
      if (subText && subText.length > 80) subText = subText.slice(0, 80) + "...";

      // Status indicator for offers
      let statusBadge = "";
      if (tabName === "offers") {
        statusBadge = item.enabled !== false 
          ? `<span class="item-badge active">Active</span>`
          : `<span class="item-badge disabled">Disabled</span>`;
      }

      listHtml += `
        <div class="item-row">
          <div class="item-details">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="item-name">${displayName}</span>
              ${statusBadge}
            </div>
            <span class="item-subtext">${subText || ''}</span>
          </div>
          <div class="item-actions">
            <button class="btn btn-secondary btn-icon-only" onclick="moveItem('${tabName}', ${index}, 'up')" title="Move Up" ${index === 0 ? 'disabled style="opacity: 0.3;"' : ''}>
              ▲
            </button>
            <button class="btn btn-secondary btn-icon-only" onclick="moveItem('${tabName}', ${index}, 'down')" title="Move Down" ${index === items.length - 1 ? 'disabled style="opacity: 0.3;"' : ''}>
              ▼
            </button>
            <button class="btn btn-secondary btn-icon-only" onclick="openItemModal('${tabName}', ${index})" title="Edit Details">
              ✏️
            </button>
            <button class="btn btn-danger btn-icon-only" onclick="deleteItem('${tabName}', ${index})" title="Delete Item">
              🗑️
            </button>
          </div>
        </div>
      `;
    });
    listHtml += `</div>`;
  }

  // Sections slogan if present
  let sloganGroup = "";
  if (data.hasOwnProperty("slogan")) {
    sloganGroup = `
      <div class="form-group">
        <label class="form-label">${tabName.toUpperCase()} Section Slogan / Subtitle</label>
        <input type="text" class="form-input" id="section-slogan" value="${data.slogan || ''}" placeholder="e.g. Explore our products collection" required>
      </div>
    `;
  }

  // Special services section-level defaults
  if (tabName === "services" && data.default) {
    const defaultImgVal = data.default.image || 'assets/images/service_default.png';
    const isDefaultImgDrive = isDriveThumbnailUrl(defaultImgVal);
    const displayDefaultImg = isDefaultImgDrive ? extractDriveId(defaultImgVal) : defaultImgVal;

    sloganGroup = `
      <div style="margin-bottom: 24px; padding: 20px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--radius-sm);">
        <h4 style="margin-bottom: 15px; color: var(--gold); font-size: 0.95rem; font-weight: 700; text-transform: uppercase;">Repair Panel Defaults (No selection state)</h4>
        <div class="form-group">
          <label class="form-label">Default Title</label>
          <input type="text" class="form-input" id="service-default-title" value="${data.default.title || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Default Description</label>
          <textarea class="form-input" id="service-default-desc" required>${data.default.description || ''}</textarea>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <label class="form-label" style="margin-bottom: 0;">Default Image Path</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.75rem; color: var(--gray-light); font-weight: 500;">Drive Image</span>
                <label class="switch">
                  <input type="checkbox" id="service-default-image-is-drive" ${isDefaultImgDrive ? 'checked' : ''} onchange="document.getElementById('service-default-image').placeholder = this.checked ? 'Enter Google Drive URL or File ID' : 'assets/images/... or external URL'">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <input type="text" class="form-input" id="service-default-image" value="${displayDefaultImg}" placeholder="${isDefaultImgDrive ? 'Enter Google Drive URL or File ID' : 'assets/images/... or external URL'}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Default WhatsApp Auto Message</label>
            <input type="text" class="form-input" id="service-default-wa" value="${data.default.waMessage || ''}" required>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    ${sloganGroup}
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0 15px 0;">
      <h3 style="font-size: 1rem; font-weight: 700; color: var(--white); text-transform: uppercase; letter-spacing: 0.02em;">Items (${items.length})</h3>
      <button class="btn btn-add" onclick="openItemModal('${tabName}', null)">
        ➕ Add New Item
      </button>
    </div>
    
    ${listHtml}

    <div class="actions-footer">
      <button class="btn btn-save" onclick="saveCollectionChanges('${tabName}')" id="btn-save-collection">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        Save All Changes to Firestore
      </button>
    </div>
  `;
}

// Save Shop Contact details back to Firebase
window.saveShopInfo = async function(e) {
  e.preventDefault();
  
  const saveBtn = document.getElementById("btn-save-shop");
  const originalHtml = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<span class="spinner"></span> Saving...`;

  const updatedData = {
    phone: document.getElementById("shop-phone").value.trim(),
    whatsapp: document.getElementById("shop-whatsapp").value.trim(),
    mail: document.getElementById("shop-email").value.trim(),
    business_hours: document.getElementById("shop-hours").value.trim(),
    weekdays_timing: document.getElementById("shop-weekdays").value.trim(),
    weekend_timing: document.getElementById("shop-weekend").value.trim(),
    short_address: document.getElementById("shop-short-address").value.trim(),
    address: document.getElementById("shop-address").value.trim(),
  };

  try {
    const docRef = doc(db, "shop-info", "base-info");
    await setDoc(docRef, updatedData);
    
    // Update local store copy
    localDataStore["shop-info"] = updatedData;
    showToast("Shop Info Saved", "Contact and address details successfully updated in Firestore.");
  } catch (error) {
    console.error("Firestore save error:", error);
    showToast("Save Failed", "Could not sync details with Firebase.", "error");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalHtml;
  }
};

// Reorder array items (Move Up/Down)
window.moveItem = function(tabName, index, direction) {
  const data = localDataStore[tabName];
  const items = data.cards || data.items || data.services || data.reviews || [];
  
  if (direction === 'up' && index > 0) {
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
  } else if (direction === 'down' && index < items.length - 1) {
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
  }

  // Re-render
  const container = document.getElementById(`${tabName}-panel`).querySelector(".panel-content-body");
  renderEditPanel(tabName, data, container);
};

// Delete item from local array
window.deleteItem = function(tabName, index) {
  if (!confirm("Are you sure you want to delete this item? Don't forget to click 'Save All Changes to Firestore' to apply it globally.")) {
    return;
  }

  const data = localDataStore[tabName];
  const items = data.cards || data.items || data.services || data.reviews || [];
  items.splice(index, 1);

  // Re-render
  const container = document.getElementById(`${tabName}-panel`).querySelector(".panel-content-body");
  renderEditPanel(tabName, data, container);
  showToast("Item Deleted Locally", "The item has been removed from your local draft.");
};

// Upload section contents to Firebase website collection
window.saveCollectionChanges = async function(tabName) {
  const saveBtn = document.getElementById("btn-save-collection");
  const originalHtml = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<span class="spinner"></span> Uploading...`;

  const docData = localDataStore[tabName];

  // Capture section level modifications from inputs if they exist
  const sloganInput = document.getElementById("section-slogan");
  if (sloganInput) {
    docData.slogan = sloganInput.value.trim();
  }

  // Capture defaults for services
  if (tabName === "services") {
    let defaultImage = document.getElementById("service-default-image").value.trim();
    const isDrive = document.getElementById("service-default-image-is-drive")?.checked;
    if (isDrive) {
      const driveId = extractDriveId(defaultImage);
      if (driveId) {
        defaultImage = `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`;
      }
    }
    docData.default = {
      title: document.getElementById("service-default-title").value.trim(),
      description: document.getElementById("service-default-desc").value.trim(),
      image: defaultImage,
      waMessage: document.getElementById("service-default-wa").value.trim(),
      showBadges: docData.default?.showBadges || false
    };
  }

  try {
    const docRef = doc(db, "website", tabName);
    await setDoc(docRef, docData);
    showToast("Changes Saved", `${tabName.toUpperCase()} section updated successfully in Firestore.`);
  } catch (error) {
    console.error("Firestore sync error:", error);
    showToast("Sync Error", `Could not update ${tabName}.`, "error");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalHtml;
  }
};

/* ==========================================================================
   Item Editor Modal
   ========================================================================== */
window.openItemModal = function(tabName, index) {
  editingItemIndex = index;
  const modal = document.getElementById("item-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  
  modalTitle.textContent = index === null ? `Add New Item` : `Edit Item Properties`;
  modalBody.innerHTML = "";

  const data = localDataStore[tabName];
  const items = data.cards || data.items || data.services || data.reviews || [];
  const item = index !== null ? items[index] : getNewItemTemplate(tabName);

  // Generate dynamic modal form fields based on tab requirements
  let formFields = "";

  switch (tabName) {
    case "why":
      formFields = `
        <div class="form-group">
          <label class="form-label">Card Title</label>
          <input type="text" class="form-input" id="m-why-title" value="${item.title || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Card Description</label>
          <textarea class="form-input" id="m-why-desc" required>${item.desc || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">SVG Icon String</label>
          <textarea class="form-input" id="m-why-icon" placeholder='<svg viewBox="0 0 24 24" ...>...</svg>' required>${item.icon || ''}</textarea>
        </div>
      `;
      break;
      
    case "services": {
      const servImgVal = item.image || 'assets/images/service_default.png';
      const isServImgDrive = isDriveThumbnailUrl(servImgVal);
      const displayServImg = isServImgDrive ? extractDriveId(servImgVal) : servImgVal;
      formFields = `
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Service ID (Unique, e.g. repair, screen)</label>
            <input type="text" class="form-input" id="m-serv-id" value="${item.id || ''}" placeholder="e.g. glass" ${index !== null ? 'disabled' : ''} required>
          </div>
          <div class="form-group">
            <label class="form-label">Service List Name</label>
            <input type="text" class="form-input" id="m-serv-name" value="${item.name || ''}" placeholder="e.g. Tempered Glass" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Detailed Title</label>
          <input type="text" class="form-input" id="m-serv-title" value="${item.title || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Service Description</label>
          <textarea class="form-input" id="m-serv-desc" required>${item.description || ''}</textarea>
        </div>
        <div class="form-group">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <label class="form-label" style="margin-bottom: 0;">Image Path / URL</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.75rem; color: var(--gray-light); font-weight: 500;">Drive Image</span>
              <label class="switch">
                <input type="checkbox" id="m-serv-image-is-drive" ${isServImgDrive ? 'checked' : ''} onchange="document.getElementById('m-serv-image').placeholder = this.checked ? 'Enter Google Drive URL or File ID' : 'assets/images/... or external URL'">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <input type="text" class="form-input" id="m-serv-image" value="${displayServImg}" placeholder="${isServImgDrive ? 'Enter Google Drive URL or File ID' : 'assets/images/... or external URL'}" required>
        </div>
        <div class="form-group">
          <label class="form-label">WhatsApp Contact Preset Message</label>
          <input type="text" class="form-input" id="m-serv-wa" value="${item.waMessage || ''}" required>
        </div>
        <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0;">
          <label class="form-label" style="margin-bottom: 0;">Show Brand Badges (Airtel, Jio, Vi)</label>
          <label class="switch">
            <input type="checkbox" id="m-serv-badges" ${item.showBadges ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
      `;
      break;
    }

    case "offers":
      formFields = `
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Offer ID (Unique Code)</label>
            <input type="text" class="form-input" id="m-off-id" value="${item.id || ''}" placeholder="e.g. cd4" ${index !== null ? 'disabled' : ''} required>
          </div>
          <div class="form-group">
            <label class="form-label">Offer Title</label>
            <input type="text" class="form-input" id="m-off-title" value="${item.title || ''}" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Offer Description</label>
          <textarea class="form-input" id="m-off-desc" required>${item.desc || ''}</textarea>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Badge Name</label>
            <input type="text" class="form-input" id="m-off-badge" value="${item.badge || ''}" placeholder="e.g. Limited Time">
          </div>
          <div class="form-group">
            <label class="form-label">Badge Styling Class (e.g. 'hot' for orange/gold)</label>
            <input type="text" class="form-input" id="m-off-class" value="${item.badgeClass || ''}" placeholder="e.g. hot">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Expiration Date-Time</label>
          <input type="datetime-local" class="form-input" id="m-off-expires" value="${formatDateTimeLocal(item.expiresAt)}" required>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">WhatsApp Preset Message</label>
            <input type="text" class="form-input" id="m-off-wa" value="${item.waText || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">WhatsApp Button text</label>
            <input type="text" class="form-input" id="m-off-wabtn" value="${item.waBtnText || 'Avail Offer'}" required>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 12px 16px; margin-top: 15px; display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <label class="form-label" style="margin-bottom: 0;">Show Fire Emoji 🔥</label>
            <label class="switch">
              <input type="checkbox" id="m-off-fire" ${item.fire ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <label class="form-label" style="margin-bottom: 0;">Show Target End Date (Text display)</label>
            <label class="switch">
              <input type="checkbox" id="m-off-showend" ${item.showEndDate ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <label class="form-label" style="margin-bottom: 0;">Enable Offer (If unchecked, won't show)</label>
            <label class="switch">
              <input type="checkbox" id="m-off-enabled" ${item.enabled !== false ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>
      `;
      break;

    case "partners": {
      const partLogoVal = item.logo || '';
      const isPartLogoDrive = isDriveThumbnailUrl(partLogoVal);
      const displayPartLogo = isPartLogoDrive ? extractDriveId(partLogoVal) : partLogoVal;
      formFields = `
        <div class="form-group">
          <label class="form-label">Partner Brand Name</label>
          <input type="text" class="form-input" id="m-part-name" value="${item.name || ''}" required>
        </div>
        <div class="form-group">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <label class="form-label" style="margin-bottom: 0;">Brand Logo Path (White/Transparent PNG recommended)</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.75rem; color: var(--gray-light); font-weight: 500;">Drive Image</span>
              <label class="switch">
                <input type="checkbox" id="m-part-logo-is-drive" ${isPartLogoDrive ? 'checked' : ''} onchange="document.getElementById('m-part-logo').placeholder = this.checked ? 'Enter Google Drive URL or File ID' : 'assets/images/... or external URL'">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <input type="text" class="form-input" id="m-part-logo" value="${displayPartLogo}" placeholder="${isPartLogoDrive ? 'Enter Google Drive URL or File ID' : 'assets/images/... or external URL'}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Partnership Badge</label>
          <input type="text" class="form-input" id="m-part-badge" value="${item.badge || 'Official Partner'}" required>
        </div>
      `;
      break;
    }

    case "products":
      formFields = `
        <div class="form-group">
          <label class="form-label">Product Name</label>
          <input type="text" class="form-input" id="m-prod-name" value="${item.name || ''}" placeholder="e.g. Smartphones" required>
        </div>
        <div class="form-group">
          <label class="form-label">Product Description</label>
          <input type="text" class="form-input" id="m-prod-desc" value="${item.desc || ''}" placeholder="e.g. Budget to flagship options" required>
        </div>
        <div class="form-group">
          <label class="form-label">SVG Outline Icon String</label>
          <textarea class="form-input" id="m-prod-icon" placeholder='<svg viewBox="0 0 24 24" ...>...</svg>' required>${item.icon || ''}</textarea>
        </div>
      `;
      break;

    case "accessories": {
      const accImgVal = item.image || '';
      const isAccImgDrive = isDriveThumbnailUrl(accImgVal);
      const displayAccImg = isAccImgDrive ? extractDriveId(accImgVal) : accImgVal;
      formFields = `
        <div class="form-group">
          <label class="form-label">Accessory Name</label>
          <input type="text" class="form-input" id="m-acc-name" value="${item.name || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Accessory Description</label>
          <textarea class="form-input" id="m-acc-desc" required>${item.desc || ''}</textarea>
        </div>
        <div class="form-group">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <label class="form-label" style="margin-bottom: 0;">Image Path / URL</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.75rem; color: var(--gray-light); font-weight: 500;">Drive Image</span>
              <label class="switch">
                <input type="checkbox" id="m-acc-image-is-drive" ${isAccImgDrive ? 'checked' : ''} onchange="document.getElementById('m-acc-image').placeholder = this.checked ? 'Enter Google Drive URL or File ID' : 'assets/images/... or external URL'">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <input type="text" class="form-input" id="m-acc-image" value="${displayAccImg}" placeholder="${isAccImgDrive ? 'Enter Google Drive URL or File ID' : 'assets/images/... or external URL'}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Image Alt Tag (SEO)</label>
          <input type="text" class="form-input" id="m-acc-alt" value="${item.alt || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">WhatsApp Enquiry Preset Text</label>
          <input type="text" class="form-input" id="m-acc-wa" value="${item.waText || ''}" required>
        </div>
      `;
      break;
    }

    case "gallery": {
      const gallImgVal = item.image || '';
      const isGallImgDrive = isDriveThumbnailUrl(gallImgVal);
      const displayGallImg = isGallImgDrive ? extractDriveId(gallImgVal) : gallImgVal;
      formFields = `
        <div class="form-group">
          <label class="form-label">Image Label / Title</label>
          <input type="text" class="form-input" id="m-gall-title" value="${item.title || ''}" placeholder="e.g. Store Front — Uchipuli" required>
        </div>
        <div class="form-group">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <label class="form-label" style="margin-bottom: 0;">Image Path / URL (Optional)</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.75rem; color: var(--gray-light); font-weight: 500;">Drive Image</span>
              <label class="switch">
                <input type="checkbox" id="m-gall-image-is-drive" ${isGallImgDrive ? 'checked' : ''} onchange="document.getElementById('m-gall-image').placeholder = this.checked ? 'Enter Google Drive URL or File ID' : 'assets/images/... or external URL'">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <input type="text" class="form-input" id="m-gall-image" value="${displayGallImg}" placeholder="${isGallImgDrive ? 'Enter Google Drive URL or File ID' : 'assets/images/... or external URL'}">
        </div>
        <div class="form-group">
          <label class="form-label">Layout Height Class (for Masonry Grid)</label>
          <select class="form-input" id="m-gall-height" style="background-color: var(--dark3); border-color: var(--glass-border);">
            <option value="h1" ${item.heightClass === 'h1' ? 'selected' : ''}>h1 (Taller - fits 1st slot spanning 2 rows)</option>
            <option value="h2" ${item.heightClass === 'h2' ? 'selected' : ''}>h2 (Medium - fits 2nd & 4th slots)</option>
            <option value="h3" ${item.heightClass === 'h3' ? 'selected' : ''}>h3 (Short - fits 3rd slot)</option>
            <option value="h4" ${item.heightClass === 'h4' ? 'selected' : ''}>h4 (Extra Short - fits 5th slot)</option>
          </select>
        </div>
      `;
      break;
    }

    case "reviews":
      formFields = `
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Customer Name</label>
            <input type="text" class="form-input" id="m-rev-name" value="${item.name || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Avatar Initials (2 Chars max)</label>
            <input type="text" class="form-input" id="m-rev-avatar" value="${item.avatar || ''}" maxlength="2" required>
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Stars Rating</label>
            <select class="form-input" id="m-rev-stars" style="background-color: var(--dark3); border-color: var(--glass-border);">
              <option value="★★★★★" ${item.stars === '★★★★★' ? 'selected' : ''}>★★★★★ (5 Stars)</option>
              <option value="★★★★" ${item.stars === '★★★★' ? 'selected' : ''}>★★★★ (4 Stars)</option>
              <option value="★★★" ${item.stars === '★★★' ? 'selected' : ''}>★★★ (3 Stars)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Verification Subtext</label>
            <input type="text" class="form-input" id="m-rev-verified" value="${item.verified || '✓ Verified Customer'}" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Customer Review Text</label>
          <textarea class="form-input" id="m-rev-text" required>${item.text || ''}</textarea>
        </div>
      `;
      break;

    case "faq":
      formFields = `
        <div class="form-group">
          <label class="form-label">Question</label>
          <input type="text" class="form-input" id="m-faq-q" value="${item.question || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Answer Text</label>
          <textarea class="form-input" id="m-faq-a" required>${item.answer || ''}</textarea>
        </div>
      `;
      break;
  }

  modalBody.innerHTML = `
    <form id="modal-item-form" onsubmit="saveItemProperties(event, '${tabName}')">
      ${formFields}
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeItemModal()">Cancel</button>
        <button type="submit" class="btn btn-save">Apply Settings</button>
      </div>
    </form>
  `;

  modal.classList.add("show");
};

// Item templates for new list additions
function getNewItemTemplate(tabName) {
  switch (tabName) {
    case "why":
      return { title: "", desc: "", icon: "" };
    case "services":
      return { id: "", name: "", title: "", description: "", image: "assets/images/service_default.png", waMessage: "", showBadges: false };
    case "offers":
      return { id: `cd_${Date.now()}`, fire: false, badge: "Limited Time", badgeClass: "", title: "", desc: "", expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(), showEndDate: false, enabled: true, waText: "", waBtnText: "Avail Offer" };
    case "partners":
      return { name: "", logo: "", badge: "Official Partner" };
    case "products":
      return { name: "", desc: "", icon: "" };
    case "accessories":
      return { name: "", desc: "", image: "", alt: "", waText: "" };
    case "reviews":
      return { stars: "★★★★★", text: "", avatar: "", name: "", verified: "✓ Verified Customer" };
    case "gallery":
      return { title: "", image: "", heightClass: "h2" };
    case "faq":
      return { question: "", answer: "" };
    default:
      return {};
  }
}

// Close Editor Modal
window.closeItemModal = function() {
  const modal = document.getElementById("item-modal");
  modal.classList.remove("show");
};

// Update local array store when Modal Form is submitted
window.saveItemProperties = function(e, tabName) {
  e.preventDefault();
  
  const data = localDataStore[tabName];
  const items = data.cards || data.items || data.services || data.reviews || [];
  
  let item = {};
  
  switch (tabName) {
    case "why":
      item = {
        title: document.getElementById("m-why-title").value.trim(),
        desc: document.getElementById("m-why-desc").value.trim(),
        icon: document.getElementById("m-why-icon").value.trim()
      };
      break;
    case "services": {
      let servImg = document.getElementById("m-serv-image").value.trim();
      const isServImgDrive = document.getElementById("m-serv-image-is-drive")?.checked;
      if (isServImgDrive) {
        const driveId = extractDriveId(servImg);
        if (driveId) {
          servImg = `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`;
        }
      }
      item = {
        id: document.getElementById("m-serv-id").value.trim().toLowerCase().replace(/\s+/g, '-'),
        name: document.getElementById("m-serv-name").value.trim(),
        title: document.getElementById("m-serv-title").value.trim(),
        description: document.getElementById("m-serv-desc").value.trim(),
        image: servImg,
        waMessage: document.getElementById("m-serv-wa").value.trim(),
        showBadges: document.getElementById("m-serv-badges").checked
      };
      break;
    }
    case "offers": {
      const expiresInput = document.getElementById("m-off-expires").value;
      const expiresIso = expiresInput ? new Date(expiresInput).toISOString() : "";
      item = {
        id: document.getElementById("m-off-id").value.trim().toLowerCase().replace(/\s+/g, '-'),
        title: document.getElementById("m-off-title").value.trim(),
        desc: document.getElementById("m-off-desc").value.trim(),
        badge: document.getElementById("m-off-badge").value.trim(),
        badgeClass: document.getElementById("m-off-class").value.trim(),
        expiresAt: expiresIso,
        waText: document.getElementById("m-off-wa").value.trim(),
        waBtnText: document.getElementById("m-off-wabtn").value.trim(),
        fire: document.getElementById("m-off-fire").checked,
        showEndDate: document.getElementById("m-off-showend").checked,
        enabled: document.getElementById("m-off-enabled").checked
      };
      break;
    }
    case "partners": {
      let partLogo = document.getElementById("m-part-logo").value.trim();
      const isPartLogoDrive = document.getElementById("m-part-logo-is-drive")?.checked;
      if (isPartLogoDrive) {
        const driveId = extractDriveId(partLogo);
        if (driveId) {
          partLogo = `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`;
        }
      }
      item = {
        name: document.getElementById("m-part-name").value.trim(),
        logo: partLogo,
        badge: document.getElementById("m-part-badge").value.trim()
      };
      break;
    }
    case "products":
      item = {
        name: document.getElementById("m-prod-name").value.trim(),
        desc: document.getElementById("m-prod-desc").value.trim(),
        icon: document.getElementById("m-prod-icon").value.trim()
      };
      break;
    case "accessories": {
      let accImg = document.getElementById("m-acc-image").value.trim();
      const isAccImgDrive = document.getElementById("m-acc-image-is-drive")?.checked;
      if (isAccImgDrive) {
        const driveId = extractDriveId(accImg);
        if (driveId) {
          accImg = `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`;
        }
      }
      item = {
        name: document.getElementById("m-acc-name").value.trim(),
        desc: document.getElementById("m-acc-desc").value.trim(),
        image: accImg,
        alt: document.getElementById("m-acc-alt").value.trim(),
        waText: document.getElementById("m-acc-wa").value.trim()
      };
      break;
    }
    case "gallery": {
      let gallImg = document.getElementById("m-gall-image").value.trim();
      const isGallImgDrive = document.getElementById("m-gall-image-is-drive")?.checked;
      if (isGallImgDrive) {
        const driveId = extractDriveId(gallImg);
        if (driveId) {
          gallImg = `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`;
        }
      }
      item = {
        title: document.getElementById("m-gall-title").value.trim(),
        image: gallImg,
        heightClass: document.getElementById("m-gall-height").value
      };
      break;
    }
    case "reviews":
      item = {
        name: document.getElementById("m-rev-name").value.trim(),
        avatar: document.getElementById("m-rev-avatar").value.trim().toUpperCase(),
        stars: document.getElementById("m-rev-stars").value,
        verified: document.getElementById("m-rev-verified").value.trim(),
        text: document.getElementById("m-rev-text").value.trim()
      };
      break;
    case "faq":
      item = {
        question: document.getElementById("m-faq-q").value.trim(),
        answer: document.getElementById("m-faq-a").value.trim()
      };
      break;
  }

  // Update or append
  if (editingItemIndex !== null) {
    items[editingItemIndex] = item;
    showToast("Item Updated", "Properties updated in local draft.");
  } else {
    items.push(item);
    showToast("Item Added", "New item appended to local draft list.");
  }

  // Save back references to local state database object
  if (data.cards) data.cards = items;
  else if (data.items) data.items = items;
  else if (data.services) data.services = items;
  else if (data.reviews) data.reviews = items;

  closeItemModal();
  
  // Re-render dashboard
  const container = document.getElementById(`${tabName}-panel`).querySelector(".panel-content-body");
  renderEditPanel(tabName, data, container);
};

// Sidebar Toggle (Mobile)
window.toggleSidebar = function() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.toggle("open");
  }
};

// Close modal when clicking on backdrop
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("item-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeItemModal();
      }
    });
  }
  
  // Initialize Auth state check
  checkAuth();
});
