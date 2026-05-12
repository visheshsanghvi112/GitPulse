# ⚡ GitPulse: The Open Source Intelligence Layer

Created by [**Vishesh Sanghvi**](https://www.linkedin.com/in/vishesh-sanghvi/) • [Portfolio](https://vishesh-ai.vercel.app/)

![GitPulse Banner](https://img.shields.io/badge/UI-Premium_Glassmorphic-6366f1) ![Engine](https://img.shields.io/badge/Stack-Next.js_15-black) ![Data](https://img.shields.io/badge/Source-GitHub_Search_API-white)

**GitPulse** is a high-fidelity, real-time intelligence dashboard for the GitHub ecosystem. It provides deep insights into trending repositories, historical rankings, and language distributions through a stunning, motion-driven interface.

---

## ✨ Key Features

- **🔥 Real-time Trending**: Live tracking of high-impact repositories using the GitHub Search API.
- **🏆 Ecosystem Rankings**: Definitive Top-100 rankings for 28+ programming languages.
- **📊 Rich Analytics**: Visualized intelligence including language distributions and repository impact charts.
- **💎 Premium UX**: A meticulously crafted glassmorphic interface with background pulsing glows, spring-based animations, and responsive card layouts.
- **⚡ Hybrid Architecture**: Intelligent fallback system that switches between Live API data and cached JSON snapshots for zero-downtime reliability.

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router ready)
- **Styling**: Tailwind CSS + Custom Design System
- **Motion**: Framer Motion (Spring physics & staggering)
- **Analytics**: Recharts (High-performance SVG charts)
- **Data**: Axios + SWR (Stale-While-Revalidate caching)

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/visheshsanghvi112/GitPulse.git
cd GitPulse
npm install
```

### 2. Environment Setup
Create a `.env.local` file and add your GitHub Personal Access Token:
```env
GITHUB_TOKEN=your_github_token_here
```
*Generating a token with `repo` scope ensures you avoid API rate limiting.*

### 3. Launch
```bash
npm run dev
```
Navigate to `http://localhost:3000` to see the pulse of open source.

## 📈 Data Strategy

GitPulse utilizes a sophisticated triple-layered data strategy:
1. **Primary**: Live GitHub Search API for immediate real-time trending results.
2. **Secondary**: Local JSON snapshots committed daily via GitHub Actions for lightning-fast loading.
3. **Tertiary**: Historical rankings data sourced from the `Github-Ranking` dataset for long-term intelligence.

## 👤 Creator

**Vishesh Sanghvi**
- 🔗 [LinkedIn](https://www.linkedin.com/in/vishesh-sanghvi/)
- 🌐 [Portfolio](https://vishesh-ai.vercel.app/)

---

## 📄 License
MIT • Crafted for the open-source community by Vishesh Sanghvi.

