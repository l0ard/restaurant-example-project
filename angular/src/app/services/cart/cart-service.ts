import { effect, inject, Injectable, signal } from '@angular/core';
import { Cart } from '../../shared/models/Cart';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {AuthService } from '../auth/auth-service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  cart = signal<Cart | null>(null);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();

      if (user) {
        this.loadCart().subscribe();
      } else {
        this.cart.set(null);
      }
    });
  }

  loadCart(): Observable<Cart>{
    return this.http.get<Cart>('/api/cart')
      .pipe(
        tap(cart => this.cart.set(cart))
    );
  }

  addToCart(foodId: number):Observable<Cart>{
    return this.http.post<Cart>(
       '/api/cart/foods/' + foodId,
      {})
      .pipe(
        tap(cart => this.cart.set(cart))
    );
  }

  removeFromCart(cartLineId: number): Observable<Cart>{
    return this.http
      .delete<Cart>('/api/cart/lines/' + cartLineId)
      .pipe(
        tap((cart) => this.cart.set(cart))
      );
  }

  changeQuantity(cartLineId:number, quantity:number): Observable<Cart>{
    return this.http
      .patch<Cart>('/api/cart/lines/' + cartLineId, {
        quantity,
      })
      .pipe(
        tap((cart) => this.cart.set(cart))
      );
  }

  clearCart(): Observable<Cart>{
    return this.http.post<Cart>('/api/cart/clear',
      {})
      .pipe(
        tap((cart) => this.cart.set(cart))
      );
  }
}
