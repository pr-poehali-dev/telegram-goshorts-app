import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Video {
  id: number;
  videoUrl: string;
  author: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  hashtags: string[];
}

const mockVideos: Video[] = [
  {
    id: 1,
    videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    author: '@sunny_vibes',
    description: 'Enjoying the golden hour 🌅 #sunset #nature',
    likes: 15200,
    comments: 342,
    shares: 128,
    isLiked: false,
    isSaved: false,
    hashtags: ['sunset', 'nature', 'golden', 'vibes'],
  },
  {
    id: 2,
    videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    author: '@beach_life',
    description: 'Summer vibes only ☀️🏖️ #beach #summer',
    likes: 23400,
    comments: 567,
    shares: 234,
    isLiked: false,
    isSaved: false,
    hashtags: ['beach', 'summer', 'ocean', 'waves'],
  },
  {
    id: 3,
    videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    author: '@travel_tales',
    description: 'Best sunrise ever! 🌄 #travel #adventure',
    likes: 45600,
    comments: 892,
    shares: 445,
    isLiked: false,
    isSaved: false,
    hashtags: ['travel', 'adventure', 'sunrise', 'explore'],
  },
  {
    id: 4,
    videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    author: '@foodie_life',
    description: 'Лучшие закаты и вкусная еда 🍕 #food #sunset',
    likes: 18900,
    comments: 421,
    shares: 156,
    isLiked: false,
    isSaved: false,
    hashtags: ['food', 'sunset', 'cooking', 'yummy'],
  },
  {
    id: 5,
    videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    author: '@fitness_guru',
    description: 'Morning workout routine 💪 #fitness #health',
    likes: 32100,
    comments: 678,
    shares: 289,
    isLiked: false,
    isSaved: false,
    hashtags: ['fitness', 'health', 'workout', 'morning'],
  },
];

