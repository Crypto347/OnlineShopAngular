import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { Product } from '../models/product';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  constructor(
    private db: AngularFireDatabase
  ) { }

  private create() {
    return this.db.list('/shopping-carts').push({
      dataCreated: new Date().getTime()
    })
  }
  private getItem(cartId: string, productId: string): any {
    return this.db.object('/shopping-carts/' + cartId + '/items/' + productId);
  }

  async getCart() {
    let cartId = await this.getOrCreateCartId();
    return this.db.object('/shopping-carts/' + cartId).valueChanges()
  }

  private async getOrCreateCartId(): Promise<string> {
    let cartId = localStorage.getItem('cartId');

    if(cartId) return cartId;

    let result = await this.create();
    localStorage.setItem('cartId', result.key);
    return result.key;

      // this.create().then(res => {
      //   localStorage.setItem('cartId', res.key);
      //   return this.getCart(res.key);
      // })
    
  }

  async addToCart(product: Product) {
    this.updateItemQuantity(product, 1);
  }

  async removeFromCart(product: Product) {
    this.updateItemQuantity(product, -1);
  }

  private async updateItemQuantity(product: Product, change: number) {
    let cartId = await this.getOrCreateCartId();
    let item$ = this.getItem(cartId, product.key);

    item$.snapshotChanges().take(1).subscribe((item) => {
      if(item.payload.exists()){
        // console.log(item.payload.val().quantity)
        item$.update({quantity: item.payload.val().quantity + change});
      } 
      else item$.set({product: product, quantity: change});
    })
  }
}
