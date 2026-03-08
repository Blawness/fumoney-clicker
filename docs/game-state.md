# Game State Documentation

Dokumentasi state game "The Fuck You Money" Clicker: struktur data, persistence, dan rumus perhitungan.

---

## 1. Overview

State game dikelola di client (React) lewat hook `useGameState` dan disimpan ke `localStorage` agar progres tidak hilang saat refresh. Tidak ada backend; semua logic berjalan di browser.

---

## 2. Persistence

| Item | Nilai |
|------|--------|
| **Key** | `fumoney-clicker-save` |
| **Format** | JSON (object `GameSave`) |
| **Debounce save** | 400 ms setelah perubahan state |
| **Load** | Sekali saat mount (client-only) |

### Interface `GameSave`

```ts
interface GameSave {
  balance: number;
  ipc: number;
  ips: number;
  acps: number;
  compoundMultiplier: number;
  ownedUpgrades: Record<string, number>;  // upgradeId -> level (jumlah beli)
  purchasedGoals: string[];              // goalId yang sudah dibeli
}
```

### Default (new game)

| Field | Default |
|-------|---------|
| `balance` | 0 |
| `ipc` | 1 |
| `ips` | 0 |
| `acps` | 0 |
| `compoundMultiplier` | 1 |
| `ownedUpgrades` | `{}` |
| `purchasedGoals` | `[]` |

---

## 3. State Fields

### 3.1 Primitive (disimpan & di-persist)

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `balance` | number | Uang saat ini (IDR). Bertambah dari klik, IPS, auto-click, dan berkurang saat beli upgrade/goal. |
| `ipc` | number | Income Per Click. Ditambah per klik tombol "Work / Code". Naik dari upgrade tipe `ipc`. |
| `ips` | number | Income Per Second (base). Pendapatan pasif per detik sebelum multiplier. Naik dari upgrade tipe `ips`. |
| `acps` | number | Auto Clicks Per Second. Setiap detik dihitung sebagai `acps * ipc` tambahan ke balance. Naik dari upgrade tipe `acps`. |
| `compoundMultiplier` | number | Pengali global pendapatan per detik. Mulai 1; naik 2× setiap 5 menit jika punya upgrade "Compound Interest Mastery". |
| `ownedUpgrades` | Record<string, number> | Map `upgradeId` → level (berapa kali upgrade itu dibeli). Dipakai untuk cost scaling dan hitung multiplier. |
| `purchasedGoals` | string[] | Daftar `goalId` Freedom Shop yang sudah dibeli (sekali beli, hanya visual + kurangi balance). |

### 3.2 Derived (dihitung dari state, tidak di-persist)

| Field | Rumus |
|-------|--------|
| `totalIpsPercent` | Jumlah dari `(ownedUpgrades[u.id] ?? 0) * u.effectValue` untuk setiap upgrade dengan `effectType === "ips_percent"`. |
| `ipsMultiplier` | `1 + totalIpsPercent / 100` (contoh: +5% dan +10% → 1.15). |
| `baseIncomePerSecond` | `ips * ipsMultiplier + acps * ipc`. |
| `effectiveIncomePerSecond` | `baseIncomePerSecond * compoundMultiplier`. |

---

## 4. Triggers & Update Logic

### 4.1 Click (manual)

- **Aksi:** User klik tombol "Work / Code".
- **Efek:** `balance += ipc`.
- **Return:** Nilai `ipc` (untuk floating text).

### 4.2 Income tick (setiap 1 detik)

- **Efek:** `balance += effectiveIncomePerSecond`.
- **Tidak jalan** jika `effectiveIncomePerSecond <= 0`.

### 4.3 Compound tick (setiap 5 menit)

- **Kondisi:** `ownedUpgrades["compound-interest-mastery"] > 0`.
- **Efek:** `compoundMultiplier *= 2`.

### 4.4 Beli upgrade

- **Cost:** `cost = floor(baseCost * 1.15^owned)`.
- **Syarat:** `balance >= cost`.
- **Efek:**
  - `balance -= cost`
  - `ownedUpgrades[upgrade.id] += 1`
  - Jika `effectType === "ipc"`: `ipc += effectValue`
  - Jika `effectType === "ips"`: `ips += effectValue`
  - Jika `effectType === "acps"`: `acps += effectValue`
  - `ips_percent` dan `compound` tidak mengubah ipc/ips/acps; efeknya lewat derived `ipsMultiplier` dan compound timer.

