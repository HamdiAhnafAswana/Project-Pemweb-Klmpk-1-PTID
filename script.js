// Import modul Firebase yang diperlukan
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword, // Ditambahkan
  createUserWithEmailAndPassword // Jika diperlukan untuk registrasi
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyArmh_5c2TI37fR9UiKv8Zt_Toy-UNTwzk",
  authDomain: "website-hotel-d0944.firebaseapp.com",
  databaseURL: "https://website-hotel-d0944-default-rtdb.firebaseio.com",
  projectId: "website-hotel-d0944",
  storageBucket: "website-hotel-d0944.firebasestorage.app",
  messagingSenderId: "1092884245966",
  appId: "1:1092884245966:web:ca723170ff5fcf9a6f8f9f",
  measurementId: "G-S3LCNK9LX5"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(); // Layanan autentikasi
const db = getFirestore(); // Firestore database
const realtimeDb = getDatabase(); // Realtime Database

// Mendapatkan elemen DOM
const loggedUsername = document.getElementById("loggedUsername"); // Elemen untuk menampilkan nama user
const userAvatar = document.getElementById("userAvatar"); // Elemen untuk avatar user
const logoutButton = document.getElementById('logout'); // Tombol logout

// Di bagian script.js, tambahkan kode berikut:
document.addEventListener('DOMContentLoaded', function () {
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');
  const registerLink = document.getElementById('registerLink');
  const registerModal = document.getElementById('registerModal');
  const closeRegisterModal = document.getElementById('closeRegisterModal');
  const loginLink = document.getElementById('loginLink');

  // Buka modal login saat tombol login diklik
  if (loginBtn) {
    loginBtn.addEventListener('click', function (e) {
      e.preventDefault();
      loginModal.style.display = 'flex';
    });
  }

  // Tutup modal login
  if (closeModal) {
    closeModal.addEventListener('click', function () {
      loginModal.style.display = 'none';
    });
  }

  // Buka modal register dari link di modal login
  if (registerLink) {
    registerLink.addEventListener('click', function (e) {
      e.preventDefault();
      loginModal.style.display = 'none';
      registerModal.style.display = 'flex';
    });
  }

  // Tutup modal register
  if (closeRegisterModal) {
    closeRegisterModal.addEventListener('click', function () {
      registerModal.style.display = 'none';
    });
  }

  // Buka modal login dari link di modal register
  if (loginLink) {
    loginLink.addEventListener('click', function (e) {
      e.preventDefault();
      registerModal.style.display = 'none';
      loginModal.style.display = 'flex';
    });
  }

  // Tutup modal saat klik di luar area modal
  window.addEventListener('click', function (e) {
    if (e.target === loginModal) {
      loginModal.style.display = 'none';
    }
    if (e.target === registerModal) {
      registerModal.style.display = 'none';
    }
  });
});

// Fungsi untuk menangani login
async function handleLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Simpan informasi user ke localStorage
    localStorage.setItem('loggedInUserId', user.uid);
    
    // Tampilkan notifikasi sukses
    Swal.fire({
      icon: 'success',
      title: 'Login Berhasil!',
      text: 'Anda akan diarahkan ke halaman pelanggan.',
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      // Tutup modal login
      const loginModal = document.getElementById('loginModal');
      if (loginModal) loginModal.style.display = 'none';
      
      // Redirect ke halaman pelanggan.html
      window.location.href = 'pelanggan.html';
    });
    
  } catch (error) {
    console.error('Error login:', error);
    
    // Tampilkan pesan error ke user
    const errorMessage = getErrorMessage(error.code);
    const signInMessage = document.getElementById('signInMessage');
    
    if (signInMessage) {
      signInMessage.textContent = errorMessage;
      signInMessage.style.display = 'block';
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Login Gagal',
      text: errorMessage,
    });
  }
}

// Fungsi untuk mendapatkan pesan error yang lebih user-friendly
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Email tidak valid. Silakan masukkan email yang benar.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan.';
    case 'auth/user-not-found':
      return 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.';
    case 'auth/wrong-password':
      return 'Password salah. Silakan coba lagi.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan login. Silakan coba lagi nanti.';
    default:
      return 'Terjadi kesalahan saat login. Silakan coba lagi.';
  }
}

