'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api/client';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

interface LoginFormProps {
  onTwoFactor: (password: string) => void;
  onSuccess: () => void;
}

export function LoginForm({ onTwoFactor, onSuccess }: LoginFormProps) {
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const result = await login(data.email, data.password);
      if (result.requiresTwoFactor) {
        onTwoFactor(data.password);
      } else {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.code === 'INVALID_CREDENTIALS' ? 'Invalid email or password' : err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && <Alert variant="error">{error}</Alert>}

      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        autoComplete="email"
        {...register('email')}
      />

      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        icon={<Lock className="h-4 w-4" />}
        error={errors.password?.message}
        autoComplete="current-password"
        {...register('password')}
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
