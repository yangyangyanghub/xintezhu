import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, X, CheckCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [oauthToast, setOauthToast] = useState<string | null>(null);
  
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(emailRegex.test(value) ? '' : '请输入有效的邮箱地址');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) validateEmail(value);
  };

  const handleEmailBlur = () => {
    setEmailFocused(false);
    validateEmail(email);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    if (password && password.length < 6) {
      setPasswordError('密码长度至少6位');
    }
  };

  const handleEscClear = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (document.activeElement === emailInputRef.current) {
        setEmail('');
        setEmailError('');
      } else if (document.activeElement === passwordInputRef.current) {
        setPassword('');
        setPasswordError('');
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleEscClear);
    return () => window.removeEventListener('keydown', handleEscClear);
  }, [handleEscClear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setEmailError('请输入邮箱地址');
      emailInputRef.current?.focus();
      return;
    }
    if (!password) {
      setPasswordError('请输入密码');
      passwordInputRef.current?.focus();
      return;
    }
    if (emailError) {
      emailInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(true);
      setTimeout(() => {
        console.log('登录成功，跳转主页面', { email, password, rememberMe });
      }, 500);
    } catch {
      setPasswordError('邮箱或密码错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOauthClick = (provider: string) => {
    setOauthToast(`${provider}登录功能即将上线`);
    setTimeout(() => setOauthToast(null), 3000);
  };

  const isFormValid = email && password && !emailError && !passwordError;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-success-pop" />
          <p className="text-lg font-medium text-[#111827]">登录成功</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] flex items-center justify-center px-6 py-12">
      {oauthToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#111827] text-white px-4 py-3 rounded-lg shadow-lg animate-toast-in z-50">
          {oauthToast}
        </div>
      )}
      
      <div className="w-full max-w-[400px]">
        <header className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg mb-3">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <p className="text-sm font-medium text-[#6b7280] mb-1">AppDemo</p>
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">
            登录
          </h1>
          <p className="text-sm text-[#6b7280] mt-2">登录以继续使用应用</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <InputField
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setEmailFocused(true)}
              onBlur={handleEmailBlur}
              placeholder="邮箱地址"
              error={emailError}
              focused={emailFocused}
              icon={<Mail className="w-4 h-4" />}
              showClear={Boolean(email) && !emailFocused}
              onClear={() => { setEmail(''); setEmailError(''); }}
              disabled={isLoading}
            />

            <InputField
              ref={passwordInputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={handlePasswordBlur}
              placeholder="密码"
              error={passwordError}
              focused={passwordFocused}
              icon={<Lock className="w-4 h-4" />}
              showClear={Boolean(password) && !passwordFocused}
              onClear={() => { setPassword(''); setPasswordError(''); }}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#6b7280] hover:text-[#374151] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                  tabIndex={-1}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span className="text-sm text-[#374151] group-hover:text-[#111827] transition-colors">
                记住我
              </span>
            </label>

            <a
              href="#forgot"
              className="text-sm text-[#6b7280] hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1"
            >
              忘记密码？
            </a>
          </div>

          <PrimaryButton
            type="submit"
            loading={isLoading}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? '登录中...' : '登录'}
          </PrimaryButton>

          <Divider />

          <div className="space-y-3">
            <SecondaryButton onClick={() => handleOauthClick('GitHub')} disabled={isLoading}>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub 登录
            </SecondaryButton>

            <SecondaryButton onClick={() => handleOauthClick('Google')} disabled={isLoading}>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google 登录
            </SecondaryButton>

            <SecondaryButton onClick={() => handleOauthClick('微信')} disabled={isLoading}>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#07C160">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.36c0 2.252 1.217 4.261 3.109 5.634l-.625 2.402 2.867-1.438c.781.234 1.625.359 2.5.359.422 0 .844-.031 1.25-.094-.266-.703-.406-1.453-.406-2.219 0-3.563 3.219-6.469 7.187-6.469.391 0 .781.031 1.156.094C16.359 4.281 12.719 2.188 8.691 2.188zm-2.5 4.563c.594 0 1.063.469 1.063 1.063s-.469 1.063-1.063 1.063-1.063-.469-1.063-1.063.469-1.063 1.063-1.063zm5 0c.594 0 1.063.469 1.063 1.063s-.469 1.063-1.063 1.063-1.063-.469-1.063-1.063.469-1.063 1.063-1.063zM24 13.5c0-3.313-3.219-6-7.187-6-3.969 0-7.188 2.688-7.188 6s3.219 6 7.188 6c.875 0 1.719-.125 2.5-.359l2.867 1.438-.625-2.402C22.783 17.761 24 15.752 24 13.5zm-9.5-1.063c-.438 0-.781-.344-.781-.781s.344-.781.781-.781.781.344.781.781-.344.781-.781.781zm4.25 0c-.438 0-.781-.344-.781-.781s.344-.781.781-.781.781.344.781.781-.344.781-.781.781z"/>
              </svg>
              微信登录
            </SecondaryButton>
          </div>

          <p className="text-center text-sm text-[#6b7280] pt-4">
            还没有账号？
            <a href="#register" className="text-blue-600 hover:underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">
              立即注册
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

