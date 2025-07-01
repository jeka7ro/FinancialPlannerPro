import React from 'react';
import { 
  LogOut, 
  X, 
  XCircle, 
  XSquare, 
  ArrowRightFromLine, 
  ArrowRight, 
  ArrowUpRight,
  DoorOpen,
  DoorClosed,
  Power,
  PowerOff,
  UserMinus,
  UserX,
  CornerUpLeft,
  Move,
  SkipBack
} from 'lucide-react';
import Windows11Card from '../components/ui/Windows11Card';
import Windows11Button from '../components/ui/Windows11Button';

const IconDemo: React.FC = () => {
  const logoutIcons = [
    { name: 'LogOut', icon: LogOut, description: 'Iconița standard de logout' },
    { name: 'X', icon: X, description: 'X simplu pentru închidere' },
    { name: 'XCircle', icon: XCircle, description: 'X în cerc' },
    { name: 'XSquare', icon: XSquare, description: 'X în pătrat' },
    { name: 'ArrowRightFromLine', icon: ArrowRightFromLine, description: 'Săgeată spre dreapta cu linie' },
    { name: 'ArrowRight', icon: ArrowRight, description: 'Săgeată simplă spre dreapta' },
    { name: 'ArrowUpRight', icon: ArrowUpRight, description: 'Săgeată diagonală spre dreapta-sus' },
    { name: 'DoorOpen', icon: DoorOpen, description: 'Ușă deschisă' },
    { name: 'DoorClosed', icon: DoorClosed, description: 'Ușă închisă' },
    { name: 'Power', icon: Power, description: 'Buton power' },
    { name: 'PowerOff', icon: PowerOff, description: 'Power off' },
    { name: 'UserMinus', icon: UserMinus, description: 'User minus' },
    { name: 'UserX', icon: UserX, description: 'User X' },
    { name: 'CornerUpLeft', icon: CornerUpLeft, description: 'Săgeată colț stânga sus' },
    { name: 'Move', icon: Move, description: 'Move' },
    { name: 'SkipBack', icon: SkipBack, description: 'Skip back' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4fa', padding: 40 }}>
      <h1 style={{ fontSize: 32, marginBottom: 32 }}>Demo Windows 11 Card & Button</h1>
      <Windows11Card style={{ maxWidth: 400, margin: '0 auto', marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Card Pastel/Gradient</h2>
        <p>Acesta este un card cu fundal pastel/gradient, complet custom.</p>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Windows11Button>Buton Pastel/Gradient</Windows11Button>
        </div>
      </Windows11Card>
      <div style={{ padding: 32 }}>
        <h2 className="text-xl font-bold mb-4">Demonstrație iconițe logout</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {logoutIcons.map(({ name, icon: Icon, description }) => (
            <div key={name} className="flex flex-col items-center p-4 border rounded-lg shadow bg-white/80 dark:bg-slate-900/80">
              <Icon className="w-8 h-8 mb-2" />
              <span className="font-semibold text-sm mb-1">{name}</span>
              <span className="text-xs text-slate-500 text-center">{description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IconDemo; 