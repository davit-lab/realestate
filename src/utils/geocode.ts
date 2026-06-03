export const CITY_COORDS: Record<string, [number, number]> = {
  'თბილისი':     [41.7151, 44.8271],
  'ბათუმი':      [41.6168, 41.6367],
  'ქუთაისი':     [42.2679, 42.7181],
  'ქობულეთი':    [41.8200, 41.7900],
  'ოზურგეთი':    [41.9200, 42.0100],
  'ზუგდიდი':     [42.5070, 41.8700],
  'ფოთი':        [42.1500, 41.6800],
  'გორი':        [41.9853, 44.1093],
  'რუსთავი':     [41.5490, 44.9963],
  'სამტრედია':   [42.1500, 42.3400],
  'ახალციხე':    [41.6400, 42.9800],
  'ტელავი':      [41.9200, 45.4700],
  'სიღნაღი':     [41.6200, 45.9200],
  'ამბროლაური':  [42.5200, 43.1500],
  'ხაშური':      [41.9900, 43.5900],
  'ბორჯომი':     [41.8300, 43.3800],
  'ახალქალაქი':  [41.4100, 43.4900],
  'სტეფანწმინდა':[42.6600, 44.6400],
  'ანაკლია':     [42.3800, 41.5600],
  'უჩამბო':      [41.8700, 41.8200],
};

export function getCityCoords(city: string): [number, number] {
  return CITY_COORDS[city?.trim()] ?? [41.7151, 44.8271];
}

export function getListingCoords(
  city: string,
  id: string,
  lat?: number,
  lng?: number,
): [number, number] {
  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) return [lat, lng];
  const base = getCityCoords(city);
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const latOff = ((hash % 200) - 100) * 0.0007;
  const lngOff = (((hash * 13) % 200) - 100) * 0.0007;
  return [base[0] + latOff, base[1] + lngOff];
}