// Event listener untuk form login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Form tidak lengkap',
        text: 'Silakan isi email dan password dengan benar.',
      });
      return;
    }
    
    handleLogin(email, password);
  });
}

// Fungsi untuk memeriksa status login user
onAuthStateChanged(auth, (user) => {
  const loggedInUserId = localStorage.getItem('loggedInUserId'); // Ambil ID user dari localStorage

  // Jika ada user yang login
  if (loggedInUserId) {
    const docRef = doc(db, "users", loggedInUserId); // Referensi ke dokumen user

    // Ambil data user dari Firestore
    getDoc(docRef)
      .then((docsnap) => {
        if (docsnap.exists()) {
          const userData = docsnap.data(); // Data user

          // Update UI dengan data user
          if (loggedUsername) loggedUsername.textContent = userData.name;
          if (userAvatar) userAvatar.textContent = userData.name.charAt(0).toUpperCase();
        } else {
          console.log("Dokumen tidak ditemukan");
        }
      })
      .catch((error) => {
        console.log("Error mengambil dokumen", error);
      });
  } else {
    console.log("ID user tidak ditemukan di localStorage");
  }
});

// Fungsi logout
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    // Tampilkan konfirmasi logout
    Swal.fire({
      title: 'Apakah Anda yakin ingin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('loggedInUserId'); // Hapus ID user dari localStorage

        // Proses logout
        signOut(auth)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Logout Berhasil!',
              text: 'Anda telah berhasil logout.',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              window.location.href = 'index.html'; // Redirect ke halaman utama
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal Logout!',
              text: 'Terjadi kesalahan saat logout. Silakan coba lagi.',
            });
            console.error('Error saat logout:', error);
          });
      }
    });
  });
}

// Form Kontak
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault(); // Mencegah form submit default

    // Ambil nilai dari form
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subjectSelect = document.getElementById('subject');
    const subject = subjectSelect.options[subjectSelect.selectedIndex].text; // Teks yang dipilih (Question, Kritik, dll)
    const message = document.getElementById('message').value.trim();

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Email Tidak Valid!',
        text: 'Masukkan alamat email yang benar.',
        showClass: {
          popup: 'animate__animated animate__shakeX' // Animasi saat muncul
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp' // Animasi saat menghilang
        }
      });
      return;
    }

    // Tampilkan loading
    Swal.fire({
      title: 'Mengirim Pesan...',
      text: 'Harap tunggu sebentar.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Tampilkan indikator loading
      }
    });

    // Data pesan yang akan dikirim
    const messageData = {
      name,
      email,
      subject, // Simpan teks subject langsung ("Question", "Kritik", dll)
      message,
      timestamp: new Date().toISOString(), // Waktu pengiriman
      isRead: false, // Status belum dibaca
      isReplied: false // Status belum dibalas
    };

    try {
      // Simpan pesan ke Firestore
      await addDoc(collection(db, 'messages'), messageData);

      // Tampilkan pesan sukses
      Swal.fire({
        icon: 'success',
        title: 'Pesan Terkirim!',
        text: 'Pesan Anda telah berhasil dikirim! Kami akan menghubungi Anda segera.',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });

      contactForm.reset(); // Reset form
    } catch (error) {
      console.error('Error mengirim pesan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengirim!',
        text: 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi nanti.',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
    }
  });
}

// Fungsi untuk mendengarkan balasan pesan
function listenForReplies() {
  if (currentUser && currentUser.email) {
    // Query untuk mendapatkan balasan pesan
    const repliesQuery = query(
      collection(db, 'messageReplies'),
      where('customerEmail', '==', currentUser.email), // Filter berdasarkan email user
      orderBy('timestamp', 'desc'), // Urutkan berdasarkan waktu terbaru
      limit(5) // Batasi 5 dokumen terakhir
    );

    // Dengarkan perubahan pada query
    onSnapshot(repliesQuery, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') { // Jika ada dokumen baru
          const reply = change.doc.data();
          // Hitung selisih waktu dalam menit
          const replyTime = new Date(reply.timestamp);
          const now = new Date();
          const diffInMinutes = (now - replyTime) / (1000 * 60);

          // Jika balasan kurang dari 1 menit yang lalu
          if (diffInMinutes < 1) {
            showMessage('Anda menerima balasan baru dari admin. Silakan periksa email Anda.');
          }
        }
      });
    });
  }
}