export default function Index() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videos, setVideos] = useState(mockVideos);
  const [activeTab, setActiveTab] = useState('home');
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const allHashtags = Array.from(new Set(mockVideos.flatMap(v => v.hashtags)));
  const savedVideos = videos.filter(v => v.isSaved);
  
  const filteredVideos = videos.filter(v => {
    const matchesSearch = searchQuery === '' || 
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHashtag = !selectedHashtag || v.hashtags.includes(selectedHashtag);
    return matchesSearch && matchesHashtag;
  });

  useEffect(() => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      currentVideo.play();
    }
    return () => {
      if (currentVideo) {
        currentVideo.pause();
      }
    };
  }, [currentVideoIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100 && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
    if (touchStart - touchEnd < -100 && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const handleLike = () => {
    const updatedVideos = [...videos];
    updatedVideos[currentVideoIndex].isLiked = !updatedVideos[currentVideoIndex].isLiked;
    updatedVideos[currentVideoIndex].likes += updatedVideos[currentVideoIndex].isLiked ? 1 : -1;
    setVideos(updatedVideos);
  };

  const handleSave = () => {
    const updatedVideos = [...videos];
    updatedVideos[currentVideoIndex].isSaved = !updatedVideos[currentVideoIndex].isSaved;
    setVideos(updatedVideos);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const currentVideo = videos[currentVideoIndex];

  const renderSearchTab = () => (
    <div className="h-full overflow-y-auto pb-20 pt-20 px-6 animate-fade-in">
      <div className="max-w-md mx-auto space-y-6">
        <div className="relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск видео, авторов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/90 backdrop-blur-sm border-orange-200 focus:border-orange-400"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Популярные теги</h3>
          <div className="flex flex-wrap gap-2">
            {allHashtags.map(tag => (
              <Badge
                key={tag}
                onClick={() => setSelectedHashtag(selectedHashtag === tag ? null : tag)}
                className={`cursor-pointer transition-all ${
                  selectedHashtag === tag
                    ? 'bg-primary text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-orange-100'
                }`}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {filteredVideos.length} результатов
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredVideos.map(video => (
              <div
                key={video.id}
                onClick={() => {
                  setCurrentVideoIndex(videos.findIndex(v => v.id === video.id));
                  setActiveTab('home');
                }}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-300 to-yellow-200 cursor-pointer hover:scale-105 transition-transform shadow-lg"
              >
                <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                  <div className="text-white">
                    <p className="text-xs font-semibold mb-1">{video.author}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Icon name="Heart" size={12} />
                        <span>{formatNumber(video.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="MessageCircle" size={12} />
                        <span>{formatNumber(video.comments)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFavoritesTab = () => (
    <div className="h-full overflow-y-auto pb-20 pt-20 px-6 animate-fade-in">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Избранное</h2>
        {savedVideos.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="Bookmark" size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Нет сохранённых видео</p>
            <p className="text-sm text-gray-400 mt-2">Добавляйте видео в избранное</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedVideos.map(video => (
              <div
                key={video.id}
                onClick={() => {
                  setCurrentVideoIndex(videos.findIndex(v => v.id === video.id));
                  setActiveTab('home');
                }}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-300 to-yellow-200 cursor-pointer hover:scale-105 transition-transform shadow-lg"
              >
                <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                  <div className="text-white">
                    <p className="text-xs font-semibold mb-1">{video.author}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Icon name="Heart" size={12} />
                        <span>{formatNumber(video.likes)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="h-full overflow-y-auto pb-20 pt-20 px-6 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 mx-auto mb-4 flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-4xl">Я</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">@my_profile</h2>
          <p className="text-gray-500 text-sm">Мой профиль GoShorts</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-800">{savedVideos.length}</p>
              <p className="text-xs text-gray-500">Сохранено</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {videos.filter(v => v.isLiked).length}
              </p>
              <p className="text-xs text-gray-500">Лайков</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{videos.length}</p>
              <p className="text-xs text-gray-500">Просмотрено</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Icon name="Settings" size={24} className="text-orange-600" />
              <span className="font-medium text-gray-800">Настройки</span>
            </div>
            <Icon name="ChevronRight" size={20} className="text-gray-400" />
          </button>

          <button className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Icon name="Globe" size={24} className="text-orange-600" />
              <span className="font-medium text-gray-800">Язык: Русский</span>
            </div>
            <Icon name="ChevronRight" size={20} className="text-gray-400" />
          </button>

          <button className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Icon name="Info" size={24} className="text-orange-600" />
              <span className="font-medium text-gray-800">О приложении</span>
            </div>
            <Icon name="ChevronRight" size={20} className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-[#FEF7CD] via-[#FDE1D3] to-[#FEC6A1]">
      {activeTab === 'home' && (
        <>
          <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/20 to-transparent">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">GoShorts</h1>
            <button onClick={() => setActiveTab('search')} className="text-white">
              <Icon name="Search" size={24} />
            </button>
          </header>

      <div
        className="relative h-full w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-orange-200/30 to-yellow-100/30 backdrop-blur-sm">
          <div className="relative w-full max-w-md h-full flex flex-col justify-center">
            <video
              ref={(el) => (videoRefs.current[currentVideoIndex] = el)}
              className="w-full h-[70vh] object-cover rounded-3xl shadow-2xl animate-fade-in"
              loop
              playsInline
              muted
              src={currentVideo.videoUrl}
            />

            <div className="absolute bottom-24 left-0 right-0 px-8 text-white animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {currentVideo.author[1].toUpperCase()}
                  </span>
                </div>
                <p className="font-semibold text-lg drop-shadow-md">{currentVideo.author}</p>
              </div>
              <p className="text-sm leading-relaxed drop-shadow-md">{currentVideo.description}</p>
            </div>

            <div className="absolute right-6 bottom-32 flex flex-col gap-6">
              <button
                onClick={handleLike}
                className="flex flex-col items-center gap-1 transition-transform active:scale-90"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    currentVideo.isLiked
                      ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse-soft'
                      : 'bg-white/90 backdrop-blur-sm'
                  }`}
                >
                  <Icon
                    name="Heart"
                    size={28}
                    className={currentVideo.isLiked ? 'text-white fill-white' : 'text-orange-600'}
                  />
                </div>
                <span className="text-xs font-semibold text-white drop-shadow-md">
                  {formatNumber(currentVideo.likes)}
                </span>
              </button>

              <button className="flex flex-col items-center gap-1 transition-transform active:scale-90">
                <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Icon name="MessageCircle" size={28} className="text-orange-600" />
                </div>
                <span className="text-xs font-semibold text-white drop-shadow-md">
                  {formatNumber(currentVideo.comments)}
                </span>
              </button>

              <button
                onClick={handleSave}
                className="flex flex-col items-center gap-1 transition-transform active:scale-90"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    currentVideo.isSaved
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-400 animate-pulse-soft'
                      : 'bg-white/90 backdrop-blur-sm'
                  }`}
                >
                  <Icon
                    name="Bookmark"
                    size={28}
                    className={currentVideo.isSaved ? 'text-white fill-white' : 'text-orange-600'}
                  />
                </div>
              </button>

              <button className="flex flex-col items-center gap-1 transition-transform active:scale-90">
                <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Icon name="Share2" size={28} className="text-orange-600" />
                </div>
                <span className="text-xs font-semibold text-white drop-shadow-md">
                  {formatNumber(currentVideo.shares)}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <p className="text-white/30 text-sm">Свайп вверх/вниз</p>
        </div>
      </div>
        </>
      )}

      {activeTab === 'search' && renderSearchTab()}
      {activeTab === 'favorites' && renderFavoritesTab()}
      {activeTab === 'profile' && renderProfileTab()}

      <nav className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-orange-200 shadow-xl">
        <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'home' ? 'scale-110' : ''
            }`}
          >
            <Icon
              name="Home"
              size={26}
              className={activeTab === 'home' ? 'text-primary' : 'text-gray-500'}
            />
            <span
              className={`text-xs font-medium ${
                activeTab === 'home' ? 'text-primary' : 'text-gray-500'
              }`}
            >
              Главная
            </span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'search' ? 'scale-110' : ''
            }`}
          >
            <Icon
              name="Search"
              size={26}
              className={activeTab === 'search' ? 'text-primary' : 'text-gray-500'}
            />
            <span
              className={`text-xs font-medium ${
                activeTab === 'search' ? 'text-primary' : 'text-gray-500'
              }`}
            >
              Поиск
            </span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'favorites' ? 'scale-110' : ''
            }`}
          >
            <Icon
              name="Bookmark"
              size={26}
              className={activeTab === 'favorites' ? 'text-primary' : 'text-gray-500'}
            />
            <span
              className={`text-xs font-medium ${
                activeTab === 'favorites' ? 'text-primary' : 'text-gray-500'
              }`}
            >
              Избранное
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'profile' ? 'scale-110' : ''
            }`}
          >
            <Icon
              name="User"
              size={26}
              className={activeTab === 'profile' ? 'text-primary' : 'text-gray-500'}
            />
            <span
              className={`text-xs font-medium ${
                activeTab === 'profile' ? 'text-primary' : 'text-gray-500'
              }`}
            >
              Профиль
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}