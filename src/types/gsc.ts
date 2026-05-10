export interface GscRow {
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface ParseIssue {
  row: number;
  message: string;
}
