import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, Wrench } from 'lucide-react';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';
import './Auth.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: otp+password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      toast.success(res.data?.message || res.message || 'OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon"><Wrench size={20} /></div>
            <span>Auto<span>Parts</span> Pro</span>
          </Link>

          {done ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
              <h1 className="auth-title">Password Reset!</h1>
              <p className="auth-subtitle">Redirecting you to login...</p>
            </motion.div>
          ) : (
            <>
              <h1 className="auth-title">Reset Password</h1>
              <p className="auth-subtitle">
                {step === 1 ? 'Enter your email to receive a reset OTP' : `OTP sent to ${email}`}
              </p>
            </>
          )}
        </div>

        {!done && (
          <>
            <div className="auth-steps">
              <div className={`auth-step ${step >= 1 ? 'active' : ''}`} />
              <div className={`auth-step ${step >= 2 ? 'active' : ''}`} />
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  onSubmit={handleSendOTP}
                  className="auth-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-with-icon">
                      <Mail size={16} className="input-icon" />
                      <input
                        type="email"
                        className="form-input has-icon"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        id="forgot-email"
                      />
                    </div>
                  </div>
                  <motion.button
                    type="submit"
                    className="btn btn-primary auth-submit-btn"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    id="send-otp-btn"
                  >
                    {loading ? <div className="btn-spinner" /> : <>Send OTP <ArrowRight size={16} /></>}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  onSubmit={handleResetPassword}
                  className="auth-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="form-group">
                    <label className="form-label">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontWeight: '700' }}
                      id="otp-input"
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Check your email (including spam folder). In dev mode, check server console.
                    </p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      id="new-password-input"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    className="btn btn-primary auth-submit-btn"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    id="reset-password-btn"
                  >
                    {loading ? <div className="btn-spinner" /> : <>Reset Password <ArrowRight size={16} /></>}
                  </motion.button>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)} style={{ width: '100%' }}>
                    ← Use different email
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-link">← Back to Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
