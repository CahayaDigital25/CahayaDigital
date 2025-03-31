import { Link } from 'wouter';
import { Article } from '@shared/schema';
import { formatDate, categoryLabels } from '@/lib/utils';

interface NewsCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'horizontal';
}

export default function NewsCard({ article, variant = 'default' }: NewsCardProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-start">
        <span className="text-3xl font-playfair font-bold text-brand-red opacity-60 mr-3">
          {String(article.id).padStart(2, '0')}
        </span>
        <div>
          <h4 className="font-medium text-base hover:text-brand-red">
            <Link href={`/article/${article.id}`}>{article.title}</Link>
          </h4>
          <p className="text-gray-500 text-sm mt-1">{formatDate(article.publishedAt)}</p>
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full md:w-1/3 h-48 md:h-auto object-cover rounded-lg"
          />
          <div className="md:w-2/3">
            <span className="text-brand-red font-semibold text-xs tracking-wider">
              {categoryLabels[article.category]}
            </span>
            <h3 className="font-playfair font-bold text-2xl mt-2 hover:text-brand-red">
              <Link href={`/article/${article.id}`}>{article.title}</Link>
            </h3>
            <p className="text-gray-600 mt-3">{article.summary}</p>
            <div className="flex items-center mt-4">
              <img 
                src={article.authorImage || "https://via.placeholder.com/150"} 
                alt={article.author} 
                className="w-8 h-8 rounded-full mr-2"
              />
              <div>
                <p className="text-gray-900 font-medium">{article.author}</p>
                <p className="text-gray-500 text-sm">Jurnalis {categoryLabels[article.category]}</p>
              </div>
            </div>
            <Link href={`/article/${article.id}`} className="inline-block mt-4 bg-brand-red hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition duration-150">
              Baca Artikel Lengkap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default card
  return (
    <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <img 
        src={article.imageUrl} 
        alt={article.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <span className="text-brand-red font-semibold text-xs tracking-wider">
          {categoryLabels[article.category]}
        </span>
        <h3 className="font-playfair font-bold text-lg mt-1 hover:text-brand-red">
          <Link href={`/article/${article.id}`}>{article.title}</Link>
        </h3>
        <p className="text-gray-600 mt-2 text-sm">{article.summary}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-500 text-sm">{formatDate(article.publishedAt)}</span>
          <Link href={`/article/${article.id}`} className="text-brand-red font-medium text-sm hover:underline">
            Baca Selengkapnya
          </Link>
        </div>
      </div>
    </article>
  );
}
