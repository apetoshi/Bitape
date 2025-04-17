import React from 'react';
import { Dialog } from '@headlessui/react';

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({
  isOpen,
  onClose
}) => {
  // Hardcoded announcements for now
  const announcements = [
    {
      id: 1,
      date: '2025-04-16 11:24',
      text: 'THE DIESEL HYBRID MINER IS NO LONGER AT DISCOUNT. MICHAEL BAYLOR IS BUSY PREPARING MACROSTRATEGY (COMING SOON!).'
    },
    {
      id: 2,
      date: '2025-04-14 12:22',
      text: 'THE DIESEL HYBRID MINER HAS ARRIVED. MICHAEL BAYLOR TO COVER DIESEL COSTS FOR A LIMITED TIME ONLY AS HE PREPARES MACROSTRATEGY.'
    },
    {
      id: 3,
      date: '2025-04-11 14:26',
      text: 'DECORATIONS HAVE ARRIVED FROM TEMU. PRICES HAVE BEEN ADJUSTED.'
    }
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-royal border-4 border-banana rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
          <div className="p-4 md:p-6">
            <Dialog.Title className="text-lg md:text-xl font-press-start text-center text-banana mb-6">
              SYSTEM ANNOUNCEMENTS
            </Dialog.Title>
            
            <div className="bg-royal-dark p-3 md:p-4 mb-6 md:mb-8 rounded">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="mb-4 pb-4 border-b border-banana/30 last:border-0 last:mb-0 last:pb-0">
                  <p className="font-press-start text-banana text-xs mb-2">[{announcement.date}]</p>
                  <p className="font-press-start text-white text-sm">{announcement.text}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-transparent font-press-start text-banana border-2 border-banana hover:bg-banana hover:text-royal transition-colors text-xs md:text-sm"
              >
                CLOSE TERMINAL
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AnnouncementsModal; 