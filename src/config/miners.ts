// Miner Types
export enum MinerType {
  BANANA_MINER = 0,
  MONKEY_TOASTER = 1,
  GORILLA_GADGET = 2,
  APEPAD_MINI = 3,
}

// Miner Data Structure
export interface MinerData {
  id: number;
  name: string;
  image: string;
  hashrate: number; // Hashrate in GH/s
  energyConsumption: number; // Energy in WATTS
  price: number; // Price in BIT
  description: string;
  isActive: boolean; // Whether the miner is available for purchase
}

// Miner Data
export const MINERS: Record<number, MinerData> = {
  [MinerType.BANANA_MINER]: {
    id: MinerType.BANANA_MINER,
    name: "BANANA MINER",
    image: "/banana-miner.gif",
    hashrate: 100,
    energyConsumption: 1,
    price: 0, // Free starter miner
    description: "YOUR FIRST BANANA MINER IS FREE!",
    isActive: true,
  },
  [MinerType.MONKEY_TOASTER]: {
    id: MinerType.MONKEY_TOASTER,
    name: "MONKEY TOASTER",
    image: "/monkey-toaster.gif",
    hashrate: 250,
    energyConsumption: 2.5,
    price: 250, // 250 BIT
    description: "2.5X HASHRATE OF BANANA MINER",
    isActive: true, // Now active
  },
  [MinerType.GORILLA_GADGET]: {
    id: MinerType.GORILLA_GADGET,
    name: "GORILLA GADGET",
    image: "/gorilla-gadget.gif",
    hashrate: 750,
    energyConsumption: 5,
    price: 1000, // 1000 BIT
    description: "7.5X HASHRATE OF BANANA MINER",
    isActive: true, // Now active
  },
  [MinerType.APEPAD_MINI]: {
    id: MinerType.APEPAD_MINI,
    name: "APEPAD MINI",
    image: "/apepad.png",
    hashrate: 2000,
    energyConsumption: 10,
    price: 5000, // 5000 BIT
    description: "20X HASHRATE OF BANANA MINER",
    isActive: true, // Now active
  },
};

// Function to get all active miners
export const getActiveMiners = () => {
  return Object.values(MINERS).filter(miner => miner.isActive);
};

// Function to get a miner by ID
export const getMinerById = (id: number): MinerData | undefined => {
  return MINERS[id];
}; 