# Stellar Freighter Wallet App

A modern, high-performance React application for connecting to the Stellar Network via the Freighter wallet. Built with React 18, TypeScript, and Tailwind CSS v4.

## 🚀 Features

- **Freighter Integration**: Securely connect and disconnect using the latest `@stellar/freighter-api` (v6+).
- **Modern UI**: Professional dark-mode interface with glassmorphism, custom gradients, and smooth animations.
- **Tailwind v4**: Leverages the latest CSS-first configuration and high-performance JIT engine.
- **Stellar SDK**: Configured with Vite node polyfills for seamless blockchain interaction.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Blockchain**: [@stellar/stellar-sdk](https://github.com/stellar/js-stellar-sdk)
- **Wallet**: [@stellar/freighter-api](https://github.com/stellar/freighter)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Freighter Wallet Extension](https://www.freighter.app/) installed in your browser.

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AbhishekRath19/stellstl1.git
   cd stellstl1
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🔐 Wallet Connection

Click the **Connect Wallet** button on the home screen to trigger the Freighter authorization popup. Once connected, your truncated public key will be displayed on the dashboard.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
