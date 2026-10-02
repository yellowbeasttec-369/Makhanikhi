import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, Terminal, ShieldCheck, 
  Send, RotateCcw, Copy, Check, Wrench, Search, ShoppingBag, 
  Truck, Coins, Globe, Radio, Play, ChevronRight, AlertCircle,
  Cpu, Layers, CheckCircle2, ArrowRight, BookOpen, Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { VisualAssemblyDiagram } from './VisualAssemblyDiagram';
import { toast } from 'sonner';

interface McpToolCall {
  tool: string;
  input: any;
  result: any;
}

interface AgentResponse {
  query: string;
  agent: string;
  architecture: string;
  locale: string;
  reasoning_steps: Array<{ step: string; tool?: string }>;
  mcp_tool_calls: McpToolCall[];
  spoken_voice_response: string;
  order?: any;
  stablecoin_currency: string;
}

const PRESET_MECHANIC_PROMPTS = [
  {
    label: "Quantum 2TR Water Pump Leak",
    tag: "Counter Reference & Flange Diagram",
    vehicle: "Toyota Quantum 2014 2TR-FE",
    prompt: "Alexa, this Quantum 2014 2TR-FE has a water pump leaking from the weep hole. Cross-reference part catalog and check closed-circuit ERP stock in Polokwane."
  },
  {
    label: "Hilux D-4D Cold Idle Knock",
    tag: "Acoustic Diagnosis & Bearing Ref",
    vehicle: "Toyota Hilux 2.5 D-4D 2KD",
    prompt: "Alexa, I've got a Hilux 2.5 D-4D with a metallic knocking noise on cold idle under the sump. Diagnose fault, cross-reference bearings, and check ERP stock in Polokwane."
  },
  {
    label: "ERP Stock for GMB-GWT-118A",
    tag: "Closed-Circuit Multi-Store ERP",
    vehicle: "SKU GMB-GWT-118A",
    prompt: "Alexa, check closed-circuit ERP stock for GMB-GWT-118A in Polokwane and Seshego."
  },
  {
    label: "Confirm Voice Spares Order",
    tag: "Hands-Free Escrow Purchase",
    vehicle: "Quantum 2TR Spares",
    prompt: "Alexa, confirm order: GMB-GWT-118A water pump from Seshego Auto Zone for delivery to Stand 412, Zone 4 workshop."
  }
];

