import { Listing, PaymentCard } from '../types';

export const exchangeRate = 2.70; // 1 USD = 2.70 GEL

export const mockListings: Listing[] = [
  {
    id: 'prop-1',
    title: 'იყიდება კერძო სახლი 10+ ოთახით',
    type: 'sale',
    priceLari: 1100000,
    priceUsd: 1100000 / exchangeRate,
    location: 'საჭილაოს ქუჩა #14',
    district: 'ნაძალადევი',
    city: 'თბილისი',
    rooms: '10+',
    beds: 8,
    area: 540,
    vipStatus: 'vip+',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'
    ],
    time: '5 აგრ 9:17',
    author: {
      name: 'ლაშა კახიშვილი',
      phone: '599 25 90 41',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      isAgent: true,
      listingCount: 4
    },
    condition: 'ახალი რემონტით',
    status: 'ახალი აშენებული',
    descriptions: {
      ka: 'სუფთა მოვლილი სახლი ფასი არ დააკლდება ტერიტორიაზე დამირეკეთ. იდეალურია როგორც საცხოვრებლად, ასევე საოფისედ ან სასტუმროდ. ეზო არის შემოღობილი, მწვანე გაზონით.',
      en: 'Clean, well-kept house. The price is non-negotiable. Please call me regarding the territory. Perfect for living, office space, or a boutique hotel. Fenced yard with a green lawn.',
      ru: 'Чистый, ухоженный дом. Цена окончательная. Пожалуйста, звоните по поводу территории. Идеально под жилье, офис или мини-отель. Огороженный двор с зеленым газоном.'
    },
    priceLevel: 'cheap',
    coordinates: { x: 45, y: 35 },
    comments: [
      {
        id: 'c-1',
        author: 'გიორგი მ.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        text: 'ძალიან კარგი მდებარეობაა, ფასიც შესანიშნავი აქვს ასეთი ფართისთვის.',
        date: '3 დღის წინ'
      }
    ]
  },
  {
    id: 'prop-2',
    title: 'იყიდება კერძო სახლი 10+ ოთახით',
    type: 'sale',
    priceLari: 2700000,
    priceUsd: 1000000,
    location: 'ილია ჭავჭავაძის გამზირი',
    district: 'ვაკე',
    city: 'თბილისი',
    rooms: '10+',
    beds: 10,
    area: 1000,
    vipStatus: 'super_vip',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
    ],
    time: '5 აგრ 9:17',
    author: {
      name: 'ნინო დვალი',
      phone: '577 12 34 56',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      isAgent: true,
      listingCount: 12
    },
    condition: 'ახალი რემონტით',
    status: 'ახალი აშენებული',
    descriptions: {
      ka: 'ექსკლუზიური ვილა ვაკეში! საუკეთესო ხედებით თბილისზე, აუზით, დიდი ვერანდით და თანამედროვე დიზაინით.',
      en: 'Exclusive villa in Vake! The best views of Tbilisi, pool, large veranda, and modern luxury design.',
      ru: 'Эксклюзивная вилла в Ваке! Лучшие виды на Тбилиси, бассейн, большая веранда и современный люкс-дизайн.'
    },
    priceLevel: 'high',
    coordinates: { x: 30, y: 65 },
    comments: []
  },
  {
    id: 'prop-3',
    title: 'იყიდება კერძო სახლი 10+ ოთახით',
    type: 'sale',
    priceLari: 1350000,
    priceUsd: 1350000 / exchangeRate,
    location: 'აკაკი წერეთლის გამზირი',
    district: 'დიდუბე',
    city: 'თბილისი',
    rooms: '12',
    beds: 6,
    area: 620,
    vipStatus: 'vip+',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    time: '5 აგრ 9:17',
    author: {
      name: 'ერეკლე კობახიძე',
      phone: '555 99 88 77',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      isAgent: false,
      listingCount: 1
    },
    condition: 'ძველი რემონტით',
    status: 'ძველი აშენებული',
    descriptions: {
      ka: 'კაპიტალური სახლი დიდუბეში, ცენტრალურ ადგილას. გამოდგება როგორც კომერციული საქმიანობისთვის, ასევე საცხოვრებლად.',
      en: 'Solid capital house in Didube, central location. Suitable for both commercial activities and private residency.',
      ru: 'Капитальный дом в Дидубе, в центральном месте. Подходит как под коммерческое использование, так и для жилья.'
    },
    priceLevel: 'average',
    coordinates: { x: 50, y: 45 },
    comments: []
  },
  {
    id: 'prop-4',
    title: 'ქირავდება 3-ოთახიანი ბინა სრულად მოწყობილი',
    type: 'rent',
    priceLari: 2200,
    priceUsd: 2200 / exchangeRate,
    location: 'ალექსანდრე ყაზბეგის გამზირი',
    district: 'საბურთალო',
    city: 'თბილისი',
    rooms: '3',
    beds: 2,
    area: 95,
    vipStatus: 'standard',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    time: '4 აგრ 12:40',
    author: {
      name: 'ვლადიმერ კ.',
      phone: '591 44 22 11',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      isAgent: false,
      listingCount: 2
    },
    condition: 'ახალი რემონტით',
    status: 'ახალი აშენებული',
    descriptions: {
      ka: 'ქირავდება სასწრაფოდ! საბურთალოს ცენტრში, ახალაშენებულ კორპუსში, თანამედროვე ავეჯით და ყველა ტექნიკით აღჭურვილი.',
      en: 'For rent urgently! In the center of Saburtalo, newly built block, with modern furniture and fully equipped with household tech.',
      ru: 'Сдается срочно! В центре Сабуртало, в новом доме, с современной мебелью и полной бытовой техникой.'
    },
    priceLevel: 'average',
    coordinates: { x: 25, y: 50 },
    comments: []
  },
  {
    id: 'prop-5',
    title: 'გირავდება ბინა ევრორემონტით ზღვასთან ახლოს',
    type: 'pledge',
    priceLari: 135000,
    priceUsd: 50000,
    location: 'შერიფ ხიმშიაშვილის ქუჩა',
    district: 'ახალი ბულვარი',
    city: 'ბათუმი',
    rooms: '2',
    beds: 1,
    area: 60,
    vipStatus: 'vip+',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    ],
    time: '3 აგრ 18:30',
    author: {
      name: 'თამარ ბაქრაძე',
      phone: '599 88 11 00',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      isAgent: false,
      listingCount: 1
    },
    condition: 'ახალი რემონტით',
    status: 'ახალი აშენებული',
    descriptions: {
      ka: 'გირავდება პრესტიჟულ უბანში ბინა Batumi ორბი თაუერსის გვერდით. იდეალური პირობებით და ზღვის პირველი ზოლის ხედით.',
      en: 'For pledge in a prestigious district, next to Batumi Orbi Towers. Perfect conditions with a direct sea front view.',
      ru: 'Под залог (гирао) в престижном районе, рядом с Orbi Towers. Отличные условия и прямой вид на море.'
    },
    priceLevel: 'cheap',
    coordinates: { x: 75, y: 80 },
    comments: []
  }
];

