"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const [mode, setMode] = useState<'checkout' | 'return'>('checkout');
  const [departments, setDepartments] = useState<any[]>([]);
  const [availableBadges, setAvailableBadges] = useState<any[]>([]);
  const [inUseBadges, setInUseBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    user_name: '',
    department_id: '',
    badge_id: ''
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: depts } = await supabase.from('departments').select('*').order('name');
    const { data: availBdgs } = await supabase.from('badges').select('*').eq('status', 'available').order('identifier');
    const { data: useBdgs } = await supabase.from('badges').select('*').eq('status', 'in-use').order('identifier');
    
    if (depts) setDepartments(depts);
    if (availBdgs) setAvailableBadges(availBdgs);
    if (useBdgs) setInUseBadges(useBdgs);
    setLoading(false);
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    const { error: logError } = await supabase.from('badge_logs').insert([
      {
        user_name: formData.user_name,
        department_id: formData.department_id,
        badge_id: formData.badge_id,
        time_out: new Date().toISOString()
      }
    ]);
    
    if (!logError) {
      await supabase.from('badges').update({ status: 'in-use' }).eq('id', formData.badge_id);
      setMessage({ type: 'success', text: `Badge successfully checked out!` });
      setFormData({ user_name: '', department_id: '', badge_id: '' });
      fetchData();
    } else {
      setMessage({ type: 'error', text: 'Error checking out badge. Please try again.' });
    }
    setIsSubmitting(false);
  }

  async function handleReturn(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    // Find the active log for this badge
    const { data: logs, error: logFetchError } = await supabase
      .from('badge_logs')
      .select('id')
      .eq('badge_id', formData.badge_id)
      .is('time_in', null)
      .order('time_out', { ascending: false })
      .limit(1);

    if (logs && logs.length > 0) {
      const { error: logUpdateError } = await supabase
        .from('badge_logs')
        .update({ time_in: new Date().toISOString() })
        .eq('id', logs[0].id);

      if (!logUpdateError) {
        await supabase.from('badges').update({ status: 'available' }).eq('id', formData.badge_id);
        setMessage({ type: 'success', text: `Badge returned successfully!` });
        setFormData({ ...formData, badge_id: '' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Failed to record return time.' });
      }
    } else {
      setMessage({ type: 'error', text: 'Could not find an active checkout for this badge.' });
    }
    setIsSubmitting(false);
  }

  return (
    <div className="animate-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="glass-card">
        <h2 className="section-title">Staff Portal</h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            className={`btn ${mode === 'checkout' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setMode('checkout'); setMessage({type:'', text:''}); setFormData({...formData, badge_id: ''}) }}
          >
            Checkout Badge
          </button>
          <button 
            className={`btn ${mode === 'return' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setMode('return'); setMessage({type:'', text:''}); setFormData({...formData, badge_id: ''}) }}
          >
            Return Badge
          </button>
        </div>

        {message.text && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            color: message.type === 'success' ? 'var(--accent-color)' : 'var(--danger-color)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`
          }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading data...</div>
        ) : (
          <form onSubmit={mode === 'checkout' ? handleCheckout : handleReturn}>
            {mode === 'checkout' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name or ID</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="e.g. Jane Doe"
                    value={formData.user_name}
                    onChange={(e) => setFormData({...formData, user_name: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select 
                    required 
                    className="form-select"
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                  >
                    <option value="">Select Department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Badge to Checkout</label>
                  <select 
                    required 
                    className="form-select"
                    value={formData.badge_id}
                    onChange={(e) => setFormData({...formData, badge_id: e.target.value})}
                  >
                    <option value="">Select Available Badge...</option>
                    {availableBadges.map(b => (
                      <option key={b.id} value={b.id}>{b.identifier}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {mode === 'return' && (
              <div className="form-group">
                <label className="form-label">Badge to Return</label>
                <select 
                  required 
                  className="form-select"
                  value={formData.badge_id}
                  onChange={(e) => setFormData({...formData, badge_id: e.target.value})}
                >
                  <option value="">Select Badge in your possession...</option>
                  {inUseBadges.map(b => (
                    <option key={b.id} value={b.id}>{b.identifier}</option>
                  ))}
                </select>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '1rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : (mode === 'checkout' ? 'Confirm Checkout' : 'Confirm Return')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
