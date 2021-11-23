import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { Genes } from '../../../core/models';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiService } from '../../../core/services/api/open-genes-api.service';
import { ToMap } from '../../../core/utils/to-map';
import { SettingsService } from '../../../core/services/settings.service';
import { SearchMode, SearchModeEnum } from '../../../core/models/settings.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent extends ToMap implements OnInit, OnDestroy {
  @Inject(Document) public document: Document;

  @Input() genesList: Genes[];
  @Input() showTitle = true;

  @Input() set setSearchMode(value: SearchMode) {
    if (value) {
      this.searchMode = value;
      this.searchedData = [];
      this.searchForm.get('searchField').setValue('');
    }
  }

  @Output() searchQuery: EventEmitter<string> = new EventEmitter<string>();
  @Output() notFoundAndFoundGenes: EventEmitter<any> = new EventEmitter<any>();

  public value: string;
  public foundGenes: string[];
  public notFoundGenes: string[] = [];
  public searchedData: Genes[];
  public searchForm: FormGroup;
  public searchMode: SearchMode;
  public showSearchResult = false;
  public biologicalProcess: Map<any, any>;
  public cellularComponent: Map<any, any>;
  public molecularActivity: Map<any, any>;

  private searchModeEnum = SearchModeEnum;
  public inputData = [
    {
      searchMode: SearchModeEnum.searchByGenes,
      placeholder: 'search_field_start_typing',
    },
    {
      searchMode: SearchModeEnum.searchByGoTerms,
      placeholder: 'search_field_tap_search',
    },
    {
      searchMode: SearchModeEnum.searchByGenesList,
      placeholder: 'search_field_by_comma',
    },
  ];

  private subscription$ = new Subject();

  constructor(
    private renderer: Renderer2,
    private apiService: ApiService,
    private settingsService: SettingsService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.searchForm = new FormGroup({
      searchField: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.subsToSearchFieldChanges();
    this.onSearch();
  }

  ngOnDestroy(): void {
    this.subscription$.next();
    this.subscription$.complete();
    this.cancelSearch();
  }

  private subsToSearchFieldChanges(): void {
    this.searchForm
      .get('searchField')
      .valueChanges.pipe(
        filter((query: string) => !!query),
        map((query: string) => query.toLowerCase()),
        filter((query: string) => {
          this.showSearchResult = query.length >= 2;

          if (this.showSearchResult) {
            this.renderer.addClass(document.body, 'body--search-on-main-page-is-active');
          } else {
            this.renderer.removeClass(document.body, 'body--search-on-main-page-is-active');
          }

          if (query.length !== 0) {
            if (this.searchMode === this.searchModeEnum.searchByGoTerms) {
              return true;
            }
            if (this.searchMode === this.searchModeEnum.searchByGenes) {
              this.searchByGenes(query);
            }
            if (this.searchMode === this.searchModeEnum.searchByGenesList) {
              this.searchByGenesList(query);
            }
          }

          return false;
        }),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((query: string) => this.apiService.getGoTermMatchByString(query)),
        takeUntil(this.subscription$)
      )
      .subscribe((genes: Genes[]) => {
        this.searchedData = genes;
        this.mapTerms();
        this.cdRef.markForCheck();
      });
  }

  private mapTerms(): void {
    for (const item of this.searchedData) {
      this.biologicalProcess = this.toMap(item.terms?.biological_process);
      this.cellularComponent = this.toMap(item.terms?.cellular_component);
      this.molecularActivity = this.toMap(item.terms?.molecular_activity);
    }
  }

  private searchByGenes(query: string): void {
    console.log(query);
    this.searchedData = this.genesList?.filter((gene) => {
      // Fields always acquired in response
      const searchedText = [
        gene.id,
        gene?.ensembl ? gene.ensembl : '',
        gene.symbol,
        gene.name,
        gene?.aliases ? gene.aliases : '',
      ]
        .join(' ')
        .toLowerCase();
      return searchedText.includes(query);
    });
  }

  private searchByGenesList(query: string): void {
    if (query.length >= 2) {
      this.searchedData = [];
      this.notFoundGenes = [];
      const arrayOfWords = query
        .toLowerCase()
        .split(',')
        .map((res) => res.trim())
        .filter((res) => res);

      const uniqWords = [...new Set(arrayOfWords)];

      if (uniqWords.length !== 0) {
        this.foundGenes = uniqWords.filter((symbol) => {
          const foundGene = this.genesList.find((gene) => symbol === gene.symbol.toLowerCase());

          foundGene ? this.searchedData.push(foundGene) : this.notFoundGenes.push(symbol);

          return !!foundGene;
        });
      }

      this.notFoundAndFoundGenes.emit({
        foundGenes: this.foundGenes,
        notFoundGenes: this.notFoundGenes,
      });
    } else {
      this.notFoundAndFoundGenes.emit({
        foundGenes: [],
        notFoundGenes: [],
      });
    }
  }

  public onSearch(): void {
    this.value = this.searchForm.get('searchField').value;
    this.searchQuery.emit(this.value.toLowerCase());
  }

  public cancelSearch(event?): void {
    this.showSearchResult = false;
    this.renderer.removeClass(document.body, 'body--search-on-main-page-is-active');
    event?.stopPropagation();
  }

  public clearSearch(): void {
    this.searchForm.get('searchField').setValue('');
    const query: string = this.searchForm.get('searchField').value;
    this.searchQuery.emit(query.toLowerCase());
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }
}
