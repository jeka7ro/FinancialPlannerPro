# Deployment pe Render.com

## Pași pentru deployment automat:

### 1. Creează cont pe Render.com
- Mergi pe [render.com](https://render.com)
- Înregistrează-te cu GitHub

### 2. Conectează repository-ul
- Apasă "New +" → "Blueprint"
- Conectează repository-ul tău de GitHub
- Render va detecta automat `render.yaml` și va configura totul

### 3. Așteaptă deployment-ul
- Render va crea automat:
  - Baza de date PostgreSQL
  - Aplicația web
  - Environment variables
  - Migrațiile bazei de date

### 4. Credențiale de login
- **Username:** `admin`
- **Password:** `admin123`

## Configurație automată:

Fișierul `render.yaml` configurează automat:
- ✅ Baza de date PostgreSQL gratuită
- ✅ Aplicația web cu Node.js
- ✅ Environment variables
- ✅ Health checks
- ✅ Auto-deploy din GitHub

## URL-ul aplicației:
După deployment, vei primi un URL de forma:
`https://financial-planner-pro.onrender.com`

## Suport:
- Dacă ai probleme, verifică log-urile în dashboard-ul Render
- Aplicația va fi disponibilă în câteva minute după push pe GitHub 