export interface FinderResult {
  title: string;
  character: string;
  phase: string;
  store: string;
  domain: string;
  price: string;
  url: string;
  note: string;
}

export interface FinderResponse {
  summary: string;
  results: FinderResult[];
  error?: string;
}
