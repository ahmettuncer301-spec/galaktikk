// ==================================================================
// GALAKTİK SİLAH ATÖLYESİ - SUNUCU (BACKEND) - V2 (Durum Yönetimi)
// ==================================================================
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- SİMÜLE EDİLMİŞ VERİTABANI ---
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

// 1. ADMİN GİRİŞİ (POST)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password) {
        currentAdminToken = "ADMIN_TOKEN_" + Date.now() + Math.random().toString(36).substr(2);
        res.json({ success: true, token: currentAdminToken });
    } else {
        res.status(401).json({ success: false, message: "Hatalı giriş!" });
    }
});

// 2. YENİ SİPARİŞ AL (POST)
app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    newOrder.serverID = 'SRV-' + Math.floor(100000 + Math.random() * 900000);
    newOrder.serverDate = new Date().toLocaleString('tr-TR');
    // YENİ: Başlangıç durumu ekle
    newOrder.status = 'Hazırlanıyor';
    
    ordersDatabase.push(newOrder);
    console.log(`📦 Yeni Sipariş: ${newOrder.serverID} (${newOrder.customerEmail}) - Durum: Hazırlanıyor`);
    res.json({ success: true, orderID: newOrder.serverID });
});

// 3. ADMİN SİPARİŞLERİNİ LİSTELE (GET)
app.get('/api/admin/orders', (req, res) => {
    const token = req.headers['authorization'];
    if (token === currentAdminToken && currentAdminToken !== null) {
        res.json(ordersDatabase);
    } else {
        res.status(403).json({ error: "Yetkisiz erişim!" });
    }
});

// --- YENİ ROTALAR ---

// 4. YENİ: ADMİN SİPARİŞ DURUMU GÜNCELLE (PUT)
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
        console.log(`🔄 Sipariş Güncellendi: ${orderId} -> ${newStatus}`);
        res.json({ success: true, message: "Durum güncellendi." });
    } else {
        res.status(404).json({ error: "Sipariş bulunamadı." });
    }
});

// 5. YENİ: KULLANICI SİPARİŞLERİNİ GETİR (Bildirimler için) (GET)
app.get('/api/user/orders/:email', (req, res) => {
    const email = req.params.email;
    // E-postaya ait siparişleri filtrele
    const userOrders = ordersDatabase.filter(order => order.customerEmail === email);
    res.json(userOrders);
});

// ------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`🚀 Sunucu V2 Başlatıldı: http://localhost:${PORT}`);
});