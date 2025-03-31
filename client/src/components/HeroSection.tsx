import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Article } from '@shared/schema';
import { formatDate, categoryLabels } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function HeroSection() {
  const { data: breakingNews, isLoading: isLoadingBreaking } = useQuery<Article[]>({
    queryKey: ['/api/articles/breaking'],
  });

  const { data: featuredArticles, isLoading: isLoadingFeatured } = useQuery<Article[]>({
    queryKey: ['/api/articles/featured', 3],
  });

  return (
    <section className="bg-white py-6">
      <div className="container mx-auto px-4">
        {/* Breaking News */}
        {isLoadingBreaking ? (
          <div className="mb-6 bg-gray-100 rounded-lg p-3 animate-pulse h-12"></div>
        ) : breakingNews && breakingNews.length > 0 ? (
          <div className="mb-6 bg-gray-100 rounded-lg p-3 flex items-center">
            <span className="bg-brand-red text-white text-sm font-bold px-3 py-1 rounded-md mr-3">BREAKING</span>
            <p className="text-brand-gray font-medium">
              {breakingNews[0].title}
            </p>
          </div>
        ) : null}

        {/* Featured News */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main featured news */}
          {isLoadingFeatured ? (
            <div className="lg:col-span-2 relative">
              <Skeleton className="w-full h-96 rounded-lg" />
            </div>
          ) : featuredArticles && featuredArticles.length > 0 ? (
            <div className="lg:col-span-2 relative">
              <img 
                src={featuredArticles[0].imageUrl} 
                alt={featuredArticles[0].title} 
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
                <span className="text-white bg-brand-red px-2 py-1 text-xs rounded-md inline-block mb-2">
                  {categoryLabels[featuredArticles[0].category]}
                </span>
                <Link href={`/article/${featuredArticles[0].id}`}>
                  <h2 className="text-2xl font-playfair font-bold text-white hover:underline">
                    {featuredArticles[0].title}
                  </h2>
                </Link>
                <p className="text-gray-200 mt-2">{featuredArticles[0].summary}</p>
                <div className="flex items-center mt-4">
                  <img 
                    src={featuredArticles[0].authorImage || "https://via.placeholder.com/150"} 
                    alt={featuredArticles[0].author} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="text-gray-300 text-sm">
                    {featuredArticles[0].author} • {formatDate(featuredArticles[0].publishedAt)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 relative bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500 text-center">Tidak ada berita utama yang tersedia</p>
            </div>
          )}

          {/* Secondary featured news */}
          <div className="space-y-5">
            {isLoadingFeatured ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4">
                  <Skeleton className="w-full md:w-32 h-24 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            ) : featuredArticles && featuredArticles.length > 1 ? (
              featuredArticles.slice(1).map((article) => (
                <div key={article.id} className="flex flex-col md:flex-row gap-4">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full md:w-32 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <span className="text-brand-red font-semibold text-xs tracking-wider">
                      {categoryLabels[article.category]}
                    </span>
                    <h3 className="font-playfair font-semibold text-lg leading-tight mt-1 hover:text-brand-red">
                      <Link href={`/article/${article.id}`}>{article.title}</Link>
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{article.summary}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center">
                Tidak ada berita pendukung yang tersedia
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
