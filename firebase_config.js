// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { getDatabase, ref, update, set } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// Firebase configuration object containing all necessary keys
const firebaseConfig = {
  apiKey: "AIzaSyArmh_5c2TI37fR9UiKv8Zt_Toy-UNTwzk",
  authDomain: "website-hotel-d0944.firebaseapp.com",
  databaseURL: "https://website-hotel-d0944-default-rtdb.firebaseio.com",
  projectId: "website-hotel-d0944",
  storageBucket: "website-hotel-d0944.appspot.com",
  messagingSenderId: "1092884245966",
  appId: "1:1092884245966:web:ca723170ff5fcf9a6f8f9f",
  measurementId: "G-S3LCNK9LX5"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig); // Main Firebase app
const auth = getAuth(app); // Authentication service
const db = getFirestore(app); // Firestore database
const realtimeDb = getDatabase(app); // Realtime Database

// Main initialization when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
  initAuthSystem(); // Set up authentication state tracking
  setupUIEventListeners(); // Set up all UI interactions
  setupBookingButtons(); // Configure booking button behavior
});

/**
 * Initializes the authentication system and tracks user state changes
 */
function initAuthSystem() {
  // Listen for authentication state changes
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
      localStorage.setItem('loggedInUserId', user.uid); // Store user ID in localStorage
      const loginBtn = document.getElementById('loginBtn');
      if (loginBtn) loginBtn.textContent = 'Logout'; // Update login button text
      
      try {
        // Prepare update data with current timestamp
        const userRef = doc(db, "users", user.uid);
        const updateData = { lastLogin: new Date().toISOString() };
        
        // Update both Firestore and Realtime Database
        await Promise.all([
          updateDoc(userRef, updateData),
          update(ref(realtimeDb, 'users/' + user.uid), updateData)
        ]);

        // Get updated user data
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          updateUIWithUserData(userData); // Update UI with user information
        }
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    } else {
      // User is signed out
      localStorage.removeItem('loggedInUserId'); // Remove stored user ID
      const loginBtn = document.getElementById('loginBtn');
      if (loginBtn) loginBtn.textContent = 'Login'; // Reset login button text
      resetUI(); // Clear user-related UI elements
    }
  });
}

/**
 * Updates the UI with user data
 * @param {Object} userData - User data object containing name and other info
 */
function updateUIWithUserData(userData) {
  const loggedUsername = document.getElementById("loggedUsername");
  const userAvatar = document.getElementById("userAvatar");
  
  // Update username display
  if (loggedUsername) loggedUsername.textContent = userData.name || 'User';
  // Update avatar with first letter of name
  if (userAvatar) userAvatar.textContent = (userData.name || 'U').charAt(0).toUpperCase();
}

/**
 * Resets UI elements when user logs out
 */
function resetUI() {
  const loggedUsername = document.getElementById("loggedUsername");
  const userAvatar = document.getElementById("userAvatar");
  
  if (loggedUsername) loggedUsername.textContent = '';
  if (userAvatar) userAvatar.textContent = '';
}

/**
 * Sets up booking buttons with authentication check
 */
function setupBookingButtons() {
  // Get all booking buttons with class 'btn btn-primary'
  const pesanButtons = document.querySelectorAll('.btn.btn-primary');
  
  // Add click event to each button
  pesanButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Check if user is logged in
      const loggedInUserId = localStorage.getItem('loggedInUserId');
      
      if (!loggedInUserId) {
        e.preventDefault(); // Prevent default action
        
        // Show SweetAlert message prompting login
        Swal.fire({
          title: 'Login Required',
          text: 'Silakan login terlebih dahulu untuk melakukan pemesanan',
          icon: 'warning',
          confirmButtonText: 'Login',
          showCancelButton: true,
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            // Show login modal if user clicks Login
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
              loginModal.style.display = 'flex';
              document.body.style.overflow = 'hidden';
            }
          }
        });
      } else {
        // User is logged in - redirect to booking page
        window.location.href = 'booking.html';
      }
    });
  });
}

/**
 * Sets up all UI event listeners for the application
 */
