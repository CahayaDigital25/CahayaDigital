import { useQuery } from '@tanstack/react-query';
import AdminNavbar from '@/components/AdminNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Article, Subscriber } from '@shared/schema';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { NewspaperIcon, UsersIcon, TrendingUpIcon, EyeIcon } from 'lucide-react';

export default function AdminDashboard() {
  const { data: articles } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  const { data: subscribers } = useQuery<Subscriber[]>({
    queryKey: ['/api/subscribers'],
  });

  // Calculate stats
  const totalArticles = articles?.length || 0;
  const totalViews = articles?.reduce((sum, article) => sum + article.views, 0) || 0;
  const totalSubscribers = subscribers?.length || 0;
  
  // Most popular categories
  const categoryData = articles?.reduce((acc, article) => {
    const category = article.category;
    if (!acc[category]) {
      acc[category] = { name: category, count: 0, views: 0 };
    }
    acc[category].count += 1;
    acc[category].views += article.views;
    return acc;
  }, {} as Record<string, { name: string; count: number; views: number }>);
  
  const categoryCounts = Object.values(categoryData || {}).sort((a, b) => b.count - a.count);
  const categoryViews = Object.values(categoryData || {}).sort((a, b) => b.views - a.views);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="pl-64 pt-6">
        <div className="container px-6 mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center">
                <div className="p-2 bg-blue-100 rounded-full mr-4">
                  <NewspaperIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Artikel</p>
                  <h3 className="text-2xl font-bold">{totalArticles}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center">
                <div className="p-2 bg-green-100 rounded-full mr-4">
                  <EyeIcon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Views</p>
                  <h3 className="text-2xl font-bold">{totalViews}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center">
                <div className="p-2 bg-purple-100 rounded-full mr-4">
                  <UsersIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Subscriber</p>
                  <h3 className="text-2xl font-bold">{totalSubscribers}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center">
                <div className="p-2 bg-amber-100 rounded-full mr-4">
                  <TrendingUpIcon className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rata-rata Views</p>
                  <h3 className="text-2xl font-bold">
                    {totalArticles ? Math.round(totalViews / totalArticles) : 0}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Artikel per Kategori</CardTitle>
                <CardDescription>Jumlah artikel berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryCounts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#e53e3e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Views per Kategori</CardTitle>
                <CardDescription>Jumlah views berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryViews} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="views" fill="#4299e1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Popular Articles */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Artikel Populer</CardTitle>
              <CardDescription>Artikel dengan jumlah views terbanyak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Judul</th>
                      <th className="px-4 py-2 text-left">Kategori</th>
                      <th className="px-4 py-2 text-left">Penulis</th>
                      <th className="px-4 py-2 text-right">Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles?.sort((a, b) => b.views - a.views).slice(0, 5).map((article) => (
                      <tr key={article.id} className="border-b">
                        <td className="px-4 py-3 font-medium">{article.title}</td>
                        <td className="px-4 py-3">{article.category}</td>
                        <td className="px-4 py-3">{article.author}</td>
                        <td className="px-4 py-3 text-right">{article.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
