import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Radio,
  Navigation,
  Clock,
  Smartphone,
  Flame,
  Layers,
  Crosshair,
  RotateCcw,
} from 'lucide-react';
import { LocationPoint } from '../../types/ipdr';

interface LocationTrackerProps {
  locationHistory: LocationPoint[];
  subscriberName: string;
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({
  locationHistory,
  subscriberName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mapMode, setMapMode] = useState<'MARKERS' | 'HEATMAP' | 'HYBRID'>('HYBRID');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'CELL_TOWER' | 'APP_PERMISSION'>('ALL');
  const [maxHourOffset, setMaxHourOffset] = useState<number>(24);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(locationHistory[0]?.id || null);

  // Filter points based on source and timeline scrubber
  const filteredPoints = useMemo(() => {
    return locationHistory.filter((pt) => {
      const matchSource = sourceFilter === 'ALL' || pt.sourceType === sourceFilter;
      const matchTime = pt.hourOffset <= maxHourOffset;
      return matchSource && matchTime;
    });
  }, [locationHistory, sourceFilter, maxHourOffset]);

  const selectedPoint = useMemo(() => {
    return locationHistory.find((p) => p.id === selectedPointId) || filteredPoints[0] || null;
  }, [locationHistory, selectedPointId, filteredPoints]);

  // Initialize Leaflet Map with Light Voyager Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultCenter: [number, number] = [-6.2297, 106.8122];
    const initialZoom = 13;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: true,
    });

    // Clean, crisp light city street map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Draw Heatmap Canvas on Map
  const renderHeatmap = () => {
    const map = mapInstanceRef.current;
    const canvas = heatmapCanvasRef.current;
    if (!map || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mapMode === 'MARKERS' || filteredPoints.length === 0) return;

    filteredPoints.forEach((pt) => {
      const point = map.latLngToContainerPoint([pt.lat, pt.lng]);
      const weight = Math.max(0.3, 1 - pt.hourOffset / 26);
      const radius = pt.sourceType === 'CELL_TOWER' ? 70 : 45;

      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        radius
      );

      // Light-adapted vibrant thermal palette: Red -> Orange -> Cyan
      gradient.addColorStop(0, `rgba(225, 29, 72, ${0.75 * weight})`);
      gradient.addColorStop(0.35, `rgba(234, 88, 12, ${0.55 * weight})`);
      gradient.addColorStop(0.7, `rgba(14, 165, 233, ${0.35 * weight})`);
      gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Update Markers & Path Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    renderHeatmap();

    if (mapMode !== 'HEATMAP') {
      if (filteredPoints.length > 1) {
        const latLngs: [number, number][] = filteredPoints.map((p) => [p.lat, p.lng]);
        L.polyline(latLngs, {
          color: '#0284c7',
          weight: 2.5,
          dashArray: '5, 5',
          opacity: 0.8,
        }).addTo(markersLayer);
      }

      filteredPoints.forEach((pt, idx) => {
        const isSelected = selectedPoint?.id === pt.id;
        const isCellTower = pt.sourceType === 'CELL_TOWER';

        const radiusMeters = isCellTower
          ? pt.estimatedRadiusMeters || 300
          : pt.accuracyMeters || 20;

        L.circle([pt.lat, pt.lng], {
          radius: radiusMeters,
          color: isCellTower ? '#d97706' : '#059669',
          fillColor: isCellTower ? '#d97706' : '#059669',
          fillOpacity: isSelected ? 0.22 : 0.08,
          weight: isSelected ? 2 : 1,
          dashArray: isCellTower ? '4, 4' : undefined,
        }).addTo(markersLayer);

        if (isCellTower && pt.azimuth !== undefined) {
          const angleRad = ((pt.azimuth - 90) * Math.PI) / 180;
          const beamDist = 0.0035;
          const endLat = pt.lat + beamDist * Math.sin(angleRad);
          const endLng = pt.lng + beamDist * Math.cos(angleRad);

          L.polyline([[pt.lat, pt.lng], [endLat, endLng]], {
            color: '#d97706',
            weight: 2.5,
            opacity: 0.9,
          }).addTo(markersLayer);
        }

        const markerHtml = `
          <div class="relative group cursor-pointer flex items-center justify-center">
            <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-transform ${
              isSelected ? 'scale-125 ring-2 ring-slate-800' : ''
            } ${
          isCellTower
            ? 'bg-amber-500 text-white'
            : 'bg-emerald-600 text-white'
        }">
              <span class="text-[10px] font-bold font-mono">${idx + 1}</span>
            </div>
            ${
              isSelected
                ? `<span class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono shadow-md">${
                    isCellTower ? `BTS ${pt.cellId}` : pt.appName?.split(' ')[0]
                  }</span>`
                : ''
            }
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-leaflet-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([pt.lat, pt.lng], { icon: customIcon });

        const popupContent = `
          <div class="text-xs font-mono space-y-1.5 p-1 text-slate-900">
            <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-1">
              <strong class="${isCellTower ? 'text-amber-700' : 'text-emerald-700'}">
                ${isCellTower ? 'CELL TOWER BTS EVENT' : 'APP GPS LOCATION PING'}
              </strong>
              <span class="text-[10px] text-slate-500">${pt.hourOffset.toFixed(1)}h ago</span>
            </div>
            <div class="text-slate-900 font-sans font-bold">${pt.locationName}</div>
            <div class="text-slate-600 text-[11px]">Coordinates: ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}</div>
            ${
              isCellTower
                ? `<div class="grid grid-cols-2 gap-1 text-[11px] bg-slate-100 p-1.5 rounded">
                     <div>Cell ID: <strong>${pt.cellId}</strong></div>
                     <div>LAC: <strong>${pt.lac}</strong></div>
                     <div>RSSI: <strong class="text-amber-700">${pt.signalStrengthDbm} dBm</strong></div>
                     <div>Azimuth: <strong>${pt.azimuth}°</strong></div>
                   </div>`
                : `<div class="grid grid-cols-2 gap-1 text-[11px] bg-slate-100 p-1.5 rounded">
                     <div>App: <strong class="text-emerald-700">${pt.appName}</strong></div>
                     <div>Accuracy: <strong>±${pt.accuracyMeters}m</strong></div>
                     <div class="col-span-2 text-slate-600">Pkg: ${pt.appPackage}</div>
                   </div>`
            }
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedPointId(pt.id);
        });

        marker.addTo(markersLayer);
      });
    }

    if (filteredPoints.length > 0) {
      const groupBounds = L.latLngBounds(filteredPoints.map((p) => [p.lat, p.lng]));
      map.fitBounds(groupBounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [filteredPoints, mapMode, selectedPoint]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapChange = () => {
      renderHeatmap();
    };

    map.on('move', handleMapChange);
    map.on('zoom', handleMapChange);
    map.on('resize', handleMapChange);

    return () => {
      map.off('move', handleMapChange);
      map.off('zoom', handleMapChange);
      map.off('resize', handleMapChange);
    };
  }, [filteredPoints, mapMode]);

  const handleCenterOnSelected = () => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPoint) return;
    map.setView([selectedPoint.lat, selectedPoint.lng], 15, { animate: true });
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map || filteredPoints.length === 0) return;
    const groupBounds = L.latLngBounds(filteredPoints.map((p) => [p.lat, p.lng]));
    map.fitBounds(groupBounds, { padding: [40, 40] });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
      {/* Header and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Last 24-Hour Geospatial City Map & Heatmap
            </h2>
            <p className="text-xs text-slate-500">
              Interactive city layout mapping subscriber movements, cell tower sectors, and dwell-time density
            </p>
          </div>
        </div>

        {/* View Mode & Source Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Map Rendering Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setMapMode('HYBRID')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                mapMode === 'HYBRID'
                  ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Hybrid</span>
            </button>
            <button
              onClick={() => setMapMode('HEATMAP')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                mapMode === 'HEATMAP'
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:text-rose-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>24h Heatmap</span>
            </button>
            <button
              onClick={() => setMapMode('MARKERS')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                mapMode === 'MARKERS'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Point Markers</span>
            </button>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setSourceFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                sourceFilter === 'ALL'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({locationHistory.length})
            </button>
            <button
              onClick={() => setSourceFilter('CELL_TOWER')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                sourceFilter === 'CELL_TOWER'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              <Radio className="w-3 h-3" />
              Tower BTS
            </button>
            <button
              onClick={() => setSourceFilter('APP_PERMISSION')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                sourceFilter === 'APP_PERMISSION'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              App GPS
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map & Timeline Scrubber Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Canvas */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-inner h-[460px]">
            {/* Real Geographic Leaflet Map */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Heatmap Overlay Canvas */}
            <canvas
              ref={heatmapCanvasRef}
              className="absolute inset-0 pointer-events-none z-[400] transition-opacity duration-300"
              style={{
                opacity: mapMode === 'MARKERS' ? 0 : 0.85,
              }}
            />

            {/* Map Action Quick Bar (Top Left) */}
            <div className="absolute top-3 left-3 z-[500] flex items-center gap-1.5 bg-white/95 border border-slate-200 rounded-lg p-1 shadow-sm text-xs font-mono-numbers">
              <button
                onClick={handleResetView}
                title="Fit all location markers to screen"
                className="px-2 py-1 flex items-center gap-1 text-slate-700 hover:text-cyan-700 hover:bg-slate-100 rounded"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Fit Bounds</span>
              </button>
              {selectedPoint && (
                <button
                  onClick={handleCenterOnSelected}
                  title="Center map on selected location"
                  className="px-2 py-1 flex items-center gap-1 text-cyan-700 hover:bg-slate-100 rounded font-semibold"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Center Target</span>
                </button>
              )}
            </div>

            {/* Bottom Legend */}
            <div className="absolute bottom-3 left-3 z-[500] flex flex-wrap items-center gap-3 bg-white/95 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-mono-numbers shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="text-slate-800 font-medium">Cell Tower BTS (Azimuth Cone & Sector)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <span className="text-slate-800 font-medium">App GPS Permission (Precision Pings)</span>
              </div>
              {mapMode !== 'MARKERS' && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                  <span className="text-rose-700 font-bold">High Dwell Density</span>
                </div>
              )}
            </div>
          </div>

          {/* 24-Hour Chronological Scrubber */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-numbers">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-700" />
                24-Hour Playback Window:
              </span>
              <span className="text-cyan-800 font-bold">
                {maxHourOffset === 24 ? 'Full 24-Hour Window' : `Events in Past ${maxHourOffset} Hours`}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={maxHourOffset}
              onChange={(e) => setMaxHourOffset(Number(e.target.value))}
              className="w-full accent-cyan-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono-numbers font-medium">
              <span>Past 1 hr (Immediate)</span>
              <span>Past 12 hrs</span>
              <span>Past 24 hrs (Full Dossier)</span>
            </div>
          </div>
        </div>

        {/* Selected Point Inspection Panel & Event Stream */}
        <div className="space-y-4">
          {/* Selected Location Card */}
          {selectedPoint && (
            <div className="bg-slate-50 p-4 rounded-xl border border-cyan-400 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono-numbers font-bold px-2 py-0.5 rounded border uppercase ${
                    selectedPoint.sourceType === 'CELL_TOWER'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {selectedPoint.sourceType === 'CELL_TOWER'
                    ? 'CELL TOWER BTS EVENT'
                    : 'APP GPS PERMISSION PING'}
                </span>
                <span className="text-[11px] font-mono-numbers text-slate-600">
                  {selectedPoint.hourOffset < 1
                    ? 'Recent (< 1 hr ago)'
                    : `${selectedPoint.hourOffset.toFixed(1)}h ago`}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedPoint.locationName}</h4>
                <div className="text-xs font-mono-numbers text-cyan-800 mt-0.5 font-bold">
                  Lat: {selectedPoint.lat.toFixed(4)}, Lng: {selectedPoint.lng.toFixed(4)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono-numbers bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                {selectedPoint.sourceType === 'CELL_TOWER' ? (
                  <>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Cell ID / LAC</div>
                      <div className="text-slate-800 font-bold">
                        {selectedPoint.cellId} / {selectedPoint.lac}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Signal RSSI</div>
                      <div className="text-amber-700 font-bold">
                        {selectedPoint.signalStrengthDbm} dBm
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Sector Azimuth</div>
                      <div className="text-slate-700 font-medium">{selectedPoint.azimuth}°</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Radius Est.</div>
                      <div className="text-slate-700 font-medium">±{selectedPoint.estimatedRadiusMeters}m</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">App Name</div>
                      <div className="text-emerald-700 font-bold truncate">
                        {selectedPoint.appName}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">GPS Accuracy</div>
                      <div className="text-emerald-700 font-bold">
                        ±{selectedPoint.accuracyMeters}m
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Package Identifier</div>
                      <div className="text-slate-700 truncate">{selectedPoint.appPackage}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Altitude</div>
                      <div className="text-slate-700 font-medium">{selectedPoint.altitudeMeters}m MSL</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Chronological Event Log List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
              <span>Chronological Location Log</span>
              <span className="font-mono-numbers text-[10px] text-cyan-700 font-bold">
                {filteredPoints.length} points visible
              </span>
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
              {filteredPoints.map((point, idx) => (
                <button
                  key={point.id}
                  onClick={() => {
                    setSelectedPointId(point.id);
                    mapInstanceRef.current?.setView([point.lat, point.lng], 15, { animate: true });
                  }}
                  className={`w-full text-left p-2 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                    selectedPoint?.id === point.id
                      ? 'bg-cyan-50 border-cyan-400 text-slate-900 shadow-2xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 text-slate-700 border border-slate-200">
                      {idx + 1}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        point.sourceType === 'CELL_TOWER' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <div className="truncate max-w-[155px]">
                      <div className="font-bold text-slate-800 truncate">{point.locationName}</div>
                      <div className="text-[10px] text-slate-500 font-mono-numbers">
                        {point.sourceType === 'CELL_TOWER' ? `BTS ${point.cellId}` : point.appName}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono-numbers text-slate-500 shrink-0 font-medium">
                    {point.hourOffset.toFixed(1)}h ago
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
