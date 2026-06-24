// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTj15amzUJTRxJe_p5rTc5Xs7mLe-IB2g",
  authDomain: "king-mobiles-65149.firebaseapp.com",
  projectId: "king-mobiles-65149",
  storageBucket: "king-mobiles-65149.firebasestorage.app",
  messagingSenderId: "622681084323",
  appId: "1:622681084323:web:993b8808fd78ad95764a16",
  measurementId: "G-63KVLTVNKP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

async function fetchAddress() {
  try {
    const docRef = doc(db, "shop-info", "base-info");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.address) {
        // Update all places where the address is located
        const dynamicAddresses = document.querySelectorAll(".dynamic-address");
        const formattedAddress = data.address.replace(/;\s*/g, "<br />");
        dynamicAddresses.forEach(el => {
          el.innerHTML = formattedAddress;
        });

        const shortAddresses = document.querySelectorAll(".dynamic-address-short");
        shortAddresses.forEach(el => {
          el.innerHTML = `${data.short_address} - open ${data.business_hours}.`;
        });

        if (data.business_hours) {
          const contactHours = document.querySelectorAll(".dynamic-contact-hours");
          contactHours.forEach(el => {
            el.innerHTML = `${data.business_hours}<br /><span style="font-size: 0.8rem; color: var(--gray)">Open All Days <br /> Sun: ${data.weekend_timing} </span>`;
          });
        }

        if (data.weekdays_timing && data.weekend_timing) {
          const faqHours = document.querySelectorAll(".dynamic-faq-hours");
          faqHours.forEach(el => {
            el.innerHTML = `We are open Monday to Saturday from ${data.weekdays_timing} and on Sunday from ${data.weekend_timing}. You can also reach us on WhatsApp at any time for queries, and we'll respond during business hours.`;
          });

          const weekdaysHours = document.querySelectorAll(".dynamic-weekdays-hours");
          weekdaysHours.forEach(el => {
            el.innerHTML = data.weekdays_timing;
          });

          const weekendHours = document.querySelectorAll(".dynamic-weekend-hours");
          weekendHours.forEach(el => {
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
