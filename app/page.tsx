import Link from "next/link";
import { ClipboardList, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="glass-card animate-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Vocera Management
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
        Welcome to the Union Hospital Vocera tracking system. Please select your portal below.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link href="/checkout" className="btn btn-primary" style={{ padding: '1rem' }}>
          <ClipboardList size={20} />
          Staff Checkout / Return
        </Link>
        <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '1rem' }}>
          <LayoutDashboard size={20} />
          Manager Dashboard
        </Link>
      </div>
    </div>
  );
}
