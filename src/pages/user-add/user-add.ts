import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../../models/user";
import {Observable} from "rxjs";
import {AuthProvider} from "../../providers/auth/auth";
import {AngularFirestore} from "@angular/fire/firestore";
import {NotifyProvider} from "../../providers/notify/notify";
import {PasswordValidator} from "../../tools/password-validator";
import {EmailValidator} from "../../tools/email-validator";
import {map} from "rxjs/operators";
import {Code, CodeId} from "../../models/code";
import firebase from "firebase";
import 'firebase/firestore';

@IonicPage()
@Component({
  selector: 'page-user-add',
  templateUrl: 'user-add.html',
})
export class UserAddPage {

  registerForm: FormGroup;
  matching_passwords_group: FormGroup;
  user: User;
  codigos: Observable<CodeId[]>;
  account_validation_messages = {
    'email': [
      { type: 'required', message: 'Correo Electronico es requerido' },
      { type: 'invalidEmail', message: 'Ingrese un correo Valido' }
    ],
    'displayName': [
      { type: 'required', message: 'Este campo es requerido.' },
    ],
    'confirm_password': [
      { type: 'required', message: 'Confirmación de contraseña es requerida.' },
      { type: 'areEqual', message: 'Las contraseñas no coinciden' }
    ],
    'password': [
      { type: 'required', message: 'Contraseña es requerida' },
      { type: 'minlength', message: 'La contraseña debe tener minimo 5 caracteres' },
      { type: 'pattern', message: 'Su contraseña debe contener al menos una letra mayúscula, una minúscula y un número' }
    ],
  };

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private viewCtrl: ViewController,
              private formBuilder: FormBuilder,
              private authProv: AuthProvider,
              private afs: AngularFirestore,
              private notifyProv: NotifyProvider) {

    this.matching_passwords_group = new FormGroup({
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required,
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')
      ])),
      confirm_password: new FormControl('', Validators.required)
    }, (formGroup: FormGroup) => {
      return PasswordValidator.areEqual(formGroup);
    });

    this.registerForm = this.formBuilder.group({
      'displayName': ['', Validators.compose([Validators.required])],
      uidCode: [''],
      email: new FormControl('', Validators.compose([Validators.required, EmailValidator.isValid])),
      matching_passwords: this.matching_passwords_group
    });

  }

  ionViewDidLoad() {
    this.codigos = this.afs.collection('codes', ref => ref.where('uidUser', '==', null))
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Code;
          const id = a.payload.doc.id;
          return { id, ...data};
        }))
      );
  }

  submit() {
    if (this.registerForm.valid) {
      this.notifyProv.showLoader('Creando...');
      this.user = this.registerForm.value;
      this.user.role = 1;
      let timeStamp = firebase.firestore.Timestamp.now();
      this.user.registerDate = timeStamp;
      this.user.updateDate = timeStamp;

      this.authProv.createUser(this.user).then(resolve => {
        this.dismiss();
        this.notifyProv.showToast('Usuario Creado Correctamente');
        this.notifyProv.dismissLoader();
      })
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
