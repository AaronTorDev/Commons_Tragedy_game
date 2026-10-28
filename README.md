# Tragedy of the Commons · Game Theory Experiment

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firestore-Database-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

An interactive real-time web application designed for classroom experiments in **Game Theory** and **Experimental Economics**. It simulates the classic **Tragedy of the Commons (Common-Pool Resource Dilemma)** with physical or virtual rewards (candies/points), marginal diminishing returns, and an Ostrom-style collective conservation dividend.

Built and maintained by **[AaronTorDev](https://github.com/AaronTorDev)**.

---

## Economic Model & Mechanics

The simulation models an open-access **Common-Pool Resource (CPR)** where consumption is **rivalrous** (each candy extracted leaves fewer for others) but **non-excludable** (all participants with tickets have access to the pot).

### 1. Turn-Based Extraction & Diminishing Utility
When called on their turn, a participant requests an extraction quantity $x$ from the shared pot. To model **diminishing marginal utility** and prevent a single player from draining the entire pot immediately, the physical reward received is logarithmic:

$$u_i(x_i) = \operatorname{round}(\ln(x_i))$$

- Requesting $1 \implies \ln(1) = 0 \to 0\text{ units}$
- Requesting $3 \implies \ln(3) \approx 1.10 \to 1\text{ unit}$
- Requesting $20 \implies \ln(20) \approx 2.99 \to 3\text{ units}$
- Requesting $100 \implies \ln(100) \approx 4.60 \to 5\text{ units}$

### 2. The Collective Dividend (Ostrom Governance)
Following the Nobel-laureate research of **Elinor Ostrom**, long-term sustainability is rewarded. At the end of the game, whatever resource remains in the shared pot is distributed as an equal bonus dividend to **every registered player**:

$$\text{Final Bonus} = \operatorname{round}(\ln(\text{Remaining Pot}))$$

> **The Dilemma:** Selfish players want to maximize their individual extraction $x$, but doing so depletes the pot rapidly. A coordinated group that exercises restraint preserves a high remaining balance, maximizing the collective payoff for everyone.

---

## Key Features

- **Real-Time Synchronization**: Powered by Firebase Firestore listeners with atomic transactions, updating pots, queues, and ledger entries instantaneously across all devices.
- **Queue & Turn Calling System**: Players scan a QR code to join and receive an ordered ticket number. The instructor advances turns sequentially.
- **Live Mathematical Typesetting**: Full LaTeX rendering using **KaTeX** for clean, crisp mathematical formulas ($x$, $\ln(x)$, payoff functions).
- **Interactive Decision Slider**: Real-time projection showing the player their instantaneous payout, impact on the pot, and remaining dividend.
- **Public Audit Ledger**: Fully transparent live history table recording every extraction, payout, and remaining balance.
- **Admin Management Panel**:
  - Protected by a secure 6-digit administrator PIN.
  - Controls to pause, resume, advance, rewind turns, or finalize the game.
  - Physical reward verification checklist (marks initial extraction and bonus dividend disbursements).
  - Multi-room support (create, switch between, or permanently delete rooms from Firestore).
- **Public Repository Safe**: Preconfigured `.gitignore` and sanitized `.env.example` ensuring no private Firebase API keys or credentials are ever committed.

---

## Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) with native ES Modules
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Math Rendering**: [KaTeX](https://katex.org/)
- **Icons**: [Lucide React](https://lucide.dev/) & FontAwesome
- **Database**: [Google Cloud Firestore](https://firebase.google.com/docs/firestore) (real-time collections, transactions, and security rules)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later) or [Bun](https://bun.sh/)
- A Firebase project with Cloud Firestore enabled (or use the pre-configured project credentials)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AaronTorDev/Commons_Tragedy_game.git
   cd Commons_Tragedy_game
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or with bun:
   bun install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory (this file is ignored by Git):
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase credentials in `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY="your_api_key_here"
   VITE_FIREBASE_PROJECT_ID="your_project_id"
   VITE_FIREBASE_APP_ID="your_app_id"
   VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
   VITE_FIREBASE_FIRESTORE_DATABASE_ID="your_database_id_or_(default)"
   VITE_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   # or with bun:
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (Vercel)

This project is optimized for deployment on [Vercel](https://vercel.com/):

1. Push your repository to GitHub.
2. Import the repository into your Vercel Dashboard.
3. In **Settings ➔ Environment Variables**, add your Firebase configuration variables. Note that `vite.config.ts` has been configured with `envPrefix: ['VITE_', 'NEXT_PUBLIC_']`, so you may use either prefix:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` (or `VITE_FIREBASE_API_KEY`)
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (or `VITE_FIREBASE_PROJECT_ID`)
   - `NEXT_PUBLIC_FIREBASE_APP_ID` (or `VITE_FIREBASE_APP_ID`)
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` (or `VITE_FIREBASE_AUTH_DOMAIN`)
   - `NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID` (or `VITE_FIREBASE_FIRESTORE_DATABASE_ID`)
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (or `VITE_FIREBASE_STORAGE_BUCKET`)
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (or `VITE_FIREBASE_MESSAGING_SENDER_ID`)
4. Click **Deploy**. Vercel will build the production static bundle into `dist/`.

---

## Administrator Access

- To enter the administrator panel, click the lock / shield icon in the top navigation bar.
- From the panel, you can create new custom game pots, manage turns, track physical candy hand-outs, and delete inactive rooms.

---

## Contributing & Attribution

Contributions, bug reports, and pedagogical improvements are welcome!

- **Author**: [Aaron Toruño (AaronTorDev)](https://github.com/AaronTorDev)
- **Repository**: [https://github.com/AaronTorDev/Commons_Tragedy_game](https://github.com/AaronTorDev/Commons_Tragedy_game)

---

## License

This project is licensed under the [Apache-2.0 License](LICENSE).
