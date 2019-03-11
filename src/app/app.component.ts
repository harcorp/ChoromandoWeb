import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import {AuthProvider} from "../providers/auth/auth";
import {CODE_LIST_PAGE, LOGIN_PAGE, USER_LIST_PAGE} from "../pages/pages.constants";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LOGIN_PAGE;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
              private authProv: AuthProvider) {
    this.initializeApp();


    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Usuarios', component: USER_LIST_PAGE },
      { title: 'Codigos', component: CODE_LIST_PAGE },
    ];

  }

  cerrarSesion() {
    this.authProv.signOut();
    this.nav.setRoot(LOGIN_PAGE);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
