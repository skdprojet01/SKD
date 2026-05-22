import { useState } from 'react';
import { GeolocationMockService } from '../utils/geolocationMock';
import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface SandboxTestProps {
  lat: number;
  lng: number;
  isMockActive: boolean;
  onToggleMock: (activate: boolean) => void;
}

export function SandboxTest({ lat, lng, isMockActive, onToggleMock }: SandboxTestProps) {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    lat?: number;
    lng?: number;
    accuracy?: number;
    timestamp?: string;
    errorMsg?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  // Calls navigator.geolocation.getCurrentPosition to verify if our override works
  const handleTestGeolocation = () => {
    setLoading(true);
    setTestResult(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setTestResult({
        success: false,
        errorMsg: 'เบราว์เซอร์ไม่รองรับ Geolocation หรือรันในสภาพแวดล้อมจำกัด',
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setTestResult({
          success: true,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toLocaleTimeString(),
        });
        setLoading(false);
      },
      (error) => {
        setTestResult({
          success: false,
          errorMsg: `${error.message} (รหัสข้อผิดพลาด: ${error.code})`,
        });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md shadow-2xl rounded-3xl border border-slate-800 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          {isMockActive ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          )}
          <h2 className="font-display font-bold text-white text-lg">
            ความปลอดภัยและพิกัดจำลอง
          </h2>
        </div>
        <button
          onClick={() => onToggleMock(!isMockActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
            isMockActive ? 'bg-blue-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
              isMockActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed focus:outline-none">
        เมื่อร่วมใช้งานกับหน้าเว็บอื่นหรือแอปพลิเคชันที่มีการถามหาพิกัด สคริปต์จำลองจะเข้าทำการแทนที่พิกัดจริงของตัวเครื่อง ด้วยจุดพิกัดที่เราเลือกและบังคับทันที
      </p>

      {/* Mock State Status Bar */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800">
          <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block mb-0.5">
            จำลองในแอป (Mock Service)
          </span>
          <span className={`text-xs font-bold font-sans ${isMockActive ? 'text-emerald-400' : 'text-amber-500'}`}>
            ● {isMockActive ? 'กำลังจำลองอยู่ (Active)' : 'ปิดอยู่ (Real Location)'}
          </span>
        </div>
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800">
          <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block mb-0.5">
            ช่องทดสอบ (Target Coordinates)
          </span>
          <span className="text-xs font-mono text-blue-400 font-bold block truncate">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        </div>
      </div>

      {/* Debug Sandbox Area */}
      <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white">ทดสอบขอพิกัดเบราว์เซอร์จริง</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-3 font-sans leading-normal">
            คลิกปุ่มด้านล่างเพื่อทำการยิงคำสั่ง <code className="text-pink-400 font-mono">navigator.geolocation</code> ของระบบจริง เพื่อสังเกตจุดพิกัดที่จะทำงาน
          </p>

          {/* Render real-time test feedback */}
          {testResult && (
            <div className={`p-3 rounded-lg text-xs font-mono mb-3 ${
              testResult.success ? 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-300' : 'bg-rose-950/40 border border-rose-900/50 text-rose-300'
            }`}>
              {testResult.success ? (
                <div className="space-y-1">
                  <p className="font-sans font-bold text-emerald-400 mb-1">✓ อ่านพิกัดสำเร็จ !</p>
                  <p>ละติจูด: {testResult.lat?.toFixed(6)}</p>
                  <p>ลองจิจูด: {testResult.lng?.toFixed(6)}</p>
                  <p>ความถูกต้อง: {testResult.accuracy} ม.</p>
                  <p>เวลาเรียก: {testResult.timestamp}</p>
                </div>
              ) : (
                <div>
                  <p className="font-sans font-bold text-rose-400 mb-1">✗ เกิดข้อผิดพลาด</p>
                  <p className="text-[10px]">{testResult.errorMsg}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleTestGeolocation}
          disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-700/60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'กำลังดึงพิกัด...' : 'ทดสอบยิง GPS ตรวจจับ'}</span>
        </button>
      </div>
    </div>
  );
}
