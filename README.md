# 🥗 Diet & Smart Fridge Inventory Management System

Una Progressive Web App (PWA) moderna, mobile-first e full-stack per la gestione intelligente della dispensa e del frigorifero, il tracciamento delle scadenze con strategia **FEFO (*First Expired, First Out*)**, la gestione di un piano alimentare fisso settimanale e la generazione automatica ottimizzata della lista della spesa a fabbisogno differenziale.

---

## ✨ Funzionalità Principali

### 1. 🧊 Gestione Dispensa & Lotti Multipli (FEFO)
- **Multi-lotto per alimento**: Gestisci più confezioni dello stesso alimento acquistate in date o con scadenze diverse (es. più bottiglie di latte con date differenti).
- **Gestione Selettiva delle Scadenze**:
  - ❄️ **Prodotti Deperibili/Freschi**: Richiedono la data di scadenza e mostrano allarmi visivi.
  - 📦 **Prodotti Non Deperibili (Lunga conservazione)**: Data di scadenza facoltativa / omessa.
- **Alert Visivi Intelligenti**:
  - 🔴 **Scaduto**: Evidenziato in rosso con conteggio giorni.
  - 🟡 **In Scadenza (≤ 3 giorni)**: Allerta preventiva in giallo/ambra.
  - 🟢 **Sicuro / Dispensa**: Verde o neutro per alimenti a lunga durata.

### 2. 🍽️ Consumo Pasti con Algoritmo FEFO
- **Pulsante "Consuma Pasto" a tocco singolo**:
  - Esegue una query sui lotti presenti in dispensa ordinati per `expiration_date ASC NULLS LAST`.
  - Scala prioritariamente le scorte dai lotti più vecchi/prossimi alla scadenza.
  - Elimina automaticamente i lotti esauriti (`quantità = 0`) e aggiorna quelli parziali.
  - Fornisce un riepilogo immediato dei lotti utilizzati ed eventuali ingredienti mancanti.

### 3. 📋 Piano Alimentare Settimanale Fisso (7 Giorni × 5 Pasti)
- Configurazione per tutti i giorni della settimana (da Lunedì a Domenica).
- **5 Slot Pasto Fissi**:
  1. `Colazione`
  2. `Spuntino Mattina`
  3. `Pranzo`
  4. `Merenda`
  5. `Cena`
- Quantità esatte per ogni alimento con relative unità di misura (`g`, `ml`, `pz`, `kg`, `fette`, `cucchiai`).
- **Zero Calorie Overhead**: Nessun calcolo energetico o di macronutrienti per garantire massima semplicità ed efficienza d'uso.
- **Duplicazione Giorno**: Funzione *"Copia Giorno"* per clonare rapidamente la configurazione di una giornata su un'altra.

### 4. 🛒 Generatore Smart Lista della Spesa (Delta Inventory)
- **Calcolo Automatico del Fabbisogno Differenziale**:
  $$\text{Quantità da Comprare} = \max\left(0, \sum_{t \in T} \text{Fabbisogno Dieta}_t - \text{Giacenza Dispensa}\right)$$
- Finestra temporale selezionabile (prossimi 1, 3, 5, 7 giorni).
- **Esperienza Supermercato Mobile-First**:
  - Spunte interattive con aggiornamento ottimistico (`useOptimistic`) per eliminare ogni ritardo di rete.
  - Target touch ergonomici (minimo 48px di altezza).
  - Possibilità di aggiungere articoli manuali fuori dieta.
- **Carica in Dispensa (Commit Restock)**:
  - Procedura guidata che converte i prodotti acquistati in lotti effettivi di dispensa.
  - Suggerimento intelligente delle scadenze per i prodotti freschi (+3gg, +7gg, +14gg) e pulizia della lista.

### 5. ⏰ Controllo Automatico Notturno Scadenze (Cron alle 01:00)
- **Vercel Cron (`vercel.json`) & API Route (`/api/cron/check-expirations`)**:
  - Esegue ogni notte alle ore **01:00 AM** una verifica completa su tutti i lotti registrati.
  - Individua automaticamente gli alimenti già scaduti e quelli con scadenza imminente entro 3 giorni.
  - Protetto da token di sicurezza `CRON_SECRET`.
  - Opzione nativa PostgreSQL disponibile con `pg_cron` in [supabase/cron.sql](supabase/cron.sql).

---

## 🛠️ Stack Tecnologico

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions)
- **Linguaggio**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **UI & Stile**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), Glassmorphism, Dark/Light mode
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL con Row Level Security & `@supabase/ssr`)
- **PWA**: Web App Manifest (`manifest.ts`), Mobile Standalone Display Mode e Touch Gestures

---

## 📂 Struttura del Progetto

