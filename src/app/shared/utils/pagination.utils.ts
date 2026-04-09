export interface PaginaParams {
  page: number;
  pageSize: number;
}

export interface Pagina<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}


export function filtrarEPaginar<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  params: PaginaParams,
): Pagina<T> {
  const filtered = data.filter(filterFn);
  const totalPages = Math.max(1, Math.ceil(filtered.length / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const items = filtered.slice(start, start + params.pageSize);

  return { items, total: filtered.length, page: params.page, totalPages };
}
