import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Luv2ShopFormService} from "../../services/luv2-shop-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {Luv2ShopValidators} from "../../validators/luv2-shop-validators";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  totalPrice: number = 0;
  totalQuantity: number = 0;
  checkoutFormGroup: FormGroup | undefined ;

  creditCardYear: number[] = [] ;
  creditCardMonth: number[] = [] ;

  countries: Country[] = [] ;
  shippingAddressState: State[] = [] ;
  billingAddressState: State[] = [] ;

  constructor(private formBuilder: FormBuilder,
              private luv2ShopFormService: Luv2ShopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      //customer est la clé et on a une collection de groupes ici
      customer: this.formBuilder.group({
          firstName: new FormControl('',
                        [Validators.required, Validators.minLength(2),
                                      Luv2ShopValidators.notOnlyWhitespace]),
          lastName: new FormControl('',
                        [Validators.required, Validators.minLength(2),
                                      Luv2ShopValidators.notOnlyWhitespace]),
          email: new FormControl('',
                  [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',
                  [Validators.required, Validators.minLength(2),
                                Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('',
                  [Validators.required, Validators.minLength(2),
                                Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('',
                  [Validators.required, Validators.minLength(2),
                                Luv2ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',
                    [Validators.required, Validators.minLength(2),
                                  Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('',
                  [Validators.required, Validators.minLength(2),
                                Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('',
                    [Validators.required, Validators.minLength(2),
                                  Luv2ShopValidators.notOnlyWhitespace])
      }),
      creditCart: this.formBuilder.group({
        cardType:new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('',
                      [Validators.required, Validators.minLength(2),
                                    Luv2ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required,
                                      Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required,
                                      Validators.pattern('[0-9]{16}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })


    });

    //populate credit Card Month
   const startMonth: number = new Date().getMonth() + 1 ; //because month is 0 based on javascript
    console.log('The start Month :' + startMonth);

    this.luv2ShopFormService.getCreditCardMonth(startMonth)
      .subscribe(data => {
        console.log('Retrieved the credit card month: ' + JSON.stringify(data));
        this.creditCardMonth = data ;
      });

    //populate Credit Card Year
    this.luv2ShopFormService.getCreditCardYear()
      .subscribe(data => {
        console.log('Retrieved the credit card year: ' + JSON.stringify(data));
        this.creditCardYear = data ;
      }) ;

    //populate countries
    this.luv2ShopFormService.getCountries()
      .subscribe( data => {
        console.log('Retrieved countries: ' + JSON.stringify(data));
        this.countries = data ;
      })

  }

  get firstName() {return this.checkoutFormGroup?.get('customer.firstName') ;}
  get lastName() {return this.checkoutFormGroup?.get('customer.lastName') ;}
  get email() {return this.checkoutFormGroup?.get('customer.email') ;}

  get shippingAddressStreet() {return this.checkoutFormGroup?.get('shippingAddress.street') ;}
  get shippingAddressCity() {return this.checkoutFormGroup?.get('shippingAddress.city') ;}
  get shippingAddressStates() {return this.checkoutFormGroup?.get('shippingAddress.state') ;}
  get shippingAddressZipCode() {return this.checkoutFormGroup?.get('shippingAddress.zipCode') ;}
  get shippingAddressCountry() {return this.checkoutFormGroup?.get('shippingAddress.country') ;}

  get billingAddressStreet() {return this.checkoutFormGroup?.get('billingAddress.street') ;}
  get billingAddressCity() {return this.checkoutFormGroup?.get('billingAddress.city') ;}
  get billingAddressStates() {return this.checkoutFormGroup?.get('billingAddress.state') ;}
  get billingAddressZipCode() {return this.checkoutFormGroup?.get('billingAddress.zipCode') ;}
  get billingAddressCountry() {return this.checkoutFormGroup?.get('billingAddress.country') ;}

  get creditCardType() {return this.checkoutFormGroup?.get('creditCart.cardType') ;}
  get creditCardNameOnCard() {return this.checkoutFormGroup?.get('creditCart.nameOnCard') ;}
  get creditCardNumber() {return this.checkoutFormGroup?.get('creditCart.cardNumber') ;}
  get creditCardSecurityCode() {return this.checkoutFormGroup?.get('creditCart.securityCode') ;}


  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup?.invalid) {
      this.checkoutFormGroup.markAllAsTouched() ;
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    //create orderItems from cartItems
    //- Long way
    /*
    let orderItems: OrderItem[] = [] ;
    for (let i=0; i<cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    */


    // short way
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem)) ;

    //set up purchase
    let purchase = new Purchase();

    //populate purchase-customer
    purchase.customer = this.checkoutFormGroup?.controls['customer'].value ;

    //populate purchase-shipping Address
    purchase.shippingAddress = this.checkoutFormGroup?.controls['shippingAddress'].value ;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress?.state)) ;
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress?.country)) ;
    // @ts-ignore
    purchase.shippingAddress?.state = shippingState.name;
    // @ts-ignore
    purchase.shippingAddress?.country = shippingCountry.name;


    //populate purchase-billing Address
    purchase.billingAddress = this.checkoutFormGroup?.controls['billingAddress'].value ;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress?.state)) ;
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress?.country)) ;
    // @ts-ignore
    purchase.billingAddress?.state = billingState.name;
    // @ts-ignore
    purchase.billingAddress?.country = billingCountry.name;

    //populate purchase-order and orderItems
    purchase.order =  order;
    purchase.orderItems = orderItems ;

    //Call REST API via the checkout service
    this.checkoutService.placeOrder(purchase).subscribe(

      {
        next: response => {
            alert(`Your order has been received.\\n Order Tracking number : ${response.orderTrackingNumber} `);
            this.resetCart();
        },
        error: err => {
          alert(`There was an error : ${err.message}`)
        }
      }

    );

  }

  copyShippingAddressToBillingAddress(event: any) {
        if (event.target.checked) {
          this.checkoutFormGroup?.controls['billingAddress']
            .setValue(this.checkoutFormGroup?.controls['shippingAddress'].value) ;

          //bug fix for states
          this.billingAddressState = this.shippingAddressState ;

        }else {
          this.checkoutFormGroup?.controls['billingAddress'].reset();
          //bug fix for states
          this.billingAddressState = [] ;

        }
  }

  handleMonthsAndYears() {

    const creditCardFormGroup = this.checkoutFormGroup?.get('creditCart');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear) ;

    //if the currentYear equals the selected year, then start with the current month
    let startMonth: number;
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1 ;
    }

    this.luv2ShopFormService.getCreditCardMonth(startMonth)
      .subscribe(data => {
        this.creditCardMonth = data ;
      })
  }

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup?.get(formGroupName);

    const countryCode = formGroup!.value.country.code ;
    const countryName = formGroup!.value.country.name ;

    console.log(`${formGroupName} country code : ${countryCode}`) ;
    console.log(`${formGroupName} country name : ${countryName}`) ;

    this.luv2ShopFormService.getStates(countryCode)
      .subscribe(data => {

        if (formGroupName === 'shippingAddress') {
              this.shippingAddressState = data ;
        } else {
          this.billingAddressState = data ;
        }

        // select first item by default
        formGroup?.get('state')?.setValue(data[0]) ;
      });

  }

  private reviewCartDetails() {

    this.cartService.totalPrice
      .subscribe( totalPrice => {
        this.totalPrice = totalPrice ;
    });

    this.cartService.totalQuantity
      .subscribe(totalQuantity => {
        this.totalQuantity = totalQuantity ;
      })

  }

  private resetCart() {

    //reset cart data
    this.cartService.cartItems = [] ;
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0) ;

    //reset the form
    this.checkoutFormGroup?.reset();

    //navigate back to the products page
    this.router.navigateByUrl("/products") ;

  }
}
