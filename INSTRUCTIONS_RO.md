# Financial Planner Pro - Instrucțiuni de Utilizare

## 🎯 Descriere
Financial Planner Pro este o aplicație web pentru gestionarea companiilor de gaming, locațiilor, furnizorilor și a tuturor aspectelor financiare și operaționale.

## 🚀 Cum să Pornești Aplicația

### 1. Pornește Serverul
```bash
cd /Users/eugeniucazmal/dev/FinancialPlannerPro
PORT=3002 npm run dev
```

### 2. Pornește Clientul (în alt terminal)
```bash
cd /Users/eugeniucazmal/dev/FinancialPlannerPro/client
npm run dev
```

### 3. Accesează Aplicația
Deschide browser-ul și navighează la: `http://localhost:5173`

## 🔐 Autentificare
- **Username:** admin
- **Password:** admin123

## 💾 Persistența Datelor
Aplicația folosește date mock (simulate) care se salvează în localStorage-ul browser-ului. Aceasta înseamnă că:

✅ **Datele se salvează** între sesiuni  
✅ **Poți adăuga** companii noi, locații, utilizatori, etc.  
✅ **Poți edita** datele existente  
✅ **Poți șterge** înregistrări  
✅ **Datele persistă** după refresh-ul paginii  

## 📋 Funcționalități Disponibile

### 🏢 Companii
- Adaugă companii noi
- Editează informațiile companiilor
- Șterge companii
- Caută în companii

### 📍 Locații
- Adaugă locații noi
- Asociază locațiile cu companii
- Editează informațiile locațiilor
- Șterge locații

### 👥 Utilizatori
- Adaugă utilizatori noi
- Asignează roluri (admin, manager, operator)
- Editează profilurile utilizatorilor
- Șterge utilizatori

### 🎮 Furnizori
- Adaugă furnizori noi
- Gestionează informațiile furnizorilor
- Editează datele furnizorilor
- Șterge furnizori

### 🎰 Cabinete
- Adaugă cabinete noi
- Asociază cabinetele cu furnizori
- Editează informațiile cabinetelelor
- Șterge cabinete

### 🎲 Game Mixes
- Adaugă game mixes noi
- Configurează jocurile din mix
- Editează game mixes
- Șterge game mixes

### 🎰 Sloturi
- Adaugă sloturi noi
- Asociază sloturile cu cabinete și game mixes
- Editează informațiile sloturilor
- Șterge sloturi

### 📄 Facturi
- Creează facturi noi
- Gestionează statusul facturilor
- Editează facturile
- Șterge facturi

### 📋 Documente Legale
- Adaugă documente legale
- Gestionează statusul documentelor
- Editează documentele
- Șterge documente

### 📊 Rapoarte ONJN
- Creează rapoarte ONJN
- Gestionează notificările
- Editează rapoartele
- Șterge rapoarte

## 🔧 Funcționalități Avansate

### 📊 Dashboard
- Vizualizează metrici financiare
- Vezi statistici despre locații
- Monitorizează activitatea recentă
- Accesează alerte de sistem

### 🔍 Căutare și Filtrare
- Caută în toate entitățile
- Filtrează după status
- Sortează datele
- Paginare avansată

### 📤 Import/Export
- Exportă date în CSV
- Importă date din fișiere
- Backup și restore

### 📎 Atașamente
- Încarcă fișiere
- Gestionează logo-urile
- Organizează documentele

## 🎨 Interfața
- Design modern și responsive
- Teme întunecate și deschise
- Navigare intuitivă
- Iconuri și vizualizări atractive

## 🛠️ Tehnologii Folosite
- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + Shadcn/ui
- **State Management:** React Query
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## 📱 Compatibilitate
- Desktop (Chrome, Firefox, Safari, Edge)
- Tablet
- Mobile (responsive design)

## 🔒 Securitate
- Autentificare mock
- Roluri și permisiuni
- Validare de date
- Sanitizare input

## 💡 Sfaturi de Utilizare
1. **Salvează-ți munca** - datele se salvează automat în localStorage
2. **Folosește căutarea** - pentru a găsi rapid informațiile
3. **Verifică statusul** - pentru a urmări progresul operațiunilor
4. **Exportă datele** - pentru backup sau analiză

## 🆘 Suport
Dacă întâmpini probleme:
1. Verifică dacă serverul rulează pe portul 3002
2. Verifică dacă clientul rulează pe portul 5173
3. Șterge localStorage-ul pentru a reseta datele mock
4. Repornește aplicația

## 🎯 Următorii Pași
Pentru a conecta aplicația la o bază de date reală:
1. Configurează o bază de date PostgreSQL
2. Modifică `apiRequest` pentru a face call-uri reale
3. Implementează autentificarea reală
4. Adaugă validări server-side

---

**Versiunea curentă:** Mock Data cu Persistență Local  
**Ultima actualizare:** Decembrie 2024  
**Status:** Funcțional pentru demo și testare 