export const AlexaVoiceSimulator: React.FC = () => {
  const [queryInput, setQueryInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'conversation' | 'mcp_inspector' | 'schema'>('conversation');
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-ZA');

  // Agent State Initialized with Counter-Dealer Cross-Reference Example
  const [latestResponse, setLatestResponse] = useState<AgentResponse | null>({
    query: "Alexa, this Quantum 2014 2TR-FE has a water pump leaking from the weep hole. Cross-reference part catalog and check closed-circuit ERP stock in Polokwane.",
    agent: "Amazon Bedrock AgentCore (Makhanikhi AI Counter-Dealer Engine)",
    architecture: "Alexa+ Model Context Protocol (MCP) Server",
    locale: "en-ZA (Limpopo Automotive Vernacular)",
    reasoning_steps: [
      { step: "Transcribed audio query received from mechanic working hands-free under chassis." },
      { step: "Bedrock AgentCore analyzed acoustic fault. Invoking MCP tool: 'diagnose_vehicle_symptom' for Toyota Quantum 2014 2TR-FE 2.7 (2TR-FE).", tool: "diagnose_vehicle_symptom" },
      { step: "Bedrock AgentCore digitized till-point counter reference book. Invoking MCP tool: 'cross_reference_part_catalog' for OEM-to-aftermarket mapping.", tool: "cross_reference_part_catalog" },
      { step: "Bedrock AgentCore queried closed-circuit motor spares ERP systems in Limpopo. Invoking MCP tool: 'check_closed_circuit_erp_stock' for SKU GMB-GWT-118A.", tool: "check_closed_circuit_erp_stock" }
    ],
    mcp_tool_calls: [
      {
        tool: "diagnose_vehicle_symptom",
        input: {
          vehicle_make: "Toyota",
          vehicle_model: "Quantum 2014 2TR-FE 2.7",
          engine_code: "2TR-FE",
          symptom_description: "Water pump leaking from the weep hole"
        },
        result: {
          vehicle: "Toyota Quantum 2014 2TR-FE 2.7",
          primary_failure_mode: "Mechanical Water Pump Seal Carbon Erosion & Bearing Free-Play",
          urgency: "HIGH - Risk of sudden catastrophic overheating, warped cylinder head, and blown head gasket on taxi route",
          torque_specs: [
            "Water Pump Housing Mounting Bolts (M8): 21 Nm",
            "Fan Pulley Hub Nuts: 16 Nm"
          ]
        }
      },
      {
        tool: "cross_reference_part_catalog",
        input: {
          vehicle_spec: "Toyota Quantum 2014 2TR-FE 2.7 2TR-FE",
          part_category: "Water Pump Housing",
          brand_preference: "OEM_or_HighQuality_Aftermarket"
        },
        result: {
          matched_vehicle: "Toyota Quantum 2014 2TR-FE 2.7 Petrol (2005-2022)",
          part_category: "Water Pump Housing & Impeller Assembly",
          oem_part_number: "TOY-16100-79445",
          superseded_oem: "TOY-16100-79285 (Early 3-bolt variant)",
          aftermarket_cross_references: [
            {
              brand: "GMB Japan (Heavy Duty)",
              part_number: "GMB-GWT-118A",
              tier: "Tier-1 High Quality Aftermarket",
              flange_type: "4-Bolt Pulley Mount Flange (Post-2011 standard)",
              indicative_price_zar: 850
            },
            {
              brand: "AISIN (OEM Tier-1 Supplier)",
              part_number: "AISIN-WPT-140",
              tier: "OEM Equivalent",
              flange_type: "4-Bolt Pulley Mount Flange",
              indicative_price_zar: 1250
            }
          ],
          physical_dimensions: {
            flange_hub_diameter_mm: 55,
            bolt_pattern: "4-Bolt Pulley Mount (68mm Pitch Circle Diameter)",
            impeller_diameter_mm: 62.5
          },
          diagram_url: "/diagrams/quantum_2tr_water_pump_flange.svg",
          ambiguity_detected: true,
          ambiguity_title: "3-Bolt vs 4-Bolt Pulley Flange Ambiguity",
          visual_confirmation_prompt: "I've pulled up the diagram on screen. Is it the 4-bolt or 3-bolt housing?",
          counter_dealer_notes: "Quantum 2TR taxis built between 2005-2010 frequently came with 3-bolt pulley hubs, whereas 2011 onward uses the 4-bolt GMB GWT-118A. Check the visual diagram before dispatch."
        }
      },
      {
        tool: "check_closed_circuit_erp_stock",
        input: {
          part_number: "GMB-GWT-118A",
          region: "Polokwane_Limpopo"
        },
        result: {
          erp_system_status: "ONLINE (Limpopo Regional Multi-Store Link)",
          results_count: 2,
          participating_vendors_found: ["Polokwane Motor Spares Central", "Seshego Auto Zone & Spares Hub"],
          matches: [
            {
              supplier_id: "SUP-PLK-01",
              supplier_name: "Polokwane Motor Spares Central",
              branch: "CBD (Excelsior St & Market)",
              part_number: "GMB-GWT-118A",
              part_name: "Water Pump Housing & Impeller Assembly (4-Bolt Flange)",
              brand: "GMB Japan (Heavy Duty)",
              price_zar: 890,
              price_zaru: 890,
              stock_qty: 5,
              delivery_eta_minutes: 25
            },
            {
              supplier_id: "SUP-SES-02",
              supplier_name: "Seshego Auto Zone & Spares Hub",
              branch: "Zone 1 Plaza (Near Taxi Rank)",
              part_number: "GMB-GWT-118A",
              part_name: "Water Pump Housing & Impeller Assembly (4-Bolt Flange)",
              brand: "GMB Japan (Heavy Duty)",
              price_zar: 850,
              price_zaru: 850,
              stock_qty: 3,
              delivery_eta_minutes: 15
            }
          ]
        }
      }
    ],
    spoken_voice_response: "Chief, on that Toyota Quantum 2014 2TR-FE 2.7 (2TR-FE), water pump weep hole leakage indicates mechanical ceramic-carbon face seal failure. I've pulled up the diagram on screen. Is it the 4-bolt or 3-bolt housing? In stock at Polokwane Motor Spares Central (CBD (Excelsior St & Market)). Brand: GMB Japan (Heavy Duty), Part Number: GMB-GWT-118A. Total price: R890 ZAR (or 890 ZARU stablecoin), delivery in 25 minutes. Seshego Auto Zone & Spares Hub also has GMB Japan (Heavy Duty) (GMB-GWT-118A) for R850 ZAR. Say 'Confirm order with Seshego' to lock funds in smart escrow and dispatch delivery to your workshop now.",
    stablecoin_currency: "ZARU (1 ZARU = 1 ZAR)"
  });

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for voice input if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-ZA';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQueryInput(transcript);
          setIsListening(false);
          handleExecuteAgent(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
          toast.error("Microphone recognition paused. You can use one-tap prompts or type.");
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Text to Speech playback
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-ZA';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          toast.info("Listening... speak your vehicle symptom or spares request!");
        } catch {
          recognitionRef.current.stop();
        }
      } else {
        toast.info("Web Speech recognition not supported in this browser. Please use the preset buttons or text input.");
      }
    }
  };

  const handleExecuteAgent = async (overridePrompt?: string) => {
    const textToRun = (overridePrompt || queryInput).trim();
    if (!textToRun) {
      toast.error("Please enter or speak a vehicle symptom or spares query.");
      return;
    }

    setIsLoading(true);
    stopSpeaking();

    try {
      const response = await fetch('/api/mcp/bedrock-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToRun,
          mechanic_id: 'MECH-LIMPOPO-01',
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`MCP Server responded with status ${response.status}`);
      }

      const data: AgentResponse = await response.json();
      setLatestResponse(data);
      setQueryInput('');

      // Trigger authoritative spoken output
      if (speechEnabled && data.spoken_voice_response) {
        speakText(data.spoken_voice_response);
      }

      toast.success("Bedrock AgentCore executed MCP tools successfully!");
    } catch (err: any) {
      console.error("Agent execution failed:", err);
      toast.error(err.message || "Failed to communicate with MCP server at /api/mcp");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCurl = () => {
    const curlCommand = `curl -X POST https://makhanikhi.vercel.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "diagnose_vehicle_symptom",
      "arguments": {
        "vehicle_make": "Toyota",
        "vehicle_model": "Hilux 2.5 D-4D",
        "symptom_description": "Metallic knocking noise on cold idle"
      }
    }
  }'`;
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    toast.success("MCP JSON-RPC curl command copied to clipboard!");
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-industrial-charcoal via-[#14181F] to-[#0D1015] border border-technic-yellow/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-technic-yellow to-transparent opacity-60" />
      
      {/* Header Bar */}
      <div className="p-6 sm:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
              <Radio className="w-3 h-3 animate-pulse" /> Alexa+ MCP Copilot
            </Badge>
            <Badge variant="outline" className="border-blue-400/40 text-blue-300 font-mono text-[10px]">
              Amazon Bedrock AgentCore
            </Badge>
            <Badge variant="outline" className="border-emerald-400/40 text-emerald-300 font-mono text-[10px]">
              Endpoint: /api/mcp
            </Badge>
            <Badge variant="outline" className="border-amber-400/40 text-amber-300 font-mono text-[10px]">
              Region: Polokwane • Seshego • Mankweng
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase italic tracking-tight flex items-center gap-3">
            Hands-Free Voice Diagnostic & Spares Copilot
          </h2>
          <p className="text-text-dim text-xs sm:text-sm max-w-3xl mt-1">
            Built for informal auto-mechanics working under vehicle chassis with oil-covered hands. 
            Speaks authentic South African workshop vernacular, queries real-time Limpopo motor spares, and confirms escrow purchases hands-free.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`border-white/10 text-xs font-bold uppercase transition-all ${
              speechEnabled ? 'text-technic-yellow bg-technic-yellow/10 border-technic-yellow/30' : 'text-text-dim'
            }`}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4 mr-1.5" /> : <VolumeX className="w-4 h-4 mr-1.5" />}
            {speechEnabled ? 'Voice Output: ON' : 'Voice Output: MUTED'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={copyCurl}
            className="border-white/10 text-xs font-mono text-white/90 hover:text-technic-yellow"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            Copy MCP cURL
          </Button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Interactive Orb & Voice Command Bar */}
        <div className="p-6 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden flex flex-col items-center text-center space-y-5">
          {/* Animated Voice Orb */}
          <div className="relative flex items-center justify-center">
            {/* Outer rings */}
            <div className={`absolute w-36 h-36 rounded-full transition-all duration-700 ${
              isListening ? 'bg-rose-500/20 scale-125 animate-ping' :
              isSpeaking ? 'bg-technic-yellow/20 scale-125 animate-pulse' :
              'bg-blue-500/10'
            }`} />
            <div className={`absolute w-28 h-28 rounded-full border border-dashed transition-all duration-500 ${
              isListening ? 'border-rose-400 rotate-180 animate-spin' :
              isSpeaking ? 'border-technic-yellow rotate-90 animate-spin' :
              'border-white/10'
            }`} />
            
            {/* Core Orb Button */}
            <button
              onClick={toggleMic}
              disabled={isLoading}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                isListening 
                  ? 'bg-rose-500 text-white scale-110 shadow-[0_0_40px_rgba(244,63,94,0.6)]' 
                  : isSpeaking
                  ? 'bg-technic-yellow text-industrial-charcoal scale-105 shadow-[0_0_40px_rgba(255,210,0,0.5)]'
                  : 'bg-white/10 hover:bg-technic-yellow hover:text-industrial-charcoal text-white border border-white/20'
              }`}
            >
              {isListening ? (
                <Mic className="w-9 h-9 animate-bounce" />
              ) : isSpeaking ? (
                <Volume2 className="w-9 h-9 animate-pulse" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          <div>
            <span className="text-xs uppercase font-black tracking-widest text-text-dim block">
              {isListening ? "🔴 LISTENING TO MECHANIC IN LIMPOPO..." :
               isSpeaking ? "🔊 ALEXA+ SPEAKING AUTHENTIC SA DIAGNOSTIC ADVICE..." :
               isLoading ? "⚙️ BEDROCK AGENTCORE PROCESSING MCP TOOLS..." :
               "TAP MIC OR ONE-TOUCH PRESET TO TRIGGER HANDS-FREE WORKSHOP VOICE"}
            </span>
            <p className="text-[11px] text-text-dim/80 mt-1 max-w-lg mx-auto">
              Under the chassis? Speak vehicle faults (knock, blow-by, clicking CV) or say &quot;Confirm order&quot; to lock funds in smart escrow.
            </p>
          </div>

          {/* Quick Voice Prompt Buttons for Informal Mechanics */}
          <div className="w-full space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-text-dim">
              <span className="uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-technic-yellow" /> One-Touch Hands-Free Mechanic Scenarios:
              </span>
              <span className="text-[10px] text-technic-yellow/80">Click to simulate audio input</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESET_MECHANIC_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQueryInput(item.prompt);
                    handleExecuteAgent(item.prompt);
                  }}
                  disabled={isLoading}
                  className="p-3 rounded-xl bg-white/5 hover:bg-technic-yellow/10 border border-white/5 hover:border-technic-yellow/40 text-left transition-all group relative"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-technic-yellow font-bold uppercase">{item.vehicle}</span>
                    <Badge variant="outline" className="text-[8px] border-white/10 text-white/70 py-0 px-1.5">
                      {item.tag}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-white group-hover:text-technic-yellow transition-colors line-clamp-1">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-text-dim line-clamp-2 mt-1 italic">
                    &quot;{item.prompt}&quot;
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Bar */}
          <div className="w-full flex gap-2 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteAgent()}
                placeholder="Or type voice transcript (e.g. 'Toyota Hilux 2KD metallic knocking noise on cold idle in Polokwane')..."
                className="w-full bg-industrial-charcoal border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-text-dim focus:outline-none focus:border-technic-yellow font-mono"
              />
            </div>
            <Button
              onClick={() => handleExecuteAgent()}
              disabled={isLoading || !queryInput.trim()}
              className="bg-technic-yellow text-industrial-charcoal hover:bg-technic-yellow/90 font-black text-xs uppercase px-5 rounded-xl h-auto"
            >
              {isLoading ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Tab Switcher: Conversation / MCP Tool Inspector / MCP Raw Schema */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('conversation')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'conversation'
                  ? 'bg-technic-yellow text-industrial-charcoal shadow-md'
                  : 'bg-white/5 text-text-dim hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> Spoken Dialogue & Advice
            </button>
            <button
              onClick={() => setActiveTab('mcp_inspector')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'mcp_inspector'
                  ? 'bg-technic-yellow text-industrial-charcoal shadow-md'
                  : 'bg-white/5 text-text-dim hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Live MCP JSON Tool Inspector
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'schema'
                  ? 'bg-technic-yellow text-industrial-charcoal shadow-md'
                  : 'bg-white/5 text-text-dim hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> MCP Server Schemas (/api/mcp)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-text-dim font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            MCP Server: Active (Port 3000)
          </div>
        </div>

        {/* TAB 1: Conversation & Spoken Dialogue */}
        {activeTab === 'conversation' && latestResponse && (
          <div className="space-y-4">
            {/* Audio Transcript Card */}
            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-white/60 border-white/20 text-[10px] uppercase font-mono">
                    Mechanic Utterance
                  </Badge>
                  <span className="text-[11px] text-text-dim">Transcription via Alexa+</span>
                </div>
                <span className="text-[10px] font-mono text-technic-yellow">Limpopo Region</span>
              </div>
              <p className="text-sm sm:text-base font-medium text-white italic bg-white/5 p-3 rounded-xl border border-white/5">
                &quot;{latestResponse.query}&quot;
              </p>

              {/* Alexa+ Spoken Vernacular Response */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-technic-yellow tracking-wider flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-technic-yellow" />
                    Alexa+ Counter-Dealer Spoken Readout:
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speakText(latestResponse.spoken_voice_response)}
                    className="h-7 text-[10px] text-technic-yellow hover:text-white uppercase font-bold"
                  >
                    <Play className="w-3 h-3 mr-1" /> Replay Voice
                  </Button>
                </div>
                <div className="p-4 rounded-xl bg-technic-yellow/10 border border-technic-yellow/30 text-white text-xs sm:text-sm leading-relaxed font-sans shadow-inner">
                  {latestResponse.spoken_voice_response}
                </div>
              </div>
            </div>

            {/* Multimodal Visual Assembly Diagram Card (Displays when ambiguity is detected) */}
            {(() => {
              const crossRefCall = latestResponse.mcp_tool_calls.find(c => c.tool === 'cross_reference_part_catalog');
              if (crossRefCall && crossRefCall.result) {
                return (
                  <div className="space-y-3">
                    <VisualAssemblyDiagram
                      partCategory={crossRefCall.result.part_category || "Water Pump Housing"}
                      vehicleSpec={crossRefCall.result.matched_vehicle || "Toyota Quantum 2014 2TR-FE"}
                      diagramUrl={crossRefCall.result.diagram_url}
                      ambiguityTitle={crossRefCall.result.ambiguity_title}
                      visualPrompt={crossRefCall.result.visual_confirmation_prompt}
                      onConfirmVariant={(variantName) => {
                        toast.success(`Mechanic visually confirmed: ${variantName}`);
                      }}
                    />

                    {/* Counter-Dealer Till-Point Cross-Reference Table */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-bold text-white flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-technic-yellow" />
                          Digitized Till-Point Reference Book Cross-References:
                        </span>
                        <Badge variant="outline" className="border-cyan-400/40 text-cyan-300 font-mono text-[9px]">
                          OEM: {crossRefCall.result.oem_part_number}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {crossRefCall.result.aftermarket_cross_references?.map((xref: any, i: number) => (
                          <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                            <div className="text-[10px] text-technic-yellow font-bold uppercase">{xref.brand}</div>
                            <div className="font-mono font-bold text-white text-xs mt-0.5">{xref.part_number}</div>
                            <div className="text-[10px] text-text-dim mt-0.5">{xref.flange_type || xref.tier}</div>
                            {xref.indicative_price_zar && (
                              <div className="text-[10px] font-mono text-emerald-400 font-bold mt-1">
                                Est: R{xref.indicative_price_zar} ZAR
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Quick Action Badges & Escrow Order Notice */}
            {latestResponse.order && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase block">
                      Escrow Order #{latestResponse.order.order_id} Locked in Vault
                    </span>
                    <span className="text-[11px] text-text-dim">
                      {latestResponse.order.part_name} from {latestResponse.order.supplier_name} • R{latestResponse.order.total_price_zar} ZAR ({latestResponse.order.total_price_zaru} ZARU)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Badge className="bg-emerald-500 text-industrial-charcoal font-black text-[10px]">
                    COURIER ETA: {latestResponse.order.courier_eta_minutes} MINS
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Live MCP JSON Tool Inspector */}
        {activeTab === 'mcp_inspector' && latestResponse && (
          <div className="space-y-6">
            {/* Reasoning Steps */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <span className="text-xs uppercase font-bold text-text-dim tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-technic-yellow" />
                Amazon Bedrock AgentCore Execution Trace:
              </span>
              <div className="space-y-2">
                {latestResponse.reasoning_steps.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-white/90 font-mono">
                    <span className="w-5 h-5 rounded-full bg-technic-yellow/20 text-technic-yellow flex items-center justify-center text-[10px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <span>{r.step}</span>
                      {r.tool && (
                        <Badge variant="outline" className="ml-2 text-[9px] text-blue-300 border-blue-400/40">
                          TOOL: {r.tool}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MCP Tool Calls and JSON Responses */}
            <div className="space-y-4">
              <span className="text-xs uppercase font-bold text-text-dim tracking-wider block">
                Executed Model Context Protocol (MCP) Tool Calls:
              </span>

              {latestResponse.mcp_tool_calls.map((call, idx) => (
                <div key={idx} className="rounded-2xl bg-black/60 border border-white/10 overflow-hidden font-mono text-xs">
                  {/* Tool Header */}
                  <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white uppercase">{call.tool}</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">
                      JSON-RPC 2.0 Success
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                    {/* Tool Input Arguments */}
                    <div className="p-4 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-text-dim block">Input Arguments (tools/call):</span>
                      <pre className="text-[11px] text-blue-300 overflow-x-auto whitespace-pre-wrap p-2 bg-black/40 rounded-lg border border-white/5 max-h-60">
                        {JSON.stringify(call.input, null, 2)}
                      </pre>
                    </div>

                    {/* Tool Output Result */}
                    <div className="p-4 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-text-dim block">Result Payload:</span>
                      <pre className="text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap p-2 bg-black/40 rounded-lg border border-white/5 max-h-60">
                        {JSON.stringify(call.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MCP Server Schemas */}
        {activeTab === 'schema' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-text-dim flex items-center justify-between">
              <div>
                <strong className="text-white block">Standard Model Context Protocol (MCP) Server Specification</strong>
                <span>Exposed live at <code>/api/mcp</code> for Bedrock AgentCore, Claude Desktop, and Alexa+ runtimes.</span>
              </div>
              <Button size="sm" variant="outline" onClick={copyCurl} className="border-white/10 text-xs text-white">
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy cURL
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tool 1 */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[9px] w-fit mb-1">
                    TOOL 1
                  </Badge>
                  <CardTitle className="text-sm font-mono font-bold text-white">
                    diagnose_vehicle_symptom
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Acoustic notes & symptom diagnosis for make/model/engine.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-[11px] font-mono text-text-dim space-y-1">
                  <div><strong>Params:</strong></div>
                  <div>• vehicle_make (string)</div>
                  <div>• vehicle_model (string)</div>
                  <div>• engine_code (string)</div>
                  <div>• symptom_description (string)</div>
                  <div className="text-emerald-400 pt-2">Returns: failure modes, torque specs, diagnostic steps</div>
                </CardContent>
              </Card>

              {/* Tool 2 */}
              <Card className="bg-white/5 border-cyan-500/20">
                <CardHeader className="pb-2">
                  <Badge className="bg-cyan-400 text-industrial-charcoal font-black text-[9px] w-fit mb-1">
                    TOOL 2 (NEW)
                  </Badge>
                  <CardTitle className="text-sm font-mono font-bold text-white">
                    cross_reference_part_catalog
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Digitizes till-point reference book (OEM to GMB/King/Ferodo).
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-[11px] font-mono text-text-dim space-y-1">
                  <div><strong>Params:</strong></div>
                  <div>• vehicle_spec (string)</div>
                  <div>• part_category (string)</div>
                  <div>• brand_preference (string)</div>
                  <div className="text-cyan-400 pt-2">Returns: OEM part #, aftermarket cross-refs, dimensions, diagram_url</div>
                </CardContent>
              </Card>

              {/* Tool 3 */}
              <Card className="bg-white/5 border-blue-500/20">
                <CardHeader className="pb-2">
                  <Badge className="bg-blue-400 text-industrial-charcoal font-black text-[9px] w-fit mb-1">
                    TOOL 3
                  </Badge>
                  <CardTitle className="text-sm font-mono font-bold text-white">
                    check_closed_circuit_erp_stock
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Queries closed-circuit ERP stock across Limpopo shops.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-[11px] font-mono text-text-dim space-y-1">
                  <div><strong>Params:</strong></div>
                  <div>• part_number (string)</div>
                  <div>• region (Polokwane/Seshego/Mankweng)</div>
                  <div className="text-emerald-400 pt-2">Returns: prices ZAR/ZARU, stock count, supplier ID, ETA</div>
                </CardContent>
              </Card>

              {/* Tool 4 */}
              <Card className="bg-white/5 border-emerald-500/20">
                <CardHeader className="pb-2">
                  <Badge className="bg-emerald-400 text-industrial-charcoal font-black text-[9px] w-fit mb-1">
                    TOOL 4
                  </Badge>
                  <CardTitle className="text-sm font-mono font-bold text-white">
                    create_voice_spares_order
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Voice-confirmed purchase locking funds in escrow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-[11px] font-mono text-text-dim space-y-1">
                  <div><strong>Params:</strong></div>
                  <div>• mechanic_id (string)</div>
                  <div>• supplier_id (string)</div>
                  <div>• part_number (string)</div>
                  <div>• delivery_address (string)</div>
                  <div className="text-emerald-400 pt-2">Returns: escrow PDA tx, courier dispatch, spoken voice readout</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Regional Architecture Footer */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-technic-yellow shrink-0" />
            <div>
              <span className="font-bold text-white block">Pan-African Multilingual & Stablecoin Expansion Ready</span>
              <span className="text-[11px] text-text-dim">
                Architecture ready for Vambo AI & Lelapa AI integration (Sepedi, isiZulu, Hausa, Yoruba, Swahili) across stablecoin economies (SA, Ghana, Nigeria, Kenya).
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-technic-yellow border-technic-yellow/30 font-mono text-[10px]">
              Currency: ZAR / ZARU (1:1 Peg)
            </Badge>
            <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 font-mono text-[10px]">
              Solana Escrow PDA
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
