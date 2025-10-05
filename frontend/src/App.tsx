import { useEffect, useState } from "react";
import { getHealth } from "./lib/api";

export default function App() {
  const [status, setStatus] = useState<string>("checking...");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getHealth()
      .then(d => setStatus(d.status))
      .catch(e => setError(String(e)));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 rounded-2xl shadow border w-[min(90vw,520px)]">
        <h1 className="text-2xl font-bold mb-2">DuneTube — Health</h1>
        <p className="mb-2">API base: <code>{import.meta.env.VITE_API_BASE}</code></p>
        {error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : (
          <p className="text-green-700">Status: <b>{status}</b></p>
        )}
      </div>
    </div>
  );
}
