# Deploy pe Vercel - Ghid Complet

## Prezentare Generală

Acest ghid te va ajuta să faci deploy aplicației FinancialPlannerPro pe Vercel, păstrând toate datele și utilizatorii.

## ⚠️ Important: Limitările Vercel

**Vercel nu este ideal pentru aplicații cu date persistente locale!**

### Ce se întâmplă la deploy pe Vercel:
- ✅ **Frontend-ul** (React/Vite) va funcționa perfect
- ✅ **Backend-ul** (Node.js/Express) va rula ca serverless functions
- ❌ **Fișierele locale** (uploads, atașamente) NU vor fi păstrate
- ❌ **Baza de date locală** (SQLite) NU va fi păstrată
- ❌ **Utilizatorii** salvați local vor fi pierduți la fiecare deploy

## 🚀 Opțiuni de Deploy

### Opțiunea 1: Deploy Complet (Recomandată)
**Frontend pe Vercel + Backend pe Railway + Baza de date externă**

1. **Creează o bază de date externă:**
   - [Neon](https://neon.tech) (PostgreSQL)
   - [PlanetScale](https://planetscale.com) (MySQL)
   - [Supabase](https://supabase.com) (PostgreSQL)

2. **Deploy backend pe Railway:**
   ```bash
   # Clonează repo-ul pe Railway
   # Setează DATABASE_URL în variabilele de mediu
   ```

3. **Deploy frontend pe Vercel:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

### Opțiunea 2: Deploy Doar Frontend pe Vercel
**Backend local + Frontend pe Vercel**

1. Rulează backend-ul local:
   ```bash
   npm run dev
   ```

2. Deploy frontend pe Vercel cu proxy către backend local

### Opțiunea 3: Deploy Full-Stack pe Vercel (Limitări)
**Totul pe Vercel, dar cu limitări**

## 📋 Pași pentru Deploy Full-Stack pe Vercel

### 1. Pregătirea Proiectului

```bash
# Asigură-te că ești în directorul principal
cd /Users/eugeniucazmal/dev/FinancialPlannerPro

# Verifică că toate dependențele sunt instalate
npm install
cd client && npm install && cd ..
```

### 2. Configurarea Bazei de Date

**Opțiunea A: Neon (Recomandată)**
1. Creează cont pe [neon.tech](https://neon.tech)
2. Creează un proiect nou
3. Copiază connection string-ul
4. Formatează-l: `postgresql://user:password@host/database`

**Opțiunea B: Supabase**
1. Creează cont pe [supabase.com](https://supabase.com)
2. Creează un proiect nou
3. Mergi la Settings > Database
4. Copiază connection string-ul

### 3. Configurarea Vercel

1. **Instalează Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login pe Vercel:**
   ```bash
   vercel login
   ```

3. **Configurează variabilele de mediu:**
   ```bash
   vercel env add DATABASE_URL
   # Introdu connection string-ul de la pasul 2
   
   vercel env add SESSION_SECRET
   # Generează un secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   vercel env add NODE_ENV
   # Introdu: production
   ```

### 4. Deploy-ul

```bash
# Deploy pentru prima dată
vercel --prod

# Pentru deploy-uri ulterioare
vercel --prod
```

### 5. Configurarea Domeniului

1. Mergi pe [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selectează proiectul
3. Mergi la Settings > Domains
4. Adaugă domeniul tău (opțional)

## 🔧 Configurații Importante

### Fișierele de Configurare

1. **`vercel.json`** - Configurația principală Vercel
2. **`.vercelignore`** - Fișiere excluse din deploy
3. **`vite.config.ts`** - Configurația build-ului
4. **`package.json`** - Scripturile de build

### Variabilele de Mediu Necesare

```env
DATABASE_URL=postgresql://user:password@host/database
SESSION_SECRET=your-64-character-secret
NODE_ENV=production
```

## 🗄️ Migrarea Datelor

### Dacă ai date locale de păstrat:

1. **Exportă datele din baza locală:**
   ```bash
   # Pentru SQLite
   sqlite3 your-database.db ".dump" > backup.sql
   ```

2. **Importă în baza externă:**
   ```bash
   # Pentru PostgreSQL
   psql $DATABASE_URL < backup.sql
   ```

3. **Migrează atașamentele:**
   - Mută fișierele din `uploads/` pe un serviciu de storage (S3, Cloudinary, etc.)
   - Actualizează codul pentru a folosi storage-ul extern

## 🚨 Probleme Comune și Soluții

### Eroare: "Could not find the build directory"
```bash
# Asigură-te că frontend-ul este build-uit
cd client && npm run build
```

### Eroare: "DATABASE_URL must be set"
```bash
# Verifică că variabila de mediu este setată
vercel env ls
```

### Eroare: "Module not found"
```bash
# Verifică că toate dependențele sunt instalate
npm install
cd client && npm install
```

### Aplicația nu se încarcă
1. Verifică log-urile în Vercel Dashboard
2. Asigură-te că backend-ul răspunde la `/api/*`
3. Verifică că frontend-ul este servit corect

## 📊 Monitorizare

### Log-urile Vercel
1. Mergi pe Vercel Dashboard
2. Selectează proiectul
3. Mergi la Functions
4. Vezi log-urile pentru fiecare funcție

### Performanța
1. Vercel Dashboard > Analytics
2. Monitorizează timpul de răspuns
3. Verifică erorile

## 🔄 Deploy-uri Automatice

### Conectarea cu GitHub
1. Push codul pe GitHub
2. Conectează repo-ul la Vercel
3. Fiecare push va declanșa un deploy automat

### Branch-uri
- `main` → Deploy de producție
- `develop` → Deploy de staging (opțional)

## 💡 Recomandări

### Pentru Producție:
1. **Folosește o bază de date externă** (Neon, Supabase)
2. **Mută atașamentele pe storage extern** (S3, Cloudinary)
3. **Configurează backup-uri automate**
4. **Monitorizează performanța**

### Pentru Development:
1. **Rulează backend-ul local**
2. **Deploy doar frontend-ul pe Vercel**
3. **Folosește proxy pentru API calls**

## 🆘 Suport

Dacă întâmpini probleme:
1. Verifică log-urile Vercel
2. Testează local cu `npm run dev`
3. Verifică configurația bazei de date
4. Asigură-te că toate variabilele de mediu sunt setate

---

**Notă:** Acest ghid presupune că ai deja o bază de date externă configurată. Dacă nu ai una, urmează pașii din secțiunea "Configurarea Bazei de Date". 