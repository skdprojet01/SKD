import React, { useState, useEffect } from 'react';
import { GeolocationMockService } from './utils/geolocationMock';
import { GpsMap } from './components/GpsMap';
import { PresetButtons } from './components/PresetButtons';
import { DirectionController } from './components/DirectionController';
import { GpxExporter } from './components/GpxExporter';
import { SandboxTest } from './components/SandboxTest';
import { SearchInput } from './components/SearchInput';
import { motion } from 'motion/react';
import { 
  Compass, 
  MapPin, 
  Info, 
  Sparkles,
  Github,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
  Activity,
  History,
  AlertCircle,
  Lock,
  User,
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  ShieldAlert,
  Smartphone,
  Laptop,
  CheckCircle,
  QrCode,
  Download,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import spxExpressBg from './assets/images/spx_express_bg_1779434322764.png';
import spxSkdLogo from './assets/images/spx_skd_logo_1779434853602.png';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fakeGps_isAuthenticated') === 'true';
  });
  
  // Mobile-enforcement and Installation Portal state management
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [forceFullScreen, setForceFullScreen] = useState<boolean>(() => {
    return localStorage.getItem('fakeGps_forceFullScreen') === 'true';
  });
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios' | 'apk'>('android');
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [simulatedTime, setSimulatedTime] = useState<string>('08:15');

  // Simulated timer for the phone status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setSimulatedTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Responsive hook & Install event catcher
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') {
          showToast('ระบบส่งพิกัดจำลองติตตั้งลงเครื่องของท่านแล้ว! 🌟');
        }
        setDeferredPrompt(null);
      });
    } else {
      setIsInstallGuideOpen(true);
    }
  };

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [lat, setLat] = useState<number>(13.7513); // Default to Grand Palace, Bangkok
  const [lng, setLng] = useState<number>(100.4926);
  const [routePoints, setRoutePoints] = useState<Array<[number, number]>>([[13.7513, 100.4926]]);
  const [isMockActive, setIsMockActive] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('map');
  const [bgTheme, setBgTheme] = useState<string>(() => {
    return localStorage.getItem('fakeGps_bgTheme') || 'spx-express';
  });

  const changeBgTheme = (theme: string) => {
    setBgTheme(theme);
    localStorage.setItem('fakeGps_bgTheme', theme);
    showToast(`เปลี่ยนสีพื้นหลังสำเร็จ ➡️ ${getThemeName(theme)}`);
  };

  const getThemeName = (theme: string) => {
    switch (theme) {
      case 'spx-express': return 'สกินคลังพัสดุ SPX Express';
      case 'blueprint': return 'ตารางพิมพ์เขียวลายเส้น';
      case 'map-mock': return 'ลวดลายแผนที่จำลอง';
      case 'cyber': return 'นีออนไซเบอร์มืด';
      case 'warm': return 'สีครีมอบอุ่นละมุนตา';
      case 'minimal': return 'ขาวสูตูดิโอสะอาดตา';
      default: return 'สกินคลังพัสดุ SPX Express';
    }
  };

  // Initialize and enable mock globally on mount
  useEffect(() => {
    GeolocationMockService.init();
    if (isMockActive) {
      GeolocationMockService.enable(lat, lng);
    }
    showToast('ระบบจำลองแผนที่เริ่มทำงานสำเร็จ ร่วมจำลองพิกัดทั่วโลก !');

    return () => {
      GeolocationMockService.disable();
    };
  }, []);

  // Sync state coordinates to navigator global service
  useEffect(() => {
    if (isMockActive) {
      GeolocationMockService.updateCoordinates(lat, lng);
    }
  }, [lat, lng, isMockActive]);

  // Handle Mock state toggles from test platform
  const handleToggleMock = (activate: boolean) => {
    setIsMockActive(activate);
    if (activate) {
      GeolocationMockService.enable(lat, lng);
      showToast('เปิดใช้งานพิกัดเสมือนทั่วทั้งแอปพลิเคชัน');
    } else {
      GeolocationMockService.disable();
      showToast('กลับมช้าใช้พิกัดจริงจาก GPS อุปกรณ์ตามธรรมชาติ');
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Change location coordinates from search or presets
  const handleLocationJump = (newLat: number, newLng: number, locationName: string) => {
    setLat(newLat);
    setLng(newLng);
    setRoutePoints([[newLat, newLng]]); // reset history trail for new location jump
    showToast(`กระโดดพิกัดจำลองสำเร็จ ➡️ ${locationName}`);
  };

  // When manually moving using Joystick/Keyboard or auto walk
  const handleMoveStep = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  };

  // Track the trail route array
  const handleAddRoutePoint = (newLat: number, newLng: number) => {
    setRoutePoints((prev) => {
      // Avoid duplicate consecutive ticks
      const last = prev[prev.length - 1];
      if (last && last[0] === newLat && last[1] === newLng) {
        return prev;
      }
      return [...prev, [newLat, newLng]];
    });
  };

  const handleClearRoutePoints = () => {
    setRoutePoints([[lat, lng]]);
    showToast('ล้างประวัติบันทึกรอยเท้าเดินทางแล้ว');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setLoginError('โปรดกรอกชื่อผู้ใช้ / รหัสพนักงาน (ID)');
      return;
    }
    if (!password) {
      setLoginError('โปรดกรอกรหัสผ่านผ่านระบบความปลอดภัย');
      return;
    }
    
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      // Only allow the set credentials 'admin' and 'spx'
      if (trimmedUser === 'admin' && password === 'spx') {
        localStorage.setItem('fakeGps_isAuthenticated', 'true');
        setIsAuthenticated(true);
        showToast('ยินดีต้อนรับผู้ดูแลระดับสูง! เข้าสู่ระบบโครงการ SPX SKD สำเร็จ');
      } else {
        setLoginError('รหัสผิดพลาด');
      }
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.removeItem('fakeGps_isAuthenticated');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    showToast('ออกจากระบบทดสอบ SPX Nav เรียบร้อยแล้ว');
  };

  const isMobileLayout = isMobile || !forceFullScreen;

  const renderAppContent = () => {
    return (
      <div className={`min-h-screen max-w-full ${isMobileLayout ? 'h-full pb-20 overflow-y-auto no-scrollbar' : ''} ${bgTheme === 'cyber' || bgTheme === 'spx-express' ? 'bg-slate-950 text-slate-100' : 'bg-[#e5e7eb] text-slate-800'} relative flex flex-col antialiased overflow-x-hidden transition-colors duration-500`}>
      {/* Dynamic Simulated Backgrounds */}
      {bgTheme === 'spx-express' && (
        <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-500 overflow-hidden">
          <img
            src={spxExpressBg}
            alt="SPX Express Background"
            className="w-full h-full object-cover opacity-85 animate-fade-in"
            referrerPolicy="no-referrer"
          />
          {/* Subtle dark backdrop overlay to guarantee legibility of controls/text */}
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs"></div>
        </div>
      )}

      {bgTheme === 'blueprint' && (
        <div className="absolute inset-0 bg-[#f3f4f6]/85 z-0 pointer-events-none transition-all duration-500">
          <div className="absolute inset-0 z-0 opacity-55" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '160px 160px' }} />
        </div>
      )}

      {bgTheme === 'map-mock' && (
        <div className="absolute inset-0 bg-[#f3f4f6] z-0 opacity-55 pointer-events-none transition-all duration-500">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '160px 160px' }}></div>
          <div className="absolute top-1/4 left-0 w-full h-8 bg-white border-y border-slate-300/40 transform -rotate-2"></div>
          <div className="absolute top-0 left-1/3 w-8 h-full bg-white border-x border-slate-300/40 transform rotate-1"></div>
          <div className="absolute bottom-1/3 left-0 w-full h-12 bg-white border-y border-slate-300/40 transform rotate-6"></div>
          <div className="absolute top-2/3 right-1/4 w-10 h-full bg-white border-x border-slate-300/30 transform -rotate-12"></div>
        </div>
      )}

      {bgTheme === 'cyber' && (
        <div className="absolute inset-0 bg-slate-950 z-0 pointer-events-none transition-all duration-500">
          <div className="absolute inset-0 z-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#2563eb 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }} />
          <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)', backgroundSize: '150px 150px' }} />
          <div className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none"></div>
        </div>
      )}

      {bgTheme === 'warm' && (
        <div className="absolute inset-0 bg-[#fafaf9] z-0 pointer-events-none transition-all duration-500">
          <div className="absolute inset-0 z-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#d6d3d1 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
          <div className="absolute inset-0 z-0 opacity-15" style={{ backgroundImage: 'linear-gradient(#e7e5e4 1px, transparent 1px), linear-gradient(90deg, #e7e5e4 1px, transparent 1px)', backgroundSize: '120px 120px' }} />
          <div className="absolute top-20 right-20 w-96 h-96 bg-amber-100/35 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      )}

      {bgTheme === 'minimal' && (
        <div className="absolute inset-0 bg-[#f8fafc] z-0 pointer-events-none transition-all duration-500">
          <div className="absolute inset-0 z-0 opacity-35" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)', backgroundSize: '48px 48px' }} />
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Toast Alert */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 pointer-events-none">
            <div className="bg-slate-900 border border-slate-800 text-slate-100 text-xs py-3 px-5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in pr-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span className="font-sans font-medium">{toast}</span>
            </div>
          </div>
        )}

        {isAuthenticated ? (
          <>
            {/* Modern High-End Top Navigation Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 md:px-8 shadow-sm transition-all">
              <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-red-500/30 flex-shrink-0">
                      <img 
                        src={spxSkdLogo} 
                        alt="SPX SKD Logo" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h1 className="font-display font-bold text-slate-900 text-lg md:text-xl tracking-tight flex items-center gap-2">
                        ระบบนำทาง SPX SKD
                        <span className="bg-blue-50 border border-blue-100 text-[10px] text-blue-700 px-2 py-0.5 rounded-md font-sans font-bold">
                          SPX SKD
                        </span>
                      </h1>
                      <p className="text-[11.5px] text-slate-400 font-medium font-sans">
                        จำลองพิกัดอุปกรณ์ในเบราว์เซอร์ พร้อมพิกัดแลนด์มาร์คสำคัญทั้งไทยและต่างประเทศ
                      </p>
                    </div>
                  </div>

                  {/* Menu Header Buttons */}
                  <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 p-1 rounded-xl lg:border-l lg:border-slate-200/80 lg:pl-4 lg:bg-transparent lg:p-0">
                    <button 
                      onClick={() => setActiveTab('map')} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 active:scale-95 ${
                        activeTab === 'map' 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-200/50 border border-red-500' 
                          : 'text-slate-600 hover:text-red-700 hover:bg-slate-205/50'
                      }`}
                      id="btn-nav-map"
                    >
                      <span>🗺️</span>
                      <span>แผนที่นำทาง</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('joystick')} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 active:scale-95 ${
                        activeTab === 'joystick' 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-200/50 border border-red-500' 
                          : 'text-slate-600 hover:text-red-700 hover:bg-slate-205/50'
                      }`}
                      id="btn-nav-joystick"
                    >
                      <span>🕹️</span>
                      <span>ปุ่มวิ่งจอยสติ๊ก</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('presets')} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 active:scale-95 ${
                        activeTab === 'presets' 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-200/50 border border-red-500' 
                          : 'text-slate-600 hover:text-red-700 hover:bg-slate-205/50'
                      }`}
                      id="btn-nav-presets"
                    >
                      <span>📍</span>
                      <span>แลนด์มาร์คสำคัญ</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('gpx')} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 active:scale-95 ${
                        activeTab === 'gpx' 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-200/50 border border-red-500' 
                          : 'text-slate-600 hover:text-red-700 hover:bg-slate-205/50'
                      }`}
                      id="btn-nav-gpx"
                    >
                      <span>💾</span>
                      <span>นำออก GPX</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('sandbox')} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 active:scale-95 ${
                        activeTab === 'sandbox' 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-200/50 border border-red-500' 
                          : 'text-slate-600 hover:text-red-700 hover:bg-slate-205/50'
                      }`}
                      id="btn-nav-sandbox"
                    >
                      <span>🛡️</span>
                      <span>ระบบ Sandbox</span>
                    </button>
                  </div>
                </div>

                {/* Quick HUD values */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-1.5 flex items-center gap-2 font-sans shadow-sm">
                    <ShieldCheck className={`w-4 h-4 ${isMockActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">สถานะ GPS</span>
                      <span className="text-xs font-bold text-slate-700">
                        {isMockActive ? 'จำลองสมบูรณ์ภายนอก' : 'รับสัญญาณจริง'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-1.5 flex items-center gap-2 font-mono shadow-sm">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">พิกัดปัจจุบัน</span>
                      <span className="text-xs font-bold text-slate-700">
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-1.5 flex items-center gap-2 shadow-sm">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">รอยเท้า GPX</span>
                      <span className="text-xs font-bold text-blue-700">
                        {routePoints.length} หมุด
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-xl px-3.5 py-1.5 flex items-center gap-2 font-sans shadow-sm text-red-600 hover:text-red-700 transition-all font-bold text-xs"
                    title="ออกจากระบบจำลองพิกัดเสมือน SPX Express Key"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span className="hidden md:inline">ออกจากระบบ</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Decorative Wallpaper Accent Ribbon Switcher */}
            <section className="bg-white border-b border-slate-200 px-4 py-3 md:px-8 shadow-xs">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-bold">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span>ปรับแต่งสกินภาพพื้นหลังระบบ (Customize Simulator Wallpaper Theme)</span>
                </div>
                <div className="flex flex-wrap items-center gap-1 bg-slate-100/90 p-1 rounded-xl">
                  <button 
                    onClick={() => changeBgTheme('spx-express')} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${bgTheme === 'spx-express' ? 'bg-white text-red-600 shadow-sm border border-red-100' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <span>📦</span>
                    <span>สกิน SPX Express</span>
                  </button>
                  <button 
                    onClick={() => changeBgTheme('blueprint')} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${bgTheme === 'blueprint' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <span>📐</span>
                    <span>ตารางพิมพ์เขียว</span>
                  </button>
                  <button 
                    onClick={() => changeBgTheme('map-mock')} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${bgTheme === 'map-mock' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <span>🗺️</span>
                    <span>ลวดลายแผนที่</span>
                  </button>
                  <button 
                    onClick={() => changeBgTheme('cyber')} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${bgTheme === 'cyber' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <span>🌌</span>
                    <span>ไซเบอร์มืด</span>
                  </button>
                  <button 
                    onClick={() => changeBgTheme('warm')} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${bgTheme === 'warm' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <span>☀️</span>
                    <span>ส้มอบอุ่น</span>
                  </button>
                  <button 
                    onClick={() => changeBgTheme('minimal')} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${bgTheme === 'minimal' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <span>🤍</span>
                    <span>ขาวสะอาด</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Info Notice Banner */}
            <section className="bg-amber-50/50 border-b border-amber-100 px-4 py-2.5 md:px-8 text-amber-800 text-[11px] flex items-center gap-2 justify-center font-sans">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>คำแนะนำคนทำระบบ:</strong> พิกัดเสมือนได้ทำการ override <code className="bg-amber-100/50 px-1 py-0.5 rounded font-mono text-amber-900 border border-amber-200/40">navigator.geolocation</code> ของเบราว์เซอร์ภายในเรียบร้อย คุณสามารถทดสอบสัญญาณพารามิเตอร์ GPS ต่างๆ ผ่านแคมปัสจำลองด่านล่างได้ทันที
              </span>
            </section>

            {/* Main Content Area: Split by separate pages (tabs) */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-5 md:px-8 flex flex-col gap-6 relative">
              
              {/* TAB 1: Navigation Map (แผนที่นำทาง) */}
              {activeTab === 'map' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full"
                >
                  {/* Left Column: Map & Search */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <div id="map-section" className="scroll-mt-20 bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border border-slate-200/80 p-5">
                      <h2 className="text-xs font-bold text-slate-500 mb-2 font-mono uppercase tracking-wider">
                        ค้นหาพิกัดพื้นที่จำลองแบบอิสระ (Custom Coordinate Search)
                      </h2>
                      <SearchInput onSelectLocation={handleLocationJump} />
                    </div>

                    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-5 border border-slate-200/85 flex flex-col h-[400px] md:h-[550px] relative">
                      <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5 font-sans font-medium text-slate-500">
                          <span className="inline-block w-2 bg-blue-600 h-2 rounded-full animate-ping"></span>
                          คลิกในแผนที่เพื่อปักหมุดจำลองจุดใหม่ได้ทันที หรือจับลากหัวหมุดพิกัด
                        </span>
                        <span>แผนที่: OpenStreetMap (OSM)</span>
                      </div>
                      <div className="flex-1">
                        <GpsMap 
                          lat={lat} 
                          lng={lng} 
                          onCoordinateChange={(newLat, newLng) => {
                            setLat(newLat);
                            setLng(newLng);
                          }} 
                          routePoints={routePoints}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Mini Guide & Active Presets */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-5 border border-slate-200/80">
                      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span>🗺️</span>
                        <span>วิธีการปักพิกัดแผนที่ (Instructions)</span>
                      </h3>
                      <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-sans">
                        <p>• <strong>ปักพิกัดจำลอง:</strong> ดำเนินการปักหมุดโดยคลิกไปยังพิกัดเป้าหมายบนแผนที่ซ้ายมือได้ทันที</p>
                        <p>• <strong>พิกัดตอบรับ:</strong> ละติจูดและลองจิจูดจะอัปเดตแบบเรียลไทม์ และระบบจะลากเส้นนำทางจากตำแหน่งเดิมให้คุณ</p>
                        <p>• <strong>จอยสติ๊ก:</strong> ไปยังเมนู <strong>"ปุ่มวิ่งจอยสติ๊ก"</strong> หากคุณต้องการจำลองสัญญาณการสัญจรเดินเท้าหรือขับยานพาหนะ</p>
                      </div>
                    </div>

                    <PresetButtons 
                      currentLat={lat} 
                      currentLng={lng} 
                      onSelectPreset={handleLocationJump} 
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB 2: Joystick Controller (ปุ่มวิ่งจอยสติ๊ก) */}
              {activeTab === 'joystick' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full"
                >
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <DirectionController 
                      lat={lat} 
                      lng={lng} 
                      onMove={handleMoveStep}
                      onAddRoutePoint={handleAddRoutePoint}
                      onClearRoutePoints={handleClearRoutePoints}
                    />
                  </div>

                  {/* Live view map trail so they can see themselves walking */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-5 border border-slate-200/85 flex flex-col h-[400px] md:h-[550px] relative">
                      <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5 font-sans font-medium text-slate-500">
                          <span className="inline-block w-2 bg-red-600 h-2 rounded-full animate-ping"></span>
                          หน้าจอจำลองการเคลื่อนที่สด: ใช้แป้นพิมพ์ [W, A, S, D] หรือตุ่มลูกศรเพื่อเคลื่อนที่
                        </span>
                        <span>แผนที่สด (Live Trajectory)</span>
                      </div>
                      <div className="flex-1">
                        <GpsMap 
                          lat={lat} 
                          lng={lng} 
                          onCoordinateChange={(newLat, newLng) => {
                            setLat(newLat);
                            setLng(newLng);
                          }} 
                          routePoints={routePoints}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: Landmark Presets (แลนด์มาร์คสำคัญ) */}
              {activeTab === 'presets' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full"
                >
                  <div className="lg:col-span-8">
                    <PresetButtons 
                      currentLat={lat} 
                      currentLng={lng} 
                      onSelectPreset={handleLocationJump} 
                    />
                  </div>

                  {/* Information Details Card */}
                  <div className="lg:col-span-4 flex flex-col gap-6 font-sans">
                    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-6 border border-slate-200/80">
                      <h3 className="font-display font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
                        <span>📍</span>
                        <span>แลนด์มาร์คพิกัดอ้างอิง</span>
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        พิกัดเหล่านี้เป็นตำแหน่งอ้างอิงที่ได้รับความนิยม คุณสามารถคลิกเลือกเพื่อทำการแก้ไขพิกัด GPS อุปกรณ์เสมือนของคุณโดยตรงผ่านโปรแกรมระบบทันที
                      </p>

                      <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">ละติจูด (Lat):</span>
                          <span className="font-mono font-bold text-slate-800">{lat.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">ลองจิจูด (Lng):</span>
                          <span className="font-mono font-bold text-slate-800">{lng.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">จำลอง GPS Sandbox:</span>
                          <span className="font-bold text-emerald-600">พร้อมทำงาน (ON)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-850 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-xl pointer-events-none"></div>
                      <h4 className="font-display font-medium text-red-500 text-xs mb-1 font-mono uppercase tracking-widest">
                        SPX Nav Engine 0.01
                      </h4>
                      <p className="font-display font-bold text-sm leading-snug mb-3">
                        เปลี่ยนศูนย์พิกัดทันสมัยผ่านการคลิกเพียงครั้งเดียว
                      </p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        อำนวยความสะดวกในการจัดสรรและจำลองจุดกระจายสินค้า เพื่อควบคุมมาตรฐานสถิติการใช้งานสัญญาณในพื้นที่ต่างๆ
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: GPX Exporter (นำออก GPX) */}
              {activeTab === 'gpx' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full"
                >
                  <div className="lg:col-span-8">
                    <GpxExporter 
                      lat={lat} 
                      lng={lng} 
                      onCoordinateChange={(newLat, newLng) => {
                        setLat(newLat);
                        setLng(newLng);
                        setRoutePoints([[newLat, newLng]]);
                        showToast('แก้ไขพิกัดแบบเขียนเองเรียบร้อย');
                      }} 
                      routePoints={routePoints}
                    />
                  </div>

                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-6 border border-slate-200/80">
                      <h3 className="font-display font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
                        <span>📊</span>
                        <span>บันทึกเส้นทางรอยเท้า</span>
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        ทุกครั้งที่มีการกดสลับหรือใช้ปุ่มจำลองเดินเท้า ระบบจะจดจำค่าไว้เป็นประวัติในรูป breadcrumbs และสามารถนำออกเป็นไฟล์จัดระเบียบแผนที่ไปเซ็ตระบบต่อภายนอกได้
                      </p>

                      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">จำนวนจุดประวัติเสมือน:</span>
                          <span className="font-mono font-bold text-slate-850">{routePoints.length} หมุด</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">ประมาณการระยะเสมือน:</span>
                          <span className="font-mono font-bold text-blue-600">~ {(routePoints.length * 25 / 1000).toFixed(2)} กม.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: Sandbox System (ระบบ Sandbox) */}
              {activeTab === 'sandbox' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full"
                >
                  <div className="lg:col-span-8">
                    <SandboxTest 
                      lat={lat} 
                      lng={lng} 
                      isMockActive={isMockActive}
                      onToggleMock={handleToggleMock}
                    />
                  </div>

                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-6 border border-slate-200/80">
                      <h3 className="font-display font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
                        <span>🛡️</span>
                        <span>กลไกทดสอบ Sandbox</span>
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4 font-sans">
                        ส่วนนี้ช่วยในการทดสอบแชร์ตำแหน่งและทำตัวดักจำลองตำแหน่ง การทดสอบดึงพิกัดจาก <code className="bg-slate-100 p-0.5 rounded font-mono text-red-600 text-[10px]">navigator.geolocation.getCurrentPosition</code> เพื่อดูว่าสัญญาณในเบราว์เซอร์นั้นถูกดักจับและส่งค่าตรงตามที่เราปักหมุดไว้จริงหรือไม่ 100%
                      </p>
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-[11px] text-emerald-800 flex items-center gap-2 font-sans">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                        <span>เปิดจำลอง Override จะบังคับส่งพิกัดจำลองเข้า Web API ภายนอกทั้งหมด</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </main>

            {/* Styled Foot Footer */}
            <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs mt-12 font-sans">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-300">เครื่องมือทดสอบระบบพิกัด Fake GPS Simulator - ปุ่มสำเร็จรูป</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    จำลองข้อมูลดาวเทียม ละติจูด ลองจิจูด แบบรันไทม์ภายในเบราว์เซอร์
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors">
                  เวอร์ชัน 2.4.0 • ปลอดภัยแบบ Client-side 100%
                </div>
              </div>
            </footer>

            {/* Decorative Branding Accent Bar */}
            <div className="h-1.5 bg-blue-600 w-full mt-auto sticky bottom-0 z-50"></div>
          </>
        ) : (
          /* PRESTIGE LOGIN SCREEN VIEW */
          <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-10px)] relative z-25">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl rounded-3xl p-6 md:p-8 w-full max-w-md relative overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col gap-6"
            >
              {/* Dynamic brand flare in the card top right */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-600/10 rounded-full blur-2xl"></div>
              
              {/* Login Header with metallic central logo */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl border border-red-500/40 p-0.5 bg-gradient-to-tr from-red-600 to-orange-500 flex-shrink-0 animate-pulse">
                  <img 
                    src={spxSkdLogo} 
                    alt="SPX SKD Logo" 
                    className="w-full h-full object-cover rounded-[14px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="mt-2">
                  <h2 className="font-display font-extrabold text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
                    ระบบนำทาง SPX SKD
                  </h2>
                  <p className="text-[11px] text-red-600 font-bold uppercase tracking-widest font-mono mt-0.5">
                    SPX SKD Security Gateway
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5 font-sans">
                    ระบบจำลองพิกัดและทดสอบอุปกรณ์ขนส่งพัสดุด่วนความเร็วสูง
                  </p>
                </div>
              </div>

              {/* Form container */}
              <form onSubmit={handleLogin} className="flex flex-col gap-4 font-sans text-xs">
                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2.5 font-medium leading-normal"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>{loginError}</span>
                  </motion.div>
                )}

                {/* Username Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="username" className="font-bold text-slate-600 dark:text-slate-300">
                    ชื่อผู้ใช้ / รหัสประจำตัวเจ้าหน้าที่ (Staff Username)
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="username"
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all font-sans"
                      placeholder="กรอกบัญชีผู้ใช้ (ตัวอย่าง: admin)"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      disabled={isLoggingIn}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="font-bold text-slate-600 dark:text-slate-300">
                    รหัสเข้าสู่ระบบ (Security Password)
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all font-sans"
                      placeholder="กรอกรหัสผ่านเข้าถึงระบบความปลอดภัย"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      disabled={isLoggingIn}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit button with loader */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-red-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-75 font-sans"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>กำลังส่งข้อมูลพิจารณาประวัติ...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>ยินยอมข้อมูล & ตรวจสอบเข้าใช้งาน</span>
                    </>
                  )}
                </button>
              </form>

              {/* Developer Credentials helpful note */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-1 text-[11px] text-slate-400 leading-relaxed font-sans mt-2">
                <span className="font-extrabold text-red-500/90 dark:text-red-400 flex items-center gap-1">
                  <span>💡</span>
                  <span>รหัสผ่านเข้าถึงระบบนำทางเสมือน:</span>
                </span>
                <p><strong>• ข้อกำหนดความปลอดภัย:</strong> ระบบได้รับการตั้งค่าจำกัดการเข้าถึงอย่างเข้มงวด โดยอนุญาตให้เข้าใช้งานได้ด้วยรหัสผ่านผู้ดูแลระบบที่กำหนดไว้เท่านั้น</p>
                <div className="border-t border-slate-200/50 dark:border-slate-850/50 my-1 pt-1"></div>
                <p><strong>• ข้อมูลบัญชีผู้ดูแลระบบ (Admin Account):</strong></p>
                <div className="flex items-center gap-2 mt-0.5 text-[10.5px]">
                  <span className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 text-red-600 px-1.5 py-0.5 rounded font-bold font-mono">ชื่อผู้ใช้: admin</span>
                  <span className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 text-red-600 px-1.5 py-0.5 rounded font-bold font-mono">รหัสผ่าน: spx</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
    );
  };

  // Modern Responsive Outer Frame Layout for Computer and Real Mobile Screen
  if (!isMobile && !forceFullScreen) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative antialiased overflow-hidden select-none">
        {/* Animated grid backgrounds on PC */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center p-4 lg:p-6 xl:p-10 w-full max-w-[1500px] mx-auto gap-8">
          
          {/* PWA Installer Portal Information Sideboard */}
          <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col gap-5 text-slate-300 pr-0 xl:pr-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-red-500/30 p-1 bg-slate-900/40 relative shadow-2xl flex-shrink-0">
                <img src={spxSkdLogo} alt="SPX SKD Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-extrabold text-base tracking-tight text-white truncate">
                    SPX SKD Mobile Portal
                  </h1>
                  <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-sans font-extrabold px-2 rounded-full flex-shrink-0">
                    PWA LIVE
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-sans mt-0.5">
                  ระบบจัดเตรียมพิกัดจำลองพัสดุสำหรับสมาร์ทโฟน
                </p>
              </div>
            </div>

            <div className="bg-slate-900/65 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-600/10 rounded-full blur-xl"></div>
              
              <div>
                <div className="flex items-center gap-1 text-red-500 font-extrabold text-[10px] tracking-widest uppercase font-mono mb-1">
                  <span>📱</span>
                  <span>Enforced Mobile-Only Interface</span>
                </div>
                <h2 className="font-display font-bold text-base text-white">
                  โปรดติดตั้งและเปิดใช้งานผ่าน "มือถือ"
                </h2>
                <div className="text-xs text-slate-400 leading-relaxed mt-2 space-y-1.5 font-light">
                  <p>ระบบได้รับการพัฒนาให้เป็นแอปพลิเคชันสำหรับโทรศัพท์มือถือโดยเฉพาะ เพื่อให้ใช้งานจำลองร่วมกับแอปขนส่งพัสดุด่วนได้เต็มพิกัด</p>
                  <p>ท่านสามารถใช้ <strong>Simulated Handset Container</strong> ด้านขวา เพื่อทดสอบหรือแก้ไขพิกัดจำลองพัสดุผ่านเบราว์เซอร์พีซีได้ทันที</p>
                </div>
              </div>

              {/* QR Code Container pointing dynamically to current preview URL */}
              <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl flex items-center gap-4">
                <div className="bg-white p-1 rounded-lg flex-shrink-0 shadow-lg">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=220-38-38&data=${encodeURIComponent(window.location.href)}`} 
                    alt="QR Code" 
                    className="w-20 h-20"
                  />
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <span className="text-[9px] uppercase font-bold text-red-400 tracking-wider font-mono">แชร์พิกัดลงมือถือ</span>
                  <h4 className="text-xs font-bold font-sans text-white">สแกนรหัสเพื่อเปิดบนโทรศัพท์</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    ใช้กล้องมือถือสแกน เพื่อเปิดลิงก์และคลิก "เพิ่มลงในหน้าจอโฮม" เพื่อติดตั้งประหนึ่งแอปพลิเคชันจริง
                  </p>
                </div>
              </div>

              {/* Step instructions */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-350">ตัวเลือกการดาวน์โหลด & ติดตั้ง:</span>
                
                <div className="grid grid-cols-3 bg-slate-950/80 p-0.5 border border-slate-800 rounded-xl">
                  <button 
                    onClick={() => setActiveGuideTab('android')}
                    className={`py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${activeGuideTab === 'android' ? 'bg-red-650 text-white' : 'text-slate-450'}`}
                  >
                    🤖 Android (PWA)
                  </button>
                  <button 
                    onClick={() => setActiveGuideTab('ios')}
                    className={`py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${activeGuideTab === 'ios' ? 'bg-red-650 text-white' : 'text-slate-450'}`}
                  >
                    🍎 iOS Device
                  </button>
                  <button 
                    onClick={() => setActiveGuideTab('apk')}
                    className={`py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${activeGuideTab === 'apk' ? 'bg-amber-650 text-white' : 'text-slate-450'}`}
                  >
                    📦 สร้าง .APK
                  </button>
                </div>

                {activeGuideTab === 'android' && (
                  <div className="bg-slate-950/30 border border-slate-800/40 p-3 rounded-2xl text-[10px] text-slate-350 flex flex-col gap-1">
                    <p>• 1. เปิดลิงก์นี้ในแอป <strong>Chrome</strong> บนโทรศัพท์มือถือ</p>
                    <p>• 2. แตะปุ่ม <strong>จุด 3 จุด (ขวาบน)</strong> แล้วเลือก <strong>"ติดตั้งแอปพลิเคชัน" (Install Web App)</strong></p>
                    <p>• 3. ระบบจะทำการตรวจสอบและสร้างไอคอนลงโฮมสกรีนอย่างสมบูรณ์แบบ</p>
                  </div>
                )}

                {activeGuideTab === 'ios' && (
                  <div className="bg-slate-950/30 border border-slate-800/40 p-3 rounded-2xl text-[10px] text-slate-350 flex flex-col gap-1">
                    <p>• 1. ตรวจสอบว่าเปิดผ่านเบราว์เซอร์ <strong>Safari</strong> ของเครื่อง iPhone</p>
                    <p>• 2. แตะปุ่ม <strong>แชร์ Share (สี่เหลี่ยมลูกศรชี้ขึ้น)</strong> แถบด้านล่าง</p>
                    <p>• 3. เลือกเมนู <strong>"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</strong> เพื่อติดตั้ง</p>
                  </div>
                )}

                {activeGuideTab === 'apk' && (
                  <div className="bg-amber-950/20 border border-amber-900/30 p-3 rounded-2xl text-[10px] text-amber-200 flex flex-col gap-2">
                    <div className="font-bold flex items-center gap-1 text-[11px] text-amber-400">
                      <span>🚀</span>
                      <span>วิธีกดสร้างไฟล์ .APK สำหรับ Android</span>
                    </div>
                    <p className="leading-relaxed">ท่านสามารถแปลงหน้าเว็บนี้ให้กลายเป็นไฟล์แอป <strong>.apk</strong> ติดตั้งโดยตรงบนมือถือได้ฟรี ใน 10 วินาที ผ่านระบบ <strong>PWABuilder</strong> (โดย Microsoft):</p>
                    <div className="flex flex-col gap-1 pt-1 font-mono text-[9px] text-amber-300">
                      <p>1. คัดลอก URL ของหน้าเว็บนี้</p>
                      <p>2. กดสุ่มสร้างแพ็คเกจผ่านลิงก์ด้านล่างเพื่อดาวน์โหลด APK ตัวเต็ม</p>
                    </div>
                    <a 
                      href={`https://www.pwabuilder.com/?url=${encodeURIComponent(window.location.protocol + '//' + window.location.host)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold py-1.5 px-2 rounded-lg text-center font-sans tracking-wide transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>🛠️</span>
                      <span>เปิด PWABuilder ผลิตไฟล์ APK</span>
                    </a>
                  </div>
                )}
              </div>

              {deferredPrompt && (
                <button
                  onClick={handleInstallApp}
                  className="w-full bg-red-650 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-xl transition-all font-sans text-[11px] flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-red-950/40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ติดตั้งแอปเวอร์ชันเครื่องคอมพิวเตอร์นี้</span>
                </button>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-mono text-[9px]">BYPASS MODE CONTROLS</span>
                <button 
                  onClick={() => {
                    setForceFullScreen(true);
                    localStorage.setItem('fakeGps_forceFullScreen', 'true');
                    showToast('แสดงผลแบบเต็มหน้าจอคอมพิวเตอร์เรียบร้อย');
                  }}
                  className="text-red-400 hover:text-red-350 font-bold underline transition-colors cursor-pointer"
                >
                  🖥️ บังคับแสดงผลเต็มจอพีซี
                </button>
              </div>
            </div>
          </div>

          {/* Right: Premium Phone simulator layout */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="absolute -left-3.5 top-1/4 w-1.5 h-10 bg-slate-800 rounded-l-md border-r border-slate-900 shadow-xl"></div>
              <div className="absolute -left-3.5 top-1/3 w-1.5 h-10 bg-slate-800 rounded-l-md border-r border-slate-900 shadow-xl"></div>
              <div className="absolute -right-3.5 top-1/4 w-1.5 h-14 bg-slate-800 rounded-r-md border-l border-slate-900 shadow-xl"></div>

              {/* Handset mockup */}
              <div className="w-[385px] h-[785px] bg-slate-950 p-3 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.85)] border-4 border-slate-800 relative flex flex-col">
                {/* Selfie notch/ear speaker */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-3.5 bg-slate-950 rounded-b-xl z-50 flex items-center justify-center">
                  <div className="w-8 h-0.5 bg-slate-850 rounded-full"></div>
                </div>

                {/* Status Bar */}
                <div className="w-full bg-slate-900 text-white h-5 px-5 pt-0.5 text-[9px] font-sans flex items-center justify-between select-none z-40 rounded-t-[28px] border-b border-white/5">
                  <span className="font-extrabold text-white">{simulatedTime}</span>
                  <div className="flex items-center gap-1 text-white/95">
                    <span className="text-[7px] font-bold bg-red-650 px-1 rounded text-white mr-1">4G SPX</span>
                    <Signal className="w-2 h-2 text-white fill-white" />
                    <Wifi className="w-2 h-2 text-white" />
                    <Battery className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                {/* Application inner view screen */}
                <div className="flex-grow w-full bg-slate-950 rounded-b-[28px] overflow-hidden relative flex flex-col no-scrollbar">
                  <div className="absolute inset-0 overflow-y-auto no-scrollbar flex flex-col h-full bg-slate-900">
                    {renderAppContent()}
                  </div>
                </div>

                {/* Home bar indicators */}
                <div className="w-full h-3 flex items-center justify-center select-none bg-slate-900 rounded-b-[34px]">
                  <div className="w-24 h-0.5 bg-white/30 rounded-full mb-1"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Real Mobile view rendering (no simulator, fill the entire phone screen)
  return (
    <div className="w-full min-h-screen relative flex flex-col overflow-x-hidden no-scrollbar bg-slate-950">
      {/* Drawer modal for real mobiles guide */}
      {isInstallGuideOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[1000] flex items-end justify-center p-4">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="bg-white text-slate-900 rounded-t-3xl p-5 w-full max-w-sm flex flex-col gap-4 font-sans border-t border-slate-100 shadow-2xl"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>📲</span>
                  <span>วิธีติดตั้งจำลองลงพิกัดมือถือ</span>
                </h3>
              </div>
              <button 
                onClick={() => setIsInstallGuideOpen(false)}
                className="text-slate-450 hover:text-slate-700 bg-slate-100 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-3 bg-slate-100 p-0.5 border border-slate-200 rounded-lg">
                <button 
                  onClick={() => setActiveGuideTab('android')}
                  className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${activeGuideTab === 'android' ? 'bg-red-650 text-white' : 'text-slate-500'}`}
                >
                  🤖 Android
                </button>
                <button 
                  onClick={() => setActiveGuideTab('ios')}
                  className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${activeGuideTab === 'ios' ? 'bg-red-650 text-white' : 'text-slate-500'}`}
                >
                  🍎 iOS Apple
                </button>
                <button 
                  onClick={() => setActiveGuideTab('apk')}
                  className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${activeGuideTab === 'apk' ? 'bg-amber-650 text-white' : 'text-slate-500'}`}
                >
                  📦 สร้าง APK
                </button>
              </div>

              {activeGuideTab === 'android' && (
                <div className="text-xs text-slate-650 flex flex-col gap-2 p-1 font-sans">
                  <p>1. ตรวจดูว่าเปิดหน้านี้บนแอป <strong>Chrome (โครม)</strong> บนสมาร์ทโฟน</p>
                  <p>2. กดสัญลักษณ์ปุ่ม <strong>จุด 3 จุด (ขวาบนที่อยู่เว็บ)</strong></p>
                  <p>3. แตะคำสั่ง <strong>"ติดตั้งแอปพลิเคชัน" (Install Web App)</strong> หรือ "เพิ่มลงบนหน้าจอหลัก"</p>
                </div>
              )}

              {activeGuideTab === 'ios' && (
                <div className="text-xs text-slate-650 flex flex-col gap-2 p-1 font-sans">
                  <p>1. ตรวจสอบว่าเปิดผ่านเบราว์เซอร์ <strong>Safari (ซาฟารี)</strong> ของเครื่องไอโฟน</p>
                  <p>2. แตะปุ่มไอคอนชี้ขึ้น <strong>แชร์ Share (สี่เหลี่ยมลูกศรชี้ขึ้น)</strong> แถบล่างสุด</p>
                  <p>3. เลื่อนแตะเลือกเมนูเขียนว่า <strong>"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</strong></p>
                </div>
              )}

              {activeGuideTab === 'apk' && (
                <div className="text-xs text-slate-700 bg-amber-50 border border-amber-200 p-3 rounded-xl flex flex-col gap-2 font-sans">
                  <p className="font-bold text-amber-800 text-[13px] flex items-center gap-1">
                    <span>📦</span>
                    <span>ดาวน์โหลดไฟล์ .APK แบบติดตั้งโดยตรง</span>
                  </p>
                  <p className="leading-relaxed text-[11px]">คุณสามารถแปลงแอปนี้ให้เป็นไฟล์ <strong>.apk</strong> นำไปติดตั้งบนแอนดรอยด์ได้ทันที โดยแนะนำให้เปิดลิงก์ผ่าน <strong>PWABuilder</strong>:</p>
                  <a 
                    href={`https://www.pwabuilder.com/?url=${encodeURIComponent(window.location.protocol + '//' + window.location.host)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold py-2 rounded-lg text-center shadow-md active:scale-98 transition-all flex items-center justify-center gap-1 font-sans text-xs"
                  >
                    <span>🛠️</span>
                    <span>เปิด PWABuilder ผลิตไฟล์ APK</span>
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsInstallGuideOpen(false)}
              className="w-full bg-red-650 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
            >
              เข้าใจแล้ว ปิดวิธีติดตั้ง
            </button>
          </motion.div>
        </div>
      )}

      {/* RENDER NATIVE CONTENT */}
      {renderAppContent()}
    </div>
  );
}
