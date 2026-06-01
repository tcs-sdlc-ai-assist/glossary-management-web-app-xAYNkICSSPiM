export const LOCAL_STORAGE_KEY = 'glossaryTerms_v1';

export const PAGE_SIZE = 10;

export const SCOPE_OPTIONS = ['Global', 'Project', 'Team', 'Personal'];

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
};

export const MAX_PREVIEW_ROWS = 50;

export const NOTIFICATION_DURATION = 3000;

export const SUPPORTED_FILE_TYPES = {
  CSV: '.csv',
  XLSX: '.xlsx',
  XLS: '.xls',
};

export const SUPPORTED_FILE_ACCEPT = [
  SUPPORTED_FILE_TYPES.CSV,
  SUPPORTED_FILE_TYPES.XLSX,
  SUPPORTED_FILE_TYPES.XLS,
].join(',');

export const SUPPORTED_FILE_MIME_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
};

export const DEBOUNCE_DELAY = 100;

export const MAX_TERMS = 5000;