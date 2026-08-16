import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  DeviceStatus,
  getDeviceStatus,
  listDevices,
  writeDeviceTag,
  type Device,
} from "../api/client";

export default function DeviceDetail() {
  const { id = "" } = useParams();
  const [device, setDevice] = useState<Device | null>(null);
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [tag, setTag] = useState("");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [list, st] = await Promise.all([listDevices(), getDeviceStatus(id)]);
    const found = list.devices.find((d) => d.id === id) ?? null;
    setDevice(found);
    setStatus(st);
    setTag((current) => current || found?.tags[0]?.name || "");
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load device");
      }
    })();
    const timer = window.setInterval(() => {
      getDeviceStatus(id)
        .then((st) => {
          if (!cancelled) setStatus(st);
        })
        .catch(() => undefined);
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [id, refresh]);

  async function onWrite(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const deviceTag = device?.tags.find((t) => t.name === tag);
    let parsed: boolean | number | string = value;
    if (deviceTag?.dataType === "bool") parsed = value === "true";
    if (deviceTag?.dataType === "number") parsed = Number(value);
    try {
      await writeDeviceTag(id, tag, parsed);
      setMessage(`Wrote ${tag} = ${String(parsed)}`);
      const st = await getDeviceStatus(id);
      setStatus(st);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Write failed");
    }
  }

  return (
    <section>
      <p className="breadcrumb">
        <Link to="/devices">Devices</Link> / {device?.name ?? id}
      </p>
      <header className="page-header">
        <h1>{device?.name ?? "Device"}</h1>
        <p className="muted">
          {device?.type} · <code>{device?.protocol}</code> · {device?.endpoint}
        </p>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}

      <div className="detail-grid">
        <div className="panel">
          <h2>Live tags</h2>
          <p className="muted">Polled every 4s (simulated).</p>
          <dl className="kv">
            <div>
              <dt>Connection</dt>
              <dd>{status?.connection ?? "—"}</dd>
            </div>
            <div>
              <dt>Last poll</dt>
              <dd>{status?.lastPolledAt ? new Date(status.lastPolledAt).toLocaleTimeString() : "—"}</dd>
            </div>
          </dl>
          <table>
            <thead>
              <tr>
                <th>Tag</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(status?.values ?? {}).map(([name, val]) => (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td>{String(val)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form className="panel" onSubmit={onWrite}>
          <h2>Write tag</h2>
          <p className="muted">Invalid tags raise an exception in the exception layer.</p>
          <label>
            Tag
            <select value={tag} onChange={(e) => setTag(e.target.value)}>
              {(device?.tags ?? []).map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} ({t.dataType})
                </option>
              ))}
              <option value="InvalidTag">InvalidTag (test exception)</option>
            </select>
          </label>
          <label>
            Value
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="true / 42 / RUNNING"
            />
          </label>
          <button type="submit">Write</button>
        </form>
      </div>
    </section>
  );
}
