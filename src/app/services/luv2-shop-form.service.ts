import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Country} from "../common/country";
import {map} from "rxjs/operators";
import {State} from "../common/state";


@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {

  private countryUrl = "http://localhost:8080/api/countries" ;
  private stateUrl = "http://localhost:8080/api/states" ;

  constructor(private httpClient: HttpClient) { }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get<GetResponseCountries>(this.countryUrl).pipe(
      map(response => response._embedded.countries)
    );
  }

  getStates(theCountryCode: string): Observable<State[]> {
    const searchStateUrl = `${this.stateUrl}/search/findByCountryCode?code=${theCountryCode}` ;
    return this.httpClient.get<GetResponseState>(searchStateUrl).pipe(
      map(response => response._embedded.states)
    );
  }

  getCreditCardMonth(startMonth: number): Observable<number[]> {

    let data: number[] = [] ;

    //build an array for month dropdown list
    //start at current month and loop until
    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
      //from rxjs wrap an object as an observable
      return of(data);
  }

  getCreditCardYear(): Observable<number[]> {

    let data: number[] = [] ;

    //build an array for Year dropdown list
    //start at current Year and loop for the next 10 years
    const startYear: number = new Date().getFullYear() ;
    const endYear: number = startYear + 10 ;

    for (let theYear = startYear; theYear <= endYear; theYear++) {
        data.push(theYear);
    }
      return of(data) ;

  }
}

interface GetResponseCountries {
  _embedded: {
    countries: Country[] ;
  }
}

interface GetResponseState {
  _embedded: {
    states: State[];
  }
}

