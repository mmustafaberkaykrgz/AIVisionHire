# 🚀 AI Interview Backend

Bu proje, yapay zeka destekli mülakat simülasyonu uygulamasının backend servisidir.

## 🛠 Gereksinimler

* **Node.js** (LTS sürümü önerilir)
* **MongoDB** (Local veya Atlas URI)

## ⚙️ Kurulum

1.  Projeyi klonlayın ve klasöre girin.
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  Ana dizinde `.env` dosyası oluşturun ve aşağıdaki değişkenleri tanımlayın:

    ```env
    PORT=5000
    MONGO_URI=mongodb+srv://<USER>:<PASS>@cluster.mongodb.net/ai-interview-db
    JWT_SECRET=gizli_key_buraya_yaz
    GEMINI_API_KEY=AIzaSy... (Gemini API Anahtarı)
    ```

## ▶️ Çalıştırma

Geliştirme modunda başlatmak için:

```bash
node server.js
# veya package.json scripti varsa: npm run dev
# 📡 API Dokümantasyonu

**Base URL:** `http://localhost:5000/api`

Tüm endpoint'ler JSON formatında veri alır ve döndürür.

---

## 🔐 1. Auth (Kimlik Doğrulama)

### Kayıt Ol
* **URL:** `/auth/register`
* **Method:** `POST`
* **Body:**
    ```json
    {
      "name": "Batu",
      "email": "batu@example.com",
      "password": "123456password"
    }
    ```

### Giriş Yap
* **URL:** `/auth/login`
* **Method:** `POST`
* **Body:**
    ```json
    {
      "email": "batu@example.com",
      "password": "123456password"
    }
    ```
* **Response:** (Bu `token` değerini saklayın, diğer isteklerde lazım olacak)
    ```json
    {
      "token": "eyJhbGciOiJIUzI1Ni...",
      "user": { "id": "...", "name": "Batu" }
    }
    ```

---

## 🎤 2. Mülakat İşlemleri

⚠️ **ÖNEMLİ:** Aşağıdaki tüm isteklere Header eklemelisiniz:
`Authorization: Bearer <TOKEN>`

### Mülakat Başlat (Soru Üret)
* **URL:** `/interview/start`
* **Method:** `POST`
* **Body:**
    ```json
    {
      "field": "React Native",
      "difficulty": "Junior"
    }
    ```
* **Response:**
    ```json
    {
      "interviewId": "65123abc...",
      "questions": [
        { "question": "What is JSX?", "order": 1 },
        { "question": "Explain State vs Props", "order": 2 }
      ]
    }
    ```

### Cevapları Gönder & Bitir
* **URL:** `/interview/submit`
* **Method:** `POST`
* **Body:**
    ```json
    {
      "interviewId": "65123abc...",  // /start endpointinden dönen ID
      "answers": [
        { "question": "What is JSX?", "answer": "It is syntax extension..." },
        { "question": "Explain State vs Props", "answer": "State is mutable..." }
      ]
    }
    ```
* **Response:** (AI Analizi Döner)
    ```json
    {
      "score": 85,
      "feedback": {
        "feedback": "Genel olarak iyi...",
        "strengths": ["React Hooks", "Component Structure"],
        "weaknesses": ["Performance Optimization"],
        "suggestions": ["Use useMemo more often"]
      }
    }
    ```

### Geçmiş Mülakatlarım
* **URL:** `/interview/my-interviews`
* **Method:** `GET`
* **Response:** Liste döner (Tarih, Puan, Alan).

### Tekil Mülakat Detayı
* **URL:** `/interview/:id` (Örn: `/interview/65123abc...`)
* **Method:** `GET`
* **Response:** O mülakata ait tüm sorular, cevaplar ve AI yorumunu döner.

---

## 📊 3. Dashboard & Analiz

⚠️ **Header:** `Authorization: Bearer <TOKEN>`

### Dashboard İstatistikleri
* **URL:** `/analytics/dashboard`
* **Method:** `GET`
* **Response:**
    ```json
    {
      "totalInterviews": 5,
      "averageScore": 72,
      "topStrengths": ["JavaScript", "CSS"],
      "topWeaknesses": ["Testing", "Docker"],
      "recentActivity": [...]
    }