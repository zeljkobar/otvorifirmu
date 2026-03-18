# 📄 Sistem za generisanje dokumenata - Uputstvo

## ✅ Implementirane funkcionalnosti

### 1. **API rute**

- `POST /api/company-request/[id]/generate-documents` - Generiše PDF dokumente
- `GET /api/company-request/[id]/download/[filename]` - Download PDF-a

### 2. **Automatsko generisanje**

- Kada admin postavi status na `PAID`, automatski se pokreće generisanje dokumenata
- Dokumenti se čuvaju u `/generated-docs` folderu

### 3. **UI komponente**

- Dugme za ručno generisanje dokumenata (ako već ne postoje)
- Download linkovi za svaki generisani dokument
- Status indikatori i error handling

### 4. **Statut template**

- **Aktuelni template:** `doo-statut.hbs` - Statut jednočlanog D.O.O. društva
- **Zakonska osnova:** Zakon o privrednim društvima br. 090/25 od 06.08.2025
- **Struktura:** 14 članova (I-XIV) u skladu sa novim propisima
- **Originalni dokument:** `Statut DOO jednočlano.docx` (referentna verzija)

---

## 🚀 Kako testirati

### 1. **Priprema**

Pokreni dev server:

```bash
npm run dev
```

Proveri da li je baza seedovana (template mora postojati):

```bash
npx prisma db seed
```

### 2. **Kreiraj test zahtjev**

Opcija A - Kroz UI:

1. Registruj se na `/register`
2. Popuni wizard na `/wizard`
3. Submituj zahtjev

Opcija B - Skripta:

```bash
node scripts/create-test-company.js
```

### 3. **Simuliraj plaćanje**

Kao korisnik:

1. Idi na `/payment/[id]`
2. Klikni "Potvrdio sam plaćanje"

Kao admin:

1. Idi na `/admin`
2. Pronađi zahtjev
3. Postavi status na `PAID`
4. **Dokumenti se automatski generišu!**

### 4. **Download dokumenta**

Kao korisnik:

1. Idi na `/request/[id]`
2. Klikni "Download" na dokumentu
3. PDF se preuzima sa kompletnim statutom

---

## 🔧 Ručno generisanje (za testiranje)

Ako želiš ručno pozvati API bez UI-ja:

```bash
# Zameni [REQUEST_ID] sa ID-jem zahtjeva
curl -X POST http://localhost:3000/api/company-request/[REQUEST_ID]/generate-documents \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

Ili koristi test skriptu:

```bash
node scripts/test-document-generation.js [REQUEST_ID]
```

---

## 📂 Struktura fajlova

```
/generated-docs/               # Folder za PDF-ove (ignorisan u git)
  └── statut-ime-firme-123.pdf

/src/app/api/company-request/[id]/
  ├── generate-documents/route.ts  # Generiše PDF
  └── download/[filename]/route.ts # Download endpoint

/src/components/company-request/
  └── generate-documents-button.tsx # UI dugme

/templates/
  └── doo-statut.hbs            # Handlebars template

/scripts/
  └── test-document-generation.js # Test skripta
```

---

## 🎯 Flow rada sistema

1. **Korisnik kreira zahtjev** (`/wizard`)
   - Popunjava podatke o firmi i osnivačima
   - Status: `DRAFT`

2. **Korisnik potvrdi plaćanje** (`/payment/[id]`)
   - Status: `AWAITING_PAYMENT` → `PAYMENT_PENDING`

3. **Admin odobri plaćanje** (`/admin`)
   - Status: `PAID`
   - **Automatski** se pokreće generisanje dokumenata

4. **Sistem generiše PDF**
   - Učitava template iz baze
   - Popunjava podatke (Handlebars)
   - Puppeteer renderuje HTML → PDF
   - Čuva na disk (`/generated-docs`)
   - Kreira zapis u `GeneratedDocument` tabeli

5. **Korisnik preuzima dokument** (`/request/[id]`)
   - Vidi listu dokumenata
   - Klikne "Download"
   - PDF se preuzima

---

## 🔐 Sigurnost

- **Autentifikacija**: Samo ulogovani korisnici mogu pristupiti
- **Autorizacija**: Korisnici mogu downloadovati samo svoje dokumente
- **Admin pristup**: Admin može generisati i downloadovati sve dokumente
- **Validacija**: Dokumenti se mogu generisati samo ako je status `PAID` ili viši

---

## 🐛 Troubleshooting

### Problem: "Template not found"

**Rješenje**: Pokreni seed:

```bash
npx prisma db seed
```

### Problem: "Puppeteer error"

**Rješenje**: Instaliraj Chrome dependencies:

```bash
# macOS
brew install chromium

# Linux
sudo apt-get install chromium-browser
```

### Problem: "File not found on server"

**Rješenje**: Proveri da li postoji `/generated-docs` folder:

```bash
mkdir -p generated-docs
```

### Problem: "Payment must be completed"

**Rješenje**: Postavi status zahtjeva na `PAID` preko admin panela

---

## 🎨 Prilagođavanje template-a

Template se nalazi u: `templates/doo-statut.hbs`

Varijable dostupne u template-u:

- `{{companyName}}` - Naziv firme
- `{{address}}` - Adresa firme
- `{{activity}}` - Djelatnost
- `{{capital}}` - Osnivački kapital
- `{{#each founders}}` - Lista osnivača
  - `{{name}}` - Ime osnivača
  - `{{idNumber}}` - JMBG/pasoš
  - `{{address}}` - Adresa
  - `{{sharePercentage}}` - Procenat vlasništva

Za izmjene:

1. Izmeni `templates/doo-statut.hbs`
2. Pokreni: `npx prisma db seed`
3. Generiši novi dokument

---

## 📊 Monitoring i logovi

Svi koraci generisanja se loguju u konzolu:

- `Generating PDF for company: XYZ`
- `PDF saved to: /path/to/file.pdf`
- `Document generation triggered for request 123`

Proveri terminal gdje radi Next.js dev server.

---

## ✨ Sledeći koraci (opciono)

- [ ] Email notifikacije kada su dokumenti spremni
- [ ] Preview verzija sa watermark-om (pre plaćanja)
- [ ] Generisanje dodatnih dokumenata (odluka o osnivanju, ugovor)
- [ ] Cloud storage (AWS S3, Cloudflare R2) umjesto lokalnog diska
- [ ] Batch generisanje za više dokumenata odjednom
