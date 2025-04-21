import { useGameState } from "../hooks/useGameState";
import { useTokenBalance } from "../hooks/useTokenBalance";
import { useIsMounted } from "../hooks/useIsMounted";

export default function ResourcesTab() {
  const { apeBalance, bitBalance } = useTokenBalance();
  const { facilityData } = useGameState();
  const isMounted = useIsMounted();

  // Default to 0 if values are not available, with explicit checks to avoid undefined
  const spacesLeft = facilityData && typeof facilityData.spaces !== 'undefined' ? facilityData.spaces : 0;
  const spacesUsed = facilityData && typeof facilityData.miners !== 'undefined' ? facilityData.miners : 0;
  const gigawattsAvailable = facilityData && typeof facilityData.power !== 'undefined' ? facilityData.power : 0;
  const gigawattsUsed = facilityData && typeof facilityData.used !== 'undefined' ? facilityData.used : 0;

  // Add explicit console logs to debug data in production
  console.log('ResourcesTab - facilityData:', facilityData);
  console.log('ResourcesTab - Calculated values:', { spacesLeft, gigawattsAvailable, apeBalance, bitBalance });
  
  return (
    <div className="text-indigo-500 p-4">
      <div className="mb-6">
        <h3 className="font-press-start text-indigo-400 mb-2">RESOURCES</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 p-3 rounded border border-indigo-600">
            <div className="text-xs mb-1 text-gray-500">APE BALANCE</div>
            <div className="font-press-start">{isMounted ? (apeBalance || '0') : "Loading..."}</div>
          </div>
          <div className="bg-gray-900 p-3 rounded border border-indigo-600">
            <div className="text-xs mb-1 text-gray-500">BIT BALANCE</div>
            <div className="font-press-start">{isMounted ? (bitBalance || '0') : "Loading..."}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-press-start text-indigo-400 mb-2">FACILITY</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 p-3 rounded border border-indigo-600">
            <div className="text-xs mb-1 text-gray-500">SPACES LEFT</div>
            <div className="font-press-start">{isMounted ? spacesLeft : "Loading..."}</div>
          </div>
          <div className="bg-gray-900 p-3 rounded border border-indigo-600">
            <div className="text-xs mb-1 text-gray-500">GIGAWATTS AVAILABLE</div>
            <div className="font-press-start">{isMounted ? gigawattsAvailable : "Loading..."}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 