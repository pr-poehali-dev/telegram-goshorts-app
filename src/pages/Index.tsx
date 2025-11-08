import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
}

interface Video {
  id: number;
  videoUrl: string;
  author: string;
  authorAvatar?: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing?: boolean;
  hashtags: string[];
  commentsList?: Comment[];
  views?: number;
  trending?: boolean;
  isLive?: boolean;
  liveViewers?: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  unlocked: boolean;
}

const mockAchievements: Achievement[] = [
  {
    id: 1,
    title: 'Первый шаг',
    description: 'Посмотри первое видео',
    icon: 'Play',
    progress: 1,
    total: 1,
    unlocked: true,
  },
  {
    id: 2,
    title: 'Любитель солнца',
    description: 'Поставь 10 лайков',
    icon: 'Heart',
    progress: 0,
    total: 10,
    unlocked: false,
  },
  {
    id: 3,
    title: 'Коллекционер',
    description: 'Сохрани 5 видео',
    icon: 'Bookmark',
    progress: 0,
    total: 5,
    unlocked: false,
  },
  {
    id: 4,
    title: 'Социальная бабочка',
    description: 'Поделись 3 видео',
    icon: 'Share2',
    progress: 0,
    total: 3,
    unlocked: false,
  },
  {
    id: 5,
    title: 'Марафонец',
    description: 'Посмотри 50 видео',
    icon: 'Zap',
    progress: 0,
    total: 50,
    unlocked: false,
  },
  {
    id: 6,
    title: 'Звезда комментариев',
    description: 'Напиши 20 комментариев',
    icon: 'MessageCircle',
    progress: 0,
    total: 20,
    unlocked: false,
  },
];

