
# InvoiceForge

**Invoice factoring dApp built on Arc Network**

🔗 **Live Demo:** [https://oldboyiii.github.io/invoiceforge-frontend/](https://oldboyiii.github.io/invoiceforge-frontend/)

---

## Overview

InvoiceForge is a decentralized invoice factoring platform that brings real-world business invoicing on-chain. Built natively on **Arc Network**, it allows issuers to create invoices, clients to pay in USDC, and third-party factors to purchase receivables — all settled in Arc's native USDC with no wrapping or bridging.

The platform integrates **FXBlitz Score** as a decentralized credit layer, replacing traditional KYC with on-chain reputation.

---

## Why Arc Network?

Arc is the only L2 where **USDC is the native gas token**. For a payments and invoicing product, this is structural — every invoice creation, payment, and factoring transaction settles in the same asset used for fees. No friction, no UX barriers.

---

## Features

- **Create Invoice** — Set client, amount, due date, factoring fee, and description
- **Pay Invoice** — Clients settle instantly in native USDC with auto-approve flow
- **Request Factoring** — Factors browse pending invoices and offer liquidity
- **Accept Factoring** — Issuers get instant USDC; factors collect later
- **FXBlitz Score Integration** — Client creditworthiness assessed via on-chain gaming history
- **Auto Network Switch** — MetaMask automatically connects to Arc Testnet

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Web3 | Ethers.js v6 |
| Wallet | MetaMask (injected) |
| Deployment | GitHub Pages + GitHub Actions |

---

## Smart Contracts (Arc Testnet)

| Contract | Address |
|----------|---------|
| `ArcInvoice` | `0x62E44bf079Ce2996E933174d7BaC591Da8ade190` |
| `USDC` (native) | `0x3600000000000000000000000000000000000000` |
| `FXBlitzScore` | `0x50e206F15556f06B374acDa943a7655602AF6494` |

**Explorer:** [testnet.arcscan.app](https://testnet.arcscan.app)

---

## Architecture

```
src/
├── components/
│   ├── CreateInvoice.tsx      # Invoice creation form
│   ├── MyInvoices.tsx         # Issuer & client dashboard
│   ├── FactoringMarket.tsx    # Factor marketplace
│   └── Navbar.tsx             # Wallet connection & navigation
├── hooks/
│   ├── useWallet.ts           # MetaMask + Arc Network connection
│   └── useContract.ts         # Ethers.js contract instances
├── config/
│   ├── abi.ts                 # Contract ABIs
│   └── contracts.ts           # Addresses & network config
└── utils/
    └── format.ts              # USDC formatting, date utils
```

---

## How It Works

### 1. Create Invoice
Issuer fills the form: client address, amount (USDC), due date, factoring fee (%), and description. The invoice is minted on-chain with a unique ID.

### 2. Pay Invoice
Client connects wallet, navigates to **My Invoices**, and clicks **Pay**. USDC is auto-approved and transferred to the issuer.

### 3. Factoring (if client is slow)
- A third-party factor browses the **Factoring Market**
- Before requesting, the platform checks the client's **FXBlitz Score** (games played)
- Factor submits an offer amount
- Issuer accepts → receives USDC instantly; factor collects from client later

---

## Getting Started

No local setup required. The app is fully deployed via GitHub Pages.

1. Visit the [live demo](https://oldboyiii.github.io/invoiceforge-frontend/)
2. Connect MetaMask
3. Switch to **Arc Testnet** (auto-added if missing)
4. Create or pay invoices

---

## Deployment

This repository uses **GitHub Actions** for automatic deployment to GitHub Pages on every push to `main`.

```yaml
# .github/workflows/deploy.yml
# Trigger: push to main
# Output: https://<username>.github.io/invoiceforge-frontend/
```

---

## Grant Submission

InvoiceForge was built for the **Circle Builder Grant** to demonstrate real-world business infrastructure on Arc Network.

**Key differentiators:**
- Native USDC settlement (gas + payment asset)
- FXBlitz Score as decentralized credit oracle
- Zero KYC — pure on-chain reputation
- Open source, no backend, fully decentralized

---

## Links

- 🌐 **Demo:** [oldboyiii.github.io/invoiceforge-frontend](https://oldboyiii.github.io/invoiceforge-frontend/)
- 📁 **Repository:** [github.com/oldboyiii/invoiceforge-frontend](https://github.com/oldboyiii/invoiceforge-frontend)
- 🔍 **Explorer:** [testnet.arcscan.app](https://testnet.arcscan.app)

---

## License

MIT
```

---

## 🔧 Как добавить

1. Откройте `README.md` в корне репозитория на GitHub
2. Нажмите ✏️ **Edit**
3. Вставьте текст выше
4. **Commit changes**

Если хотите — могу добавить в README **скриншоты** (после того как вы их сделаете) или **badge** (build status, license и т.д.).
