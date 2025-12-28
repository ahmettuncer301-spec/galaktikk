// ==================================================================
// GALAKTİK SİLAH ATÖLYESİ - SUNUCU (BACKEND)
// RENDER İÇİN HAZIRLANMIŞ FİNAL SÜRÜM
// ==================================================================
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// RENDER İÇİN KRİTİK AYAR:
// Render'ın atadığı portu kullan, yoksa 3000'i kullan.
const PORT = process.env.PORT || 3000;

// Middleware'ler
app.use(cors()); // Farklı adreslerden (GitHub Pages) gelen isteklere izin ver
app.use(bodyParser.json()); // Gelen JSON verilerini okuyabil

// --- SİMÜLE EDİLMİŞ VERİTABANI (Geçici Hafıza) ---
// Not: Sunucu yeniden başladığında burası sıfırlanır.
let ordersDatabase = [];

// --- ADMİN AYARLARI ---
const ADMIN_CONFIG = {
    email: "admin@galaktik.com",
    password: "175017"
};
let currentAdminToken = null;

// ==================================================================
// API ROTALARI
// ==================================================================

// 0. ANA KÖK ROTA (Sunucunun çalıştığını test etmek için)
// Render linkine tıkladığında "Cannot GET /" hatası almamak için.
app.get('/', (req, res) => {
    res.send('Galaktik Sunucu Aktif! 🚀 (API rotaları /api altında çalışmaktadır.)');
});

// 1. ADMİN GİRİŞİ (POST)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password) {
        // Basit bir token oluştur (Gerçek hayatta JWT kullanılır)
        currentAdminToken = "ADMIN_TOKEN_" + Date.now() + Math.random().toString(36).substr(2);
        res.json({ success: true, token: currentAdminToken, message: "Giriş Başarılı!" });
    } else {
        res.status(401).json({ success: false, message: "Hatalı e-posta veya şifre!" });
    }
});

// 2. YENİ SİPARİŞ AL (POST)
app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    // Sunucu tarafında benzersiz ID ve tarih oluştur
    newOrder.serverID = 'SRV-' + Math.floor(100000 + Math.random() * 900000);
    newOrder.serverDate = new Date().toLocaleString('tr-TR');
    // Başlangıç durumu ekle
    newOrder.status = 'Hazırlanıyor';
    
    // Veritabanına kaydet
    ordersDatabase.push(newOrder);
    
    console.log(`📦 Yeni Sipariş Alındı: ${newOrder.serverID} (${newOrder.customerEmail})`);
    res.json({ success: true, orderID: newOrder.serverID });
});

// 3. ADMİN SİPARİŞLERİNİ LİSTELE (GET) - Korumalı Rota
app.get('/api/admin/orders', (req, res) => {
    // Header'dan token kontrolü yap
    const token = req.headers['authorization'];
    if (token === currentAdminToken && currentAdminToken !== null) {
        res.json(ordersDatabase);
    } else {
        res.status(403).json({ error: "Yetkisiz erişim! Lütfen giriş yapın." });
    }
});

// 4. ADMİN SİPARİŞ DURUMU GÜNCELLE (PUT) - Korumalı Rota
app.put('/api/admin/orders/:id/status', (req, res) => {
    const token = req.headers['authorization'];
    if (token !== currentAdminToken || currentAdminToken === null) {
        return res.status(403).json({ error: "Yetkisiz erişim!" });
    }

    const orderId = req.params.id;
    const { newStatus } = req.body;

    // Siparişi bul
    const order = ordersDatabase.find(o => o.serverID === orderId);
    if (order) {
        order.status = newStatus;
        console.log(`🔄 Sipariş Durumu Güncellendi: ${orderId} -> ${newStatus}`);
        res.json({ success: true, message: "Durum başarıyla güncellendi." });
    } else {
        res.status(404).json({ error: "Sipariş bulunamadı." });
    }
});

// 5. KULLANICI SİPARİŞLERİNİ GETİR (Bildirimler için) (GET)
app.get('/api/user/orders/:email', (req, res) => {
    const email = req.params.email;
    // E-postaya ait siparişleri filtrele
    const userOrders = ordersDatabase.filter(order => order.customerEmail === email);
    res.json(userOrders);
});

// ==================================================================
// SUNUCUYU BAŞLAT
// ==================================================================
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`🚀 GALAKTİK SUNUCU BAŞLATILDI!`);
    console.log(`📡 Port: ${PORT} üzerinde dinleniyor.`);
    console.log(`cloud environment: ${process.env.PORT ? 'EVET (Render)' : 'HAYIR (Yerel)'}`);
    console.log(`==========================================`);
});




