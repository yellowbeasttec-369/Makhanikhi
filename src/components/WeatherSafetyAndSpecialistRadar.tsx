import React, { useState, useMemo } from 'react';
import { 
  CloudRain, Sun, Wind, Thermometer, ShieldAlert, ShieldCheck, 
  MapPin, Users, Wrench, AlertTriangle, CheckCircle2, Umbrella, 
  Eye, Droplets, Compass, Activity, Sparkles, Clock, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { evaluateWeatherWorkViability, JobWeatherCategory } from '../services/escrowService';
import { toast } from 'sonner';

interface SpecialistRadarItem {
  id: string;
  name: string;
  category: 'diagnostics' | 'powertrain' | 'brakes_suspension' | 'roadside_emergency' | 'ac_cooling';
  specialtyLabel: string;
  distanceKm: number;
  rating: number;
  hasAllWeatherGazeboWithWalls: boolean;
  status: 'available' | 'on_callout' | 'sheltered_standby';
  vehicleType: string;
}

const SAMPLE_SPECIALISTS: SpecialistRadarItem[] = [
  { id: 'sp-1', name: 'Sipho "The Hands" Khumalo', category: 'powertrain', specialtyLabel: 'Ford & Toyota Engine / Drivetrain', distanceKm: 3.4, rating: 4.9, hasAllWeatherGazeboWithWalls: true, status: 'available', vehicleType: 'Ranger 2.2 Workhorse' },
  { id: 'sp-2', name: 'Karabo Dlamini', category: 'diagnostics', specialtyLabel: 'Advanced CAN-bus & ECU Diagnostics', distanceKm: 4.8, rating: 5.0, hasAllWeatherGazeboWithWalls: true, status: 'available', vehicleType: 'NP200 Tool Rig' },
  { id: 'sp-3', name: 'Mandla Sithole', category: 'roadside_emergency', specialtyLabel: '24/7 Mobile Jumpstart & Fuel Systems', distanceKm: 6.2, rating: 4.8, hasAllWeatherGazeboWithWalls: true, status: 'available', vehicleType: 'Hilux Utility Bakkie' },
  { id: 'sp-4', name: 'Pieter van der Merwe', category: 'brakes_suspension', specialtyLabel: 'Commercial Calipers & Strut Geometry', distanceKm: 11.5, rating: 4.9, hasAllWeatherGazeboWithWalls: true, status: 'on_callout', vehicleType: 'Isuzu D-Max Service Unit' },
  { id: 'sp-5', name: 'Thabo Mokoena', category: 'ac_cooling', specialtyLabel: 'HVAC Leak Tracing & Radiator Cores', distanceKm: 13.1, rating: 4.7, hasAllWeatherGazeboWithWalls: true, status: 'available', vehicleType: 'Caddy Maxi Mobile Workshop' },
  { id: 'sp-6', name: 'Lindiwe Ndlovu', category: 'diagnostics', specialtyLabel: 'Wiring Harness & Sensor Calibration', distanceKm: 16.4, rating: 5.0, hasAllWeatherGazeboWithWalls: false, status: 'sheltered_standby', vehicleType: 'NP200 Mobile Box' },
  { id: 'sp-7', name: 'Kagiso Lekota', category: 'roadside_emergency', specialtyLabel: 'Emergency Roadside Recovery & Battery', distanceKm: 19.8, rating: 4.9, hasAllWeatherGazeboWithWalls: true, status: 'available', vehicleType: 'Ford Courier Tool Van' },
  { id: 'sp-8', name: 'Devon Govender', category: 'powertrain', specialtyLabel: 'Common-Rail Diesel Injectors & Turbos', distanceKm: 24.0, rating: 4.8, hasAllWeatherGazeboWithWalls: true, status: 'on_callout', vehicleType: 'Ranger SuperCab' },
  { id: 'sp-9', name: 'Blessing Moyo', category: 'brakes_suspension', specialtyLabel: 'ABS Hydro Units & Brake Overhauls', distanceKm: 28.5, rating: 4.7, hasAllWeatherGazeboWithWalls: true, status: 'available', vehicleType: 'Navara 2.5 Single Cab' },
  { id: 'sp-10', name: 'Nico Jacobs', category: 'ac_cooling', specialtyLabel: 'Compressors, Condensers & Evaporators', distanceKm: 38.2, rating: 4.9, hasAllWeatherGazeboWithWalls: true, status: 'available', vehicleType: 'Mazda BT-50 Service Pod' }
];

export const WeatherSafetyAndSpecialistRadar: React.FC = () => {
  // Weather State (with real-time simulated telemetry controls)
  const [weather, setWeather] = useState({
    temperatureC: 28,
    precipitationMm: 1.2,
    rainProbability: 55,
    windSpeedKmh: 18,
    humidityPercent: 68,
    uvIndex: 7,
    isLightningDetected: false,
    lastSyncTime: new Date().toLocaleTimeString()
  });

  // Selected Radius for Specialist Density
  const [selectedRadius, setSelectedRadius] = useState<number>(30);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hasGazeboWithWalls, setHasGazeboWithWalls] = useState<boolean>(true);
  const [testJobType, setTestJobType] = useState<string>('Air Filter & Ignition Coil Service');

  // Evaluate viability based on the selected job type and weather
  const viability = useMemo(() => {
    return evaluateWeatherWorkViability(testJobType, weather, hasGazeboWithWalls);
  }, [testJobType, weather, hasGazeboWithWalls]);

  // Filter specialists within radius
  const filteredSpecialists = useMemo(() => {
    return SAMPLE_SPECIALISTS.filter(sp => {
      const withinRadius = sp.distanceKm <= selectedRadius;
      const matchesCategory = selectedCategory === 'all' || sp.category === selectedCategory;
      return withinRadius && matchesCategory;
    });
  }, [selectedRadius, selectedCategory]);

  // Counts by category within radius
  const categoryCounts = useMemo(() => {
    const counts = {
      diagnostics: 0,
      powertrain: 0,
      brakes_suspension: 0,
      roadside_emergency: 0,
      ac_cooling: 0
    };
    SAMPLE_SPECIALISTS.filter(sp => sp.distanceKm <= selectedRadius).forEach(sp => {
      if (counts[sp.category] !== undefined) {
        counts[sp.category]++;
      }
    });
    return counts;
  }, [selectedRadius]);

  const cycleWeatherPreset = (preset: 'clear' | 'light_rain' | 'thunderstorm' | 'extreme_heat') => {
    if (preset === 'clear') {
      setWeather({
        temperatureC: 24,
        precipitationMm: 0,
        rainProbability: 5,
        windSpeedKmh: 10,
        humidityPercent: 42,
        uvIndex: 5,
        isLightningDetected: false,
        lastSyncTime: new Date().toLocaleTimeString()
      });
      toast.success('Weather preset set to Clear Skies');
    } else if (preset === 'light_rain') {
      setWeather({
        temperatureC: 21,
        precipitationMm: 1.8,
        rainProbability: 75,
        windSpeedKmh: 22,
        humidityPercent: 88,
        uvIndex: 2,
        isLightningDetected: false,
        lastSyncTime: new Date().toLocaleTimeString()
      });
      toast.info('Weather preset set to Passing Rain (Gazebo Sidewalls Required)');
    } else if (preset === 'thunderstorm') {
      setWeather({
        temperatureC: 19,
        precipitationMm: 8.5,
        rainProbability: 95,
        windSpeedKmh: 45,
        humidityPercent: 95,
        uvIndex: 1,
        isLightningDetected: true,
        lastSyncTime: new Date().toLocaleTimeString()
      });
      toast.warning('Weather preset set to Electrical Storm (Work Halted for Safety)');
    } else if (preset === 'extreme_heat') {
      setWeather({
        temperatureC: 37,
        precipitationMm: 0,
        rainProbability: 0,
        windSpeedKmh: 8,
        humidityPercent: 20,
        uvIndex: 11,
        isLightningDetected: false,
        lastSyncTime: new Date().toLocaleTimeString()
      });
      toast.warning('Weather preset set to High Heat Stress (Mandatory Hydration Intervals)');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-industrial-charcoal via-slate-900 to-blue-950/40 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[10px] uppercase">
                Environmental & Safety Oracle
              </Badge>
              <Badge variant="outline" className="text-blue-300 border-blue-300/30 text-[10px]">
                <Clock className="w-3 h-3 mr-1" /> Telemetry Live • {weather.lastSyncTime}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-digital-white uppercase tracking-tight">
              Weather Gating & Regional Specialist Radar
            </h1>
            <p className="text-text-dim text-xs sm:text-sm max-w-2xl mt-1">
              Guarantees work continuity and technician ergonomics. Verifies water-ingress protection (Gazebo with Wall Coverings), 
              monitors heat stress, and displays mobile specialist density across service radiuses.
            </p>
          </div>

          {/* Quick Simulation Presets */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase font-bold text-text-dim">Simulate Weather:</span>
            <button
              onClick={() => cycleWeatherPreset('clear')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 flex items-center gap-1.5"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Clear
            </button>
            <button
              onClick={() => cycleWeatherPreset('light_rain')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 flex items-center gap-1.5"
            >
              <CloudRain className="w-3.5 h-3.5 text-blue-400" /> Rain (1.8mm)
            </button>
            <button
              onClick={() => cycleWeatherPreset('thunderstorm')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Storm
            </button>
            <button
              onClick={() => cycleWeatherPreset('extreme_heat')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 flex items-center gap-1.5"
            >
              <Thermometer className="w-3.5 h-3.5 text-red-500" /> Heat (37°C)
            </button>
          </div>
        </div>
      </div>

      {/* Weather Applet & Human Ergonomics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Temp & Heat Index */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-text-dim text-xs font-bold uppercase">
              <span>Ambient Temp & Heat Index</span>
              <Thermometer className="w-4 h-4 text-amber-400" />
            </div>
            <CardTitle className="text-3xl font-black font-mono text-white mt-1">
              {weather.temperatureC}°C
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs space-y-1">
            <div className="flex justify-between text-text-dim">
              <span>Ergonomic Heat Stress:</span>
              <span className={`font-bold uppercase ${
                viability.heatStressAlert === 'danger' ? 'text-red-400' :
                viability.heatStressAlert === 'warning' ? 'text-amber-400' :
                viability.heatStressAlert === 'caution' ? 'text-yellow-300' : 'text-emerald-400'
              }`}>
                {viability.heatStressAlert === 'none' ? 'Normal / Optimal' : viability.heatStressAlert}
              </span>
            </div>
            <p className="text-[10px] text-text-dim/80 pt-1 border-t border-white/5">
              {weather.temperatureC >= 34 
                ? 'Mandatory 10-min shaded hydration pause every 45 mins.' 
                : 'Ergonomic temperature suitable for standard shifts.'}
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Precipitation & Water Ingress */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-text-dim text-xs font-bold uppercase">
              <span>Precipitation & Rain Risk</span>
              <CloudRain className="w-4 h-4 text-blue-400" />
            </div>
            <CardTitle className="text-3xl font-black font-mono text-white mt-1">
              {weather.precipitationMm} <span className="text-sm font-sans font-normal text-text-dim">mm/hr</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs space-y-1">
            <div className="flex justify-between text-text-dim">
              <span>Rain Probability:</span>
              <span className="font-bold text-white font-mono">{weather.rainProbability}%</span>
            </div>
            <p className="text-[10px] text-text-dim/80 pt-1 border-t border-white/5">
              {weather.precipitationMm > 0 
                ? 'Water-ingress curtains required on all sides.' 
                : 'Zero rainfall detected. Open gazebo canopy allowed.'}
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Wind & Stability */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-text-dim text-xs font-bold uppercase">
              <span>Wind Speed & Guy Ropes</span>
              <Wind className="w-4 h-4 text-teal-400" />
            </div>
            <CardTitle className="text-3xl font-black font-mono text-white mt-1">
              {weather.windSpeedKmh} <span className="text-sm font-sans font-normal text-text-dim">km/h</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs space-y-1">
            <div className="flex justify-between text-text-dim">
              <span>Sandbag Anchor Ballast:</span>
              <span className="font-bold text-emerald-400">6 Bottles / 48kg</span>
            </div>
            <p className="text-[10px] text-text-dim/80 pt-1 border-t border-white/5">
              {weather.windSpeedKmh > 35 
                ? 'High gust warning: Stake guy lines firmly into soil.' 
                : 'Wind within safe certified operating threshold.'}
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Electrical & Lighting Risk */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-text-dim text-xs font-bold uppercase">
              <span>Electrical Lightning Sensor</span>
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
            </div>
            <CardTitle className="text-2xl font-black uppercase text-white mt-1">
              {weather.isLightningDetected ? (
                <span className="text-rose-400">CELL DETECTED</span>
              ) : (
                <span className="text-emerald-400">SAFE RADAR</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs space-y-1">
            <div className="flex justify-between text-text-dim">
              <span>Mobility Exemption:</span>
              <span className="font-bold text-white">Emergency Only</span>
            </div>
            <p className="text-[10px] text-text-dim/80 pt-1 border-t border-white/5">
              {weather.isLightningDetected 
                ? 'All outdoor metal hoist work automatically frozen.' 
                : 'No atmospheric discharge within 25km radius.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Site Gating & Water Ingress Verification Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Umbrella className="w-4 h-4 text-technic-yellow" />
                <CardTitle className="text-lg font-bold uppercase text-white">
                  Site Establishment Gating: Gazebo with Wall Coverings
                </CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Ensures rain does not stop viable work (e.g. air filter, battery, spark plugs) while insulating the driveway mobile workshop.
              </CardDescription>
            </div>

            {/* Wall Coverings Check Toggle */}
            <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/10 shrink-0">
              <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasGazeboWithWalls}
                  onChange={(e) => setHasGazeboWithWalls(e.target.checked)}
                  className="accent-technic-yellow w-4 h-4 rounded"
                />
                <span>Gazebo Wall Coverings Deployed</span>
              </label>
              <Badge className={hasGazeboWithWalls ? "bg-emerald-500/20 text-emerald-400 text-[10px]" : "bg-rose-500/20 text-rose-400 text-[10px]"}>
                {hasGazeboWithWalls ? '✓ SEALED WALLS PROVEN' : 'NO WALL COVERINGS'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-5 text-xs">
          {/* Job Type Selector for Feasibility Check */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
            <span className="text-[11px] uppercase font-bold text-text-dim block">
              Test Work Inclusivity vs. Service Complexity:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTestJobType('Air Filter & Diagnostic Scan')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  testJobType.includes('Air Filter')
                    ? 'bg-technic-yellow/10 border-technic-yellow text-white'
                    : 'bg-white/5 border-white/10 text-text-dim hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">Air Filter & OBD-II Diagnostics</div>
                <div className="text-[10px] text-text-dim mt-0.5">Top-end hood operation • High weather inclusivity</div>
              </button>

              <button
                type="button"
                onClick={() => setTestJobType('Brake Pads & Caliper Flush')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  testJobType.includes('Brake')
                    ? 'bg-technic-yellow/10 border-technic-yellow text-white'
                    : 'bg-white/5 border-white/10 text-text-dim hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">Brake Discs & Caliper Service</div>
                <div className="text-[10px] text-text-dim mt-0.5">Wheel-well sheltered • Moderate weather tolerance</div>
              </button>

              <button
                type="button"
                onClick={() => setTestJobType('Complete Gearbox & Clutch Replacement')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  testJobType.includes('Gearbox')
                    ? 'bg-technic-yellow/10 border-technic-yellow text-white'
                    : 'bg-white/5 border-white/10 text-text-dim hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">Underbody Gearbox Drop</div>
                <div className="text-[10px] text-text-dim mt-0.5">Ground contact • Strict rain gating required</div>
              </button>
            </div>
          </div>

          {/* Decision Outcome Card */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            viability.isPermitted 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-rose-500/10 border-rose-500/30'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {viability.isPermitted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span className={`font-bold text-sm uppercase ${
                  viability.isPermitted ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                  {viability.isPermitted ? 'SERVICE AUTHORIZED TO PROCEED' : 'WEATHER GATE TRIGGERED: SERVICE HALTED'}
                </span>
              </div>
              <p className="text-xs text-text-dim pl-7">{viability.reason}</p>
              <p className="text-[11px] text-white/90 pl-7 font-medium">👉 Advisory: {viability.advisory}</p>
            </div>

            <Badge className={`w-fit shrink-0 uppercase text-[10px] font-black ${
              viability.isPermitted ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
            }`}>
              {viability.category.replace('_', ' ')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Regional Specialist Radar & Radius Density */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-technic-yellow" />
                <CardTitle className="text-lg font-bold uppercase text-white">
                  Regional Specialist Density & Mobility Radar
                </CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Visualizes active, all-weather certified mobile mechanics available within your chosen radius.
              </CardDescription>
            </div>

            {/* Radius Selector Pills */}
            <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-text-dim px-2">Radius:</span>
              {[5, 15, 30, 50].map((radius) => (
                <button
                  key={radius}
                  onClick={() => setSelectedRadius(radius)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    selectedRadius === radius 
                      ? 'bg-technic-yellow text-industrial-charcoal shadow' 
                      : 'text-text-dim hover:text-white'
                  }`}
                >
                  {radius} km
                </button>
              ))}
            </div>
          </div>

          {/* Category Count Summary Chips */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                selectedCategory === 'all' 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'bg-white/5 text-text-dim hover:text-white border border-transparent'
              }`}
            >
              All Types ({filteredSpecialists.length})
            </button>
            <button
              onClick={() => setSelectedCategory('diagnostics')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                selectedCategory === 'diagnostics' 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                  : 'bg-white/5 text-text-dim hover:text-white border border-transparent'
              }`}
            >
              ⚡ Diagnostics & ECU ({categoryCounts.diagnostics})
            </button>
            <button
              onClick={() => setSelectedCategory('powertrain')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                selectedCategory === 'powertrain' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-white/5 text-text-dim hover:text-white border border-transparent'
              }`}
            >
              🚗 Engine & Drivetrain ({categoryCounts.powertrain})
            </button>
            <button
              onClick={() => setSelectedCategory('brakes_suspension')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                selectedCategory === 'brakes_suspension' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-white/5 text-text-dim hover:text-white border border-transparent'
              }`}
            >
              🛑 Brakes & Suspension ({categoryCounts.brakes_suspension})
            </button>
            <button
              onClick={() => setSelectedCategory('roadside_emergency')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                selectedCategory === 'roadside_emergency' 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                  : 'bg-white/5 text-text-dim hover:text-white border border-transparent'
              }`}
            >
              🛞 Roadside Emergency ({categoryCounts.roadside_emergency})
            </button>
            <button
              onClick={() => setSelectedCategory('ac_cooling')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                selectedCategory === 'ac_cooling' 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                  : 'bg-white/5 text-text-dim hover:text-white border border-transparent'
              }`}
            >
              ❄️ AC & Cooling ({categoryCounts.ac_cooling})
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSpecialists.map((sp) => (
              <div 
                key={sp.id} 
                className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-technic-yellow/30 transition-all space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{sp.name}</h4>
                    <p className="text-[11px] text-text-dim">{sp.specialtyLabel}</p>
                  </div>
                  <Badge variant="outline" className="text-technic-yellow border-technic-yellow/30 font-mono text-[10px]">
                    ★ {sp.rating}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-dim border-t border-white/5 pt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-technic-yellow" />
                    <strong>{sp.distanceKm} km</strong> away
                  </span>
                  <span>{sp.vehicleType}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {sp.hasAllWeatherGazeboWithWalls ? (
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                      ✓ ALL-WEATHER GAZEBO & WALLS
                    </Badge>
                  ) : (
                    <Badge className="bg-white/10 text-text-dim text-[9px]">
                      OPEN CANOPY ONLY
                    </Badge>
                  )}

                  <span className={`text-[10px] font-bold uppercase ${
                    sp.status === 'available' ? 'text-emerald-400' :
                    sp.status === 'on_callout' ? 'text-amber-400' : 'text-blue-300'
                  }`}>
                    • {sp.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredSpecialists.length === 0 && (
            <div className="text-center py-10 text-text-dim space-y-2">
              <Users className="w-8 h-8 mx-auto text-text-dim/40" />
              <p>No specialists found in this category within {selectedRadius} km.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedRadius(50)}
                className="text-xs border-white/10"
              >
                Expand Radius to 50 km
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
