import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FoodService } from '../../../services/food/food-service';
import { StarRating } from '../../partials/star-rating/star-rating';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { CartService } from '../../../services/cart/cart-service';
import { NotFound } from '../../partials/not-found/not-found';
import { switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../services/auth/auth-service';

@Component({
  selector: 'app-food-page',
  imports: [StarRating, NgOptimizedImage, RouterLink, CurrencyPipe, NotFound],
  templateUrl: './food-page.html',
  styleUrl: './food-page.scss',
})
export class FoodPage {
  private activatedRoute = inject(ActivatedRoute);
  authService = inject(AuthService);
  private foodService = inject(FoodService);
  private cartService = inject(CartService);
  private router = inject(Router);

  food = toSignal(
    this.activatedRoute.params.pipe(
      switchMap(params =>
        this.foodService.getFoodById(params['id'])
      )
    ),
    {
      initialValue: null
    }
  );

  addToCart() {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    const food = this.food();

    if(!food){
      return;
    }

    this.cartService
      .addToCart(food.id)
      .subscribe(() => {
        this.router.navigateByUrl('/cart-page');
      });
  }
}
