// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered successfully:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Service Worker update found!');
                });

                // Initialize Push Notifications after SW registration
                initializePushNotifications(registration);
            })
            .catch(err => {
                console.error('❌ Service Worker registration failed:', err);
            });
    });
}

// Push Notifications Setup
function initializePushNotifications(registration) {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
        console.log('❌ Browser tidak mendukung notifikasi');
        return;
    }

    // Check current permission
    console.log('📬 Notification permission:', Notification.permission);

    // Add notification button to page
    addNotificationButton();
}

function addNotificationButton() {
    // Check if button already exists
    if (document.getElementById('notificationBtn')) return;

    // Create notification button
    const notifBtn = document.createElement('button');
    notifBtn.id = 'notificationBtn';
    notifBtn.className = 'floating-btn'; // Menggunakan class CSS
    notifBtn.innerHTML = '🔔 Aktifkan Notifikasi';

    notifBtn.addEventListener('click', requestNotificationPermission);

    // Hide button if already granted
    if (Notification.permission === 'granted') {
        notifBtn.innerHTML = '✅ Notifikasi Aktif';
        notifBtn.classList.add('active');
        notifBtn.disabled = true;
    }

    document.body.appendChild(notifBtn);
}

async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('✅ Notifikasi diizinkan!');
            showNotification('Terima kasih!', 'Notifikasi berhasil diaktifkan untuk Ruble Laundry');
            
            // Update button
            const btn = document.getElementById('notificationBtn');
            btn.innerHTML = '✅ Notifikasi Aktif';
            btn.classList.add('active');
            btn.disabled = true;

            // Schedule welcome notification
            scheduleWelcomeNotification();
        } else if (permission === 'denied') {
            console.log('❌ Notifikasi ditolak');
            alert('Anda menolak notifikasi. Anda bisa mengaktifkannya nanti di pengaturan browser.');
        } else {
            console.log('⚠️ Notifikasi diabaikan');
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
}

function showNotification(title, body, options = {}) {
    // Putar suara kustom (Hanya bekerja jika user sudah berinteraksi dengan halaman)
    const audio = new Audio('sounds/notification.mp3');
    audio.play().catch(e => console.log('Gagal memutar suara (perlu interaksi user):', e));

    // Tampilkan Toast di dalam aplikasi (agar selalu terlihat)
    showToast(title, body);

    if (Notification.permission === 'granted') {
        const defaultOptions = {
            body: body,
            icon: 'images/icons/icon-192x192.png',
            badge: 'images/icons/icon-192x192.png',
            vibrate: [200, 100, 200],
            sound: 'sounds/notification.mp3', // Properti standar (dukungan browser bervariasi)
            tag: 'ruble-laundry',
            requireInteraction: false,
            ...options
        };

        // Use Service Worker to show notification if available
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, defaultOptions);
            });
        } else {
            // Fallback to regular notification
            new Notification(title, defaultOptions);
        }
    }
}

// Fungsi baru untuk menampilkan Toast Notifikasi yang cantik
function showToast(title, message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        background: white;
        border-left: 5px solid #3b82f6;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 15px;
        min-width: 300px;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    
    toast.innerHTML = `
        <div class="toast-icon">🔔</div>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);

    // Animasi Masuk
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
    });

    // Hapus otomatis setelah 5 detik
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 5000);
}

function scheduleWelcomeNotification() {
    // Show a welcome notification after 5 seconds
    setTimeout(() => {
        showNotification(
            '🧺 Selamat Datang di Ruble Laundry!',
            'Kami siap melayani kebutuhan laundry Anda. Hubungi kami di 0812-3456-7890',
            {
                actions: [
                    { action: 'contact', title: '📱 Hubungi Kami' },
                    { action: 'close', title: '❌ Tutup' }
                ]
            }
        );
    }, 5000);
}

// Demo: Send notification button (for testing)
function addTestNotificationButton() {
    if (Notification.permission !== 'granted') return;

    const testBtn = document.createElement('button');
    testBtn.className = 'test-btn'; // Menggunakan class CSS
    testBtn.innerHTML = '🧪 Test Notifikasi';

    testBtn.addEventListener('click', () => {
        const messages = [
            { title: '🎉 Promo Spesial!', body: 'Diskon 20% untuk pelanggan baru. Promo terbatas!' },
            { title: '✅ Laundry Selesai!', body: 'Pakaian Anda sudah bersih dan siap diambil' },
            { title: '⏰ Reminder', body: 'Jangan lupa ambil laundry Anda hari ini!' },
            { title: '🚚 Antar Gratis!', body: 'Minimal 5kg, gratis antar jemput se-Bandung' }
        ];
        
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        showNotification(randomMsg.title, randomMsg.body);
    });

    document.body.appendChild(testBtn);
}

// Add test button after permission granted
setTimeout(() => {
    if (Notification.permission === 'granted') {
        addTestNotificationButton();
    }
}, 1000);

// Check online/offline status
function updateOnlineStatus() {
    const indicator = document.getElementById('offlineIndicator');
    
    if (navigator.onLine) {
        indicator.textContent = '🟢 Online';
        indicator.style.color = '#10b981';
    } else {
        indicator.textContent = '🔴 Offline Mode - Menggunakan Cache';
        indicator.style.color = '#ef4444';
    }
}

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial status check
window.addEventListener('load', updateOnlineStatus);

// Smooth scroll for internal links
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Add install prompt for PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    deferredPrompt = e;
    
    console.log('💡 PWA can be installed!');
    
    // You can show a custom install button here
    // For now, just log it
});

window.addEventListener('appinstalled', () => {
    console.log('✅ PWA was installed successfully!');
    deferredPrompt = null;
});