import React from 'react';
import {
  Home, Heart, GitCompare, MessageSquare, Plus, User,
  Shield, LogOut, LogIn, Compass, Building2
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  favoritesCount: number;
  unreadMessagesCount: number;
  compareCount: number;
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
  compareCount,
  onAddListingClick,
  userAvatar,
  isAuthenticated,
  isAdmin,
  onAuthClick,
  onLogout,
}: HeaderProps) {
  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'explore',      label: 'უძრავი ქონება', icon: <Home size={17} strokeWidth={2} /> },
    { tab: 'hotels',       label: 'სასტუმრო',      icon: <Building2 size={17} strokeWidth={2} /> },
    { tab: 'tourism',      label: 'ტურიზმი',        icon: <Compass size={17} strokeWidth={2} /> },
    { tab: 'favorites',    label: 'რჩეულები',       icon: <Heart size={17} strokeWidth={2} />, badge: favoritesCount },
    { tab: 'compare',      label: 'შედარება',        icon: <GitCompare size={17} strokeWidth={2} />, badge: compareCount },
    { tab: 'messages',     label: 'შეტყობინება',     icon: <MessageSquare size={17} strokeWidth={2} />, badge: unreadMessagesCount },
  ];

  const isExploreActive = activeTab === 'explore' || activeTab === 'detail';

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">

        {/* Logo */}
        <button
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
            <Home size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="hidden sm:block text-[15px] font-black text-gray-900 tracking-tight">
            adjarahome
          </span>
        </button>

        {/* ── Nav — pill-active + icon-only-inactive ── */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ tab, label, icon, badge }) => {
            const isActive = tab === 'explore' ? isExploreActive : activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => isAuthenticated || (tab !== 'add_property') ? setActiveTab(tab) : onAuthClick()}
                title={label}
                className={`relative flex items-center gap-2 cursor-pointer select-none transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white px-4 py-2 rounded-full text-[13px] font-bold shadow-sm shadow-blue-200'
                    : 'text-gray-400 hover:text-gray-700 w-10 h-10 rounded-full hover:bg-gray-50 justify-center'
                }`}
              >
                {icon}
                {isActive && <span className="text-[13px] font-bold whitespace-nowrap">{label}</span>}
                {!isActive && badge != null && badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center leading-none">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              title="ადმინ პანელი"
              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                activeTab === 'admin'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Shield size={17} strokeWidth={2} />
            </button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-10 h-10 rounded-full overflow-hidden cursor-pointer ring-2 ring-offset-1 transition-all ${
                  activeTab === 'profile' ? 'ring-blue-600' : 'ring-transparent hover:ring-gray-300'
                }`}
              >
                {userAvatar ? (
                  <img src={userAvatar || undefined} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                )}
              </button>
              <button
                onClick={onLogout}
                title="გასვლა"
                className="w-10 h-10 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center cursor-pointer transition-all"
              >
                <LogOut size={16} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 text-[13px] font-semibold px-3.5 py-2 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all"
            >
              <LogIn size={15} strokeWidth={2} />
              <span className="hidden sm:inline">შესვლა</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
