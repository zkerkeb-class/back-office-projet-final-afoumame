'use client';
import React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormMessage,
  FormItem,
} from '@/components/ui/form';

type Props = {};

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function LoginPage({}: Props) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 p-4">
      <div className="flex flex-col items-center gap-2 md:gap-4 md:flex-row md:items-center">
        <Image src="/logo.svg" alt="Logo" width={50} height={50} />
        <h1 className="text-3xl font-bold text-center">Sign in into Backoffice</h1>
      </div>

      <Form {...form}>
        <form
          className="flex flex-col space-y-4 w-72 md:w-96"
          onSubmit={form.handleSubmit(console.log)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input {...field} id="email" type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">Password</FormLabel>
                <FormControl>
                  <Input {...field} id="password" type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Login</Button>
        </form>
      </Form>
    </div>
  );
}

export default LoginPage;
