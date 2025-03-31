import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Article, Subscriber, InsertSubscriber, insertSubscriberSchema } from '@shared/schema';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getNumberString } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: popularArticles, isLoading: isLoadingPopular } = useQuery<Article[]>({
    queryKey: ['/api/articles/popular', 5],
  });

  // Email subscription form
  const subscribeSchema = insertSubscriberSchema.extend({
    email: z.string().email({ message: "Email tidak valid" }),
  });

  const form = useForm<InsertSubscriber>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: InsertSubscriber) => {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/subscribers', data);
      toast({
        title: "Berhasil berlangganan!",
        description: "Terima kasih telah berlangganan berita kami.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Gagal berlangganan",
        description: "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { name: 'Politik', slug: 'politik' },
    { name: 'Ekonomi', slug: 'ekonomi' },
    { name: 'Teknologi', slug: 'teknologi' },
    { name: 'Pendidikan', slug: 'pendidikan' },
    { name: 'Kesehatan', slug: 'kesehatan' },
    { name: 'Olahraga', slug: 'olahraga' },
    { name: 'Hiburan', slug: 'hiburan' },
    { name: 'Gaya Hidup', slug: 'gaya_hidup' },
    { name: 'Otomotif', slug: 'otomotif' },
    { name: 'Properti', slug: 'properti' },
  ];

  return (
    <div className={className}>
      {/* Popular News */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-8">
        <h3 className="text-xl font-playfair font-bold text-brand-gray mb-4 pb-2 border-b">Berita Populer</h3>
        <div className="space-y-4">
          {isLoadingPopular ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-10 w-8" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : popularArticles && popularArticles.length > 0 ? (
            popularArticles.map((article, index) => (
              <div key={article.id} className="flex items-start">
                <span className="text-3xl font-playfair font-bold text-brand-red opacity-60 mr-3">
                  {getNumberString(index)}
                </span>
                <div>
                  <h4 className="font-medium text-base hover:text-brand-red">
                    <Link href={`/article/${article.id}`}>{article.title}</Link>
                  </h4>
                  <p className="text-gray-500 text-sm mt-1">{formatDate(article.publishedAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">Tidak ada berita populer</p>
          )}
        </div>
      </div>

      {/* Subscribe */}
      <div className="bg-brand-red bg-opacity-95 rounded-lg shadow-sm p-5 mb-8 text-white">
        <h3 className="text-xl font-playfair font-bold mb-3">Berlangganan Berita</h3>
        <p className="text-white text-opacity-90 mb-4">Dapatkan berita terbaru langsung di email Anda setiap pagi.</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Masukkan email Anda"
                      className="w-full px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-white text-brand-red font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition duration-150"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sedang memproses...' : 'Berlangganan'}
            </Button>
          </form>
        </Form>
        <p className="text-white text-opacity-80 text-xs mt-3">Kami tidak akan mengirimkan spam. Anda dapat berhenti berlangganan kapan saja.</p>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-8">
        <h3 className="text-xl font-playfair font-bold text-brand-gray mb-4 pb-2 border-b">Kategori</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link 
              key={category.slug} 
              href={`/category/${category.slug}`}
              className="px-3 py-1 bg-gray-100 hover:bg-brand-red hover:text-white rounded-md text-sm transition duration-150"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