interface InputFieldProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder: string;
  error?: string;
  focused?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showClear?: boolean;
  onClear?: () => void;
  disabled?: boolean;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({
  type,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  error,
  focused,
  icon,
  rightIcon,
  showClear,
  onClear,
  disabled,
}, ref) => {
  const hasError = Boolean(error);
  const hasValue = Boolean(value);

  return (
    <div className="space-y-1.5">
      <div
        className={`relative flex items-center h-11 rounded-lg border transition-all duration-200 ${
          hasError
            ? 'border-[#ef4444] bg-[#fef2f2]'
            : focused
              ? 'border-blue-500 bg-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
              : hasValue
                ? 'border-[#d1d5db] bg-white hover:border-[#9ca3af]'
                : 'border-[#d1d5db] bg-[#f9fafb] hover:border-[#9ca3af] hover:bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {icon && (
          <span className={`absolute left-3 transition-colors ${focused ? 'text-blue-500' : 'text-[#6b7280]'}`}>
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-full px-3 py-2.5 text-sm text-[#111827] placeholder:text-[#9ca3af] bg-transparent border-none outline-none focus:ring-0 ${
            icon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''}`}
          aria-invalid={hasError}
          aria-describedby={error ? `${placeholder}-error` : undefined}
        />
        {showClear && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-1 text-[#9ca3af] hover:text-[#374151] transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            tabIndex={-1}
            aria-label="清除"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {rightIcon && !showClear && (
          <span className="absolute right-2">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p
          id={`${placeholder}-error`}
          className="text-xs text-[#dc2626] pl-1 animate-shake"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

interface PrimaryButtonProps {
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  type = 'button',
  loading,
  disabled,
  children,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`w-full h-11 flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-all duration-200 ${
        disabled
          ? 'bg-[#9ca3af] text-white cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:from-blue-800 active:to-blue-900 transform active:scale-[0.98]'
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

interface SecondaryButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  onClick,
  disabled,
  children,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-11 flex items-center justify-center rounded-lg font-medium text-sm border transition-all duration-200 ${
        disabled
          ? 'bg-[#f3f4f6] text-[#9ca3af] border-[#e5e7eb] cursor-not-allowed'
          : 'bg-white text-[#374151] border-[#d1d5db] hover:bg-[#f9fafb] hover:border-[#9ca3af] hover:shadow-sm active:bg-[#f3f4f6] active:shadow-none'
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
    >
      {children}
    </button>
  );
};

interface CheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, disabled }) => {
  return (
    <span
      className={`relative inline-flex w-4 h-4 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className={`w-4 h-4 rounded border transition-all duration-150 ${
          checked
            ? 'bg-blue-600 border-blue-600'
            : 'bg-white border-[#d1d5db] hover:border-[#9ca3af]'
        } focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1`}
      >
        {checked && (
          <svg
            className="w-full h-full text-white"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </span>
  );
};

const Divider: React.FC = () => {
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="flex-1 h-px bg-[#e5e7eb]" />
      <span className="text-xs text-[#9ca3af] font-medium">或</span>
      <span className="flex-1 h-px bg-[#e5e7eb]" />
    </div>
  );
};

export default LoginPage;