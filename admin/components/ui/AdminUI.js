"use client";

import { useState } from 'react';
import Link from 'next/link';

export function PageHeader({ title, description, children }) {
  return <div className="portal-header"><div><Link href="/dashboard">Dashboard</Link><h1>{title}</h1>{description && <p>{description}</p>}</div><div className="portal-actions">{children}</div></div>;
}
export function Card({ title, children }) { return <section className="portal-card">{title && <h2>{title}</h2>}{children}</section>; }
export function Notice({ error, children }) { return <div role={error ? 'alert' : 'status'} className={`portal-notice ${error ? 'error' : ''}`}>{children}</div>; }
export function ResourceState({ resource, children }) {
  if (!resource.loaded) return <Notice>Loading records…</Notice>;
  if (resource.error) return <Notice error>{resource.error} <button onClick={resource.reload}>Retry</button></Notice>;
  return children;
}
export function Field({ label, children }) { return <label className="portal-field"><span>{label}</span>{children}</label>; }
export function Stats({ items }) { return <div className="portal-stats">{items.map(([label, value]) => <Card key={label}><small>{label}</small><strong>{value ?? '—'}</strong></Card>)}</div>; }
export function DataTable({ rows, columns, empty = 'No records found.' }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / 20));
  const safePage = Math.min(page, pages);
  return <div className="portal-card"><div className="portal-table-scroll"><table className="portal-table"><thead><tr>{columns.map(c => <th key={c.label}>{c.label}</th>)}</tr></thead><tbody>{rows.slice((safePage - 1) * 20, safePage * 20).map(row => <tr key={row.id}>{columns.map(c => <td key={c.label}>{c.render(row)}</td>)}</tr>)}{!rows.length && <tr><td colSpan={columns.length}>{empty}</td></tr>}</tbody></table></div><div className="portal-actions"><span>{rows.length} records · Page {safePage} of {pages}</span><button disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Previous</button><button disabled={safePage === pages} onClick={() => setPage(safePage + 1)}>Next</button></div></div>;
}
