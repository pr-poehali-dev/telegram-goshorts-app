import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

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
  },
];

export default function Index() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videos, setVideos] = useState(mockVideos);
  const [activeTab, setActiveTab] = useState('home');
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

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

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-[#FEF7CD] via-[#FDE1D3] to-[#FEC6A1]">
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/20 to-transparent">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">GoShorts</h1>
        <button className="text-white">
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
