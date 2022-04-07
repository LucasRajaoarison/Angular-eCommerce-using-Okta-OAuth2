import {Component, Inject, OnInit} from '@angular/core';
import {OktaAuth} from "@okta/okta-auth-js";
import {OKTA_AUTH} from "@okta/okta-angular";
import { OktaAuthStateService } from '@okta/okta-angular';


@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {



  isAuthenticated: boolean = false;
  userFullName?: string;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth, public authService: OktaAuthStateService) { }

  ngOnInit(): void {

    //subscribe to authentication state changes
    this.oktaAuth.authStateManager.subscribe(
      (result: any) => {
        this.isAuthenticated = result ;
        this.getUserDetails() ;
      }
    );

  }

  private getUserDetails() {
    if (this.isAuthenticated) {

      //Fetch the logged in user details (user's claims)
      //
      //user full name is exposed as a property name
      this.oktaAuth.getUser().then(
        res => {
          this.userFullName = res.name ;
        }
      );

    }
  }

  logout() {
    //terminate the session with okta and removes current tokens
    this.oktaAuth.signOut();
  }

}
