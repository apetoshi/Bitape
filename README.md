# BitApe - A Peer-to-Peer Electronic Ape Cash System

BitApe is a mining game on ApeChain where players can purchase mining facilities, acquire miners, and earn BitApe ($BIT) tokens. This project is a clone of Bigcoin, adapted for ApeChain with ape-themed branding.

## Deployed Contracts

- **BitApe Token Contract**: [0xd5f2A51440059C5E7B1E1E21634B5f48860A53f3](https://apescan.io/address/0xd5f2A51440059C5E7B1E1E21634B5f48860A53f3)
- **Main Contract**: [0x9281b1D9291e2D1911a400877B5c5e3c85342672](https://apescan.io/address/0x9281b1D9291e2D1911a400877B5c5e3c85342672)

## Tech Stack

- **Frontend**: React, NextJS, TypeScript, Tailwind CSS
- **Blockchain Integration**: Wagmi, Viem, Web3Modal
- **Smart Contracts**: Solidity 0.8.19
- **Network**: ApeChain

## Features

- Connect wallet to ApeChain
- Purchase mining facility with APE
- Get starter miner
- Mine BitApe tokens automatically
- Claim mining rewards
- Upgrade facility
- View mining statistics
- Account management

## Local Development

### Prerequisites

- Node.js 18+ and npm
- MetaMask or another Web3 wallet

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/bitape.git
cd bitape
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file with your Web3Modal Project ID
```
NEXT_PUBLIC_WEB3MODAL_PROJECT_ID=your_project_id_here
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Setup

Make sure your wallet is configured to connect to ApeChain:

- **Network Name**: ApeChain
- **RPC URL**: https://apechain-mainnet.g.alchemy.com/v2/o5UPoUhml8_h72VaE2QIglR76E8dQg42
- **Chain ID**: 16350
- **Currency Symbol**: APE
- **Block Explorer URL**: https://apescan.io

## Production Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and sign up/login
3. Click "New Project" and import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
5. Add environment variables:
   - NEXT_PUBLIC_WEB3MODAL_PROJECT_ID=your_project_id_here
6. Click "Deploy"

### Other Hosting Options

You can also deploy to other platforms like Netlify, AWS Amplify, or traditional hosting:

1. Build the project
```bash
npm run build
```

2. Start the production server
```bash
npm start
```

Or export as static HTML (if your app doesn't use server-side features):
```bash
npm run build
npm run export
```

## Contract Interaction

The UI interacts with two main contracts:

1. **BitApe Token Contract**: ERC20 token with a maximum supply of 21,000,000 tokens
2. **Main Contract**: Handles game logic including facility management, miners, and rewards

Key functions:
- `purchaseInitialFacility(address _referrer)`: Buy your first mining facility with APE
- `getStarterMiner()`: Claim a free starter miner
- `claimReward()`: Claim mined BitApe tokens
- `upgradeFacility()`: Upgrade your mining facility

## Game Mechanics

- Players purchase a mining facility with APE
- Each facility provides power for miners
- Miners generate hashrate which mines BitApe tokens
- Mining rewards are based on your percentage of the total network hashrate
- Rewards halve periodically, similar to Bitcoin's halving mechanism

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**:
   - Ensure you're on ApeChain network
   - Check if you have APE for gas fees

2. **Transaction Failures**:
   - Verify you have sufficient APE for gas
   - Check contract approval status for token interactions

3. **UI Not Loading**:
   - Clear browser cache
   - Ensure JavaScript is enabled
   - Try a different browser

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original concept based on Bigcoin (https://www.bigcoin.tech/)
- Adapted for ApeChain with permission
