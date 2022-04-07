import { Component, OnInit } from '@angular/core';
import {ProductService} from "../../services/product.service";
import {Product} from "../../common/product";
import {ActivatedRoute} from "@angular/router";
import {CartItem} from "../../common/cart-item";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  //templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] | undefined = [];
  currentCategoryId?: number = 1;
  searchMode?: boolean = false;
  previousCategoryId: number = 1;

  //new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number  = 5;
  theTotalElements: number  = 0;

  previousKeyword: string | null = null;


  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });

  }

  // les données sont chargées et stcker dans products
  listProducts() {

    this.searchMode= this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode) {
      this.handleSearchMode();
    }else {
      this.handleListProducts();
      console.log("Pas de mot!!!");
    }

  }


  handleSearchMode() {

    const theKeyWord: string | null = this.route.snapshot.paramMap.get('keyword');
    console.log(theKeyWord);

    //
    //check if we have a different keyword than previous
    //then set thePageNumber to 1
    //

    if(this.previousKeyword != theKeyWord) {
      this.thePageNumber = 1;
    }
    this.previousKeyword = theKeyWord ;
    console.log(`keyword=${theKeyWord}, thePageNumber=${this.thePageNumber}`);
    //now search for the product using keyword
    /* this.productService.searchProduct(theKeyWord)
      .subscribe((data: any)=>{
        this.products = data ;
      }); */

    //get the products for the given search keyword
    this.productService.searchProductListPaginate(this.thePageNumber - 1,
                                                  this.thePageSize,
                                                  theKeyWord)
                                                  .subscribe(this.processResult()) ;


  }

  handleListProducts() {
    //check if id parameter is available, example= /product/1
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id') ;

    if(hasCategoryId) {
      //get the id param string. convert string into a number using the "+" symbol
      // @ts-ignore
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id') ;
    }else {
      // category id not available....return default category id 1
      this.currentCategoryId = 1;
    }

    //
    //check if we have a different category than previous
    // Note: Angular will reuse a component if it is currently being viewed
    //

    // if we have a different category id than previous
    //then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1 ;
    }
    this.previousCategoryId = this.currentCategoryId;
    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

    //get the products for the given category id
    this.productService.getProductListPaginate(this.thePageNumber - 1,
                                                this.thePageSize,
                                                this.currentCategoryId)
                                                .subscribe(this.processResult()) ;
  }

   processResult() {
     return (data: any) => {
          this.products = data._embedded.products;
          this.thePageNumber = data.page.number + 1;
          this.thePageSize = data.page.size;
          this.theTotalElements = data.page.totalElements;
     };
  }

  updatePageSize(pageSize: number) {
        this.thePageSize = pageSize;
        this.thePageNumber = 1;
        this.listProducts();
  }

  addToCart(theProduct: Product) {

      console.log(`Adding to cart ${theProduct.name}, ${theProduct.unitPrice}`) ;

    //the real work
    const theCartItem = new CartItem(theProduct) ;

    this.cartService.addToCart(theCartItem) ;


  }
}
