import { SearchModes } from './search-modes.model';

export interface Settings {
  showUiHints: boolean;
  searchMode: SearchModes;
  isTableView: boolean;
}

export enum SettingsEnum {
  showUiHints = 'showUiHints',
  searchMode = 'searchMode',
  isTableView = 'isTableView',
}
