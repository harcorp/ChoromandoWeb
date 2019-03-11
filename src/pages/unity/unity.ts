import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as $ from 'jquery';
import { AuthProvider } from '../../providers/auth/auth';
import {LOGIN_PAGE} from "../pages.constants";
declare const UnityLoader;

@IonicPage()
@Component({
  selector: 'page-unity',
  templateUrl: 'unity.html',
})
export class UnityPage {

  public gameObject: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private ngZone: NgZone,
    public authProv: AuthProvider) {

      (<any>window).unity = (<any>window).unity || {};
      (<any>window).unity.GetUnityNumber = this.randomNumberFromUnity.bind(this);
  }

  ionViewDidLoad() {
    this.init();
    this.authProv.user.subscribe(user => {
      if (!user) {
        setTimeout(() => {
          location.reload();
        }, 1000);
      }
    });
  }

  cerrarSesion() {
    this.authProv.signOut();
    this.navCtrl.setRoot(LOGIN_PAGE).then(() => {
      setTimeout(() => {
        location.reload();
      }, 700);
    });
  }

  ionViewDidLeave() {
    this.gameObject = null;
  }

  ionViewWillEnter() {
    setTimeout(() => {
      this.gameObject.SetFullscreen(1);
    }, 1000);
  }

  init() {
    $.getScript('assets/TemplateData/UnityProgress.js').done((UnityProgress, text) => {
      $.getScript('assets/aplicativo/UnityLoader.js').done((bla, text) => {
        this.gameObject = UnityLoader.instantiate('gameContainer', 'assets/aplicativo/Choromando.json');
      });
    });
  }

  fullScreen() {
    this.gameObject.SetFullscreen(1);
  }

  randomNumberFromUnity(input: string) {
    this.ngZone.run(() => {
      console.log('call from unity', input);
    });
  }

}
