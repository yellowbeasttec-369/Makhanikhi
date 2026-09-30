import React, { useState } from 'react';
import { 
  Gamepad2, Award, CheckCircle2, XCircle, AlertTriangle, 
  RotateCcw, Sparkles, Shield, Wrench, Flame, Building, 
  Box, Trophy, ArrowRight, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Question {
  id: number;
  pillar: string;
  pillarNumber: number;
  title: string;
  scenario: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
    points: number;
  }[];
}

const GAME_QUESTIONS: Question[] = [
  {
    id: 1,
    pillar: 'Company Incorporation & Regulatory Compliance',
    pillarNumber: 1,
    title: 'The CIPC & Corporate Incorporation Check',
    scenario: 'You are dispatched to a high-value fleet service. Before client funds can be unlocked from the smart escrow vault, which regulatory documents must be verified on Makhanikhi?',
    options: [
      {
        text: 'A hand-written receipt book and verbal assurance from a local informal workshop.',
        isCorrect: false,
        explanation: 'Incorrect! Makhanikhi requires formal corporate registration to protect both the fleet owner and specialist.',
        points: 0
      },
      {
        text: 'Official CIPC Registration Certificate (CoR 14.3 / CK1) plus proof of current Annual Returns submission (or US Bizee/Incfile Articles of Organization).',
        isCorrect: true,
        explanation: 'Spot on! Pillar 1 requires authentic business incorporation and up-to-date annual returns to establish legal standing.',
        points: 35
      },
      {
        text: 'An expired trading license from 5 years ago.',
        isCorrect: false,
        explanation: 'Incorrect! Non-compliant or lapsed entities are rejected by the compliance oracle.',
        points: 0
      }
    ]
  },
  {
    id: 2,
    pillar: 'Mechanic Safety & Live Substance Verification',
    pillarNumber: 2,
    title: 'The Driveway Sobriety & PPE Protocol',
    scenario: 'You arrive at the client’s private driveway at 08:30 AM. What mandatory safety checklist must you pass before touching any vehicle or tool?',
    options: [
      {
        text: 'Drink an energy drink and work in sneakers and shorts because the weather is warm.',
        isCorrect: false,
        explanation: 'Violates OHSA and Makhanikhi Driveway protocols! Working without PPE leads to instant job suspension.',
        points: 0
      },
      {
        text: 'Submit a live timestamped substance test (photo/video), and gear up in full PPE: steel-toe boots, flame-retardant overalls, safety eye goggles, and mechanic grip gloves.',
        isCorrect: true,
        explanation: 'Excellent! Live substance verification and full PPE safeguard your life, your team, and unlock Pillar 2 points.',
        points: 35
      },
      {
        text: 'Ask the client if they have tools you can borrow and skip the safety test.',
        isCorrect: false,
        explanation: 'Incorrect! Borrowing client tools and skipping sobriety tests breaks chain-of-custody protocols.',
        points: 0
      }
    ]
  },
  {
    id: 3,
    pillar: 'Site Readiness & Toolset Audit',
    pillarNumber: 3,
    title: 'The Cooler Box vs Specialized Toolbox Audit',
    scenario: 'The site auditor inspects your mobile setup. Which tool setup passes Makhanikhi’s strict audit requirements?',
    options: [
      {
        text: 'A repurposed picnic cooler box containing loose sockets, spare engine parts, and unrelated personal lunch items.',
        isCorrect: false,
        explanation: 'AUTOMATIC DISQUALIFICATION! Cooler boxes, paint buckets, or disorganized tubs trigger the smart contract DisqualifiedToolboxDetected error!',
        points: 0
      },
      {
        text: 'A certified specialized multi-tier mechanic cantilever or roll-cab toolbox, deployed beneath a branded Makhanikhi gazebo with 6 branded sand bottles/cones and danger tape demarcating the work area.',
        isCorrect: true,
        explanation: 'Perfection! Certified specialized toolboxes, branded shelter, and strict sand-bottle/cone perimeter earn full Pillar 3 marks!',
        points: 30
      },
      {
        text: 'Tools laid out loosely on the client’s grass without danger tape or oil spill mats.',
        isCorrect: false,
        explanation: 'Severe violation! Unprotected grass risks environmental contamination and safety breach.',
        points: 0
      }
    ]
  }
];

