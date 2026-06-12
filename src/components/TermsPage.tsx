import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

interface Props { onBack: () => void; }

const SECTIONS = [
 {
 title: '1. ზოგადი დებულებები',
 body: `adjarahome.ge (შემდგომში "პლატფორმა") წარმოადგენს უძრავი ქონების ონლაინ-პლატფორმას, რომელიც უზრუნველყოფს განცხადებების განთავსებასა და მოძიებას საქართველოში. პლატფორმით სარგებლობით, თქვენ ეთანხმებით წინამდებარე წესებსა და პირობებს.`,
 },
 {
 title: '2. სარეგისტრაციო მოთხოვნები',
 body: `რეგისტრაციისთვის აუცილებელია:\n• 18 წელს გადაცილებული ფიზიკური ან იურიდიული პირი;\n• მოქმედი ელ-ფოსტის მისამართი;\n• სწორი პერსონალური მონაცემების მიწოდება.\nყალბი ინფორმაციის მიწოდება იწვევს ანგარიშის დაბლოკვას.`,
 },
 {
 title: '3. განცხადებების განთავსება',
 body: `განცხადებების განთავსებისას მომხმარებელი ადასტურებს:\n• ქონება მის საკუთრებაშია ან უფლებამოსილია მის სახელით განახორციელოს გარიგება;\n• მოწოდებული ინფორმაცია სწორი და სრულია;\n• ფოტოები ასახავს რეალურ ქონებას.\nსარეკლამო, შეცდომაში შემყვანი ან კანონსაწინააღმდეგო შინაარსი დაუშვებელია.`,
 },
 {
 title: '4. VIP სტატუსი და გადახდა',
 body: `VIP განცხადებები განთავსდება ძიების შედეგების სათავეში. გადახდა ხდება პლატფორმის ბალანსიდან. თანხა არ ბრუნდება VIP სტატუსის გააქტიურების შემდეგ. ტარიფები შეიძლება შეიცვალოს 30-დღიანი შეტყობინებით.`,
 },
 {
 title: '5. კონტენტის უფლებები',
 body: `პლატფორმაზე განთავსებული ფოტოები და ტექსტი რჩება მომხმარებლის საკუთრებაში, თუმცა განთავსებით ის ანიჭებს adjarahome.ge-ს კონტენტის გამოყენების, ჩვენებისა და ასლების შექმნის არაექსკლუზიურ, უსასყიდლო ლიცენზიას.`,
 },
 {
 title: '6. პასუხისმგებლობის შეზღუდვა',
 body: `adjarahome.ge მოქმედებს როგორც შუამავალი პლატფორმა. ჩვენ პასუხს არ ვაგებთ:\n• მომხმარებლებს შორის გარიგებებზე;\n• განცხადებებში მოწოდებული ინფორმაციის სიზუსტეზე;\n• სხვა მომხმარებლების მოქმედებებზე.`,
 },
 {
 title: '7. ანგარიშის გაუქმება',
 body: `adjarahome.ge-ს უფლება აქვს გააუქმოს ანგარიში წინამდებარე წესების დარღვევის, სასამართლო გადაწყვეტილების ან უსაფრთხოების საფრთხის შემთხვევაში. მომხმარებელს შეუძლია ნებისმიერ დროს წაშალოს ანგარიში პარამეტრების გვერდიდან.`,
 },
 {
 title: '8. ცვლილებები',
 body: `ჩვენ ვიტოვებთ უფლებას ნებისმიერ დროს შევცვალოთ წინამდებარე წესები. ცვლილებები ძალაში შედის პლატფორმაზე გამოქვეყნებიდან 15 დღის შემდეგ. გამოყენების გაგრძელება ნიშნავს ახალ პირობებზე თანხმობას.`,
 },
];

export default function TermsPage({ onBack }: Props) {
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
   <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
   <FileText size={18} className="text-white" />
   </div>
   <div>
   <h1 className="text-[26px] font-black text-gray-900 leading-none">წესები და პირობები</h1>
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
   © {new Date().getFullYear()} Adjarahome.ge — ყველა უფლება დაცულია.
  </p>
  </div>
 </div>
 );
}
