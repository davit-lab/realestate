import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface Props { onBack: () => void; }

const SECTIONS = [
 {
 title: '1. რა ინფორმაციას ვაგროვებთ',
 body: `• პირდაპირ მოწოდებული: სახელი, გვარი, ელ-ფოსტა, ტელეფონი, ფოტო;\n• ავტომატურად: IP მისამართი, browser ტიპი, ვიზიტის დრო, გვერდები;\n• ქუქი-ფაილები: სესიის, ფუნქციური და ანალიტიკური ქუქი-ფაილები.`,
 },
 {
 title: '2. მონაცემების გამოყენება',
 body: `შეგროვებული მონაცემები გამოიყენება:\n• ანგარიშის მართვისა და ავტენტიფიკაციისთვის;\n• განცხადებების განთავსებისა და ძიებისთვის;\n• შეტყობინებებისა და სერვის ცვლილებების გაგზავნისთვის;\n• პლატფორმის უსაფრთხოებისა და თაღლითობის პრევენციისთვის;\n• სტატისტიკური ანალიზისთვის (ანონიმიზებული სახით).`,
 },
 {
 title: '3. მონაცემების გაზიარება',
 body: `ჩვენ არ ვყიდით და არ ვქირავდებთ თქვენს პირად მონაცემებს. გაზიარება ხდება მხოლოდ:\n• თქვენი თანხმობით;\n• კანონის მოთხოვნის შემთხვევაში;\n• სერვის პროვაიდერებთან (Supabase, Cloudflare) NDA-ს ფარგლებში.`,
 },
 {
 title: '4. მონაცემების შენახვა',
 body: `პირადი მონაცემები ინახება ანგარიშის არსებობის მანძილზე. ანგარიშის წაშლის შემდეგ მონაცემები წაიშლება 30 დღის ვადაში, გარდა კანონით გათვალისწინებული შენახვის ვალდებულებებისა.`,
 },
 {
 title: '5. თქვენი უფლებები',
 body: `GDPR-ისა და საქართველოს კანონმდებლობის შესაბამისად გაქვთ უფლება:\n• მოითხოვოთ მონაცემების ასლი;\n• მოითხოვოთ შესწორება ან წაშლა;\n• გააუქმოთ თანხმობა ნებისმიერ დროს;\n• შეიტანოთ საჩივარი მარეგულირებელ ორგანოში.\nმოთხოვნები გამოაგზავნეთ: privacy@newlife.ge`,
 },
 {
 title: '6. ქუქი-ფაილები',
 body: `ვიყენებთ:\n• სავალდებულო ქუქიებს: სესიის მართვისთვის;\n• ანალიტიკური ქუქიებს: Google Analytics (ანონიმიზებული);\n• ფუნქციური ქუქიებს: პრეფერენციების შენახვისთვის.\nბრაუზერის პარამეტრებიდან შეგიძლიათ ქუქიების გამორთვა.`,
 },
 {
 title: '7. უსაფრთხოება',
 body: `ვიყენებთ SSL დაშიფვრას, Supabase Row-Level Security-ს და მულტი-ფაქტორიანი ავთენტიფიკაციის შესაძლებლობას. მიუხედავად ამისა, ინტერნეტ-გადაცემა სრულ უსაფრთხოებას ვერ გარანტიებს.`,
 },
 {
 title: '8. კონტაქტი',
 body: `კონფიდენციალურობის საკითხებთან დაკავშირებით:\nელ-ფოსტა: privacy@newlife.ge\nმისამართი: თბილისი, რუსთაველის 10\nტელ: +995 (32) 2-11-11-11`,
 },
];

export default function PrivacyPage({ onBack }: Props) {
 return (
 <div className="min-h-full bg-gray-50">
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
  <button
   onClick={onBack}
   className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-[13px] font-semibold mb-8 cursor-pointer transition-colors"
  >
   <ArrowLeft size={16} /> მთავარ გვერდზე დაბრუნება
  </button>

  <div className="flex items-center gap-3 mb-8">
   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
   <Shield size={18} className="text-white" />
   </div>
   <div>
   <h1 className="text-[26px] font-black text-gray-900 leading-none">კონფიდენციალურობა</h1>
   <p className="text-gray-400 text-[12px] mt-1">ბოლო განახლება: 1 მაისი, 2025</p>
   </div>
  </div>

  <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
   {SECTIONS.map((s) => (
   <div key={s.title} className="p-6">
    <h2 className="font-bold text-[15px] text-gray-900 mb-3">{s.title}</h2>
    <p className="text-gray-600 text-[13px] leading-relaxed whitespace-pre-line">{s.body}</p>
   </div>
   ))}
  </div>

  <p className="text-center text-gray-400 text-[11px] mt-8">
   © {new Date().getFullYear()} Newlife.ge — ყველა უფლება დაცულია.
  </p>
  </div>
 </div>
 );
}