export const mockCards: PaymentCard[] = [
  {
    id: 'card-1',
    number: '•••• •••• •••• 4242',
    expiry: '12/28',
    cvc: '123',
    type: 'standard_pay',
    cardholder: 'Saba Kunchuashvili',
    colorTheme: 'red-dark'
  },
  {
    id: 'card-2',
    number: '•••• •••• •••• 9876',
    expiry: '09/29',
    cvc: '456',
    type: 'visa',
    cardholder: 'Saba Kunchuashvili',
    colorTheme: 'purple-dark'
  },
  {
    id: 'card-3',
    number: '•••• •••• •••• 5555',
    expiry: '05/30',
    cvc: '777',
    type: 'mastercard',
    cardholder: 'Saba Kunchuashvili',
    colorTheme: 'bronze-glow'
  },
  {
    id: 'card-4',
    number: '•••• •••• •••• 1111',
    expiry: '11/31',
    cvc: '999',
    type: 'amex',
    cardholder: 'Saba Kunchuashvili',
    colorTheme: 'silver-classic'
  }
];

export const initialProfile = {
  name: 'საბა კუნჭუაშვილი',
  userId: '#7014',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  balance: 350.50, // Lari/GEL represent
  notificationsEnabled: true,
  smsEnabled: false
};

export const mockChats = [
  {
    id: 'chat-1',
    listingTitle: 'იყიდება კერძო სახლი 10+ ოთახით',
    listingId: 'prop-1',
    agentName: 'ლაშა კახიშვილი',
    agentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'გამარჯობა, სახლის ნახვა ხვალ შეგიძლიათ 14:00 საათის მერე.',
    time: '9:17',
    messages: [
      { sender: 'user', text: 'გამარჯობა ძალიან მომწონს შენი კერძო სახლი...', time: '9:15' },
      { sender: 'agent', text: 'გამარჯობა, სახლის ნახვა ხვალ შეგიძლიათ 14:00 საათის მერე.', time: '9:17' }
    ]
  },
  {
    id: 'chat-2',
    listingTitle: 'გირავდება ბინა ევრორემონტით ზღვასთან ახლოს',
    listingId: 'prop-5',
    agentName: 'თამარ ბაქრაძე',
    agentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'რამდენი წლით გსურთ გირაოს ხელშეკრულება?',
    time: 'გუშინ',
    messages: [
      { sender: 'user', text: 'მოგესალმებით, ბინა ჯერ კიდევ თავისუფალია?', time: 'გუშინ 15:40' },
      { sender: 'agent', text: 'დიახ, თავისუფალია. რამდენი წლით გსურთ გირაოს ხელშეკრულება?', time: 'გუშინ 15:45' }
    ]
  }
];
