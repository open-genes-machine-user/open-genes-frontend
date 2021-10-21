import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SettingsEnum } from '../../../core/models/settings.model';
import { SettingsService } from '../../../core/services/settings.service';
import { SearchModes } from '../../../core/models/search-modes.model';

@Component({
  selector: 'app-toggle-search-mode',
  templateUrl: './toggle-search-mode.component.html',
  styleUrls: ['./toggle-search-mode.component.scss'],
})
export class ToggleSearchModeComponent implements OnInit {
  public searchMode = 'genesSearch';
  private settingsKey = SettingsEnum;

  @Output() setMode: EventEmitter<string> = new EventEmitter<string>();

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.setMode.emit(this.searchMode);
    this.settingsService.setSettings(this.settingsKey.searchMode, this.searchMode);
  }

  public setSearchMode(mode: SearchModes): void {
    this.searchMode = mode;
    this.setMode.emit(mode);
    this.settingsService.setSettings(this.settingsKey.searchMode, mode);
  }
}
