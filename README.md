# OtvoriFirmu - Automatizacija osnivanja D.O.O. u Crnoj Gori

Next.js aplikacija za automatsko generisanje kompletne dokumentacije za osnivanje društva sa ograničenom odgovornošću (D.O.O.).

## 🚀 Getting Started

### 1. Instaliraj dependencies

```bash
npm install
```

### 2. Postavi bazu podataka

```bash
# Pokreni Prisma migracije
npx prisma migrate dev

# Seeduj bazu (dodaje template za statut)
npx prisma db seed
```

### 3. Pokreni development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ✨ Features

- 🧙 **Interaktivni wizard** - 4-step proces za unos podataka
- 📄 **Automatsko generisanje statuta** - PDF dokument prilagođen vašim podacima
- 💳 **Payment tracking** - Praćenje bankovnih uplata
- 👨‍💼 **Admin panel** - Upravljanje zahtjevima i odobravanje plaćanja
- 🔐 **Autentifikacija** - NextAuth.js sa role-based pristupom
- 📊 **Prisma ORM** - Type-safe pristup MySQL bazi

## 📚 Dokumentacija

Detaljno uputstvo za sistem generisanja dokumenata: **[DOCUMENT_GENERATION.md](./DOCUMENT_GENERATION.md)**

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: MySQL + Prisma ORM
- **PDF Generation**: Puppeteer + Handlebars
- **Forms**: React Hook Form + Zod

## 🧪 Testing

```bash
# Kreiraj test korisnika
node scripts/create-test-user.js

# Kreiraj test admin korisnika
node scripts/create-admin-user.js

# Kreiraj test company request
node scripts/create-test-company.js

# Testiraj generisanje dokumenata
node scripts/test-document-generation.js [REQUEST_ID]
```

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
