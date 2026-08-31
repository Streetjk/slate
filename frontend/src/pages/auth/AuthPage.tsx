import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { appRoutes } from '@/app/routes';
import { AuthFormLayout } from '@/features/auth/components/AuthFormLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthForm } from '@/features/auth/hooks/useAuthForm';
import { redirectFromLocationState } from '@/features/auth/lib/redirect';

type AuthPageMode = 'login' | 'register';

export function AuthPage({ mode }: { mode: AuthPageMode }) {
  return mode === 'login' ? <LoginAuthPage /> : <RegisterAuthPage />;
}

function LoginAuthPage() {
  const { token, login } = useAuth();
  const location = useLocation();
  const redirectTo = redirectFromLocationState(location.state);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const authForm = useAuthForm();

  if (token) return <Navigate to={redirectTo} replace />;

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    await authForm.run(
      () => login({ identifier, password }, redirectTo),
      'Sign-in failed. Check your username and password.'
    );
  }

  return (
    <AuthFormLayout
      title="Sign in"
      subtitle="Sign in to manage Slate and your content."
      submitLabel="Enter"
      loading={authForm.loading}
      error={authForm.error}
      onSubmit={onSubmit}
      footer={
        <p className="mt-7 text-center font-sans text-[13px] text-stone">
          No account yet?{' '}
          <Link to={appRoutes.register} className="text-ink border-b border-ink">
            Create one now
          </Link>
        </p>
      }
    >
      <Input
        label="Username or email"
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        autoFocus
        required
        autoComplete="username"
        placeholder="Username or email"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        placeholder="Enter your password"
      />
    </AuthFormLayout>
  );
}

function RegisterAuthPage() {
  const { token, register } = useAuth();
  const location = useLocation();
  const redirectTo = redirectFromLocationState(location.state);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterField, string>>>({});
  const authForm = useAuthForm();

  if (token) return <Navigate to={redirectTo} replace />;

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    authForm.setError(null);
    setFieldErrors({});

    const trimmedEmail = email.trim();
    const validationError = validateRegisterForm({
      email: trimmedEmail,
      username,
      password,
      confirm,
    });
    if (validationError) {
      setFieldErrors({ [validationError.field]: validationError.message });
      return;
    }

    await authForm.run(
      () => register({ email: trimmedEmail, username, password }, redirectTo),
      'Sign-up failed. Please try again later.'
    );
  }

  return (
    <AuthFormLayout
      title="Create account"
      subtitle="Create an account to manage Slate and your content."
      submitLabel="Create account"
      loading={authForm.loading}
      error={authForm.error}
      onSubmit={onSubmit}
      footer={
        <p className="mt-7 text-center font-sans text-[13px] text-stone">
          Already have an account?{' '}
          <Link to={appRoutes.login} className="text-ink border-b border-ink">
            Sign in
          </Link>
        </p>
      }
    >
      <Input
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoFocus
        required
        autoComplete="username"
        placeholder="Letters, numbers, and underscores; 3–32 characters"
        error={fieldErrors.username}
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        placeholder="you@example.com"
        error={fieldErrors.email}
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Enter your password"
        error={fieldErrors.password}
      />
      <Input
        label="Confirm password"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Enter your password again"
        error={fieldErrors.confirm}
      />
    </AuthFormLayout>
  );
}

type RegisterField = 'email' | 'username' | 'password' | 'confirm';

function validateRegisterForm({
  email,
  username,
  password,
  confirm,
}: {
  email: string;
  username: string;
  password: string;
  confirm: string;
}): { field: RegisterField; message: string } | null {
  if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
    return {
      field: 'username',
      message:
        'Username must contain only letters, numbers, or underscores and be 3–32 characters long',
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { field: 'email', message: 'Enter a valid email address' };
  }
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters' };
  }
  if (password !== confirm) {
    return { field: 'confirm', message: 'Passwords do not match' };
  }
  return null;
}
