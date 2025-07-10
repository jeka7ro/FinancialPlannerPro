# Financial Planner Pro

Sistem complet de management pentru industria gaming cu backend Node.js/Express și frontend React.

## 🚀 Deploy Rapid

### 1. Backend + PostgreSQL pe Render
```bash
# 1. Intră pe https://dashboard.render.com/
# 2. New → PostgreSQL (nume: cashpot-gaming-db)
# 3. New → Web Service (nume: cashpot-backend)
# 4. Connectează repo-ul GitHub
# 5. Build Command: npm install
# 6. Start Command: node real-server.js
# 7. Environment Variables: DATABASE_URL (din PostgreSQL)
```

### 2. Frontend pe Vercel
```bash
# 1. Intră pe https://vercel.com/
# 2. New Project → Importează repo-ul
# 3. Root Directory: client
# 4. Build Command: npm run build
# 5. Output Directory: dist
# 6. Environment Variables: VITE_API_URL=https://cashpot-backend.onrender.com
```

## 🏃‍♂️ Rulare Locală

### Backend
   ```bash
   npm install
node real-server.js
   ```

### Frontend
   ```bash
cd client
npm install
   npm run dev
   ```

## 📊 Baza de Date
- PostgreSQL cu toate tabelele necesare
- Date de test incluse
- Migrații automate

## 🔐 Autentificare
- **Admin:** admin / admin123
- JWT tokens
- Securitate completă

## 🌐 Acces Online
- Aplicația va fi accesibilă de oriunde
- Multi-user support
- Date sincronizate în cloud

## 📁 Structura Proiectului
```
├── real-server.js          # Backend principal
├── client/                 # Frontend React
├── shared/                 # Schema comună
├── migrations/             # Migrații DB
└── render.yaml            # Configurare Render
```