### 4.5 Beli goal (Freedom Shop)

- **Syarat:** Goal belum di `purchasedGoals` dan `balance >= goal.cost`.
- **Efek:** `balance -= goal.cost`, `purchasedGoals.push(goalId)`.

---

## 5. Upgrade Definitions

### 5.1 Effect types

| Type | Deskripsi |
|------|-----------|
| `ipc` | Menambah Income Per Click. |
| `ips` | Menambah Income Per Second (base). |
| `acps` | Menambah Auto Clicks Per Second. |
| `ips_percent` | Menambah persen ke total IPS (digabung jadi `ipsMultiplier`). |
| `compound` | Mengaktifkan doubling pendapatan setiap 5 menit (`compoundMultiplier`). |

### 5.2 Categories & daftar upgrade

**The Builder (IPC)**

| id | name | effect | baseCost |
|----|------|--------|----------|
| vibe-coding-ai | Vibe Coding AI (Cursor/Claude) | +5 IPC | 100 |
| fullstack-mastery | Fullstack Mastery (Next.js + Prisma) | +25 IPC | 500 |
| openrouter-api-pro | OpenRouter API Pro | +100 IPC | 2,500 |
| supercomputer-cluster | Supercomputer Cluster | +1,000 IPC | 25,000 |
| neural-link-coding | Neural Link Coding | +10,000 IPC | 250,000 |

**The Founder (IPS)**

| id | name | effect | baseCost |
|----|------|--------|----------|
| freelance-project | Freelance Project | +10/s | 500 |
| vorca-studio-team | Vorca Studio Team | +150/s | 5,000 |
| feedback-hub-saas | Feedback-Hub SaaS | +1,000/s | 50,000 |
| gitsheet-enterprise | GitSheet Enterprise | +5,000/s | 250,000 |
| global-tech-empire | Global Tech Empire | +50,000/s | 2,500,000 |

**The Investor (multiplier / %)**  

| id | name | effect | baseCost |
|----|------|--------|----------|
| xaut-digital-gold | XAUT (Digital Gold) | +5% total IPS | 10,000 |
| sp500-voo | S&P 500 (VOO) | +10% total IPS | 50,000 |
| nasdaq-qqq | Nasdaq 100 (QQQ) | +15% total IPS | 250,000 |
| bitcoin-whale | Bitcoin Whale | +50% total IPS | 2,000,000 |
| compound-interest-mastery | Compound Interest Mastery | 2× income every 5 min | 10,000,000 |

### 5.3 Cost formula

```
cost = floor(baseCost * 1.15^owned)
```

`owned` = level upgrade tersebut (berapa kali sudah dibeli).

---

## 6. Goals (Freedom Shop)

Sekali beli; hanya mengurangi balance dan mengubah visual/status. Tidak mengubah IPC/IPS.

| id | label | cost (IDR) |
|----|--------|------------|
| dream-car | Dream Car | 1,000,000,000 |
| south-jakarta-house | South Jakarta House | 5,000,000,000 |
| wedding-fund | The Wedding Fund | 10,000,000,000 |
| fuck-you-money | Fuck You Money Status | 100,000,000,000 |

---

## 7. File reference

| Concern | File |
|---------|------|
| Save/load, `GameSave` | `src/lib/storage.ts` |
| State + logic, derived values | `src/hooks/useGameState.ts` |
| Daftar upgrade, cost helper | `src/data/upgrades.ts` |
| Daftar goal | `src/data/goals.ts` |

---

## 8. Ringkasan rumus

- **Cost upgrade:** `floor(baseCost * 1.15^level)`  
- **IPS multiplier:** `1 + (jumlah semua % dari upgrade investor) / 100`  
- **Pendapatan per detik:** `(ips * ipsMultiplier + acps * ipc) * compoundMultiplier`  
- **Compound:** Setiap 5 menit, `compoundMultiplier *= 2` jika punya upgrade Compound Interest Mastery.