// Variabel untuk menyimpan data user saat ini
let currentUser = null;

// Cek status login user
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    listenForReplies(); // Mulai mendengarkan balasan jika user login
  }
});

// Form Pemesanan
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Mencegah form submit default

    // Cek apakah user sudah login
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (!loggedInUserId) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Anda harus login terlebih dahulu untuk melakukan pemesanan.',
      });
      return;
    }

    // Ambil nama customer dengan berbagai alternatif selector
    let customerName = "";
    const bookingNameInput = document.getElementById("bookingName");

    if (bookingNameInput && bookingNameInput.value) {
      customerName = bookingNameInput.value.trim();
    } else {
      // Alternatif selector jika yang utama tidak ditemukan
      const altNameInputs = [
        document.querySelector("input[name='bookingName']"),
        document.querySelector("#bookingForm input[placeholder*='Nama']"),
        document.querySelector("#bookingForm input:first-of-type")
      ];

      for (const input of altNameInputs) {
        if (input && input.value) {
          customerName = input.value.trim();
          break;
        }
      }
    }

    // Ambil elemen form dengan pengecekan null
    const NIKElement = document.getElementById("NIK");
    const checkInElement = document.getElementById("checkIn");
    const checkOutElement = document.getElementById("checkOut");
    const totalDWSElement = document.getElementById("TotalDWS");
    const totalANKElement = document.getElementById("TotalANK");
    const keteranganElement = document.getElementById("KeteranganTambahan");
    const roomTitleElement = document.getElementById("selectedRoomTitle");
    const totalPriceElement = document.getElementById("totalPrice");

    // Nilai default jika elemen tidak ditemukan
    const NIK = NIKElement ? NIKElement.value : "";
    const startDate = checkInElement ? checkInElement.value : "";
    const endDate = checkOutElement ? checkOutElement.value : "";
    const TotalDWS = totalDWSElement ? totalDWSElement.value : "0";
    const TotalANK = totalANKElement ? totalANKElement.value : "0";

    let tambahanText = "";
    if (keteranganElement) {
      tambahanText = keteranganElement.options[keteranganElement.selectedIndex].text;
    }

    const roomTitle = roomTitleElement ? roomTitleElement.textContent : "";
    const totalCost = totalPriceElement ? totalPriceElement.innerText : "";

    // Tampilkan loading
    Swal.fire({
      title: 'Memproses Reservasi',
      text: 'Harap tunggu...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Referensi ke data booking di Realtime Database
    const bookingRef = ref(realtimeDb, "bookings");

    // Simpan data booking
    push(bookingRef, {
      userId: loggedInUserId,
      customerName: customerName,
      name: customerName,
      NIK: NIK,
      startDate: startDate,
      endDate: endDate,
      TotalDWS: TotalDWS,
      TotalANK: TotalANK,
      KeteranganTambahan: tambahanText,
      roomTitle: roomTitle,
      totalCost: totalCost,
      timestamp: new Date().toISOString() // Waktu pemesanan
    })
      .then(() => {
        // Tampilkan pesan sukses
        Swal.fire({
          icon: 'success',
          title: 'Reservasi Berhasil!',
          text: 'Reservasi Anda telah dikonfirmasi.',
        });
        bookingForm.reset(); // Reset form

        // Tutup modal booking jika ada
        const bookingModal = document.getElementById('bookingModal');
        if (bookingModal) {
          bookingModal.classList.remove('active');
        }
      })
      .catch((error) => {
        // Tampilkan pesan error
        Swal.fire({
          icon: 'error',
          title: 'Terjadi Kesalahan!',
          text: 'Gagal menyimpan reservasi. Silakan coba lagi.',
        });
        console.error('Error menyimpan booking:', error);
      });
  });
}

// Fungsi untuk menampilkan pesan notifikasi (jika diperlukan)
function showMessage(message) {
  // Implementasi notifikasi sesuai kebutuhan
  // Contoh sederhana:
  alert(message);
  // Atau bisa menggunakan SweetAlert2:
  // Swal.fire({
  //   icon: 'info',
  //   title: 'Notifikasi',
  //   text: message
  // });
}