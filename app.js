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
    notifBtn.innerHTML = '🔔 Aktifkan Notifikasi';
    notifBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
        color: white;
        border: none;
        padding: 15px 25px;
        border-radius: 50px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
        z-index: 1000;
        transition: all 0.3s ease;
    `;

    notifBtn.addEventListener('mouseenter', () => {
        notifBtn.style.transform = 'translateY(-3px)';
        notifBtn.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)';
    });

    notifBtn.addEventListener('mouseleave', () => {
        notifBtn.style.transform = 'translateY(0)';
        notifBtn.style.boxShadow = '0 5px 15px rgba(59, 130, 246, 0.4)';
    });

    notifBtn.addEventListener('click', requestNotificationPermission);

    // Hide button if already granted
    if (Notification.permission === 'granted') {
        notifBtn.innerHTML = '✅ Notifikasi Aktif';
        notifBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        notifBtn.disabled = true;
        notifBtn.style.cursor = 'default';
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
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100())';
            btn.disabled = true;
            btn.style.cursor = 'default';

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
    if (Notification.permission === 'granted') {
        const defaultOptions = {
            body: body,
            icon: 'images/icons/icon-192x192.png',
            badge: 'images/icons/icon-192x192.png',
            vibrate: [200, 100, 200],
            tag: 'ruble-laundry',
            requireInteraction: false,
            ...options
        };

        // Use Service Worker to show notification if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, defaultOptions);
            });
        } else {
            // Fallback to regular notification
            new Notification(title, defaultOptions);
        }
    }
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
    testBtn.innerHTML = '🧪 Test Notifikasi';
    testBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4);
        z-index: 1000;
        transition: all 0.3s ease;
    `;

    testBtn.addEventListener('mouseenter', () => {
        testBtn.style.transform = 'translateY(-3px)';
    });

    testBtn.addEventListener('mouseleave', () => {
        testBtn.style.transform = 'translateY(0)';
    });

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