"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    // Fetch all badges
    const { data: bdgs } = await supabase.from('badges').select('*').order('identifier');
    
    // Fetch active checkouts (time_in is null) with department names
    const { data: activeLogs } = await supabase
      .from('badge_logs')
      .select('*, departments(name)')
      .is('time_in', null);

    if (bdgs) {
      // Map active logs to their badges
      const enrichedBadges = bdgs.map(b => {
        const log = activeLogs?.find(l => l.badge_id === b.id);
        return {
          ...b,
          activeLog: log || null
        };
      });
      setBadges(enrichedBadges);
    }
    setLoading(false);
  }

  async function updateBadgeStatus(badgeId: string, newStatus: string) {
    if (!confirm(`Are you sure you want to mark this badge as ${newStatus}?`)) return;
    
    const { error } = await supabase.from('badges').update({ status: newStatus }).eq('id', badgeId);
    if (!error) {
      fetchDashboardData();
    } else {
      alert("Failed to update status.");
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'available': return <span className="status-badge status-available">Available</span>;
      case 'in-use': return <span className="status-badge status-in-use">In Use</span>;
      case 'lost': return <span className="status-badge status-missing">Lost</span>;
      case 'damaged': return <span className="status-badge status-damaged">Damaged</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  }

  return (
    <div className="animate-in" style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Manager Dashboard</h2>
          <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={fetchDashboardData}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading dashboard...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem' }}>Identifier</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Current User</th>
                  <th style={{ padding: '1rem' }}>Department</th>
                  <th style={{ padding: '1rem' }}>Time Out</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {badges.map(badge => {
                  const isOverdue = badge.status === 'in-use' && badge.activeLog && 
                    (new Date().getTime() - new Date(badge.activeLog.time_out).getTime()) > 12 * 60 * 60 * 1000; // 12 hours

                  return (
                    <tr key={badge.id} style={{ 
                      borderBottom: '1px solid var(--surface-border)',
                      backgroundColor: isOverdue ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
                    }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {badge.identifier}
                          {isOverdue && <span title="Overdue (Checked out > 12h)"><AlertTriangle size={16} color="var(--warning-color)" /></span>}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{getStatusBadge(badge.status)}</td>
                      <td style={{ padding: '1rem', color: badge.activeLog ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {badge.activeLog ? badge.activeLog.user_name : '-'}
                      </td>
                      <td style={{ padding: '1rem', color: badge.activeLog ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {badge.activeLog ? badge.activeLog.departments?.name : '-'}
                      </td>
                      <td style={{ padding: '1rem', color: badge.activeLog ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {badge.activeLog ? new Date(badge.activeLog.time_out).toLocaleString() : '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <select 
                          className="form-select" 
                          style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem', display: 'inline-block' }}
                          value=""
                          onChange={(e) => {
                            if (e.target.value) updateBadgeStatus(badge.id, e.target.value);
                          }}
                        >
                          <option value="">Report Issue...</option>
                          <option value="damaged">Mark Damaged</option>
                          <option value="lost">Mark Lost</option>
                          {badge.status !== 'available' && badge.status !== 'in-use' && (
                            <option value="available">Mark Available (Found/Fixed)</option>
                          )}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