const mockVideos: Video[] = [
  {
    id: 1,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    author: '@funny_animals',
    description: 'Когда увидел новый функционал GoShorts 🐰😄 #funny #animals',
    likes: 15200,
    comments: 342,
    shares: 128,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    hashtags: ['funny', 'animals', 'cute', 'comedy'],
    views: 125000,
    trending: false,
    isLive: false,
  },
  {
    id: 2,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    author: '@dream_studio',
    description: 'Мечты сбываются в GoShorts! ✨🎬 #dreams #creative',
    likes: 23400,
    comments: 567,
    shares: 234,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    hashtags: ['dreams', 'creative', 'art', 'animation'],
    views: 345000,
    trending: true,
    isLive: true,
    liveViewers: 1234,
  },
  {
    id: 3,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    author: '@fire_vibes',
    description: 'Жаркий контент каждый день! 🔥☀️ #hot #vibes',
    likes: 45600,
    comments: 892,
    shares: 445,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    hashtags: ['hot', 'vibes', 'summer', 'energy'],
    views: 567000,
    trending: true,
    isLive: false,
  },
  {
    id: 4,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    author: '@travel_escape',
    description: 'Открывай новые горизонты с GoShorts! 🌍✈️ #travel #escape',
    likes: 18900,
    comments: 421,
    shares: 156,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    hashtags: ['travel', 'escape', 'adventure', 'explore'],
    views: 189000,
    trending: false,
    isLive: true,
    liveViewers: 567,
  },
  {
    id: 5,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    author: '@fun_zone',
    description: 'Больше веселья, больше эмоций! 🎉😂 #fun #entertainment',
    likes: 32100,
    comments: 678,
    shares: 289,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    hashtags: ['fun', 'entertainment', 'joy', 'comedy'],
    views: 421000,
    trending: true,
    isLive: false,
  },
];

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videos, setVideos] = useState(mockVideos);
  const [activeTab, setActiveTab] = useState('home');
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('ru');
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLiveStreams, setShowLiveStreams] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [viewHistory, setViewHistory] = useState<number[]>([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileName, setProfileName] = useState('@my_profile');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const mockComments: Comment[] = [
    { id: 1, author: '@user123', text: 'Невероятно красиво! 😍', timestamp: '2 часа назад', likes: 24 },
    { id: 2, author: '@traveler', text: 'Где это снято?', timestamp: '5 часов назад', likes: 12 },
    { id: 3, author: '@sunny_fan', text: 'Обожаю такие закаты ☀️', timestamp: '1 день назад', likes: 45 },
  ];

  const allHashtags = Array.from(new Set(mockVideos.flatMap(v => v.hashtags)));
  const savedVideos = videos.filter(v => v.isSaved);
  const trendingVideos = videos.filter(v => v.trending).sort((a, b) => (b.views || 0) - (a.views || 0));
  const followingVideos = videos.filter(v => v.isFollowing);
  const liveVideos = videos.filter(v => v.isLive);
  
  const getRecommendations = () => {
    if (viewHistory.length === 0) return videos.slice(0, 3);
    
    const viewedHashtags = viewHistory
      .map(id => videos.find(v => v.id === id))
      .filter(v => v)
      .flatMap(v => v!.hashtags);
    
    const hashtagCounts = viewedHashtags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topHashtags = Object.entries(hashtagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);
    
    return videos
      .filter(v => !viewHistory.includes(v.id))
      .sort((a, b) => {
        const aScore = a.hashtags.filter(tag => topHashtags.includes(tag)).length;
        const bScore = b.hashtags.filter(tag => topHashtags.includes(tag)).length;
        return bScore - aScore;
      })
      .slice(0, 6);
  };
  
  const recommendedVideos = getRecommendations();
  
  const filteredVideos = videos.filter(v => {
    const matchesSearch = searchQuery === '' || 
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHashtag = !selectedHashtag || v.hashtags.includes(selectedHashtag);
    return matchesSearch && matchesHashtag;
  });

  const handleFollow = () => {
    const updatedVideos = [...videos];
    updatedVideos[currentVideoIndex].isFollowing = !updatedVideos[currentVideoIndex].isFollowing;
    setVideos(updatedVideos);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Uploading video:', file.name);
      setShowUploadSheet(false);
    }
  };

  const shareToSocial = (platform: string) => {
    const currentVideo = videos[currentVideoIndex];
    const shareUrl = window.location.href;
    const text = `Смотри это видео от ${currentVideo.author}: ${currentVideo.description}`;
    
    const urls: Record<string, string> = {
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
      vk: `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      wechat: shareUrl,
      line: `https://line.me/R/msg/text/?${encodeURIComponent(text + ' ' + shareUrl)}`,
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
    setShowShareSheet(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadProfileFromBackend();
  }, []);

  const loadProfileFromBackend = async () => {
    try {
      const userId = localStorage.getItem('goShorts_userId') || 'user_' + Math.random().toString(36).substring(7);
      localStorage.setItem('goShorts_userId', userId);
      
      const response = await fetch('https://functions.poehali.dev/be39ce1f-14f8-4292-8617-09632a97455b', {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfileName(data.profile.profile_name || '@my_profile');
          setProfileAvatar(data.profile.avatar_url || null);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    if (!viewHistory.includes(videos[currentVideoIndex].id)) {
      setViewHistory([...viewHistory, videos[currentVideoIndex].id]);
    }
  }, [currentVideoIndex]);

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
    saveToBackend();
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      setCommentText('');
      setShowComments(false);
    }
  };

  const saveToBackend = async () => {
    try {
      const userId = 'user_' + Math.random().toString(36).substring(7);
      
      const savedVideos = videos.filter(v => v.isSaved);
      const likedVideos = videos.filter(v => v.isLiked);
      
      for (const video of savedVideos) {
        await fetch('https://functions.poehali.dev/be39ce1f-14f8-4292-8617-09632a97455b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId,
          },
          body: JSON.stringify({
            action: 'save_video',
            video_id: video.id,
            is_saved: true,
          }),
        });
      }
      
      for (const video of likedVideos) {
        await fetch('https://functions.poehali.dev/be39ce1f-14f8-4292-8617-09632a97455b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId,
          },
          body: JSON.stringify({
            action: 'like_video',
            video_id: video.id,
            is_liked: true,
          }),
        });
      }
      
      await fetch('https://functions.poehali.dev/be39ce1f-14f8-4292-8617-09632a97455b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          action: 'update_settings',
          settings: {
            dark_mode: darkMode,
            language: language,
          },
        }),
      });
      
      console.log('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
    }
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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfileToBackend = async () => {
    try {
      const userId = localStorage.getItem('goShorts_userId') || 'user_' + Math.random().toString(36).substring(7);
      
      await fetch('https://functions.poehali.dev/be39ce1f-14f8-4292-8617-09632a97455b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          action: 'update_profile',
          profile_name: profileName,
          avatar_url: profileAvatar,
        }),
      });
      
      console.log('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const renderProfileTab = () => (
    <div className="h-full overflow-y-auto pb-20 pt-20 px-6 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div 
            onClick={() => setShowEditProfile(true)}
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 mx-auto mb-4 flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 transition-transform group">
            {profileAvatar ? (
              <img src={profileAvatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-bold text-4xl">Я</span>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Icon name="Edit" size={24} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{profileName}</h2>
          <p className="text-gray-500 text-sm">Мой профиль GoShorts</p>
          <button 
            onClick={() => setShowEditProfile(true)}
            className="mt-2 text-orange-600 text-sm font-medium hover:underline">
            Редактировать профиль
          </button>
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
          <button 
            onClick={() => setShowAchievements(true)}
            className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Icon name="Award" size={24} className="text-orange-600" />
              <span className="font-medium text-gray-800">Достижения</span>
            </div>
            <Icon name="ChevronRight" size={20} className="text-gray-400" />
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Icon name="Settings" size={24} className="text-orange-600" />
              <span className="font-medium text-gray-800">Настройки</span>
            </div>
            <Icon name="ChevronRight" size={20} className="text-gray-400" />
          </button>

          <button className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Icon name="Globe" size={24} className="text-orange-600" />
              <span className="font-medium text-gray-800">Язык: {language === 'ru' ? 'Русский' : 'English'}</span>
            </div>
            <Icon name="ChevronRight" size={20} className="text-gray-400" />
          </button>

          <button 
            onClick={() => setShowAboutDialog(true)}
            className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Icon name="Info" size={24} className="text-orange-600" />
              <span className="font-medium text-gray-800">О приложении</span>
            </div>
            <Icon name="ChevronRight" size={20} className="text-gray-400" />
          </button>

          <button 
            onClick={() => {
              const appUrl = window.location.href;
              navigator.clipboard.writeText(appUrl);
            }}
            className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl p-4 flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform">
            <Icon name="Share2" size={20} className="text-white" />
            <span className="font-semibold text-white">Поделиться приложением</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-[#FEF7CD] via-[#FDE1D3] to-[#FEC6A1] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto shadow-2xl animate-pulse-soft">
              <img 
                src="https://cdn.poehali.dev/files/33dc9abe-3980-4dff-93a0-e778a23a51b3.jpg" 
                alt="GoShorts Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-yellow-300/30 blur-xl"></div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            GoShorts
          </h1>
          <p className="text-gray-600 text-lg mb-8">Солнечные видео каждый день ☀️</p>
          <div className="flex gap-2 justify-center">
            <div className="w-3 h-3 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-[#FEF7CD] via-[#FDE1D3] to-[#FEC6A1]">
      {activeTab === 'home' && (
        <>
          <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/20 to-transparent">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">GoShorts</h1>
              <button 
                onClick={() => setShowTrending(!showTrending)}
                className="text-white">
                <Icon name="TrendingUp" size={20} />
              </button>
              <button 
                onClick={() => setShowLiveStreams(!showLiveStreams)}
                className="text-white relative">
                <Icon name="Radio" size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="text-white">
                <Icon name="Sparkles" size={20} />
              </button>
              <button onClick={() => setShowUploadSheet(true)} className="text-white">
                <Icon name="Plus" size={24} />
              </button>
              <button onClick={() => setActiveTab('search')} className="text-white">
                <Icon name="Search" size={24} />
              </button>
            </div>
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

            {currentVideo.isLive && (
              <div className="absolute top-8 left-8 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 animate-pulse shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                LIVE
                <span className="ml-2 flex items-center gap-1">
                  <Icon name="Eye" size={14} />
                  {formatNumber(currentVideo.liveViewers || 0)}
                </span>
              </div>
            )}

            <div className="absolute bottom-24 left-0 right-0 px-8 text-white animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {currentVideo.author[1].toUpperCase()}
                    </span>
                  </div>
                  <p className="font-semibold text-lg drop-shadow-md">{currentVideo.author}</p>
                </div>
                <Button
                  onClick={handleFollow}
                  size="sm"
                  className={`${
                    currentVideo.isFollowing
                      ? 'bg-white/20 text-white border border-white'
                      : 'bg-gradient-to-r from-orange-400 to-yellow-400 text-white'
                  } font-semibold`}
                >
                  {currentVideo.isFollowing ? 'Подписан' : 'Подписаться'}
                </Button>
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

              <button 
                onClick={() => setShowComments(true)}
                className="flex flex-col items-center gap-1 transition-transform active:scale-90">
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

              <button 
                onClick={() => setShowShareSheet(true)}
                className="flex flex-col items-center gap-1 transition-transform active:scale-90">
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

        {showTrending && (
          <div className="absolute top-20 left-0 right-0 bottom-0 bg-gradient-to-br from-[#FEF7CD] to-[#FDE1D3] z-30 overflow-y-auto animate-fade-in">
            <div className="max-w-md mx-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🔥 Тренды</h2>
                <button onClick={() => setShowTrending(false)}>
                  <Icon name="X" size={24} className="text-gray-600" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {trendingVideos.map(video => (
                  <div
                    key={video.id}
                    onClick={() => {
                      setCurrentVideoIndex(videos.findIndex(v => v.id === video.id));
                      setShowTrending(false);
                    }}
                    className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-300 to-yellow-200 cursor-pointer hover:scale-105 transition-transform shadow-lg"
                  >
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      TRENDING
                    </div>
                    <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                      <div className="text-white w-full">
                        <p className="text-xs font-semibold mb-1">{video.author}</p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Icon name="Heart" size={12} />
                              <span>{formatNumber(video.likes)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon name="Eye" size={12} />
                              <span>{formatNumber(video.views || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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

      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="max-w-md bg-gradient-to-br from-[#FEF7CD] to-[#FDE1D3] border-orange-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Комментарии ({mockComments.length})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {mockComments.map(comment => (
              <div key={comment.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {comment.author[1].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{comment.text}</p>
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-600">
                      <Icon name="Heart" size={14} />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t border-orange-200">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Добавьте комментарий..."
              className="resize-none bg-white/80 backdrop-blur-sm border-orange-200"
              rows={2}
            />
            <Button
              onClick={handleAddComment}
              className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white hover:from-orange-500 hover:to-yellow-500"
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md bg-gradient-to-br from-[#FEF7CD] to-[#FDE1D3] border-orange-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Настройки</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="Moon" size={24} className="text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Тёмная тема</p>
                    <p className="text-xs text-gray-500">Включить ночной режим</p>
                  </div>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={(checked) => {
                    setDarkMode(checked);
                    document.documentElement.classList.toggle('dark', checked);
                  }}
                />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="Globe" size={24} className="text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Язык</p>
                    <p className="text-xs text-gray-500">Выберите язык интерфейса</p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white/90 border border-orange-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800"
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="Bell" size={24} className="text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Уведомления</p>
                    <p className="text-xs text-gray-500">Получать push-уведомления</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="Volume2" size={24} className="text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Автозвук</p>
                    <p className="text-xs text-gray-500">Воспроизводить звук автоматически</p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>

            <Button
              onClick={() => {
                setShowSettings(false);
                saveToBackend();
              }}
              className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white hover:from-orange-500 hover:to-yellow-500"
            >
              Сохранить настройки
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent side="bottom" className="bg-gradient-to-br from-[#FEF7CD] to-[#FDE1D3] border-orange-200">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-gray-800">Поделиться видео</SheetTitle>
          </SheetHeader>
          
          <div className="grid grid-cols-4 gap-4 mt-6">
            <button onClick={() => shareToSocial('telegram')} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-[#0088cc] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Icon name="Send" size={28} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">Telegram</span>
            </button>

            <button onClick={() => shareToSocial('whatsapp')} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Icon name="MessageCircle" size={28} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">WhatsApp</span>
            </button>

            <button onClick={() => shareToSocial('vk')} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-[#0077FF] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">VK</span>
              </div>
              <span className="text-xs font-medium text-gray-700">VK</span>
            </button>

            <button onClick={() => shareToSocial('twitter')} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-[#1DA1F2] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Icon name="Twitter" size={28} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">Twitter</span>
            </button>

            <button onClick={() => shareToSocial('facebook')} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-[#1877F2] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Icon name="Facebook" size={28} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">Facebook</span>
            </button>

            <button onClick={() => shareToSocial('wechat')} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-[#09B83E] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">微</span>
              </div>
              <span className="text-xs font-medium text-gray-700">WeChat</span>
            </button>

            <button onClick={() => shareToSocial('line')} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-[#00B900] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">LINE</span>
              </div>
              <span className="text-xs font-medium text-gray-700">LINE</span>
            </button>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setShowShareSheet(false);
              }}
              className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Icon name="Link" size={28} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">Копировать</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showUploadSheet} onOpenChange={setShowUploadSheet}>
        <SheetContent side="bottom" className="bg-gradient-to-br from-[#FEF7CD] to-[#FDE1D3] border-orange-200">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-gray-800">Загрузить видео</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4 mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white hover:from-orange-500 hover:to-yellow-500 h-16 text-lg"
            >
              <Icon name="Upload" size={24} className="mr-2" />
              Выбрать видео из галереи
            </Button>

            <Button
              onClick={() => {
                console.log('Opening camera...');
                setShowUploadSheet(false);
              }}
              className="w-full bg-white/90 border-2 border-orange-400 text-gray-800 hover:bg-orange-50 h-16 text-lg"
            >
              <Icon name="Camera" size={24} className="mr-2" />
              Снять видео
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="max-w-md bg-gradient-to-br from-[#FEF7CD] to-[#FDE1D3] border-orange-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">О приложении</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 mx-auto mb-4 flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-4xl">G</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">GoShorts</h3>
              <p className="text-sm text-gray-600">Версия 1.0.0</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
              <p className="text-gray-700 leading-relaxed">
                GoShorts — это мини-приложение для просмотра коротких видео с солнечным дизайном и удобным интерфейсом.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Code" size={20} className="text-orange-600" />
                <p className="font-semibold text-gray-800">Разработчик</p>
              </div>
              <p className="text-gray-700">Ivan Gromov</p>
              <p className="text-sm text-gray-500 mt-1">Full Stack Developer</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Send" size={20} className="text-orange-600" />
                <p className="font-semibold text-gray-800">Контакты</p>
              </div>
              <p className="text-sm text-gray-600">
                Для связи и предложений:<br />
                <a href="https://t.me/vlados0402" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  @vlados0402
                </a>
              </p>
            </div>

            <p className="text-center text-xs text-gray-500">
              © 2025 GoShorts. Все права защищены.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="max-w-md bg-gradient-to-br from-[#FEF7CD] to-[#FDE1D3] border-orange-200 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">🏆 Достижения</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {mockAchievements.map(achievement => (
              <div 
                key={achievement.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm transition-all ${
                  achievement.unlocked ? 'border-2 border-yellow-400' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-400' 
                      : 'bg-gray-300'
                  }`}>
                    <Icon name={achievement.icon as any} size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {achievement.progress}/{achievement.total}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <Icon name="CheckCircle" size={20} className="text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {showLiveStreams && (
        <div className="absolute top-20 left-0 right-0 bottom-0 bg-gradient-to-br from-[#FEF7CD] to-[#FDE1D3] z-30 overflow-y-auto animate-fade-in">
          <div className="max-w-md mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🔴 Прямые эфиры</h2>
              <button onClick={() => setShowLiveStreams(false)}>
                <Icon name="X" size={24} className="text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              {liveVideos.map(video => (
                <div
                  key={video.id}
                  onClick={() => {
                    setCurrentVideoIndex(videos.findIndex(v => v.id === video.id));
                    setShowLiveStreams(false);
                    setActiveTab('home');
                  }}
                  className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-orange-300 to-yellow-200 cursor-pointer hover:scale-105 transition-transform shadow-lg"
                >
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    LIVE
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Icon name="Eye" size={12} />
                    {formatNumber(video.liveViewers || 0)}
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                    <div className="text-white w-full">
                      <p className="font-semibold mb-1">{video.author}</p>
                      <p className="text-sm opacity-90 line-clamp-2">{video.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRecommendations && (
        <div className="absolute top-20 left-0 right-0 bottom-0 bg-gradient-to-br from-[#FEF7CD] to-[#FDE1D3] z-30 overflow-y-auto animate-fade-in">
          <div className="max-w-md mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">✨ Рекомендации для вас</h2>
              <button onClick={() => setShowRecommendations(false)}>
                <Icon name="X" size={24} className="text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              На основе ваших просмотров ({viewHistory.length} видео)
            </p>
            <div className="grid grid-cols-2 gap-3">
              {recommendedVideos.map(video => (
                <div
                  key={video.id}
                  onClick={() => {
                    setCurrentVideoIndex(videos.findIndex(v => v.id === video.id));
                    setShowRecommendations(false);
                    setActiveTab('home');
                  }}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-300 to-yellow-200 cursor-pointer hover:scale-105 transition-transform shadow-lg"
                >
                  <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                    <div className="text-white w-full">
                      <p className="text-xs font-semibold mb-1">{video.author}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Icon name="Heart" size={12} />
                            <span>{formatNumber(video.likes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon name="Eye" size={12} />
                            <span>{formatNumber(video.views || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md bg-gradient-to-br from-[#FEF7CD] to-[#FDE1D3] border-orange-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Редактировать профиль</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={() => avatarInputRef.current?.click()}
                className="relative w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 transition-transform group">
                {profileAvatar ? (
                  <img src={profileAvatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-5xl">Я</span>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon name="Camera" size={32} className="text-white" />
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-sm text-gray-600">Нажмите, чтобы изменить фото</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="User" size={20} className="text-orange-600" />
                <p className="font-semibold text-gray-800">Никнейм</p>
              </div>
              <Input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Введите никнейм"
                className="bg-white/90 border-orange-200 focus:border-orange-400"
              />
            </div>

            <Button
              onClick={() => {
                saveProfileToBackend();
                setShowEditProfile(false);
              }}
              className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white hover:from-orange-500 hover:to-yellow-500"
            >
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}