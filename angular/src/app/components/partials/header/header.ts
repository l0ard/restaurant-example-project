import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { CartService } from '../../../services/cart/cart-service';
import { AuthService } from '../../../services/auth/auth-service';
import { Search } from '../search/search';

@Component({
  selector: 'app-header',
  imports: [RouterLink, UpperCasePipe, Search, TitleCasePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);

  cart = inject(CartService).cart;
  currentUser = this.authService.currentUser;

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
  }
}
