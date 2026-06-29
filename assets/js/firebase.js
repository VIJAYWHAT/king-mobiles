// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import {
  getFirestore,
  doc,
  getDoc,
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
const analytics = getAnalytics(app);
const db = getFirestore(app);

/* ===============================
   Firestore Loader
================================ */
async function getWebsiteData(documentName) {
  try {
    const docRef = doc(db, "website", documentName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    console.warn(`${documentName} document not found.`);
    return null;
  } catch (err) {
    console.error(`Error loading ${documentName}:`, err);
    return null;
  }
}

window.getWebsiteData = getWebsiteData;

function formatPhoneNumber(phoneStr) {
  if (!phoneStr) return "";
  const clean = phoneStr.replace(/\D/g, "");
  if (clean.length === 12 && clean.startsWith("91")) {
    return (
      "+91 " +
      clean.slice(2, 6) +
      " " +
      clean.slice(6, 8) +
      " " +
      clean.slice(8, 12)
    );
  }
  if (clean.length === 10) {
    return (
      "+91 " +
      clean.slice(0, 4) +
      " " +
      clean.slice(4, 6) +
      " " +
      clean.slice(6, 10)
    );
  }
  return phoneStr;
}

async function fetchAddress() {
  try {
    const docRef = doc(db, "shop-info", "base-info");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();

      // Update contact details (phone, whatsapp, email)
      if (data.phone) {
        const cleanPhone = data.phone.replace(/[^\d+]/g, "");
        const dynamicPhoneHrefs = document.querySelectorAll(
          ".dynamic-phone-href",
        );
        dynamicPhoneHrefs.forEach((el) => {
          el.href = `tel:${cleanPhone}`;
        });
        const dynamicPhoneTexts = document.querySelectorAll(
          ".dynamic-phone-text",
        );
        dynamicPhoneTexts.forEach((el) => {
          el.textContent = formatPhoneNumber(data.phone);
        });
      }

      if (data.whatsapp) {
        const cleanWa = data.whatsapp.replace(/\D/g, "");
        window.shopWhatsappNumber = cleanWa;

        const dynamicWaHrefs = document.querySelectorAll(".dynamic-wa-href");
        dynamicWaHrefs.forEach((el) => {
          const waText = el.getAttribute("data-wa-text");
          if (waText) {
            el.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(waText)}`;
          } else {
            el.href = `https://wa.me/${cleanWa}`;
          }
        });

        const dynamicWaTexts = document.querySelectorAll(".dynamic-wa-text");
        dynamicWaTexts.forEach((el) => {
          el.textContent = formatPhoneNumber(data.whatsapp);
        });
      }

      if (data.mail) {
        const dynamicEmailHrefs = document.querySelectorAll(
          ".dynamic-email-href",
        );
        dynamicEmailHrefs.forEach((el) => {
          el.href = `mailto:${data.mail.trim()}`;
        });
        const dynamicEmailTexts = document.querySelectorAll(
          ".dynamic-email-text",
        );
        dynamicEmailTexts.forEach((el) => {
          el.textContent = data.mail.trim();
        });
      }

      if (data.address) {
        // Update all places where the address is located
        const dynamicAddresses = document.querySelectorAll(".dynamic-address");
        const formattedAddress = data.address.replace(/;\s*/g, "<br />");
        dynamicAddresses.forEach((el) => {
          el.innerHTML = formattedAddress;
        });

        const shortAddresses = document.querySelectorAll(
          ".dynamic-address-short",
        );
        shortAddresses.forEach((el) => {
          el.innerHTML = `${data.short_address} - open ${data.business_hours}.`;
        });

        if (data.business_hours) {
          const contactHours = document.querySelectorAll(
            ".dynamic-contact-hours",
          );
          contactHours.forEach((el) => {
            el.innerHTML = `${data.business_hours}<br /><span style="font-size: 0.8rem; color: var(--gray)">Open All Days <br /> Sun: ${data.weekend_timing} </span>`;
          });
        }

        if (data.weekdays_timing && data.weekend_timing) {
          const faqHours = document.querySelectorAll(".dynamic-faq-hours");
          faqHours.forEach((el) => {
            el.innerHTML = `We are open Monday to Saturday from ${data.weekdays_timing} and on Sunday from ${data.weekend_timing}. You can also reach us on WhatsApp at any time for queries, and we'll respond during business hours.`;
          });

          const weekdaysHours = document.querySelectorAll(
            ".dynamic-weekdays-hours",
          );
          weekdaysHours.forEach((el) => {
            el.innerHTML = data.weekdays_timing;
          });

          const weekendHours = document.querySelectorAll(
            ".dynamic-weekend-hours",
          );
          weekendHours.forEach((el) => {
            el.innerHTML = data.weekend_timing;
          });
        }
      }
    } else {
      console.log("No base-info document found!");
    }
  } catch (e) {
    console.error("Error fetching address from Firebase: ", e);
  }
}

// Call fetchAddress on page load
window.addEventListener("DOMContentLoaded", fetchAddress);