function setupUIEventListeners() {
  // Get all necessary DOM elements
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const closeModal = document.getElementById('closeModal');
  const closeRegisterModal = document.getElementById('closeRegisterModal');
  const registerLink = document.getElementById('registerLink');
  const loginLink = document.getElementById('loginLink');
  const scrollDown = document.getElementById('scrollDown');
  const navbar = document.getElementById('navbar');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Mobile menu toggle functionality
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      // Toggle hamburger icon between bars and X
      hamburger.innerHTML = navLinks.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }

  // Scroll down button functionality
  if (scrollDown) {
    scrollDown.addEventListener('click', () => {
      window.scrollBy({
        top: window.innerHeight - 100,
        behavior: 'smooth'
      });
    });
  }

  // Navbar scroll effect - adds/removes 'scrolled' class
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Login button behavior - handles both login and logout
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (auth.currentUser) {
        // User is logged in - show logout confirmation
        Swal.fire({
          title: 'Logout?',
          text: 'Are you sure you want to logout?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, logout'
        }).then((result) => {
          if (result.isConfirmed) {
            signOut(auth); // Sign out user
          }
        });
      } else {
        // User is not logged in - show login modal
        if (loginModal) {
          loginModal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      }
    });
  }

  // Modal close buttons functionality
  if (closeModal && loginModal) {
    closeModal.addEventListener('click', () => {
      loginModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  }

  if (closeRegisterModal && registerModal) {
    closeRegisterModal.addEventListener('click', () => {
      registerModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  }

  // Toggle between login and register modals
  if (registerLink && loginModal && registerModal) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginModal.style.display = 'none';
      registerModal.style.display = 'flex';
    });
  }

  if (loginLink && loginModal && registerModal) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      registerModal.style.display = 'none';
      loginModal.style.display = 'flex';
    });
  }

  // Close modals when clicking outside the modal content
  window.addEventListener('click', (e) => {
    if (loginModal && e.target === loginModal) {
      loginModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
    if (registerModal && e.target === registerModal) {
      registerModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Close mobile menu if open
        if (navLinks) navLinks.classList.remove('active');
        if (hamburger) hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        
        // Calculate scroll position accounting for navbar height
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = targetElement.offsetTop - navbarHeight;
        
        // Smooth scroll to target
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Setup form handlers for login and registration
  setupFormHandlers();
}

/**
 * Sets up form handlers for login and registration forms
 */
function setupFormHandlers() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');

  // Login Form Handler
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Get form values
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      // Validate inputs
      if (!email || !password) {
        showMessage('Email and password are required', 'error');
        return;
      }

      // Hide modal and show loading
      if (loginModal) {
        loginModal.style.display = "none";
        document.body.style.overflow = 'auto';
      }
      showLoading('Logging in...');

      try {
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Prepare update data with current timestamp
        const updateData = { lastLogin: new Date().toISOString() };
        
        // Update both databases
        await Promise.all([
          updateDoc(doc(db, "users", user.uid), updateData),
          update(ref(realtimeDb, 'users/' + user.uid), updateData)
        ]);

        showMessage('Login successful!', 'success');
        
        // Redirect after successful login
        setTimeout(() => {
          window.location.href = './pelanggan.html';
        }, 1500);

      } catch (error) {
        handleAuthError(error); // Handle any errors
        if (loginModal) {
          loginModal.style.display = "flex";
          document.body.style.overflow = 'hidden';
        }
      }
    });
  }

  // Register Form Handler
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Get form values
      const name = document.getElementById("registerName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Validate inputs
      if (!name || !email || !password || !confirmPassword) {
        showMessage('All fields are required', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
      }

      if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
      }

      // Hide modal and show loading
      if (registerModal) {
        registerModal.style.display = "none";
        document.body.style.overflow = 'auto';
      }
      showLoading('Creating your account...');

      try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Prepare user data object
        const userData = {
          name: name,
          email: email,
          password: password, // Note: In production, you shouldn't store passwords like this
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          role: 'user' // Default role
        };

        // Save user data to both databases
        await Promise.all([
          setDoc(doc(db, "users", user.uid), userData),
          set(ref(realtimeDb, 'users/' + user.uid), userData)
        ]);

        showMessage('Account created successfully!', 'success');
        
        // Redirect after successful registration
        setTimeout(() => {
          window.location.href = 'pelanggan.html';
        }, 1500);

      } catch (error) {
        handleAuthError(error); // Handle any errors
        if (registerModal) {
          registerModal.style.display = "flex";
          document.body.style.overflow = 'hidden';
        }
      }
    });
  }
}

/**
 * Shows a message using SweetAlert
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success', 'error', etc.)
 */
function showMessage(message, type) {
  Swal.fire({
    title: type === 'success' ? 'Success!' : 'Error!',
    text: message,
    icon: type,
    timer: 3000,
    showConfirmButton: false
  });
}

/**
 * Shows a loading indicator using SweetAlert
 * @param {string} message - The loading message to display
 */
function showLoading(message) {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });
}

/**
 * Handles authentication errors and displays appropriate messages
 * @param {Object} error - The error object from Firebase
 */
function handleAuthError(error) {
  let errorMessage = "An error occurred";
  switch (error.code) {
    case 'auth/invalid-email':
      errorMessage = "Invalid email format";
      break;
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      errorMessage = "Invalid email or password";
      break;
    case 'auth/too-many-requests':
      errorMessage = "Too many attempts. Try again later";
      break;
    case 'auth/user-disabled':
      errorMessage = "This account has been disabled";
      break;
    case 'auth/email-already-in-use':
      errorMessage = "This email is already registered";
      break;
    case 'auth/weak-password':
      errorMessage = "Password is too weak";
      break;
    default:
      errorMessage = error.message;
  }
  showMessage(errorMessage, 'error');
}
