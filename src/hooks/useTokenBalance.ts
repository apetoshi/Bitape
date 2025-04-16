'use client';

import { useAccount, useContractRead, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { APECHAIN_ID, CONTRACT_ADDRESSES, ERC20_ABI } from '../config/contracts';

export function useTokenBalance() {
  const { address } = useAccount();

  const { data: apeBalanceData } = useBalance({
    address: address as `0x${string}`,
    chainId: APECHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  const { data: bitBalance } = useContractRead({
    address: CONTRACT_ADDRESSES.BIT_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  return {
    apeBalance: apeBalanceData?.formatted ?? '0',
    bitBalance: bitBalance ? formatUnits(bitBalance as bigint, 18) : '0',
  };
} 