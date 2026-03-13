"use client";

import { useState, useEffect, useCallback } from "react";
import type { ScenarioInputs } from "@/lib/scenario-schema";

interface Scenario {
  id: string;
  name: string;
  inputs: ScenarioInputs;
  updatedAt: string;
}

interface ScenarioManagerProps {
  onLoad: (inputs: ScenarioInputs) => void;
  getCurrentInputs: () => ScenarioInputs;
}

export default function ScenarioManager({ onLoad, getCurrentInputs }: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchScenarios = useCallback(async () => {
    try {
      const res = await fetch("/api/scenarios");
      if (res.ok) {
        const data = await res.json();
        setScenarios(data);
      }
    } catch {
      // Silent fail on fetch
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: saveName.trim(), inputs: getCurrentInputs() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      const saved = await res.json();
      setActiveId(saved.id);
      setSaveName("");
      setShowSave(false);
      await fetchScenarios();
    } catch {
      setError("Failed to save scenario");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!activeId) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/scenarios/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: getCurrentInputs() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }

      await fetchScenarios();
    } catch {
      setError("Failed to update scenario");
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (scenario: Scenario) => {
    setActiveId(scenario.id);
    onLoad(scenario.inputs);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/scenarios/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (activeId === id) setActiveId(null);
        await fetchScenarios();
      }
    } catch {
      // Silent fail
    }
  };

  const activeName = scenarios.find((s) => s.id === activeId)?.name;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Load dropdown */}
      {scenarios.length > 0 && (
        <div className="relative group">
          <button className="bg-[#003350] border border-[#003350]/60 text-white rounded-lg px-3 py-2 text-sm hover:border-[#FC6200] transition-colors min-h-[44px]">
            {activeName ? `📋 ${activeName}` : "Load Scenario"}
          </button>
          <div className="absolute top-full left-0 mt-1 bg-[#00273B] border border-[#003350] rounded-lg shadow-xl z-50 min-w-[220px] hidden group-hover:block">
            {scenarios.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-[#003350] first:rounded-t-lg last:rounded-b-lg"
              >
                <button
                  onClick={() => handleLoad(s)}
                  className="text-sm text-white text-left flex-1 truncate"
                >
                  {s.name}
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-400 hover:text-red-300 text-xs ml-2 shrink-0"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save / Save As */}
      {showSave ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Scenario name..."
            className="bg-[#003350] border border-[#003350]/60 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FC6200] min-h-[44px]"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={loading || !saveName.trim()}
            className="bg-[#FC6200] text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#FC6200]/90 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "..." : "Save"}
          </button>
          <button
            onClick={() => { setShowSave(false); setSaveName(""); setError(""); }}
            className="text-gray-400 hover:text-white text-sm min-h-[44px] px-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSave(true)}
          className="bg-[#003350] border border-[#003350]/60 text-white rounded-lg px-3 py-2 text-sm hover:border-[#FC6200] transition-colors min-h-[44px]"
        >
          Save As...
        </button>
      )}

      {/* Update active scenario */}
      {activeId && !showSave && (
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-[#003350] border border-[#68DDDC]/40 text-[#68DDDC] rounded-lg px-3 py-2 text-sm hover:border-[#68DDDC] transition-colors disabled:opacity-50 min-h-[44px]"
        >
          {loading ? "..." : "Update"}
        </button>
      )}

      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}
