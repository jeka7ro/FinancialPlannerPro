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

## 🔐 Autentificare și Roluri

### Utilizatori Predefiniți:
- **Admin:** `admin` / `admin123` - Acces complet la toate funcționalitățile
- **Manager:** `manager1` / `manager123` - Acces limitat la locațiile atribuite
- **Operator:** `operator1` / `operator123` - Acces limitat la locațiile atribuite

### Sistemul de Permisiuni:

#### 👑 **Admin**
- ✅ Acces complet la toate datele și funcționalitățile
- ✅ Poate crea, edita, șterge orice tip de date
- ✅ Poate gestiona toți utilizatorii și rolurile

#### 🏢 **Manager**
- ✅ Poate vedea doar locațiile atribuite
- ✅ Poate gestiona cabinele, sloturile și game mix-urile din locațiile sale
- ✅ Poate vedea facturile și documentele legale pentru locațiile sale
- ✅ Poate vedea rapoartele ONJN pentru locațiile sale
- ✅ Poate vedea furnizorii folosiți în locațiile sale
- ❌ Nu poate accesa datele altor locații

#### 👨‍💼 **Operator**
- ✅ Acces similar cu managerul, dar cu permisiuni limitate
- ✅ Poate vedea și gestiona datele din locațiile atribuite

## 💾 Persistența Datelor
Aplicația folosește date mock (simulate) care se salvează în localStorage-ul browser-ului. Aceasta înseamnă că:

✅ **Datele se salvează** între sesiuni  
✅ **Poți adăuga, edita, șterge** toate tipurile de date  
✅ **Modificările persistă** după refresh-ul paginii  
✅ **Fiecare browser** are propriile date  

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

## 👥 Gestionarea Utilizatorilor

### Crearea Utilizatorilor Noi:
1. Navighează la pagina **Users**
2. Apasă butonul **"Create User"**
3. Completează toate câmpurile obligatorii:
   - **Username** (obligatoriu)
   - **Email** (obligatoriu)
   - **Password** (obligatoriu)
   - **Telephone** (opțional)
   - **First Name** (opțional)
   - **Last Name** (opțional)
   - **Role** (obligatoriu)
   - **Assigned Locations** (obligatoriu - cel puțin o locație)

### Editarea Utilizatorilor:
1. Apasă butonul **Edit** lângă utilizatorul dorit
2. Modifică câmpurile necesare
3. **Pentru parolă:** Completează câmpul "New Password" doar dacă vrei să schimbi parola
4. **Locații:** Selectează/deselectează locațiile atribuite
5. Apasă **"Update User"**

### Rolurile Disponibile:
- **Admin:** Acces complet
- **Manager:** Acces la locațiile atribuite
- **Operator:** Acces limitat la locațiile atribuite
- **Viewer:** Acces doar pentru vizualizare

## 🏢 Gestionarea Locațiilor

### Atribuirea Managerilor:
1. Creează un utilizator cu rolul **Manager**
2. În formularul de creare, selectează locațiile pe care managerul le va gestiona
3. Managerul va vedea doar datele legate de acele locații

### Ce Vede un Manager:
- ✅ **Locațiile atribuite** și informațiile lor
- ✅ **Cabinele** din locațiile sale
- ✅ **Sloturile** din locațiile sale
- ✅ **Game Mix-urile** folosite în locațiile sale
- ✅ **Facturile** pentru locațiile sale
- ✅ **Documentele legale** pentru locațiile sale
- ✅ **Rapoartele ONJN** pentru locațiile sale
- ✅ **Furnizorii** folosiți în locațiile sale
- ❌ **Nu vede** datele altor locații

## 🔧 Funcționalități Principale

### Dashboard
- Vizualizare generală a performanței
- Statistici și metrici importante
- Harta locațiilor cu filtrare

### Gestionarea Datelor
- **Companies:** Gestionarea companiilor
- **Locations:** Gestionarea locațiilor
- **Cabinets:** Gestionarea cabinelor
- **Slots:** Gestionarea sloturilor
- **Game Mixes:** Gestionarea game mix-urilor
- **Providers:** Gestionarea furnizorilor
- **Users:** Gestionarea utilizatorilor

### Documente și Rapoarte
- **Invoices:** Gestionarea facturilor
- **Legal Documents:** Documente legale
- **ONJN Reports:** Rapoarte ONJN
- **Rent Management:** Gestionarea închirierilor

## 🎨 Interfața

### Design Modern
- Interfață cu temă gaming
- Efecte vizuale și animații
- Layout responsive pentru toate dispozitivele

### Navigare Intuitivă
- Meniu lateral cu toate secțiunile
- Breadcrumbs pentru navigare
- Căutare și filtrare avansată

## 🔍 Căutare și Filtrare

### Căutare Globală
- Caută în toate câmpurile text
- Rezultate în timp real
- Filtrare după status și tip

### Paginare
- Navigare prin pagini
- Setarea numărului de rezultate per pagină
- Informații despre totalul de rezultate

## 📱 Responsive Design
- Funcționează pe desktop, tablet și mobil
- Meniu adaptiv pentru ecrane mici
- Tabele cu scroll orizontal pe mobile

## 🚨 Notificări și Feedback
- Toast notifications pentru acțiuni
- Mesaje de confirmare pentru operații critice
- Indicatori de loading pentru operații

## 🔒 Securitate
- Autentificare obligatorie
- Roluri și permisiuni
- Filtrare automată a datelor în funcție de rol

## 📊 Export și Import
- Export de date în format CSV
- Import de date din fișiere
- Backup și restore al datelor

## 🆘 Suport
Pentru probleme sau întrebări:
1. Verifică consola browser-ului pentru erori
2. Asigură-te că ești autentificat
3. Verifică permisiunile rolului tău
4. Încearcă să refresh-ezi pagina

## 🔄 Actualizări Recente
- ✅ Sistem de permisiuni pentru manageri
- ✅ Câmp pentru parolă în editarea utilizatorilor
- ✅ Filtrare automată a datelor în funcție de rol
- ✅ Persistența datelor în localStorage
- ✅ Interfață îmbunătățită și responsive 