```text
Diet/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx       # Pagina Login / Registrazione Supabase + Demo
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Layout con Navbar responsive + Demo Banner
│   │   │   ├── page.tsx             # Dashboard: Pasti del giorno, scadenze, FEFO
│   │   │   ├── inventory/
│   │   │   │   └── page.tsx         # Gestione lotti dispensa + Catalogo alimenti
│   │   │   ├── diet/
│   │   │   │   └── page.tsx         # Configurazione piano pasti settimanale
│   │   │   └── shopping/
│   │   │       └── page.tsx         # Lista della spesa interattiva delta
│   │   ├── layout.tsx               # Root Layout con ToastProvider e Viewport PWA
│   │   ├── manifest.ts              # Configurazione PWA Web App Manifest
│   │   └── globals.css              # Stili Tailwind CSS v4 e Glassmorphism
│   ├── components/
│   │   ├── ui/                      # Button, Input, Dialog, Badge, Card, Toast
│   │   ├── navbar.tsx               # Bottom Nav mobile e Sidebar desktop
│   │   ├── meal-card.tsx            # Card pasto con consumo FEFO reattivo
│   │   ├── inventory-batch-dialog.tsx # Inserimento lotti con gestione scadenze
│   │   ├── food-item-dialog.tsx     # Creazione/modifica alimenti master
│   │   ├── shopping-list-client.tsx # Checklist spesa con Optimistic UI
│   │   ├── restock-modal.tsx        # Modal carico spesa in dispensa
│   │   └── demo-banner.tsx          # Indicatore stato connessione Supabase/Demo
│   ├── actions/
│   │   ├── inventory.ts             # Server Actions FEFO e CRUD lotti/alimenti
│   │   ├── diet.ts                  # Server Actions piano settimanale e copia
│   │   ├── shopping.ts              # Server Actions calcolo delta e restock
│   │   └── auth.ts                  # Server Actions autenticazione Supabase
│   └── lib/
│       ├── supabase/                # Client SSR, Server e Middleware
│       ├── demo-store.ts            # Store in-memory con dati di prova italiani
│       ├── types/database.ts        # Tipi TypeScript per PostgreSQL / Supabase
│       └── utils.ts                 # Helpers per date, scadenze e classi CSS
├── supabase/
│   ├── schema.sql                   # Schema DDL completo con indici e RLS
│   └── seed.sql                     # Dati di prova realistici
├── public/                          # Icone PWA, Favicon e SVG
├── requirements.md                  # Specifiche tecniche dei requisiti
└── package.json
```

---

## 🚀 Guida all'Installazione & Avvio

### 1. Prerequisiti
- [Node.js](https://nodejs.org/) versione 18.18+ (consigliata v20+ o v22+)
- `npm`, `pnpm` o `yarn`

### 2. Installazione delle Dipendenze
```bash
npm install
```

### 3. Configurazione delle Variabili d'Ambiente
Copia il file `.env.example` in `.env.local` e inserisci le tue credenziali Supabase:
```bash
cp .env.example .env.local
```

Nel file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=la-tua-chiave-anon-jwt
```

Esegui lo script presente in [supabase/schema.sql](supabase/schema.sql) nell'editor SQL della tua dashboard Supabase per creare le tabelle e le policy di sicurezza Row Level Security (RLS).

---

### 4. 👤 Creazione Utente Amministratore / Utenti Autorizzati (Supabase)

Per garantire la massima sicurezza e riservatezza dei dati, **la registrazione autonoma dall'app è disabilitata**. Gli account vengono creati direttamente dall'amministratore tramite la dashboard di Supabase:

1. Vai su [supabase.com](https://supabase.com) ed entra nel tuo progetto.
2. Dal menu laterale a sinistra, clicca su **Authentication** ➡️ **Users**.
3. Clicca sul pulsante verde in alto a destra **"Add user"** ➡️ **"Create user"**.
4. Inserisci l'**Email** e la **Password** desiderata (minimo 6 caratteri).
5. Assicurati che l'opzione **"Auto Confirm User"** sia **attiva** (in questo modo l'utente potrà accedere istantaneamente senza dover verificare l'email).
6. Clicca su **"Create user"**.
7. Ora puoi accedere direttamente all'applicazione inserendo l'email e la password create.

> [!TIP]
> Al primo accesso di un nuovo utente, il sistema popola automaticamente il catalogo alimenti di base con gli ingredienti più comuni della dieta mediterranea.

---

### 5. Avvio in Sviluppo
```bash
npm run dev
```
Apri il browser su [http://localhost:3000](http://localhost:3000) (o sulla porta indicata nel terminale).

### 6. Build di Produzione & Deploy su Vercel
```bash
npm run build
npm run start
```
Per il deploy su **Vercel**, basta collegare il repository GitHub e impostare le variabili d'ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nelle impostazioni del progetto.

---

## 🧪 Esempio di Funzionamento Algoritmo FEFO

Supponiamo di avere in dispensa 3 lotti di **Petto di Pollo**:
1. **Lotto A**: 40 g (Scadenza: 16 Agosto)
2. **Lotto B**: 250 g (Scadenza: 18 Agosto)
3. **Lotto C**: 300 g (Scadenza: 19 Agosto)

Il pranzo richiede **160 g di Pollo**:
- Il sistema individua i lotti in ordine di scadenza crescente.
- Consuma interamente i **40 g del Lotto A** ed elimina il lotto esaurito.
- Preleva i restanti **120 g dal Lotto B**, aggiornando la giacenza residua a 130 g.
- Lascia intatto il **Lotto C** (300 g).

---

## 📱 Installazione come PWA su Smartphone
1. Apri l'applicazione dal browser del tuo dispositivo mobile (Chrome / Safari).
2. Tocca l'icona di condivisione o il menu delle opzioni (tre puntini).
3. Seleziona **"Aggiungi alla schermata Home"** o **"Installa app"**.
4. Avvia l'applicazione come app a schermo intero indipendente dal browser.
