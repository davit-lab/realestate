import React from 'react';
import { motion } from 'motion/react';
import {
  Home, Heart, MessageSquare, Plus, User,
  Shield, LogOut, LogIn, Compass, Building2,
  Moon, Sun, Monitor
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  favoritesCount: number;
  unreadMessagesCount: number;
  onAddListingClick: () => void;
  userAvatar: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  onAuthClick: () => void;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  favoritesCount,
  unreadMessagesCount,
  onAddListingClick,
  userAvatar,
  isAuthenticated,
  isAdmin,
  onAuthClick,
  onLogout,
}: HeaderProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'explore',      label: 'უძრავი ქონება', icon: <Home size={17} strokeWidth={2} /> },
    { tab: 'hotels',       label: 'სასტუმრო',      icon: <Building2 size={17} strokeWidth={2} /> },
    { tab: 'tourism',      label: 'ტურიზმი',        icon: <Compass size={17} strokeWidth={2} /> },
    { tab: 'favorites',    label: 'რჩეულები',       icon: <Heart size={17} strokeWidth={2} />, badge: favoritesCount },
    { tab: 'messages',     label: 'შეტყობინება',     icon: <MessageSquare size={17} strokeWidth={2} />, badge: unreadMessagesCount },
  ];

  const isExploreActive = activeTab === 'explore' || activeTab === 'detail';

  const themeIcon = resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">

        {/* Logo */}
        <button
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
        >
          <div className="w-8 h-8 rounded-xl bg-ss-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <Home size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="hidden sm:block text-[15px] font-black text-gray-900 dark:text-white tracking-tight">
            adjara<span className="text-ss-primary">home</span>
          </span>
        </button>

        {/* ── Nav — pill-active + icon-only-inactive ── */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ tab, label, icon, badge }) => {
            const isActive = tab === 'explore' ? isExploreActive : activeTab === tab;
            return (
              <motion.button
                key={tab}
                onClick={() => isAuthenticated || (tab !== 'add_property') ? setActiveTab(tab) : onAuthClick()}
                title={label}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-2 cursor-pointer select-none transition-all duration-200 ${
                  isActive
                    ? 'bg-ss-primary text-white px-4 py-2 rounded-full text-[13px] font-bold shadow-sm shadow-violet-200 dark:shadow-violet-900/30'
                    : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 justify-center'
                }`}
              >
                {icon}
                {isActive && <span className="text-[13px] font-bold whitespace-nowrap">{label}</span>}
                {!isActive && badge != null && badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center leading-none shadow-sm">
                    {badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={resolvedTheme === 'dark' ? 'ღია რეჟიმი' : 'მუქი რეჟიმი'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-ss-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            {themeIcon}
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              title="ადმინ პანელი"
              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                activeTab === 'admin'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Shield size={17} strokeWidth={2} />
            </button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-10 h-10 rounded-full overflow-hidden cursor-pointer ring-2 ring-offset-1 dark:ring-offset-gray-900 transition-all ${
                  activeTab === 'profile' ? 'ring-ss-primary' : 'ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600'
                }`}
              >
                {userAvatar ? (
                  <img src={userAvatar || undefined} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <User size={16} className="text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </button>
              <button
                onClick={onLogout}
                title="გასვლა"
                className="w-10 h-10 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center cursor-pointer transition-all"
              >
                <LogOut size={16} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-[13px] font-semibold px-3.5 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all"
            >
              <LogIn size={15} strokeWidth={2} />
              <span className="hidden sm:inline">შესვლა</span>
            </button>
          )}
        </div>

      </div>
    </motion.header>
  );
}
