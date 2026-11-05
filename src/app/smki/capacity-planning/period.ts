type SearchValue = string | string[] | undefined;
export type CapacitySearchParams = Promise<Record<string, SearchValue>> | undefined;

function first(value: SearchValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function capacityPeriod(searchParams: CapacitySearchParams): Promise<{ initialYear?: number; initialMonth?: number }> {
  const params = (await searchParams) ?? {};
  const year = Number(first(params.year));
  const month = Number(first(params.month));

  return {
    initialYear: Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : undefined,
    initialMonth: Number.isInteger(month) && month >= 1 && month <= 12 ? month : undefined,
  };
}
