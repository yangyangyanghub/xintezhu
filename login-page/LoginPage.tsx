import React, { useState, useCallback, useRef } from 'react';

interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

const LoginPage: React.FC = () => {
  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email.trim()) return '请输入邮箱地址';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return '请输入有效的邮箱格式';
    return undefined;
  }, []);

  const validatePassword = useCallback((password: string): string | undefined => {
    if (!password) return '请输入密码';
    if (password.length < 6) return '密码长度至少为6位';
    return undefined;
  }, []);

  const isFormValid = useCallback(() => {
    return form.email.trim() !== '' && 
           form.password !== '' && 
           !errors.email && 
           !errors.password;
  }, [form, errors]);

  const handleEmailBlur = useCallback(() => {
    setFocusedField(null);
    const error = validateEmail(form.email);
    setErrors(prev => ({ ...prev, email: error }));
  }, [form.email, validateEmail]);

  const handlePasswordBlur = useCallback(() => {
    setFocusedField(null);
    const error = validatePassword(form.password);
    setErrors(prev => ({ ...prev, password: error }));
  }, [form.password, validatePassword]);

  const handleInputChange = useCallback((field: 'email' | 'password', value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter' && isFormValid()) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      if (field === 'email') {
        setForm(prev => ({ ...prev, email: '' }));
      } else if (field === 'password') {
        setForm(prev => ({ ...prev, password: '' }));
      }
    }
  }, [isFormValid]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid()) return;
    
    setButtonState('loading');
    setSubmitError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const shouldFail = loginAttempts < 2;
      
      if (shouldFail) {
        setLoginAttempts(prev => prev + 1);
        setButtonState('error');
        setSubmitError('邮箱或密码错误，请重新输入');
        setTimeout(() => setButtonState('idle'), 2000);
      } else {
        setButtonState('success');
        setTimeout(() => {
          alert('登录成功！即将跳转到主页面...');
        }, 500);
      }
    } catch {
      setButtonState('error');
      setSubmitError('网络异常，请稍后重试');
      setTimeout(() => setButtonState('idle'), 2000);
    }
  }, [isFormValid, loginAttempts]);

  const handleThirdPartyLogin = useCallback((provider: string) => {
    alert(`${provider}登录功能即将上线`);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8 bg-gradient-to-br from-cream-50 via-indigo-25 to-blue-30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-blue-200 rounded-full blur-2xl animate-pulse-slower" />
      </div>

      <div 
        className="w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-2xl shadow-soft-lg border border-white/50 p-8 transform transition-all duration-300 ease-out animate-float-in"
        role="main"
        aria-label="登录表单"
      >
        <div className="mb-8 flex flex-col items-center space-y-3 animate-stagger-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">DataVault</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            登录
          </h1>
        </div>

        <form className="space-y-5" onSubmit={e => e.preventDefault()}>
          <div className="animate-stagger-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <div className="relative">
              <input
                ref={emailRef}
                id="email"
                type="email"
                value={form.email}
                onChange={e => handleInputChange('email', e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={handleEmailBlur}
                onKeyDown={e => handleKeyDown(e, 'email')}
                placeholder="your@email.com"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full h-11 px-4 pr-10 text-base rounded-lg border-2 transition-all duration-200 ease-out
                  ${focusedField === 'email' 
                    ? 'bg-white border-indigo-500 shadow-focus-ring scale-[1.02]' 
                    : errors.email 
                      ? 'bg-red-50 border-red-400' 
                      : form.email 
                        ? 'bg-white border-gray-300' 
                        : 'bg-gray-50 border-gray-200'}
                  placeholder:text-gray-400 focus:outline-none`}
              />
              {form.email && focusedField !== 'email' && (
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, email: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label="清空邮箱"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            {errors.email && (
              <p id="email-error" className="mt-1.5 text-sm text-red-600 animate-shake" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="animate-stagger-3">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => handleInputChange('password', e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={handlePasswordBlur}
                onKeyDown={e => handleKeyDown(e, 'password')}
                placeholder="输入密码"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`w-full h-11 px-4 pr-10 text-base rounded-lg border-2 transition-all duration-200 ease-out
                  ${focusedField === 'password' 
                    ? 'bg-white border-indigo-500 shadow-focus-ring scale-[1.02]' 
                    : errors.password 
                      ? 'bg-red-50 border-red-400' 
                      : form.password 
                        ? 'bg-white border-gray-300' 
                        : 'bg-gray-50 border-gray-200'}
                  placeholder:text-gray-400 focus:outline-none`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.45 3.12M1 1l22 22" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1.5 text-sm text-red-600 animate-shake" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between animate-stagger-4">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={e => setForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  className="sr-only"
                  aria-label="记住我"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
                  ${form.rememberMe 
                    ? 'bg-indigo-500 border-indigo-500' 
                    : 'bg-white border-gray-300 group-hover:border-indigo-400'}`}>
                  {form.rememberMe && (
                    <svg className="w-3 h-3 text-white animate-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="ml-2 text-sm text-gray-600 select-none">记住我</span>
            </label>
          </div>

          <div className="animate-stagger-5">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid() || buttonState === 'loading'}
              className={`w-full h-11 rounded-lg font-medium text-base transition-all duration-200 ease-out relative overflow-hidden
                ${buttonState === 'loading' 
                  ? 'bg-gray-400 text-white cursor-wait' 
                  : buttonState === 'success' 
                    ? 'bg-green-500 text-white' 
                    : buttonState === 'error' 
                      ? 'bg-red-500 text-white' 
                      : isFormValid() 
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              aria-busy={buttonState === 'loading'}
            >
              {buttonState === 'loading' && (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  登录中...
                </span>
              )}
              {buttonState === 'idle' && '登录'}
              {buttonState === 'success' && '✓ 登录成功'}
              {buttonState === 'error' && '登录失败'}
            </button>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-shake" role="alert">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <div className="text-center animate-stagger-6">
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline transition-all duration-150"
              aria-label="忘记密码"
            >
              忘记密码？
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 animate-stagger-7">
          <p className="text-center text-sm text-gray-500 mb-4">
            — 或使用以下方式登录 —
          </p>
          <div className="flex justify-center gap-3">
            {['Google', '微信', 'GitHub'].map((provider, idx) => (
              <button
                key={provider}
                type="button"
                onClick={() => handleThirdPartyLogin(provider)}
                className={`w-11 h-11 rounded-lg border-2 bg-white transition-all duration-200 flex items-center justify-center hover:scale-105
                  ${idx === 0 ? 'border-red-200 hover:border-red-400 hover:bg-red-50' : ''}
                  ${idx === 1 ? 'border-green-200 hover:border-green-400 hover:bg-green-50' : ''}
                  ${idx === 2 ? 'border-gray-300 hover:border-gray-500 hover:bg-gray-50' : ''}`}
                aria-label={`使用${provider}登录`}
              >
                {idx === 0 && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 007.58 10.4l.88-2.09a5.23 5.23 0 00-2.3-.5z"/>
                    <path fill="#34A853" d="M12 5.5a5.23 5.23 0 00-2.5.6l.88 2.09a7.07 7.07 0 012.42-.4z"/>
                    <path fill="#4A90E2" d="M16.62 10.4l-.88-2.09a5.23 5.23 0 00-2.42.4l.88 2.09z"/>
                    <path fill="#FBBC05" d="M12 7.09l-.88-2.09a7.07 7.07 0 00-2.32 5.5l2.3.5z"/>
                  </svg>
                )}
                {idx === 1 && (
                  <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.5 12.5a2 2 0 100-4 2 2 0 000 4zM15.5 12.5a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                )}
                {idx === 2 && (
                  <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.835 1.305 3.51.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            还没有账号？
            <button
              type="button"
              onClick={() => alert('注册功能即将上线')}
              className="ml-1 text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              aria-label="注册新账号"
            >
              立即注册
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;