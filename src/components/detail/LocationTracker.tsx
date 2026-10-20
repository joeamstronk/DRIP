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
  Info,
  Maximize2,
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

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on Jakarta or average coordinates
    const defaultCenter: [number, number] = [-6.2297, 106.8122];
    const initialZoom = 13;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: initialZoom,
      zoomControl: false, // We'll add custom positioned zoom control
      attributionControl: true,
    });

    // Dark Matter city street tile layer (shows real streets, districts, highways)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
    }).addTo(map);

    // Custom Zoom Control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Layer group for dynamic markers, lines & circles
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    // Invalidate size on load to ensure crisp rendering
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

    // Render radial heat spots for each point
    filteredPoints.forEach((pt) => {
      const point = map.latLngToContainerPoint([pt.lat, pt.lng]);
      // Weight points by recency and stay time (closer to present = higher intensity)
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

      // Cyber tactical heatmap color ramp: intense core (red/orange) -> amber -> cyan glow
      gradient.addColorStop(0, `rgba(244, 63, 94, ${0.7 * weight})`); // Red-pink core
      gradient.addColorStop(0.3, `rgba(245, 158, 11, ${0.5 * weight})`); // Amber
      gradient.addColorStop(0.65, `rgba(56, 189, 248, ${0.35 * weight})`); // Cyan
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0)'); // Transparent edge

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

    // Redraw heatmap
    renderHeatmap();

    if (mapMode !== 'HEATMAP') {
      // 1. Draw Breadcrumb Polyline between chronological points
      if (filteredPoints.length > 1) {
        const latLngs: [number, number][] = filteredPoints.map((p) => [p.lat, p.lng]);
        L.polyline(latLngs, {
          color: '#38bdf8',
          weight: 2,
          dashArray: '5, 5',
          opacity: 0.7,
        }).addTo(markersLayer);
      }

      // 2. Render Point Markers
      filteredPoints.forEach((pt, idx) => {
        const isSelected = selectedPoint?.id === pt.id;
        const isCellTower = pt.sourceType === 'CELL_TOWER';

        // Render coverage or accuracy radius circle
        const radiusMeters = isCellTower
          ? pt.estimatedRadiusMeters || 300
          : pt.accuracyMeters || 20;

        L.circle([pt.lat, pt.lng], {
          radius: radiusMeters,
          color: isCellTower ? '#f59e0b' : '#10b981',
          fillColor: isCellTower ? '#f59e0b' : '#10b981',
          fillOpacity: isSelected ? 0.22 : 0.08,
          weight: isSelected ? 2 : 1,
          dashArray: isCellTower ? '4, 4' : undefined,
        }).addTo(markersLayer);

        // Render Tower sector beam / azimuth direction if tower
        if (isCellTower && pt.azimuth !== undefined) {
          const angleRad = ((pt.azimuth - 90) * Math.PI) / 180;
          const beamDist = 0.0035; // Approx 350m in lat/lng delta
          const endLat = pt.lat + beamDist * Math.sin(angleRad);
          const endLng = pt.lng + beamDist * Math.cos(angleRad);

          L.polyline([[pt.lat, pt.lng], [endLat, endLng]], {
            color: '#f59e0b',
            weight: 2.5,
            opacity: 0.85,
          }).addTo(markersLayer);
        }

        // Custom HTML Marker Icon
        const markerHtml = `
          <div class="relative group cursor-pointer flex items-center justify-center">
            <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 transition-transform ${
              isSelected ? 'scale-125 ring-2 ring-white' : ''
            } ${
          isCellTower
            ? 'bg-amber-500 border-slate-900 text-slate-950'
            : 'bg-emerald-500 border-slate-900 text-slate-950'
        }">
              <span class="text-[10px] font-bold font-mono">${idx + 1}</span>
            </div>
            ${
              isSelected
                ? `<span class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-200 border border-slate-700 text-[9px] font-mono shadow-md">${
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

        // Popup Content
        const popupContent = `
          <div class="text-xs font-mono space-y-1.5 p-1">
            <div class="flex items-center justify-between gap-3 border-b border-slate-700 pb-1">
              <strong class="${isCellTower ? 'text-amber-400' : 'text-emerald-400'}">
                ${isCellTower ? 'CELL TOWER BTS EVENT' : 'APP GPS LOCATION PING'}
              </strong>
              <span class="text-[10px] text-slate-400">${pt.hourOffset.toFixed(1)}h ago</span>
            </div>
            <div class="text-slate-200 font-sans font-bold">${pt.locationName}</div>
            <div class="text-slate-400 text-[11px]">Coordinates: ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}</div>
            ${
              isCellTower
                ? `<div class="grid grid-cols-2 gap-1 text-[11px] bg-slate-900 p-1.5 rounded">
                     <div>Cell ID: <strong>${pt.cellId}</strong></div>
                     <div>LAC: <strong>${pt.lac}</strong></div>
                     <div>RSSI: <strong class="text-amber-400">${pt.signalStrengthDbm} dBm</strong></div>
                     <div>Azimuth: <strong>${pt.azimuth}°</strong></div>
                   </div>`
                : `<div class="grid grid-cols-2 gap-1 text-[11px] bg-slate-900 p-1.5 rounded">
                     <div>App: <strong class="text-emerald-400">${pt.appName}</strong></div>
                     <div>Accuracy: <strong>±${pt.accuracyMeters}m</strong></div>
                     <div class="col-span-2 text-slate-400">Pkg: ${pt.appPackage}</div>
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

    // Fit map bounds to filtered points if points exist
    if (filteredPoints.length > 0) {
      const groupBounds = L.latLngBounds(filteredPoints.map((p) => [p.lat, p.lng]));
      map.fitBounds(groupBounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [filteredPoints, mapMode, selectedPoint]);

  // Hook map events to redraw canvas heatmap on pan/zoom
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      {/* Header and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Last 24-Hour Geospatial City Map & Heatmap
            </h2>
            <p className="text-xs text-slate-400">
              Interactive city layout mapping subscriber movements, cell tower sectors, and dwell-time density
            </p>
          </div>
        </div>

        {/* View Mode & Source Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Map Rendering Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setMapMode('HYBRID')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                mapMode === 'HYBRID'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Hybrid</span>
            </button>
            <button
              onClick={() => setMapMode('HEATMAP')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                mapMode === 'HEATMAP'
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>24h Heatmap</span>
            </button>
            <button
              onClick={() => setMapMode('MARKERS')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                mapMode === 'MARKERS'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Point Markers</span>
            </button>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSourceFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                sourceFilter === 'ALL'
                  ? 'bg-slate-700 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({locationHistory.length})
            </button>
            <button
              onClick={() => setSourceFilter('CELL_TOWER')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                sourceFilter === 'CELL_TOWER'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Radio className="w-3 h-3" />
              Tower BTS
            </button>
            <button
              onClick={() => setSourceFilter('APP_PERMISSION')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                sourceFilter === 'APP_PERMISSION'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-emerald-300'
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
          <div className="relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner h-[460px]">
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
            <div className="absolute top-3 left-3 z-[500] flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1 backdrop-blur text-xs font-mono-numbers">
              <button
                onClick={handleResetView}
                title="Fit all location markers to screen"
                className="px-2 py-1 flex items-center gap-1 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Fit Bounds</span>
              </button>
              {selectedPoint && (
                <button
                  onClick={handleCenterOnSelected}
                  title="Center map on selected location"
                  className="px-2 py-1 flex items-center gap-1 text-cyan-400 hover:bg-slate-800 rounded"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Center Target</span>
                </button>
              )}
            </div>

            {/* Bottom Legend */}
            <div className="absolute bottom-3 left-3 z-[500] flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-mono-numbers backdrop-blur">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="text-slate-300">Cell Tower BTS (Azimuth Cone & Sector)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-slate-300">App GPS Permission (Precision Pings)</span>
              </div>
              {mapMode !== 'MARKERS' && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="text-rose-300">High Dwell Density</span>
                </div>
              )}
            </div>
          </div>

          {/* 24-Hour Chronological Scrubber */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-numbers">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                24-Hour Playback Window:
              </span>
              <span className="text-cyan-400 font-bold">
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
              className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono-numbers">
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
            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono-numbers font-bold px-2 py-0.5 rounded border ${
                    selectedPoint.sourceType === 'CELL_TOWER'
                      ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {selectedPoint.sourceType === 'CELL_TOWER'
                    ? 'CELL TOWER BTS EVENT'
                    : 'APP GPS PERMISSION PING'}
                </span>
                <span className="text-[11px] font-mono-numbers text-slate-400">
                  {selectedPoint.hourOffset < 1
                    ? 'Recent (< 1 hr ago)'
                    : `${selectedPoint.hourOffset.toFixed(1)}h ago`}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100">{selectedPoint.locationName}</h4>
                <div className="text-xs font-mono-numbers text-cyan-400 mt-0.5">
                  Lat: {selectedPoint.lat.toFixed(4)}, Lng: {selectedPoint.lng.toFixed(4)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono-numbers bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                {selectedPoint.sourceType === 'CELL_TOWER' ? (
                  <>
                    <div>
                      <div className="text-[10px] text-slate-500">Cell ID / LAC</div>
                      <div className="text-slate-200">
                        {selectedPoint.cellId} / {selectedPoint.lac}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Signal RSSI</div>
                      <div className="text-amber-400 font-semibold">
                        {selectedPoint.signalStrengthDbm} dBm
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Sector Azimuth</div>
                      <div className="text-slate-200">{selectedPoint.azimuth}°</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Radius Est.</div>
                      <div className="text-slate-200">±{selectedPoint.estimatedRadiusMeters}m</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-[10px] text-slate-500">App Name</div>
                      <div className="text-emerald-400 font-semibold truncate">
                        {selectedPoint.appName}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">GPS Accuracy</div>
                      <div className="text-emerald-400 font-semibold">
                        ±{selectedPoint.accuracyMeters}m
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Package Identifier</div>
                      <div className="text-slate-300 truncate">{selectedPoint.appPackage}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Altitude</div>
                      <div className="text-slate-300">{selectedPoint.altitudeMeters}m MSL</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Chronological Event Log List */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Chronological Location Log</span>
              <span className="font-mono-numbers text-[10px] text-cyan-400">
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
                      ? 'bg-slate-800 border-cyan-500 text-slate-100 shadow-sm'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 text-slate-300">
                      {idx + 1}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        point.sourceType === 'CELL_TOWER' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                    <div className="truncate max-w-[155px]">
                      <div className="font-medium text-slate-200 truncate">{point.locationName}</div>
                      <div className="text-[10px] text-slate-500 font-mono-numbers">
                        {point.sourceType === 'CELL_TOWER' ? `BTS ${point.cellId}` : point.appName}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono-numbers text-slate-400 shrink-0">
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
