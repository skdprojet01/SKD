import { useState, useEffect, useRef } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Navigation, 
  Play, 
  Square, 
  Flame, 
  ChevronsRight,
  Footprints,
  Bike,
  Car,
  Plane
} from 'lucide-react';

interface DirectionControllerProps {
  lat: number;
  lng: number;
  onMove: (newLat: number, newLng: number) => void;
  onAddRoutePoint: (lat: number, lng: number) => void;
  onClearRoutePoints: () => void;
}

type SpeedMode = 'walk' | 'bike' | 'drive' | 'fly';

export function DirectionController({ 
  lat, 
  lng, 
  onMove, 
  onAddRoutePoint, 
  onClearRoutePoints 
}: DirectionControllerProps) {
  const [speedMode, setSpeedMode] = useState<SpeedMode>('drive');
  const [isAutoWalking, setIsAutoWalking] = useState(false);
  const [autoDirection, setAutoDirection] = useState<number>(0); // angle in degrees

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Constants mapping speed modes to degrees change per tick (approx 1 second intervals)
  // Latitude 1 degree = ~111,000 meters
  // 5 km/h = 1.38 m/s = ~0.000012 degrees/tick
  // 20 km/h = 5.56 m/s = ~0.00005 degrees/tick
  // 80 km/h = 22.2 m/s = ~0.0002 degrees/tick
  // 500 km/h = 138.8 m/s = ~0.0012 degrees/tick
  const STEP_SIZES = {
    walk: 0.00002,  // ~2 meters
    bike: 0.00008,  // ~8 meters
    drive: 0.0003,  // ~30 meters
    fly: 0.0015,    // ~150 meters
  };

  const getSpeedLabel = () => {
    switch (speedMode) {
      case 'walk': return { name: 'เดินเท้า (Walk)', speed: '5 กม./ชม.', icon: <Footprints className="w-4 h-4" /> };
      case 'bike': return { name: 'ปั่นจักรยาน (Bike)', speed: '20 กม./ชม.', icon: <Bike className="w-4 h-4" /> };
      case 'drive': return { name: 'ขับขี่รถยนต์ (Drive)', speed: '80 กม./ชม.', icon: <Car className="w-4 h-4" /> };
      case 'fly': return { name: 'บินความเร็วสูง (Fly)', speed: '500 กม./ชม.', icon: <Plane className="w-4 h-4" /> };
    }
  };

  // Move manual step
  const handleManualMove = (direction: 'N' | 'S' | 'E' | 'W') => {
    const step = STEP_SIZES[speedMode];
    let newLat = lat;
    let newLng = lng;

    switch (direction) {
      case 'N': newLat += step; break;
      case 'S': newLat -= step; break;
      case 'E': newLng += step / Math.cos((lat * Math.PI) / 180); break;
      case 'W': newLng -= step / Math.cos((lat * Math.PI) / 180); break;
    }

    // Rounding to prevent floating point glitches
    newLat = Number(newLat.toFixed(7));
    newLng = Number(newLng.toFixed(7));

    onMove(newLat, newLng);
    onAddRoutePoint(newLat, newLng);
  };

  // Angle step simulation for auto walking
  useEffect(() => {
    if (isAutoWalking) {
      timerRef.current = setInterval(() => {
        const step = STEP_SIZES[speedMode];
        
        // Add a slight random noise to the direction to make it look realistic on GPX routes!
        const noise = (Math.random() - 0.5) * 0.2; // random direction fluctuations
        const angleRad = (autoDirection + noise) * (Math.PI / 180);

        const deltaLat = step * Math.sin(angleRad);
        const deltaLng = (step * Math.cos(angleRad)) / Math.cos((lat * Math.PI) / 180);

        const newLat = Number((lat + deltaLat).toFixed(7));
        const newLng = Number((lng + deltaLng).toFixed(7));

        onMove(newLat, newLng);
        onAddRoutePoint(newLat, newLng);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAutoWalking, lat, lng, speedMode, autoDirection]);

  // Handle keys N, S, W, E via keyboard or arrow keys! High quality!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't move if typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleManualMove('N');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleManualMove('S');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleManualMove('W');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleManualMove('E');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lat, lng, speedMode]);

  const toggleAutoWalk = () => {
    if (!isAutoWalking) {
      // Set direction toward random angle first or current heading
      setAutoDirection(Math.floor(Math.random() * 360));
    }
    setIsAutoWalking(!isAutoWalking);
  };

  const changeAutoDirection = (degrees: number) => {
    setAutoDirection(degrees);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border border-slate-200/85 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600 rotate-45" />
          <h2 className="font-display font-bold text-slate-900 text-lg">
            ควบคุมการเคลื่อนที่จำลอง
          </h2>
        </div>
        <span className="text-xs text-blue-500 font-semibold bg-blue-50 rounded-full px-2.5 py-1">
          คีย์สายย่อ: W S A D ได้
        </span>
      </div>

      {/* Speed selectors */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {(['walk', 'bike', 'drive', 'fly'] as SpeedMode[]).map((mode) => {
          const isActive = speedMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setSpeedMode(mode)}
              className={`py-2 px-1 flex flex-col items-center justify-center rounded-xl border text-[11px] font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-150'
              }`}
            >
              {mode === 'walk' && <Footprints className="w-4 h-4 mb-1" />}
              {mode === 'bike' && <Bike className="w-4 h-4 mb-1" />}
              {mode === 'drive' && <Car className="w-4 h-4 mb-1" />}
              {mode === 'fly' && <Plane className="w-4 h-4 mb-1" />}
              <span className="capitalize">{mode === 'walk' ? 'เดิน' : mode === 'bike' ? 'จักรยาน' : mode === 'drive' ? 'รถยนต์' : 'บิน'}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getSpeedLabel().icon}
          <div>
            <p className="text-xs font-bold text-slate-700">{getSpeedLabel().name}</p>
            <p className="text-[10px] text-slate-400">ระยะก้าวจำลอง: {getSpeedLabel().speed}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-blue-600 font-mono font-bold">
            {STEP_SIZES[speedMode]}° / ก้าว
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-center">
        {/* Direction Joypad Panel */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono font-bold text-slate-400 mb-3 uppercase tracking-widest">
            Joypad ควบคุมพิกัด
          </span>
          <div className="relative w-36 h-36 bg-slate-100 rounded-full flex items-center justify-center p-2 shadow-inner border border-slate-200">
            {/* Center Compass Circle */}
            <div className="absolute w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-[10px] font-bold text-slate-400 font-mono z-10 border border-slate-100">
              N
            </div>

            {/* UP BUTTON (N) */}
            <button
              onClick={() => handleManualMove('N')}
              className="absolute top-2 w-10 h-10 bg-white hover:bg-blue-50 text-slate-700 active:scale-90 hover:text-blue-600 rounded-xl shadow-md border border-slate-200/60 flex items-center justify-center transition-all"
              title="เคลื่อนทางเหนือ / ไปข้างบน (W)"
            >
              <ArrowUp className="w-5 h-5" />
            </button>

            {/* DOWN BUTTON (S) */}
            <button
              onClick={() => handleManualMove('S')}
              className="absolute bottom-2 w-10 h-10 bg-white hover:bg-blue-50 text-slate-700 active:scale-90 hover:text-blue-600 rounded-xl shadow-md border border-slate-200/60 flex items-center justify-center transition-all"
              title="เคลื่อนทางใต้ / ลงข้างล่าง (S)"
            >
              <ArrowDown className="w-5 h-5" />
            </button>

            {/* LEFT BUTTON (W) */}
            <button
              onClick={() => handleManualMove('W')}
              className="absolute left-2 w-10 h-10 bg-white hover:bg-blue-50 text-slate-700 active:scale-90 hover:text-blue-600 rounded-xl shadow-md border border-slate-200/60 flex items-center justify-center transition-all"
              title="เคลื่อนทางตะวันตก / ไปทางซ้าย (A)"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* RIGHT BUTTON (E) */}
            <button
              onClick={() => handleManualMove('E')}
              className="absolute right-2 w-10 h-10 bg-white hover:bg-blue-50 text-slate-700 active:scale-90 hover:text-blue-600 rounded-xl shadow-md border border-slate-200/60 flex items-center justify-center transition-all"
              title="เคลื่อนทางตะวันออก / ไปทางขวา (D)"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auto Walk / Drive Engine */}
        <div className="bg-slate-50/70 rounded-2xl p-4.5 border border-slate-200/50 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-1">
              จำลองคลื่นสัญญาณเดินทาง
            </h3>
            <p className="text-[10px] text-slate-450 leading-relaxed mb-4">
              จำลองอัตโนมัติ ช่วยสร้างเส้นทางเหมือนคุณกำลังนั่งรถหรือเดินทางจริงๆ เพื่อทดสอบแอปภายนอก
            </p>
          </div>

          <div className="space-y-4">
            {/* Compass Rotation Controller */}
            {isAutoWalking && (
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">
                  ทิศทางเข็ม: {autoDirection}° ({autoDirection < 45 || autoDirection >= 315 ? 'เหนือ' : autoDirection < 135 ? 'ตะวันออก' : autoDirection < 225 ? 'ใต้' : 'ตะวันตก'})
                </label>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={autoDirection}
                  onChange={(e) => changeAutoDirection(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
                  <span>เหนือ (0°)</span>
                  <span>ออก (90°)</span>
                  <span>ใต้ (180°)</span>
                  <span>ตก (270°)</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={toggleAutoWalk}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-white ${
                  isAutoWalking
                    ? 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-100'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'
                }`}
              >
                {isAutoWalking ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>หยุดจำลอง</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>จำลองเดินทางภัย</span>
                  </>
                )}
              </button>

              <button
                onClick={onClearRoutePoints}
                className="py-2 px-3 text-xs font-bold rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100 transition-colors"
                title="ล้างเส้นทางที่เดินลากไว้"
              >
                ล้างเส้นทาง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
