import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, ShieldCheck, ArrowLeft } from 'lucide-react'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputsRef = useRef([])

  const isPhoneValid = /^[6-9]\d{9}$/.test(phone)

  const handleSendOtp = (e) => {
    e.preventDefault()
    if (!isPhoneValid) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
    }, 900)
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 4) {
      setError('Enter the 4-digit OTP')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/home')
    }, 800)
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-logo">
          <Sprout size={28} strokeWidth={2.4} />
        </div>
        <h1>KisanConnect</h1>
        <p>Your complete farming companion</p>
      </div>

      <div className="login-card">
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp}>
            <h2>Login to continue</h2>
            <p className="login-sub">We'll send a one-time password to verify your number</p>

            <label className="field-label">Mobile Number</label>
            <div className={'phone-input' + (error ? ' error' : '')}>
              <span className="country-code">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''))
                  setError('')
                }}
                autoFocus
              />
            </div>
            {error && <p className="field-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>

            <p className="terms-note">
              By continuing, you agree to KisanConnect's Terms of Service &amp; Privacy Policy
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <button type="button" className="back-btn" onClick={() => setStep('phone')}>
              <ArrowLeft size={18} />
            </button>
            <h2>Verify OTP</h2>
            <p className="login-sub">
              Enter the 4-digit code sent to <strong>+91 {phone}</strong>
            </p>

            <div className="otp-inputs">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={error ? 'error' : ''}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {error && <p className="field-error center">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>

            <p className="resend-note">
              Didn't receive the code? <span>Resend OTP</span>
            </p>
          </form>
        )}
      </div>

      <div className="login-trust">
        <ShieldCheck size={16} />
        <span>Secure OTP login · Trusted by 50,000+ farmers</span>
      </div>
    </div>
  )
}