export const RulesOfEngagementGame: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  const currentQ = GAME_QUESTIONS[currentStep];

  const handleSelectOption = (index: number) => {
    if (showExplanation) return;
    const option = currentQ.options[index];
    const newAnswers = [...selectedAnswers];
    newAnswers[currentStep] = index;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);

    if (option.isCorrect) {
      setScore(prev => prev + option.points);
      toast.success(`Correct! +${option.points} Points`);
    } else {
      toast.error('Incorrect option selected.');
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentStep < GAME_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setGameFinished(true);
      toast.success('Rules of Engagement Challenge Completed!');
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedAnswers([]);
    setShowExplanation(false);
    setScore(0);
    setGameFinished(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-industrial-charcoal via-industrial-charcoal/90 to-amber-950/20 border border-technic-yellow/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[10px] uppercase">
                Gamified Training Module
              </Badge>
              <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-[10px]">
                CPD Accredited: +50 Points
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-digital-white uppercase tracking-tight">
              Rules of Engagement Game
            </h1>
            <p className="text-text-dim text-xs sm:text-sm max-w-2xl mt-1">
              Test your knowledge on regulatory compliance, live substance testing, PPE, and the 
              site-ready audit to qualify for the <strong className="text-technic-yellow">15% platform fee discount tier</strong>!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-3 rounded-xl">
            <Trophy className="w-8 h-8 text-technic-yellow" />
            <div>
              <div className="text-[10px] text-text-dim uppercase font-bold tracking-widest">Live Score</div>
              <div className="text-xl font-black font-mono text-digital-white">
                {score} / 100 PTS
              </div>
            </div>
          </div>
        </div>
      </div>

      {!gameFinished ? (
        <Card className="bg-white/5 border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-technic-yellow/10 text-technic-yellow border-technic-yellow/30 text-[10px]">
                SCENARIO {currentStep + 1} OF {GAME_QUESTIONS.length}
              </Badge>
              <span className="text-xs font-mono text-text-dim">
                Pillar {currentQ.pillarNumber}: {currentQ.pillar}
              </span>
            </div>
            <CardTitle className="text-lg font-bold text-digital-white">
              {currentQ.title}
            </CardTitle>
            <CardDescription className="text-sm text-text-dim mt-2 leading-relaxed">
              {currentQ.scenario}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentStep] === idx;
                let btnStyle = 'border-white/10 hover:border-technic-yellow/40 hover:bg-white/5 text-text-dim';
                
                if (showExplanation) {
                  if (option.isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold';
                  } else if (isSelected && !option.isCorrect) {
                    btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-400';
                  } else {
                    btnStyle = 'border-white/5 opacity-40';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${btnStyle}`}
                  >
                    <div className="p-1 rounded-full bg-white/10 text-xs font-mono font-bold mt-0.5 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="text-sm leading-relaxed flex-1">
                      {option.text}
                    </div>
                    {showExplanation && option.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {showExplanation && isSelected && !option.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    currentQ.options[selectedAnswers[currentStep]]?.isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <strong className="block font-bold mb-1 uppercase tracking-wider">
                    {currentQ.options[selectedAnswers[currentStep]]?.isCorrect ? '✓ Audit Passed' : '✗ Audit Warning'}
                  </strong>
                  {currentQ.options[selectedAnswers[currentStep]]?.explanation}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Navigation */}
            {showExplanation && (
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleNext} 
                  className="bg-technic-yellow hover:bg-technic-yellow/90 text-industrial-charcoal font-black text-xs uppercase px-6"
                >
                  {currentStep < GAME_QUESTIONS.length - 1 ? 'Next Scenario' : 'View Results'} <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Results Card */
        <Card className="bg-white/5 border-technic-yellow/30 text-center p-8 relative overflow-hidden">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-technic-yellow/20 text-technic-yellow flex items-center justify-center mx-auto border border-technic-yellow/40">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-xs mb-2">
                CHALLENGE COMPLETED
              </Badge>
              <h2 className="text-3xl font-display font-black text-digital-white uppercase">
                {score >= 90 ? 'Master of Engagement' : 'Audit Refresher Required'}
              </h2>
              <p className="text-xs text-text-dim mt-2">
                Your final score is <strong className="text-technic-yellow text-base font-mono">{score} / 100 PTS</strong>.
                {score >= 90 
                  ? ' You have proven mastery over CIPC/Bizee regulatory filings, live substance protocols, and specialized toolbox standards!'
                  : ' Review the failed scenarios to ensure full compliance before dispatching to site.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-text-dim">
                <span>Pillar 1: Corporate Incorporation</span>
                <span className="font-bold text-white">35 / 35 PTS</span>
              </div>
              <div className="flex justify-between items-center text-text-dim">
                <span>Pillar 2: Live Substance & PPE</span>
                <span className="font-bold text-white">35 / 35 PTS</span>
              </div>
              <div className="flex justify-between items-center text-text-dim">
                <span>Pillar 3: Toolbox & Perimeter</span>
                <span className="font-bold text-white">30 / 30 PTS</span>
              </div>
              <div className="flex justify-between items-center text-technic-yellow font-bold border-t border-white/10 pt-2">
                <span>Continuous Professional Development:</span>
                <span>+50 CPD Credits Logged</span>
              </div>
            </div>

            <Button
              onClick={handleRestart}
              variant="outline"
              className="border-technic-yellow/30 text-technic-yellow hover:bg-technic-yellow/10 font-bold text-xs uppercase"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Play Challenge Again
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
