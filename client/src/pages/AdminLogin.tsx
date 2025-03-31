import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Settings } from '@shared/schema';

// Define the login form schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username diperlukan'),
  password: z.string().min(1, 'Password diperlukan'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const primaryColor = settings?.primaryColor || '#e53e3e';
  const siteName = settings?.siteName || 'CahayaDigital25';
  const logoText = settings?.logoText || 'CD';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true);
    
    try {
      // Add 1 second delay before login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await apiRequest('POST', '/api/auth/login', data);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Login berhasil',
          description: 'Selamat datang di panel admin',
        });
        // Redirect to admin dashboard
        window.location.href = '/admin/dashboard';
      } else {
        toast({
          title: 'Login gagal',
          description: 'Username atau password salah',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login gagal',
        description: 'Username atau password salah',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Link href="/" className="absolute top-4 right-4">
        <Button variant="ghost" size="icon">
          <X className="h-6 w-6" />
        </Button>
      </Link>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="text-white font-bold font-montserrat text-2xl">{logoText}</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>Masuk ke panel admin {siteName}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan username" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Masukkan password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-brand-red hover:bg-red-700"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </div>
                ) : 'Masuk'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
