import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search,  BookOpen,  Clock, User, 
  Share2, Bookmark, Eye,  
  CheckCircle, X, RotateCcw,  Brain, 
   FileText, 
   Calendar,  ThumbsUp,
  AlertCircle, Loader
} from 'lucide-react';
import mythService from '../services/mythService';  // Add this import

interface EducationHubProps {
  onNavigate: (page: string) => void;
  userName: string;
}

const EducationHub = ({ onNavigate, userName }: EducationHubProps) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [mythCardFlipped, setMythCardFlipped] = useState<number | null>(null);
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredArticle, setFeaturedArticle] = useState<any>(null);

  // Add myth-specific state
  const [mythBusterData, setMythBusterData] = useState<any[]>([]);
  const [mythsLoading, setMythsLoading] = useState(false);
  const [mythsError, setMythsError] = useState<string | null>(null);

  // Get NewsAPI key from environment variable
  const API_KEY = import.meta.env.VITE_NEWS_API_KEY || '53ade871a7c74edfb0c7b09bba6757ca';
  const BASE_URL = 'https://newsapi.org/v2';

  const categories = [
    'All', 'Nutrition', 'Health', 'Wellness', 
    'Diet', 'Exercise', 'Mental Health', 'Disease Prevention'
  ];

  const quizData = {
    question: 'Which vitamin is primarily obtained from sunlight exposure?',
    options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E'],
    correct: 'Vitamin D',
    explanation: 'Vitamin D is synthesized in the skin when exposed to UVB radiation from sunlight. It\'s essential for bone health and immune function.'
  };

  // Add function to fetch AI myths
  const fetchAIMyths = async () => {
    try {
      setMythsLoading(true);
      setMythsError(null);
      console.log('EducationHub: Starting myth generation...');
      
      const response = await mythService.generateMyths();
      console.log('EducationHub: Myths received:', response);
      
      if (response && response.myths && Array.isArray(response.myths)) {
        setMythBusterData(response.myths);
        console.log('EducationHub: Myths set successfully:', response.myths.length, 'myths');
      } else {
        throw new Error('Invalid myths response structure');
      }
    } catch (error) {
      console.error('EducationHub: Error fetching AI myths:', error);
      setMythsError(error instanceof Error ? error.message : 'Failed to load myths');
      
      // Use fallback data
      console.log('EducationHub: Using fallback myths');
      setMythBusterData([
        {
          id: 1,
          myth: 'Myth: Carbs make you gain weight',
          fact: 'Fact: Excess calories, not carbs themselves, lead to weight gain',
          explanation: 'Carbohydrates are an essential macronutrient that provides energy for your body. Weight gain occurs when you consume more calories than you burn, regardless of the source.'
        },
        {
          id: 2,
          myth: 'Myth: You need to drink 8 glasses of water daily',
          fact: 'Fact: Water needs vary based on individual factors',
          explanation: 'Your hydration needs depend on your activity level, climate, overall health, and body size. Listen to your body and drink when thirsty.'
        },
        {
          id: 3,
          myth: 'Myth: Eating fat makes you fat',
          fact: 'Fact: Healthy fats are essential for optimal health',
          explanation: 'Healthy fats like those found in avocados, nuts, and olive oil are crucial for hormone production, nutrient absorption, and brain function.'
        },
        {
          id: 4,
          myth: 'Myth: Skipping meals helps you lose weight faster',
          fact: 'Fact: Regular meals support healthy metabolism',
          explanation: 'Skipping meals can slow your metabolism and lead to overeating later. Consistent, balanced meals help maintain stable blood sugar levels.'
        }
      ]);
    } finally {
      setMythsLoading(false);
    }
  };

  // NewsAPI fetch function (keeping existing functionality)
  const fetchArticles = async (category = 'All', searchTerm = '') => {
    try {
      setLoading(true);
      setError(null);

      let query = '';
      let endpoint = '';
      let params = new URLSearchParams();

      if (searchTerm) {
        endpoint = '/everything';
        query = `${searchTerm} AND (nutrition OR diet OR health OR wellness)`;
        params.set('q', query);
        params.set('language', 'en');
        params.set('sortBy', 'publishedAt');
        params.set('pageSize', '20');
      } else if (category !== 'All') {
        endpoint = '/everything';
        const categoryMap = {
          'Nutrition': 'nutrition OR "healthy eating" OR "balanced diet"',
          'Health': 'health OR medical OR "health care" OR wellness',
          'Wellness': 'wellness OR "mental health" OR meditation OR "self care"',
          'Diet': 'diet OR "weight loss" OR "healthy lifestyle"',
          'Exercise': 'exercise OR fitness OR workout OR "physical activity"',
          'Mental Health': '"mental health" OR psychology OR therapy OR "stress management"',
          'Disease Prevention': 'prevention OR vaccine OR immunity OR "disease prevention"'
        };
        query = categoryMap[category] || 'health nutrition wellness';
        params.set('q', query);
        params.set('language', 'en');
        params.set('sortBy', 'publishedAt');
        params.set('pageSize', '20');
      } else {
        endpoint = '/top-headlines';
        params.set('category', 'health');
        params.set('country', 'us');
        params.set('pageSize', '20');
      }

      params.set('apiKey', API_KEY);

      const response = await fetch(`${BASE_URL}${endpoint}?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid NewsAPI key. Please check your credentials.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 426) {
          throw new Error('API upgrade required. Please check your NewsAPI plan.');
        } else {
          throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (data.status === 'ok' && data.articles && data.articles.length > 0) {
        const processedArticles = data.articles
          .filter(article => article.title && article.title !== '[Removed]')
          .map((article, index) => ({
            id: article.url || `article-${index}`,
            title: article.title || 'Untitled Article',
            category: mapContentToCategory(article.title, article.description),
            type: 'article',
            image: article.urlToImage || getPlaceholderImage(article.title),
            snippet: article.description || 'No description available.',
            readTime: estimateReadTime(article.content),
            author: article.author || article.source?.name || 'NewsAPI',
            publishDate: formatDate(article.publishedAt),
            url: article.url,
            views: Math.floor(Math.random() * 5000) + 100,
            likes: Math.floor(Math.random() * 300) + 10,
            isHot: index < 2,
            isNew: index === 0,
            content: article.content || article.description || ''
          }));

        setArticles(processedArticles);
        
        if (processedArticles.length > 0) {
          setFeaturedArticle(processedArticles[0]);
        }
      } else {
        setArticles(getSampleData());
        setError('No articles found for your search. Showing sample content.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch articles');
      setArticles(getSampleData());
    } finally {
      setLoading(false);
    }
  };

  // Keep all your existing helper functions
  const mapContentToCategory = (title: string, description: string): string => {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('nutrition') || text.includes('diet') || text.includes('food')) return 'Nutrition';
    if (text.includes('exercise') || text.includes('fitness') || text.includes('workout')) return 'Exercise';
    if (text.includes('mental') || text.includes('psychology') || text.includes('stress')) return 'Mental Health';
    if (text.includes('prevention') || text.includes('vaccine') || text.includes('immunity')) return 'Disease Prevention';
    if (text.includes('wellness') || text.includes('lifestyle')) return 'Wellness';
    
    return 'Health';
  };

  const getPlaceholderImage = (title: string): string => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('nutrition') || titleLower.includes('food')) {
      return 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';
    }
    if (titleLower.includes('exercise') || titleLower.includes('fitness')) {
      return 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400';
    }
    if (titleLower.includes('mental') || titleLower.includes('wellness')) {
      return 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400';
    }
    
    return 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const estimateReadTime = (content: string | null): string => {
    if (!content) return '3 min read';
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const getSampleData = () => [
    {
      id: 'sample-1',
      title: 'The Truth About Superfoods: Separating Hype from Health',
      category: 'Nutrition',
      type: 'article',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      snippet: 'Examining the science behind popular superfoods and their actual health benefits.',
      readTime: '5 min read',
      author: 'Health Desk',
      publishDate: 'Aug 1, 2025',
      views: 2340,
      likes: 156,
      isHot: true,
      content: 'Sample content about superfoods and their health benefits...'
    }
  ];

  // Add useEffect to fetch myths on component mount
  useEffect(() => {
    fetchAIMyths();
    fetchArticles(activeCategory, searchQuery);
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery || activeCategory !== 'All') {
        fetchArticles(activeCategory, searchQuery);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (selectedContent) {
      const handleScroll = () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        setReadingProgress(Math.min(scrollPercent, 100));
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [selectedContent]);

  // Keep all your existing handler functions
  const filteredContent = articles.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
                         item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookmark = (id: string) => {
    setBookmarkedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleQuizSubmit = () => {
    setShowQuizResult(true);
    setTimeout(() => {
      setShowQuizResult(false);
      setQuizAnswer('');
      setShowQuiz(false);
    }, 3000);
  };

  const handleReadFullArticle = (article: any) => {
    if (article.url) {
      window.open(article.url, '_blank');
    }
  };

  // Keep your existing renderContentCard function
  const renderContentCard = (item: any) => (
    <div 
      key={item.id}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
      onClick={() => setSelectedContent(item)}
    >
      <div className="relative">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = getPlaceholderImage(item.title);
          }}
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            item.category === 'Nutrition' ? 'bg-green-100 text-green-800' :
            item.category === 'Health' ? 'bg-blue-100 text-blue-800' :
            item.category === 'Wellness' ? 'bg-purple-100 text-purple-800' :
            item.category === 'Mental Health' ? 'bg-pink-100 text-pink-800' :
            item.category === 'Exercise' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {item.category}
          </span>
        </div>
        {item.isHot && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              🔥 HOT
            </span>
          </div>
        )}
        {item.isNew && (
          <div className="absolute top-12 right-3">
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              ✨ NEW
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-200">
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.snippet}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{item.readTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{item.views}</span>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBookmark(item.id);
            }}
            className={`p-1 rounded-full transition-colors duration-200 ${
              bookmarkedItems.includes(item.id)
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarkedItems.includes(item.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-gray-600">{item.author}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <ThumbsUp className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">{item.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Responsive myth card rendering
  const renderMythCard = (myth: any, index: number) => (
    <div key={myth.id} className="relative h-48 sm:h-56 md:h-64 perspective-1000 mb-4 sm:mb-6">
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          mythCardFlipped === index ? 'rotate-y-180' : ''
        }`}
        onClick={() => setMythCardFlipped(mythCardFlipped === index ? null : index)}
      >
        {/* Front of card (Myth) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 sm:p-4 border-2 border-red-200 overflow-hidden">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-red-500 rounded-full p-2 sm:p-3 mb-2 sm:mb-3">
              <X className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <h4 className="text-sm sm:text-base md:text-lg font-bold text-red-800 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3 leading-tight px-1 sm:px-2">
              {myth.myth}
            </h4>
            <button className="bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors duration-200">
              Reveal the Truth
            </button>
          </div>
        </div>
        
        {/* Back of card (Fact) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 border-2 border-green-200 overflow-hidden">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-green-500 rounded-full p-1.5 sm:p-2 mb-1.5 sm:mb-2">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
            </div>
            <h4 className="text-xs sm:text-sm md:text-base font-bold text-green-800 mb-1.5 sm:mb-2 line-clamp-2 leading-tight">
              {myth.fact}
            </h4>
            <div className="flex-1 flex items-center justify-center px-1 sm:px-2">
              <p className="text-green-700 text-xs leading-relaxed line-clamp-3 sm:line-clamp-4 text-center">
                {myth.explanation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Keep your existing article view render (unchanged)
  if (selectedContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* All your existing article view JSX - keeping it exactly the same */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-gradient-to-r from-green-600 to-emerald-700 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSelectedContent(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Hub</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleBookmark(selectedContent.id)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    bookmarkedItems.includes(selectedContent.id)
                      ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${bookmarkedItems.includes(selectedContent.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="max-w-3xl mx-auto">
            <header className="mb-8">
              <div className="mb-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedContent.category}
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {selectedContent.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600 text-sm mb-6">
                <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span>By {selectedContent.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedContent.publishDate}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{selectedContent.readTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{selectedContent.views}</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <img 
                src={selectedContent.image} 
                alt={selectedContent.title}
                className="w-full h-64 lg:h-80 object-cover rounded-xl mb-8"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getPlaceholderImage(selectedContent.title);
                }}
              />
              
              <div className="article-content text-gray-800 leading-relaxed mb-8">
                <p className="text-lg mb-6">{selectedContent.snippet}</p>
                
                {selectedContent.content && (
                  <div className="whitespace-pre-wrap">{selectedContent.content}</div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">Read Full Article</h3>
                  </div>
                  <p className="text-blue-800 mb-4">
                    This is a preview from our news sources. Click below to read the complete article.
                  </p>
                  <button
                    onClick={() => handleReadFullArticle(selectedContent)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Read Full Article
                  </button>
                </div>
              </div>
            </div>

            {/* Updated Myth vs. Fact section with AI */}
            <div className="my-12 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 flex-1 text-center">AI-Powered Myth vs. Fact</h3>
                  <button
                    onClick={fetchAIMyths}
                    disabled={mythsLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center space-x-2"
                  >
                    {mythsLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        <span>New Myths</span>
                      </>
                    )}
                  </button>
                </div>

                {mythsError && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <p className="text-yellow-800 text-sm">{mythsError}</p>
                    </div>
                  </div>
                )}
                
                {mythsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <Loader className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Generating new nutrition myths...</p>
                    </div>
                  </div>
                            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {mythBusterData.map((myth, index) => renderMythCard(myth, index))}
              </div>
            )}
              </div>

              {/* Keep your existing Quick Knowledge Check section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-600 rounded-full p-2">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Quick Knowledge Check</h3>
                </div>
                
                {!showQuizResult ? (
                  <>
                    <p className="text-gray-700 mb-4">{quizData.question}</p>
                    <div className="space-y-2 mb-4">
                      {quizData.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => setQuizAnswer(option)}
                          className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                            quizAnswer === option
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleQuizSubmit}
                      disabled={!quizAnswer}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Submit Answer
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <div className={`p-4 rounded-lg mb-4 ${
                      quizAnswer === quizData.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <div className="font-semibold mb-2">
                        {quizAnswer === quizData.correct ? '🎉 Correct!' : '❌ Incorrect'}
                      </div>
                      <p className="text-sm">{quizData.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.slice(0, 2).map(item => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => setSelectedContent(item)}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage(item.title);
                      }}
                    />
                    <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{item.snippet}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.readTime}</span>
                      <span>By {item.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  // Main hub view - keep all existing JSX but update the myth section
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Back to Dashboard Button */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 text-white/90 hover:text-white transition-all duration-300 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Header - keep exactly the same */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 rounded-full p-4 mr-4">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold">Education Hub</h1>
            </div>
            <p className="text-xl lg:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              Welcome back, {userName}! Discover the latest insights in nutrition, health, and wellness from trusted news sources.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{articles.length}</div>
                <div className="text-green-100">Latest Articles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{bookmarkedItems.length}</div>
                <div className="text-green-100">Bookmarked</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">AI Powered</div>
                <div className="text-green-100">Myths & Facts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Keep all your existing search, filter, featured article, articles grid, and loading sections exactly the same */}
        
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search health topics, nutrition, wellness..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>

            <button
              onClick={() => fetchArticles(activeCategory, searchQuery)}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  <span>Refresh Articles</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-green-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="text-amber-800 font-semibold">API Notice</h3>
                <p className="text-amber-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {featuredArticle && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Featured Article</h2>
            <div 
              className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-xl"
              onClick={() => setSelectedContent(featuredArticle)}
            >
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="mb-4">
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {featuredArticle.category}
                    </span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-green-100 text-lg mb-6 leading-relaxed">
                    {featuredArticle.snippet}
                  </p>
                  <div className="flex items-center space-x-6 text-green-100">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{featuredArticle.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{featuredArticle.readTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{featuredArticle.publishDate}</span>
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/3">
                  <img 
                    src={featuredArticle.image} 
                    alt={featuredArticle.title}
                    className="w-full h-48 lg:h-64 object-cover rounded-xl shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getPlaceholderImage(featuredArticle.title);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Fetching latest health articles from NewsAPI...</p>
            </div>
          </div>
        )}

        {!loading && filteredContent.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Latest Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredContent.map(renderContentCard)}
            </div>
          </div>
        )}

        {!loading && filteredContent.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-24 h-24 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search terms or category filter
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                fetchArticles();
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Updated Educational Sections with AI-powered myths */}
        <div className="space-y-12">
          {/* AI-Powered Myth Busters */}
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">AI-Powered Myth vs. Fact</h2>
              <button
                onClick={fetchAIMyths}
                disabled={mythsLoading}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base"
              >
                {mythsLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    <span>Generate New Myths</span>
                  </>
                )}
              </button>
            </div>

            {mythsError && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h3 className="text-yellow-800 font-semibold">Myth Generation Notice</h3>
                    <p className="text-yellow-700 text-sm mt-1">{mythsError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {mythsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <Loader className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">AI is generating fresh nutrition myths and facts...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {mythBusterData.map((myth, index) => renderMythCard(myth, index))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationHub;
