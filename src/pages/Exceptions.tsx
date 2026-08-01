import { useEffect, useState } from "react";
import { ackException, CpimException, listExceptions } from "../api/client";

export default function Exceptions() {
  const [items, setItems] = useState<CpimException[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await listExceptions();
    setItems(data.exceptions);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load exceptions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onAck(id: string) {
    try {
      await ackException(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Acknowledge failed");
    }
  }

  return (
    <section>
      <header className="page-header">
        <h1>Exceptions</h1>
        <p className="muted">Alarms and faults from the device communication layer.</p>
      </header>
      {loading ? <p>Loading exceptions…</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Code</th>
                <th>Device</th>
                <th>Message</th>
                <th>Status</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((ex) => (
                <tr key={ex.id}>
                  <td>
                    <span className={`severity sev-${ex.severity}`}>{ex.severity}</span>
                  </td>
                  <td>
                    <code>{ex.code}</code>
                  </td>
                  <td>{ex.deviceName ?? ex.deviceId}</td>
                  <td>{ex.message}</td>
                  <td>{ex.status}</td>
                  <td>{new Date(ex.createdAt).toLocaleString()}</td>
                  <td>
                    {ex.status === "open" ? (
                      <button type="button" className="ghost-btn" onClick={() => onAck(ex.id)}>
                        Ack
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7}>No exceptions yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
