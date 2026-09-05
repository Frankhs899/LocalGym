import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/health/')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setStatus(data.status))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-white">LocalGym</h1>
      {error ? (
        <p className="mt-2 text-lg text-red-400">API: error - {error}</p>
      ) : (
        <p className="mt-2 text-lg text-emerald-400">API: {status ?? 'cargando...'}</p>
      )}
    </main>
  );
}

export default App;
