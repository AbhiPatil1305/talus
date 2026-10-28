import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-950/50 border-b border-amber-900/60 px-4 py-2 text-xs text-amber-200/90 flex items-center justify-center space-x-2">
      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
      <span>
        <strong>Educational Prototype Notice:</strong> TALUS is an academic hackathon simulation
        concept for psychomotor training. It is <em>not</em> clinically validated and does not substitute for accredited, supervised surgical training.
      </span>
    </div>
  );
};
