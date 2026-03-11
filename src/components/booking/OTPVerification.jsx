import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function OTPVerification({ phone, onVerify, onResend, onBack, loading }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const code = otp.join('');
    if (code.length === 6) {
      onVerify(code);
    }
  };

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    onResend();
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Phone</h2>
        <p className="text-gray-500">
          Enter the 6-digit code sent to
          <br />
          <span className="font-medium text-gray-900">{phone}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-11 h-14 text-center text-xl font-semibold border-2 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]"
          />
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isComplete || loading}
        className="w-full h-14 text-lg bg-[#1e3a5f] hover:bg-[#2d4a6f]"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Verify Code'
        )}
      </Button>

      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-[#1e3a5f] font-medium hover:underline"
          >
            Resend Code
          </button>
        ) : (
          <p className="text-gray-500">
            Resend code in <span className="font-medium">{countdown}s</span>
          </p>
        )}
      </div>
    </div>
  );
}
