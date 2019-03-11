import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../../models/user";
import {AuthProvider} from "../../providers/auth/auth";
import {NotifyProvider} from "../../providers/notify/notify";
import {PasswordValidator} from "../../tools/password-validator";
import {UNITY_PAGE} from "../pages.constants";
import {EmailValidator} from "../../tools/email-validator";
import {AngularFirestore} from "@angular/fire/firestore";
import {Code} from "../../models/code";

@IonicPage({
  segment: 'registro'
})
@Component({
  selector: 'page-user-register',
  templateUrl: 'user-register.html',
})
export class UserRegisterPage {

  registerFormProv: FormGroup;
  registerFormPass: FormGroup;
  matching_passwords_group: FormGroup;
  usuario: any;
  providerID: string;
  user: User;
  tycBool = false;
  showInfo = false;

  account_validation_messages = {
    'displayName': [
      { type: 'required', message: 'Tu nombre es requerido'}
    ],
    'code': [
      { type: 'required', message: 'El codigo es requerido'}
    ],
    'email': [
      { type: 'required', message: 'Correo Electronico es requerido' },
      { type: 'invalidEmail', message: 'Ingrese un correo Valido' }
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
              private formBuilder: FormBuilder,
              private authProv: AuthProvider,
              private notifyProv: NotifyProvider,
              private afs: AngularFirestore) {

    this.registerFormProv = this.formBuilder.group({
      displayName: ['', Validators.required],
      code: ['', Validators.required]
    });

    if (this.navParams.get('user') !== undefined) {
      this.usuario = this.navParams.get('user');
      this.providerID = this.usuario.providerData[0].providerId;
      let displayName = this.usuario.displayName;
      this.registerFormProv.controls.displayName.setValue(displayName);
    } else {
      this.providerID = 'password';
    }



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
    this.registerFormPass = this.formBuilder.group({
      displayName: ['', Validators.required],
      code: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid ])],
      matching_passwords: this.matching_passwords_group
    });

  }

  registerFormProvAction() {
    if (this.tycBool) {
      if (this.registerFormProv.valid) {
        this.notifyProv.showLoader('Registrando...');
        let timeStamp = new Date();
        this.user = {
          role: 1,
          email: this.usuario.email,
          displayName: this.registerFormProv.value.displayName,
          uid: this.usuario.uid,
          registerDate: timeStamp,
          updateDate: timeStamp
        };
        let valores = {
          usuario: this.user,
          codigo: this.registerFormProv.value.code
        };
        this.authProv.registerUser(valores).then(res => {
          this.navCtrl.setRoot(UNITY_PAGE);
          this.notifyProv.showToast('Registro Completo');
          this.notifyProv.dismissLoader();
        });
      } else {
        this.notifyProv.showToast('Hay campos sin completar.');
      }
    } else {
      this.notifyProv.showToast('Debe aceptar los terminos y condiciones para poder registrarse.');
    }

  }

  get password() { return this.registerFormPass.get('matching_passwords').get('password'); }
  get email() { return this.registerFormPass.get('email'); }
  get displayName() { return this.registerFormPass.get('displayName'); }
  get code() { return this.registerFormPass.get('code'); }

  registerFormPassAction() {
    if (this.tycBool) {
      if (this.registerFormPass.valid) {
        this.notifyProv.showLoader('Registrando...');
        this.afs.collection<Code>('codes', ref => ref.where('code', '==', this.code.value)).get().subscribe(res => {
          if (res.size === 1) {
            res.forEach(code => {
              let codigo = code.data() as Code;
              let idCodigo = code.id;
              if (codigo.uidUser === null) {
                this.authProv.createUserWithEmail(this.email.value, this.password.value).then(resultado => {
                  let newUser: User = {
                    uid: resultado.user.uid,
                    displayName: this.displayName.value,
                    registerDate: new Date(),
                    updateDate: new Date(),
                    uidCode: idCodigo,
                    role: 1,
                    email: this.email.value
                  };
                  let batch = this.afs.firestore.batch();
                  let userDoc = this.afs.firestore.collection('users').doc(resultado.user.uid);
                  batch.set(userDoc, newUser);
                  let codeDoc = this.afs.firestore.collection('codes').doc(idCodigo);
                  batch.set(codeDoc, {
                    uidUser: resultado.user.uid,
                    updateDate: new Date(),
                    activateDate: new Date(),
                  }, { merge: true });
                  batch.commit().then(r => {
                    this.notifyProv.showToast('Registrado correctamente');
                    this.navCtrl.setRoot(UNITY_PAGE);
                  }).catch(error => {
                    this.notifyProv.showToast('No se pudo registrar. Contacte con servicio al cliente');
                    this.notifyProv.dismissLoader();
                  });
                }).catch(error => {
                  this.authProv.handleError(error);
                });
              } else {
                this.notifyProv.showToast('Este codigo ya se encuentra en uso por otro usuario.');
                this.notifyProv.dismissLoader();
              }
            })
          } else if (res.size === 0) {
            this.notifyProv.showToast('Este codigo no existe o no es valido. Intenta de nuevo.');
            this.notifyProv.dismissLoader();
          } else {
            this.notifyProv.showToast('Error de codigo contacte con servicio al cliente.');
            this.notifyProv.dismissLoader();
          }
        });
      } else {
        this.notifyProv.showToast('Formulario incompleto.');
      }
    } else {
      this.notifyProv.showToast('Debe aceptar los terminos y condiciones para poder registrarse.');
    }
  }

  openInfo() {
    this.showInfo = !this.showInfo;
  }
}
