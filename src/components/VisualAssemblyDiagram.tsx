import React, { useState } from 'react';
import { Layers, Eye, CheckCircle2, AlertTriangle, ZoomIn, Info, Check } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface VisualAssemblyDiagramProps {
  partCategory: string;
  vehicleSpec: string;
  diagramUrl?: string;
  ambiguityTitle?: string;
  visualPrompt?: string;
  onConfirmVariant?: (variantName: string) => void;
}

export const VisualAssemblyDiagram: React.FC<VisualAssemblyDiagramProps> = ({
  partCategory,
  vehicleSpec,
  ambiguityTitle = 'Flange & Fitting Variant Ambiguity',
  visualPrompt = "I've pulled up the diagram on screen. Is it the 4-bolt or 3-bolt housing?",
  onConfirmVariant
}) => {
  const isWaterPump = partCategory.toLowerCase().includes('water pump') || vehicleSpec.toLowerCase().includes('quantum');
  const isBearing = partCategory.toLowerCase().includes('bearing') || vehicleSpec.toLowerCase().includes('hilux 2.5');
  const isCVJoint = partCategory.toLowerCase().includes('cv') || partCategory.toLowerCase().includes('joint');

  const [selectedVariant, setSelectedVariant] = useState<string>(
    isWaterPump ? '4_bolt' : isBearing ? 'std_journal' : '30_spline_abs'
  );

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0e131b] to-black border border-cyan-500/30 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Blueprint Grid Background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono text-[9px] uppercase">
              <Eye className="w-3 h-3 mr-1" /> Multimodal Visual Part Diagram
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] uppercase font-bold">
              Mechanic Visual Confirmation Required
            </Badge>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
            Till-Point Reference Assembly: <span className="text-cyan-400">{partCategory}</span>
          </h4>
          <p className="text-[11px] text-text-dim">
            Application: <strong className="text-white/90">{vehicleSpec}</strong>
          </p>
        </div>

        <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1.5 rounded-lg shrink-0">
          Ref Spec: ISO-9001 / OEM CAD
        </div>
      </div>

      {/* Visual Blueprint Vector Graphic */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Schematic Rendering */}
        <div className="lg:col-span-7 bg-[#060a0f] p-4 rounded-xl border border-cyan-500/20 relative flex flex-col items-center justify-center min-h-[220px]">
          {isWaterPump ? (
            /* Quantum 2TR Water Pump Schematic */
            <svg viewBox="0 0 400 220" className="w-full h-48 drop-shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              {/* Outer Housing Casting */}
              <path d="M 120 70 C 150 40, 250 40, 280 70 C 310 100, 310 150, 280 180 C 250 200, 150 200, 120 180 C 90 150, 90 100, 120 70 Z" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              {/* Impeller Chamber */}
              <circle cx="200" cy="125" r="45" fill="#082f49" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 2" />
              {/* Center Pulley Shaft & Hub */}
              <circle cx="200" cy="125" r="24" fill="#0369a1" stroke="#38bdf8" strokeWidth="2.5" />
              <circle cx="200" cy="125" r="8" fill="#e0f2fe" />

              {/* 4-Bolt Holes vs 3-Bolt Holes Graphic */}
              {selectedVariant === '4_bolt' ? (
                <>
                  <circle cx="178" cy="103" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                  <circle cx="222" cy="103" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                  <circle cx="178" cy="147" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                  <circle cx="222" cy="147" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                  <text x="200" y="32" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">4-BOLT FLANGE (GWT-118A: 2011-2022)</text>
                </>
              ) : (
                <>
                  <circle cx="200" cy="98" r="5" fill="#f43f5e" stroke="#9f1239" strokeWidth="1.5" />
                  <circle cx="178" cy="142" r="5" fill="#f43f5e" stroke="#9f1239" strokeWidth="1.5" />
                  <circle cx="222" cy="142" r="5" fill="#f43f5e" stroke="#9f1239" strokeWidth="1.5" />
                  <text x="200" y="32" fill="#f43f5e" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">EARLY 3-BOLT FLANGE (GWT-117A: 2005-2010)</text>
                </>
              )}

              {/* Dimension Dimension Lines */}
              <line x1="160" y1="185" x2="240" y2="185" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
              <text x="200" y="198" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">PCD: 68.0 mm</text>
              <line x1="50" y1="125" x2="160" y2="125" stroke="#38bdf8" strokeWidth="1" />
              <text x="55" y="118" fill="#38bdf8" fontSize="9" fontFamily="monospace">Weep Hole</text>
            </svg>
          ) : isBearing ? (
            /* Hilux 2KD Big End Bearing Schematic */
            <svg viewBox="0 0 400 220" className="w-full h-48 drop-shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              {/* Semi-circular bearing shell */}
              <path d="M 100 130 A 80 80 0 0 1 300 130 L 280 130 A 60 60 0 0 0 120 130 Z" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2.5" />
              {/* Tri-metal layers */}
              <path d="M 102 128 A 78 78 0 0 1 298 128" fill="none" stroke="#facc15" strokeWidth="3" />
              {/* Locating Tang */}
              <rect x="94" y="125" width="8" height="14" fill="#38bdf8" rx="2" />
              <text x="75" y="145" fill="#94a3b8" fontSize="9" fontFamily="monospace">Offset Tang</text>
              {/* Oil Hole */}
              <circle cx="200" cy="50" r="7" fill="#082f49" stroke="#38bdf8" strokeWidth="2" />
              <text x="200" y="30" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                {selectedVariant === 'std_journal' ? 'CR-4155XP-STD (53.00 mm)' : 'CR-4155XP-025 (52.75 mm)'}
              </text>
              <text x="200" y="160" fill="#e2e8f0" fontSize="10" textAnchor="middle" fontFamily="monospace">Tri-Metal Copper-Lead Matrix</text>
            </svg>
          ) : (
            /* CV Joint Spline Schematic */
            <svg viewBox="0 0 400 220" className="w-full h-48 drop-shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <circle cx="200" cy="110" r="60" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="200" cy="110" r="30" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              {/* 6 Ball Tracks */}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const x = 200 + 44 * Math.cos(rad);
                const y = 110 + 44 * Math.sin(rad);
                return <circle key={i} cx={x} cy={y} r="10" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1.5" />;
              })}
              <text x="200" y="30" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                30-EXTERNAL SPLINES (HILUX VIGO 4x4)
              </text>
            </svg>
          )}

          <div className="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded">
            CAD Ver: 2026.10-ZA
          </div>
        </div>

        {/* Technical Callout & Mechanic Confirmation Controls */}
        <div className="lg:col-span-5 space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
            <span className="font-bold flex items-center gap-1.5 uppercase text-[11px] mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {ambiguityTitle}
            </span>
            <p className="text-[11px] leading-relaxed text-amber-100/90 italic">
              &quot;{visualPrompt}&quot;
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-text-dim block">
              Mechanic Visual Confirmation:
            </span>

            {isWaterPump && (
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVariant('4_bolt');
                    onConfirmVariant?.('GMB-GWT-118A (4-Bolt Flange)');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedVariant === '4_bolt'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-text-dim hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">4-Bolt Flange (GMB-GWT-118A)</div>
                    <div className="text-[10px] text-text-dim">PCD 68mm • 2011 to 2022 Quantum 2TR</div>
                  </div>
                  {selectedVariant === '4_bolt' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedVariant('3_bolt');
                    onConfirmVariant?.('GMB-GWT-117A (3-Bolt Flange)');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedVariant === '3_bolt'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-text-dim hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">3-Bolt Flange (GMB-GWT-117A)</div>
                    <div className="text-[10px] text-text-dim">Triangular hub • 2005 to 2010 Early Quantum</div>
                  </div>
                  {selectedVariant === '3_bolt' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </button>
              </div>
            )}

            {isBearing && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVariant('std_journal');
                    onConfirmVariant?.('CR-4155XP-STD (Standard 53.00mm)');
                  }}
                  className={`p-2 rounded-lg border text-left text-xs font-bold ${
                    selectedVariant === 'std_journal' ? 'bg-cyan-500/20 border-cyan-400 text-white' : 'bg-white/5 border-white/10 text-text-dim'
                  }`}
                >
                  Standard Journal (53.00mm)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVariant('025_under');
                    onConfirmVariant?.('CR-4155XP-025 (0.25mm Undersize)');
                  }}
                  className={`p-2 rounded-lg border text-left text-xs font-bold ${
                    selectedVariant === '025_under' ? 'bg-cyan-500/20 border-cyan-400 text-white' : 'bg-white/5 border-white/10 text-text-dim'
                  }`}
                >
                  0.25mm Under (52.75mm)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
