import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Gene } from '../../../../../../core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gene-menu',
  templateUrl: './gene-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneMenuComponent {
  @Input() gene: Gene;
  @Input() isAdded: Observable<boolean>;
  @Output() unFav: EventEmitter<number> = new EventEmitter();
  @Output() fav: EventEmitter<number> = new EventEmitter();
  isAddToFavoritesShown: boolean;

  unFavItem(id: number): void {
    this.unFav.emit(id);
  }

  favItem(id: number): void {
    this.fav.emit(id);
  }
}
