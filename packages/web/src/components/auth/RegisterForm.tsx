'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api/client';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

interface RegisterFormProps {
  onSuccess: (email: string, password: string, salt: string) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [error, setError] = useState('');
  const registerUser = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await registerUser(data.email, data.password);
      onSuccess(data.email, data.password, res.salt);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.code === 'RESOURCE_ALREADY_EXISTS'
            ? 'An account with this email already exists'
            : err.message
        );
      } else {
        setError('Registration failed. Please try again.');
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

      <div>
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />
        <PasswordStrengthIndicator password={password} />
      </div>

      <Input
        id="confirmPassword"
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        icon={<Lock className="h-4 w-4" />}
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
        {...register('confirmPassword')}
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Create account
      </Button>
    </form>
  );
}
