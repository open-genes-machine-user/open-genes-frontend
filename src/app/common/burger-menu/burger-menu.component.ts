import {Component} from '@angular/core';

@Component({
  selector: 'app-burger-menu',
  templateUrl: './app-burger-menu.component.html',
  styleUrls: ['./app-burger-menu.component.scss']
})
export class BurgerMenuComponent {

  menuVisible = false;

  constructor() {
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
    if (this.menuVisible === true) {
      document.body.classList.add('body--still');
    } else {
      document.body.classList.remove('body--still');
    }
  }

}
