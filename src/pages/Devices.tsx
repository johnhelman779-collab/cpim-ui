import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Device, listDevices } from "../api/client";

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listDevices();
        if (!cancelled) setDevices(data.devices);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load devices");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <header className="page-header">
        <h1>Devices</h1>
        <p className="muted">Plant assets and their communication protocols.</p>
      </header>
      {loading ? <p>Loading devices…</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !error ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Protocol</th>
                <th>Endpoint</th>
                <th>Connection</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>
                    <span className="pill">{d.type}</span>
                  </td>
                  <td>
                    <code>{d.protocol}</code>
                  </td>
                  <td>
                    <code className="endpoint">{d.endpoint}</code>
                  </td>
                  <td>
                    <span className={`status status-${d.connection ?? "unknown"}`}>
                      {d.connection ?? "—"}
                    </span>
                  </td>
                  <td>
                    <Link to={`/devices/${d.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
