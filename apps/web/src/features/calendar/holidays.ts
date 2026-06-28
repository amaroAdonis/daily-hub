import { useQuery } from '@tanstack/react-query';

/** Feriado nacional resolvido para um país, num dia (`YYYY-MM-DD`). */
export interface Holiday {
  date: string;
  name: string;
  country: string;
  flag: string;
  label: string;
}

const COUNTRIES = [
  // BR usa o nome local (PT); IE usa o nome internacional (o local vem em gaélico).
  { code: 'BR', flag: '🇧🇷', label: 'Brasil', local: true },
  { code: 'IE', flag: '🇮🇪', label: 'Irlanda', local: false },
];

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
}

async function fetchHolidays(year: number, code: string): Promise<NagerHoliday[]> {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`);
    if (!res.ok) return [];
    return (await res.json()) as NagerHoliday[];
  } catch {
    return [];
  }
}

/**
 * Feriados nacionais de Brasil e Irlanda no ano, via Nager.Date (API pública,
 * sem chave). Cache "infinito" — feriados do ano não mudam.
 */
export function useHolidays(year: number) {
  return useQuery({
    queryKey: ['holidays', year],
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
    queryFn: async (): Promise<Holiday[]> => {
      const lists = await Promise.all(
        COUNTRIES.map(async (country) => {
          const holidays = await fetchHolidays(year, country.code);
          return holidays.map((h) => ({
            date: h.date,
            name: (country.local ? h.localName : h.name) || h.name,
            country: country.code,
            flag: country.flag,
            label: country.label,
          }));
        }),
      );
      return lists.flat();
    },
  });
}
