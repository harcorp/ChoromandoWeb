import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NotifyProvider} from "../../providers/notify/notify";
import {AuthProvider} from "../../providers/auth/auth";
import {EmailValidator} from "../../tools/email-validator";
import {LOGIN_PAGE} from "../pages.constants";

/**
 * Generated class for the PasswordForgotPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-password-forgot',
  templateUrl: 'password-forgot.html',
})
export class PasswordForgotPage {

  forgotForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private formBuilder: FormBuilder, private notify: NotifyProvider,
              private authService: AuthProvider) {
    this.forgotForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PasswordForgotPage');
  }

  get email() { return this.forgotForm.get('email'); }

  login() {
    this.notify.showLoader();
    if (this.forgotForm.valid) {
      this.authService.forgotPassword(this.email.value)
        .then(authData => {
          this.notify.showToast('Se ha enviado un correo para restablecer la contraseña');
          this.navCtrl.setRoot(LOGIN_PAGE);
        }).catch(error => {
          switch (error.code) {
            case 'auth/user-not-found':
              this.notify.showToast('El correo electronico no esta registrado en nuestro sistema.');
              break;
            default:
              this.notify.showToast('Error desconocido. Intente mas tarde.');
            }
        this.notify.dismissLoader();
      });
    } else {
      this.notify.showToast('Formulario no valido. Revise e intente de nuevo');
      this.notify.dismissLoader();
    }
  }

}
