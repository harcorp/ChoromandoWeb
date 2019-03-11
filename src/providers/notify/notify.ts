import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Loading, LoadingController, Toast, ToastController} from "ionic-angular";

/*
  Generated class for the NotifyProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NotifyProvider {

  loader: Loading;
  toast: Toast;

  constructor(public http: HttpClient,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController) {

  }

  showLoader(message: string = 'Cargando...'): void {
    this.loader = this.loadingCtrl.create({
      'content': message,
      'dismissOnPageChange': true
    });
    this.loader.present();
  }

  dismissLoader(): void {
    this.loader.dismiss();
  }

  showToast(message: string): void {
    this.toast = this.toastCtrl.create({
      'message': message,
      'duration': 3000,
      'position': 'bottom'
    });
    this.toast.present();
  }

}
