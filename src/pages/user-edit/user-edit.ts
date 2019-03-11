import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AngularFirestore} from "@angular/fire/firestore";
import {NotifyProvider} from "../../providers/notify/notify";
import {AuthProvider} from "../../providers/auth/auth";
import {EmailValidator} from "../../tools/email-validator";

@IonicPage()
@Component({
  selector: 'page-user-edit',
  templateUrl: 'user-edit.html',
})
export class UserEditPage {

  editUser: FormGroup;
  uidUser: string;
  account_validation_messages = {
    'email': [
      { type: 'required', message: 'Correo Electronico es requerido' },
      { type: 'invalidEmail', message: 'Ingrese un correo Valido' }
    ],
    'displayName': [
      { type: 'required', message: 'Este campo es requerido.' },
    ],
  };

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private fb: FormBuilder,
              private afs: AngularFirestore,
              private notifyProv: NotifyProvider,
              private authProv: AuthProvider,
              private viewCtrl: ViewController) {

    this.uidUser = this.navParams.get('uid');

    this.editUser = this.fb.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      displayName: ['', Validators.required],
    });

  }

  ionViewDidLoad() {
    this.afs.doc(`users/${this.uidUser}`).valueChanges().subscribe(user => {
      if (user) {
        this.editUser.patchValue(user);
      } else {
        this.notifyProv.showToast('Usuario no encontrado.');
        this.viewCtrl.dismiss();
      }
    })
  }

  dismiss() {
    this.notifyProv.showToast('No se realizo ningun cambio.');
    this.viewCtrl.dismiss();
  }

  submit() {
    this.notifyProv.showLoader('Editando...');
    this.authProv.editUser(this.editUser.value, this.uidUser).then(res => {
      this.notifyProv.dismissLoader();
      this.notifyProv.showToast('Usuario actualizado correctamente');
      this.viewCtrl.dismiss();
    });
  }

}
