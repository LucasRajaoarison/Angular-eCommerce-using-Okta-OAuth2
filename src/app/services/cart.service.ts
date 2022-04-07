import { Injectable } from '@angular/core';
import {CartItem} from "../common/cart-item";
import {Subject} from "rxjs";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  //
  //subject is to publish events in our code
  //the event will be send to all of the subscribers
  //
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);

  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);


  storage: Storage = sessionStorage;

  //if we want the data to survive with closed browser
  //storage: Storage = localStorage;

  constructor() {
    //read data from storage
    let data = JSON.parse(<string>this.storage.getItem('cartItems')) ;

    if (data != null) {
      this.cartItems = data;

      //compute totals based on the data that is read from storage
      this.computeCartTotal();
    }

  }

  addToCart(theCartItem: CartItem) {

    //check if we already have the item in our cart
    let alreadyExistInCart: boolean = false;
    let existingCartItem: CartItem | undefined;

    if(this.cartItems.length > 0) {
                  //find the item in the cart based on item ID
                  /*
                  for (let tempCartItem of this.cartItems) {
                    if (tempCartItem.id === theCartItem.id) {
                      //we found it so
                      existingCartItem = tempCartItem;
                      break;
                    }
                  }
                  */

      //find the item in the cart based on item ID
      existingCartItem = this.cartItems.find( tempCartItem => tempCartItem.id === theCartItem.id) ;

      //check if we found it
      // @ts-ignore
      alreadyExistInCart = (existingCartItem != undefined) ;
    }

    //after we found it
    if (alreadyExistInCart) {
      //increment the quantity
      // @ts-ignore
      existingCartItem.quantity++ ;
    } else {
      //just add the item into the array
      this.cartItems.push(theCartItem);
    }

    //compute cart totalPrice and totalQuantity
    this.computeCartTotal();

  }

   computeCartTotal() {

    let totalPriceValue: number = 0 ;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      // @ts-ignore
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice ;
      // @ts-ignore
      totalQuantityValue += currentCartItem.quantity;
    }

    //publish or send the new values....all subscribers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue) ;

    //log cart data for debugging
    this.logCartData(totalPriceValue, totalQuantityValue);

    //persist cart data
    this.persistCartItems();
  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems)) ;
  }


   logCartData(totalPriceValue: number, totalQuantityValue: number) {

    console.log('content of the cart');
    for(let tempCartItem of this.cartItems) {
      // @ts-ignore
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice ;
      console.log(`Name: ${tempCartItem.name},  quantity: ${tempCartItem.quantity}
                   subTotalPrice: ${subTotalPrice}`)
    }
      // deux chiffre apprés la virgule
    console.log(`Total Price: ${totalPriceValue.toFixed(2)}, Total Quantity: ${totalQuantityValue}`) ;
    console.log('-------------');
  }


  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity-- ;
    if (theCartItem.quantity === 0) {
      this.remove(theCartItem) ;
    } else {
      this.computeCartTotal();
    }
  }

 remove(theCartItem: CartItem) {
      //get index of item in the array
      const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === theCartItem.id) ;

      //if found, remove the item from the array to the given index
   if (itemIndex > -1) {
     this.cartItems.splice(itemIndex, 1) ;
     this.computeCartTotal();
   }
  }
}
