// Georgian cities + key districts/villages for search + dropdown
// Curated compact list (~200 entries)

export interface LocationEntry {
  name: string;
  city: string;          // parent municipality
  type: 'city' | 'suburb' | 'village';
  region: string;
}

export const ALL_GEORGIA_LOCATIONS: LocationEntry[] = [
  // Capital
  { name: 'თბილისი', city: 'თბილისი', type: 'city', region: 'თბილისი' },
  { name: 'მცხეთა', city: 'მცხეთა', type: 'city', region: 'მცხეთა-მთიანეთი' },
  // Adjara
  { name: 'ბათუმი', city: 'ბათუმი', type: 'city', region: 'აჭარა' },
  { name: 'ქობულეთი', city: 'ქობულეთი', type: 'city', region: 'აჭარა' },
  { name: 'ხელვაჩაური', city: 'ხელვაჩაური', type: 'city', region: 'აჭარა' },
  { name: 'ქედა', city: 'ქედა', type: 'city', region: 'აჭარა' },
  { name: 'შუახევი', city: 'შუახევი', type: 'city', region: 'აჭარა' },
  { name: 'ხულო', city: 'ხულო', type: 'city', region: 'აჭარა' },
  { name: 'გონიო', city: 'გონიო', type: 'village', region: 'აჭარა' },
  { name: 'მახინჯაური', city: 'ბათუმი', type: 'village', region: 'აჭარა' },
  { name: 'სარფი', city: 'ბათუმი', type: 'village', region: 'აჭარა' },
  { name: 'კვარიათი', city: 'ბათუმი', type: 'village', region: 'აჭარა' },
  // Imereti
  { name: 'ქუთაისი', city: 'ქუთაისი', type: 'city', region: 'იმერეთი' },
  { name: 'ზესტაფონი', city: 'ზესტაფონი', type: 'city', region: 'იმერეთი' },
  { name: 'სამტრედია', city: 'სამტრედია', type: 'city', region: 'იმერეთი' },
  { name: 'თერჯოლი', city: 'თერჯოლი', type: 'city', region: 'იმერეთი' },
  { name: 'ჭიათურა', city: 'ჭიათურა', type: 'city', region: 'იმერეთი' },
  { name: 'ხაშური', city: 'ხაშური', type: 'city', region: 'იმერეთი' },
  { name: 'საჩხერე', city: 'საჩხერე', type: 'city', region: 'იმერეთი' },
  { name: 'ტყიბული', city: 'ტყიბული', type: 'city', region: 'იმერეთი' },
  { name: 'ბაღდათი', city: 'ბაღდათი', type: 'city', region: 'იმერეთი' },
  { name: 'ხონი', city: 'ხონი', type: 'city', region: 'იმერეთი' },
  { name: 'ვანი', city: 'ვანი', type: 'city', region: 'იმერეთი' },
  { name: 'ბაკურიანი', city: 'ბორჯომი', type: 'village', region: 'იმერეთი' },
  // Samegrelo
  { name: 'ზუგდიდი', city: 'ზუგდიდი', type: 'city', region: 'სამეგრელო' },
  { name: 'სენაკი', city: 'სენაკი', type: 'city', region: 'სამეგრელო' },
  { name: 'მარტვილი', city: 'მარტვილი', type: 'city', region: 'სამეგრელო' },
  { name: 'ხობი', city: 'ხობი', type: 'city', region: 'სამეგრელო' },
  { name: 'წალენჯიხა', city: 'წალენჯიხა', type: 'city', region: 'სამეგრელო' },
  { name: 'მესტია', city: 'მესტია', type: 'city', region: 'სამეგრელო' },
  { name: 'ლენტეხი', city: 'ლენტეხი', type: 'city', region: 'სამეგრელო' },
  { name: 'ჩხოროწყუ', city: 'ჩხოროწყუ', type: 'city', region: 'სამეგრელო' },
  { name: 'ფოთი', city: 'ფოთი', type: 'city', region: 'სამეგრელო' },
  { name: 'ანაკლია', city: 'ანაკლია', type: 'village', region: 'სამეგრელო' },
  { name: 'უშგული', city: 'უშგული', type: 'village', region: 'სამეგრელო' },
  // Kakheti
  { name: 'თელავი', city: 'თელავი', type: 'city', region: 'კახეთი' },
  { name: 'ყვარელი', city: 'ყვარელი', type: 'city', region: 'კახეთი' },
  { name: 'სიღნაღი', city: 'სიღნაღი', type: 'city', region: 'კახეთი' },
  { name: 'გურჯაანი', city: 'გურჯაანი', type: 'city', region: 'კახეთი' },
  { name: 'ლაგოდეხი', city: 'ლაგოდეხი', type: 'city', region: 'კახეთი' },
  { name: 'ახმეტა', city: 'ახმეტა', type: 'city', region: 'კახეთი' },
  { name: 'საგარეჯო', city: 'საგარეჯო', type: 'city', region: 'კახეთი' },
  { name: 'დედოფლისწყარო', city: 'დედოფლისწყარო', type: 'city', region: 'კახეთი' },
  { name: 'წინანდალი', city: 'წინანდალი', type: 'village', region: 'კახეთი' },
  { name: 'კვარელი', city: 'კვარელი', type: 'village', region: 'კახეთი' },
  // Shida Kartli
  { name: 'გორი', city: 'გორი', type: 'city', region: 'შიდა ქართლი' },
  { name: 'ქარელი', city: 'ქარელი', type: 'city', region: 'შიდა ქართლი' },
  { name: 'კასპი', city: 'კასპი', type: 'city', region: 'შიდა ქართლი' },
  { name: 'ახალგორი', city: 'ახალგორი', type: 'city', region: 'შიდა ქართლი' },
  { name: 'ჯავა', city: 'ჯავა', type: 'city', region: 'შიდა ქართლი' },
  { name: 'თიანეთი', city: 'თიანეთი', type: 'city', region: 'შიდა ქართლი' },
  // Kvemo Kartli
  { name: 'რუსთავი', city: 'რუსთავი', type: 'city', region: 'ქვემო ქართლი' },
  { name: 'მარნეული', city: 'მარნეული', type: 'city', region: 'ქვემო ქართლი' },
  { name: 'ბოლნისი', city: 'ბოლნისი', type: 'city', region: 'ქვემო ქართლი' },
  { name: 'დმანისი', city: 'დმანისი', type: 'city', region: 'ქვემო ქართლი' },
  { name: 'გარდაბანი', city: 'გარდაბანი', type: 'city', region: 'ქვემო ქართლი' },
  { name: 'თეთრი წყარო', city: 'თეთრი წყარო', type: 'city', region: 'ქვემო ქართლი' },
  { name: 'წალკა', city: 'წალკა', type: 'city', region: 'ქვემო ქართლი' },
  // Samtskhe-Javakheti
  { name: 'ახალციხე', city: 'ახალციხე', type: 'city', region: 'სამცხე-ჯავახეთი' },
  { name: 'ახალქალაქი', city: 'ახალქალაქი', type: 'city', region: 'სამცხე-ჯავახეთი' },
  { name: 'ბორჯომი', city: 'ბორჯომი', type: 'city', region: 'სამცხე-ჯავახეთი' },
  { name: 'ნინოწმინდა', city: 'ნინოწმინდა', type: 'city', region: 'სამცხე-ჯავახეთი' },
  { name: 'ადიგენი', city: 'ადიგენი', type: 'city', region: 'სამცხე-ჯავახეთი' },
  { name: 'ასპინძა', city: 'ასპინძა', type: 'city', region: 'სამცხე-ჯავახეთი' },
  // Guria
  { name: 'ოზურგეთი', city: 'ოზურგეთი', type: 'city', region: 'გურია' },
  { name: 'ლანჩხუთი', city: 'ლანჩხუთი', type: 'city', region: 'გურია' },
  { name: 'ჩოხატაური', city: 'ჩოხატაური', type: 'city', region: 'გურია' },
  { name: 'ურეკი', city: 'ურეკი', type: 'village', region: 'გურია' },
  { name: 'შეკვეთილი', city: 'შეკვეთილი', type: 'village', region: 'გურია' },
  { name: 'ნატანები', city: 'ნატანები', type: 'village', region: 'გურია' },
  // Racha-Lechkhumi
  { name: 'ამბროლაური', city: 'ამბროლაური', type: 'city', region: 'რაჭა-ლეჩხუმი' },
  { name: 'ონი', city: 'ონი', type: 'city', region: 'რაჭა-ლეჩხუმი' },
  { name: 'წყალტუბო', city: 'წყალტუბო', type: 'city', region: 'რაჭა-ლეჩხუმი' },
  { name: 'ცაგერი', city: 'ცაგერი', type: 'city', region: 'რაჭა-ლეჩხუმი' },
  // Mtskheta-Mtianeti
  { name: 'დუშეთი', city: 'დუშეთი', type: 'city', region: 'მცხეთა-მთიანეთი' },
  { name: 'ყაზბეგი', city: 'ყაზბეგი', type: 'city', region: 'მცხეთა-მთიანეთი' },
  { name: 'სტეფანწმინდა', city: 'სტეფანწმინდა', type: 'village', region: 'მცხეთა-მთიანეთი' },
  { name: 'გუდაური', city: 'გუდაური', type: 'village', region: 'მცხეთა-მთიანეთი' },
  // Abkhazia
  { name: 'სოხუმი', city: 'სოხუმი', type: 'city', region: 'აფხაზეთი' },
  { name: 'ოჩამჩირე', city: 'ოჩამჩირე', type: 'city', region: 'აფხაზეთი' },
  { name: 'გაგრა', city: 'გაგრა', type: 'city', region: 'აფხაზეთი' },
  // Abroad
  { name: 'უცხოეთი', city: 'უცხოეთი', type: 'city', region: 'უცხოეთი' },
  { name: 'სტამბული', city: 'სტამბული', type: 'city', region: 'უცხოეთი' },
  { name: 'ბაქო', city: 'ბაქო', type: 'city', region: 'უცხოეთი' },
  { name: 'ერევანი', city: 'ერევანი', type: 'city', region: 'უცხოეთი' },

  // ═════════════ TBILISI SUBURBS ═════════════
  { name: 'საბურთალო', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ვაკე', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'გლდანი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'დიდი დიღომი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ნაძალადევი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ისანი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'სამგორი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ჩუღურეთი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'დიღმის მასივი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ვარკეთილი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ორთაჭალა', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ავლაბარი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'მთაწმინდა', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ვერა', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ძველი თბილისი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'სოლოლაკი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ვეძისი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'დიდუბე', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'სადგურის მოედანი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ნავთლუღი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ავჭალა', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'თემქა', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ლილო', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ვაზისუბანი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ფონიჭალა', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ტაბახმელა', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ოქროყანა', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'წავკისი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'კოჯორი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'კრივანი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'აღმაშენებლის ხეივანი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'კახეთის გზატკეცილი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'ნუცუბიძის ფერდობი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'წერეთელი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'დელისი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'დიღომი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'თბილისის ცენტრი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },
  { name: 'თბილისის შემოგარენი', city: 'თბილისი', type: 'suburb', region: 'თბილისი' },

  // ═════════════ BATUMI AREAS ═════════════
  { name: 'ბათუმის ცენტრი', city: 'ბათუმი', type: 'suburb', region: 'აჭარა' },
  { name: 'ახალი ბულვარი', city: 'ბათუმი', type: 'suburb', region: 'აჭარა' },
  { name: 'ძველი ბულვარი', city: 'ბათუმი', type: 'suburb', region: 'აჭარა' },
  { name: 'აეროპორტის უბანი', city: 'ბათუმი', type: 'suburb', region: 'აჭარა' },
  { name: 'გონიო', city: 'ბათუმი', type: 'suburb', region: 'აჭარა' },
  { name: 'მახინჯაური', city: 'ბათუმი', type: 'suburb', region: 'აჭარა' },
  { name: 'ხიმშიაშვილის უბანი', city: 'ბათუმი', type: 'suburb', region: 'აჭარა' },
  { name: 'სარფი', city: 'ბათუმი', type: 'suburb', region: 'აჭარა' },
  { name: 'კვარიათი', city: 'ბათუმი', type: 'suburb', region: 'აჭარა' },
  { name: 'მაჭახელას უბანი', city: 'ბათუმი', type: 'suburb', region: 'აჭარა' },

  // ═════════════ KUTAISI AREAS ═════════════
  { name: 'ქუთაისის ცენტრი', city: 'ქუთაისი', type: 'suburb', region: 'იმერეთი' },
  { name: 'აწაღვარი', city: 'ქუთაისი', type: 'suburb', region: 'იმერეთი' },
  { name: 'გუმბრათი', city: 'ქუთაისი', type: 'suburb', region: 'იმერეთი' },
  { name: 'ჭალადიდი', city: 'ქუთაისი', type: 'suburb', region: 'იმერეთი' },
  { name: 'დიდგორი', city: 'ქუთაისი', type: 'suburb', region: 'იმერეთი' },
  { name: 'სულორთი', city: 'ქუთაისი', type: 'suburb', region: 'იმერეთი' },

  // ═════════════ RUSTAVI AREAS ═════════════
  { name: 'რუსთავის ცენტრი', city: 'რუსთავი', type: 'suburb', region: 'ქვემო ქართლი' },
  { name: 'რუსთავის დასავლეთი', city: 'რუსთავი', type: 'suburb', region: 'ქვემო ქართლი' },
  { name: 'მესამე მ/რ', city: 'რუსთავი', type: 'suburb', region: 'ქვემო ქართლი' },
  { name: 'მეოთხე მ/რ', city: 'რუსთავი', type: 'suburb', region: 'ქვემო ქართლი' },
  { name: 'მეხუთე მ/რ', city: 'რუსთავი', type: 'suburb', region: 'ქვემო ქართლი' },
  { name: 'მეექვსე მ/რ', city: 'რუსთავი', type: 'suburb', region: 'ქვემო ქართლი' },

  // ═════════════ KOBLULETI / KHELVACHAURI ═════════════
  { name: 'ქობულეთის ცენტრი', city: 'ქობულეთი', type: 'suburb', region: 'აჭარა' },
  { name: 'ჭაკვი', city: 'ქობულეთი', type: 'suburb', region: 'აჭარა' },
  { name: 'მუხაესტატი', city: 'ქობულეთი', type: 'suburb', region: 'აჭარა' },
  { name: 'ციხისძირი', city: 'ქობულეთი', type: 'suburb', region: 'აჭარა' },
  { name: 'ფერია', city: 'ქობულეთი', type: 'suburb', region: 'აჭარა' },
];

// Flat array of just the names for quick autocomplete / search
export const ALL_GEORGIAN_NAMES = ALL_GEORGIA_LOCATIONS.map(l => l.name);

// Unique list of all cities (used for city dropdown)
export const ALL_CITIES = Array.from(new Set(ALL_GEORGIA_LOCATIONS.map(l => l.city)));

// Get suburbs for a given city
export function getSuburbs(city: string): LocationEntry[] {
  return ALL_GEORGIA_LOCATIONS.filter(l => l.city === city && l.type === 'suburb');
}

// Get all entries matching a search query
export function searchLocations(query: string): LocationEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_GEORGIA_LOCATIONS.filter(l => l.name.toLowerCase().includes(q));
}
