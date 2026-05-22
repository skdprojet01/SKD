import { useState } from 'react';
import { 
  Copy, 
  Check, 
  MapPin, 
  Download, 
  ExternalLink,
  Map,
  Share2,
  FileSpreadsheet
} from 'lucide-react';

interface GpxExporterProps {
  lat: number;
  lng: number;
  onCoordinateChange: (lat: number, lng: number) => void;
  routePoints: Array<[number, number]>;
}

export function GpxExporter({ lat, lng, onCoordinateChange, routePoints }: GpxExporterProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [latInput, setLatInput] = useState(lat.toString());
  const [lngInput, setLngInput] = useState(lng.toString());

  // Sync internal input state when props change
  const syncInputs = () => {
    setLatInput(lat.toString());
    setLngInput(lng.toString());
  };

  const handleApplyManual = () => {
    const parsedLat = parseFloat(latInput);
    const parsedLng = parseFloat(lngInput);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      if (parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180) {
        onCoordinateChange(parsedLat, parsedLng);
      } else {
        alert('กรุณากรอกละติจูดระหว่าง -90 ถึง 90 และลองจิจูดระหว่าง -180 ถึง 180');
      }
    } else {
      alert('ค่าพิกัดต้องเป็นตัวเลขเท่านั้น');
    }
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Generate Waypoint GPX
  const downloadWaypointGpx = () => {
    const rawGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Fake GPS Controller" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="${lat.toFixed(6)}" lon="${lng.toFixed(6)}">
    <name>Mocked GPS Waypoint</name>
    <desc>Simulated Location via Fake GPS Controller</desc>
    <sym>Waypoint</sym>
  </wpt>
</gpx>`;

    triggerDownload(rawGpx, `mocked_gps_waypoint_${lat.toFixed(4)}_${lng.toFixed(4)}.gpx`);
  };

  // Generate Route GPX (using the simulated walk route history!)
  const downloadRouteGpx = () => {
    if (routePoints.length === 0) {
      alert('ยังไม่มีเส้นทางจำลองสะสม กรุณากดปุ่ม Joypad หรือเปิดจำลองการเดินก่อน เพื่อสร้างรอยเท้าเดินทาง!');
      return;
    }

    const pointsXml = routePoints.map(([pLat, pLng], i) => {
      const timeOffset = new Date(Date.now() + i * 1000).toISOString();
      return `      <trkpt lat="${pLat.toFixed(6)}" lon="${pLng.toFixed(6)}">
        <time>${timeOffset}</time>
      </trkpt>`;
    }).join('\n');

    const rawGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Fake GPS Controller" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Simulated Route Path</name>
    <desc>Created by walking in Fake GPS Controller</desc>
    <trkseg>
${pointsXml}
    </trkseg>
  </trk>
</gpx>`;

    triggerDownload(rawGpx, `mocked_gps_route_simulation.gpx`);
  };

  const triggerDownload = (content: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'application/gpx+xml' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border border-slate-200/85 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-600" />
          <h2 className="font-display font-bold text-slate-900 text-lg">
            แผงส่งออกข้อมูลพิกัดละติจูด
          </h2>
        </div>
      </div>

      {/* Coordinate Input Controls */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            ละติจูด (Latitude)
          </label>
          <input
            type="text"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 select-all focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            ลองจิจูด (Longitude)
          </label>
          <input
            type="text"
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 select-all focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleApplyManual}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-blue-100"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>ข้ามไปพิกัดมือพิมพ์</span>
        </button>
        <button
          onClick={syncInputs}
          className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2.5 px-3 rounded-xl text-xs transition-all"
          title="ดึงพิกัดจากแผนกลับมาใส่กล่องข้อความ"
        >
          รีเฟรชค่า
        </button>
      </div>

      {/* Actions (Copiers) */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">
              คู่ละติจูด ลองจิจูด
            </span>
            <span className="text-xs font-mono text-slate-700 block truncate">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </span>
          </div>
          <button
            onClick={() => handleCopyText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`, 'raw')}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
          >
            {copied === 'raw' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">
              พิกัดแบบ JSON
            </span>
            <span className="text-xs font-mono text-slate-700 block truncate">
              {`{"lat": ${lat.toFixed(6)}, "lng": ${lng.toFixed(6)}}`}
            </span>
          </div>
          <button
            onClick={() => handleCopyText(`{"lat": ${lat.toFixed(6)}, "lng": ${lng.toFixed(6)}}`, 'json')}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
          >
            {copied === 'json' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Outer Links */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all text-center"
          >
            <Map className="w-3.5 h-3.5 text-red-500" />
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all text-center"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>OpenStreetMap</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* GPX Export Box */}
      <div className="border-t border-slate-100 mt-4 pt-4">
        <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-blue-500" />
          <span>ดาวน์โหลดพิกัดจำลอง (.gpx)</span>
        </h3>
        <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
          สร้างไฟล์พิกัดมาตรฐานเพื่อให้คุณสามารถนำเข้าระบบ Fake GPS บนระบบปฏิบัติการ Android/iOS
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={downloadWaypointGpx}
            className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>เครื่องหมายจุดเดี่ยว</span>
          </button>
          <button
            onClick={downloadRouteGpx}
            className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-110/60 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>เส้นทางเดินสะสม ({routePoints.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
