import { useEffect, useState } from 'react';

// 1. TypeScript interfaces matching your Java backend models
interface Vehicle {
  id: string;
  name: string;
  capabilities: string[];
  latitude: number;
  longitude: number;
  status: string; // "IDLE" | "BUSY" | "OFFLINE"
}

interface Field {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
}

interface Job {
  id: string;
  fieldId: string;
  requiredCapability: string;
  priority: number;
  status: string;
}

interface Assignment {
  id: string;
  jobId: string;
  vehicleId: string;
  assignedAt: string;
  reason: string;
}

const API_BASE = 'http://localhost:8080/api';

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  // Form state for dispatching a new job
  const [selectedField, setSelectedField] = useState<string>('F-1');
  const [capability, setCapability] = useState<string>('PLOW');
  const [priority, setPriority] = useState<number>(3);

  // 2. Fetch live state from Spring Boot REST API
  const loadFarmState = async () => {
    try {
      const [vRes, fRes, jRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles`),
        fetch(`${API_BASE}/fields`),
        fetch(`${API_BASE}/jobs`),
        fetch(`${API_BASE}/assignments`),
      ]);
      setVehicles(await vRes.json());
      setFields(await fRes.json());
      setJobs(await jRes.json());
      setAssignments(await aRes.json());
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
    }
  };

  useEffect(() => {
    loadFarmState();
    const interval = setInterval(loadFarmState, 2000);
    return () => clearInterval(interval);
  }, []);

  // 3. Send a new Job to Java (triggers FleetAgent automatically)
  const handleDispatchJob = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fieldId: selectedField,
        requiredCapability: capability,
        priority,
      }),
    });
    loadFarmState();
  };

  // Helper: Convert GPS (lat/lon) from simulator into 2D map coordinates (0–100%)
  const toMapPosition = (lat: number, lon: number) => {
    const minLat = 32.2200, maxLat = 32.2255;
    const minLon = -110.9775, maxLon = -110.9725;
    const x = Math.min(90, Math.max(10, ((lon - minLon) / (maxLon - minLon)) * 100));
    const y = Math.min(90, Math.max(10, (1 - (lat - minLat) / (maxLat - minLat)) * 100));
    return { x, y };
  };

  const statusColor = (status: string) => {
    if (status === 'BUSY') return '#2563eb';
    if (status === 'OFFLINE') return '#dc2626';
    return '#16a34a';
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>AI Farm Orchestrator — Command Center</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Autonomous Fleet Dispatch & Simulation Telemetry Bridge
          </p>
        </div>
        <span style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, background: backendConnected ? '#064e3b' : '#7f1d1d', color: backendConnected ? '#6ee7b7' : '#fca5a5' }}>
          {backendConnected ? '● Orchestrator Online (Port 8080)' : '● Backend Offline'}
        </span>
      </header>

      {/* Main 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
        
        {/* Left Column: 2D Tactical Field Map + Job Dispatch */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section style={{ background: '#1e293b', borderRadius: '12px', padding: '16px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Live Field Telemetry (Simulator / AgOpenWeb Feed)</h2>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '320px', background: '#0b192c', borderRadius: '8px', border: '1px solid #334155' }}>
              {/* Subtle grid lines */}
              <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.4" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.4" />

              {/* Render Fields */}
              {fields.map((field) => {
                const pos = toMapPosition(field.latitude, field.longitude);
                return (
                  <g key={field.id}>
                    <rect x={pos.x - 10} y={pos.y - 7} width="20" height="14" rx="2" fill="#14532d" stroke="#22c55e" strokeWidth="0.6" />
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" fill="#bbf7d0" fontSize="3.2" fontWeight="bold">
                      {field.name}
                    </text>
                  </g>
                );
              })}

              {/* Render Active Assignment Route Lines */}
              {assignments.map((a) => {
                const vehicle = vehicles.find((v) => v.id === a.vehicleId);
                const job = jobs.find((j) => j.id === a.jobId);
                const field = fields.find((f) => f.id === job?.fieldId);
                if (!vehicle || !field) return null;
                const vPos = toMapPosition(vehicle.latitude, vehicle.longitude);
                const fPos = toMapPosition(field.latitude, field.longitude);
                return (
                  <line key={a.id} x1={vPos.x} y1={vPos.y} x2={fPos.x} y2={fPos.y} stroke="#38bdf8" strokeWidth="0.7" strokeDasharray="1.5,1.5" />
                );
              })}

              {/* Render Vehicles */}
              {vehicles.map((v) => {
                const pos = toMapPosition(v.latitude, v.longitude);
                return (
                  <g key={v.id}>
                    <circle cx={pos.x} cy={pos.y} r="3" fill={statusColor(v.status)} stroke="#fff" strokeWidth="0.6" />
                    <text x={pos.x} y={pos.y - 4.5} textAnchor="middle" fill="#f8fafc" fontSize="3.2" fontWeight="bold">
                      {v.id} ({v.status})
                    </text>
                  </g>
                );
              })}
            </svg>
          </section>

          {/* Operator Job Dispatch Form */}
          <section style={{ background: '#1e293b', borderRadius: '12px', padding: '16px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Dispatch Field Job</h2>
            <form onSubmit={handleDispatchJob} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.areaHectares} ha)</option>
                ))}
              </select>

              <select value={capability} onChange={(e) => setCapability(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}>
                <option value="PLOW">PLOW</option>
                <option value="SEED">SEED</option>
                <option value="SPRAY">SPRAY</option>
              </select>

              <input
                type="number"
                min={1}
                max={5}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                style={{ width: '70px', padding: '8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
                title="Priority (1-5)"
              />

              <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                Dispatch to AI Agent
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: Fleet Status & AI Agent Reasoning Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section style={{ background: '#1e293b', borderRadius: '12px', padding: '16px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Active Fleet</h2>
            {vehicles.map((v) => (
              <div key={v.id} style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '10px', borderLeft: `4px solid ${statusColor(v.status)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{v.name}</strong>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: statusColor(v.status) }}>{v.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                  Implements: {v.capabilities.join(', ')} • GPS: {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
                </div>
              </div>
            ))}
          </section>

          <section style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', flex: 1 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>AI Agent Reasoning Log</h2>
            {assignments.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No agent decisions yet. Dispatch a job to watch FleetAgent assign a tractor.</p>
            ) : (
              assignments.map((a) => (
                <div key={a.id} style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #1e3a8a' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8' }}>
                    Assigned {a.vehicleId} → Job {a.jobId}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
                    {a.reason}
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}