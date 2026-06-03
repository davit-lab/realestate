import React from 'react';

export interface QuickFilter {
  type?: string;
  rooms?: string;
  status?: string;
  searchArea?: string;
}

interface TagFilter extends QuickFilter {
  label: string;
}

interface Category {
  label: string;
  tags: TagFilter[];
  photo: string;
  span?: 'tall' | 'wide' | 'normal';
  cardFilter: QuickFilter;
}

const CATEGORIES: Category[] = [
  {
    label: 'იყიდება ბინები',
    photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
    span: 'tall',
    cardFilter: { type: 'sale' },
    tags: [
      { label: 'პატარა',           type: 'sale', rooms: '2' },
      { label: 'საშუალო',           type: 'sale', rooms: '3' },
      { label: 'დიდი',              type: 'sale', rooms: '4' },
      { label: 'მშენებარე',         type: 'sale', status: 'მშენებარე' },
      { label: 'ახალი აშენებული',   type: 'sale', status: 'ახალი აშენებული' },
      { label: 'ძველი აშენებული',   type: 'sale', status: 'ძველი აშენებული' },
    ],
  },
  {
    label: 'ქირავდება ბინები',
    photo: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
    span: 'normal',
    cardFilter: { type: 'rent' },
    tags: [
      { label: 'პატარა',  type: 'rent', rooms: '2' },
      { label: 'საშუალო', type: 'rent', rooms: '3' },
      { label: 'დიდი',    type: 'rent', rooms: '4' },
    ],
  },
  {
    label: 'კომერციული',
    photo: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    span: 'normal',
    cardFilter: {},
    tags: [
      { label: 'ქირავდება', type: 'rent',  searchArea: 'კომერც' },
      { label: 'იყიდება',   type: 'sale',  searchArea: 'კომერც' },
    ],
  },
  {
    label: 'კერძო სახლი',
    photo: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
    span: 'wide',
    cardFilter: { searchArea: 'სახლი' },
    tags: [
      { label: 'პატარა',  rooms: '3', searchArea: 'სახლი' },
      { label: 'საშუალო', rooms: '4', searchArea: 'სახლი' },
      { label: 'დიდი',    rooms: '6+', searchArea: 'სახლი' },
    ],
  },
];

interface QuickSearchProps {
  onSelect: (filter: QuickFilter) => void;
}

export default function QuickSearch({ onSelect }: QuickSearchProps) {
  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
      <h2 className="text-[22px] font-black text-gray-900 tracking-tight mb-5">
        იპოვე მარტივად
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 grid-rows-[240px_240px] gap-3 h-auto sm:h-[492px]">
        {CATEGORIES.map((cat) => {
          const colClass =
            cat.span === 'tall'  ? 'sm:col-span-1 sm:row-span-2' :
            cat.span === 'wide'  ? 'sm:col-span-2 sm:row-span-1' :
            'sm:col-span-1 sm:row-span-1';
          return (
            <div
              key={cat.label}
              onClick={() => onSelect(cat.cardFilter)}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer text-left ${colClass}`}
              style={{ minHeight: '220px' }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${cat.photo})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 rounded-2xl ring-2 ring-white/0 group-hover:ring-white/20 transition-all duration-300 pointer-events-none" />

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-black text-[16px] tracking-tight mb-2.5 drop-shadow">
                  {cat.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.tags.map((tag) => {
                    const { label, ...filter } = tag;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onSelect(filter); }}
                        className="bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 hover:border-white/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer active:scale-95"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
