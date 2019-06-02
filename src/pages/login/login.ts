import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AngularFirestore} from "@angular/fire/firestore";
import {NotifyProvider} from "../../providers/notify/notify";
import {AuthProvider} from "../../providers/auth/auth";
import {EmailValidator} from "../../tools/email-validator";
import {PASSWORD_FORGOT_PAGE, USER_LIST_PAGE, USER_REGISTER_PAGE} from "../pages.constants";

@IonicPage({
  segment: 'ingreso'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  loginForm: FormGroup;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private authService: AuthProvider,
              private fb: FormBuilder,
              private notify: NotifyProvider,
              private afs: AngularFirestore) {

    this.loginForm = this.fb.group({
      'email': [ '' , [ Validators.required, EmailValidator.isValid ] ],
      'password': [ '', [
        Validators.minLength(6),
        Validators.maxLength(25)
      ]]
    });

  }

  ionViewDidLoad() {
    this.authService.user.subscribe(user => {
      if (user) {
        if (user.role === 0) {
          this.navCtrl.setRoot(USER_LIST_PAGE);
        } else if (user.role === 1) {
          this.navCtrl.setRoot('UnityPage');
        }
      } else {
        this.authService.signOut();
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  login() {
    this.notify.showLoader();
    if (this.loginForm.valid) {
      this.authService.loginEmail(this.email.value, this.password.value)
        .then(authData => {
        }).catch(error => {
          this.authService.handleError(error);
        this.notify.dismissLoader();
      });
    } else {
      this.notify.showToast('Formulario no valido. Revise e intente de nuevo');
      this.notify.dismissLoader();
    }
  }

  loginGoogle() {
    this.authService.loginWithGoogle().then(res => {
      let user = res.user;
      if (user) {
        this.afs.doc(`users/${user.uid}`).get().subscribe(usuario => {
          if (usuario.exists) {
          } else {
            this.navCtrl.setRoot(USER_REGISTER_PAGE, {user: user});
          }
        })
      }
    });
  }

  loginFacebook() {
    this.authService.loginWithFacebook().then(res => {
      let user = res.user;
      if (user) {
        this.afs.doc(`users/${user.uid}`).get().subscribe(usuario => {
          if (usuario.exists) {
          } else {
            this.navCtrl.setRoot(USER_REGISTER_PAGE, {user: user});
          }
        })
      }
    });
  }

  goToRegister() {
    this.notify.showLoader('Cargando...');
    this.navCtrl.setRoot(USER_REGISTER_PAGE);
  }

  goToForgot() {
    this.notify.showLoader('Cargando...');
    this.navCtrl.setRoot(PASSWORD_FORGOT_PAGE);
  }

}
