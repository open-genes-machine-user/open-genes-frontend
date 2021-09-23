import { Component, Input } from "@angular/core";

@Component({
  selector: "app-skeleton",
  templateUrl: "./skeleton.component.html",
  styleUrls: ["./skeleton.component.scss"],
})
export class SkeletonLoaderComponent {
  @Input()
  groups: number;
  @Input()
  cardRows?: number = 3;
  quantity = Array;
  @Input() view?: string = 'line';

  row(n: number): Array<number> {
    return Array(n)
  }
}
