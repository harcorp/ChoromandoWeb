import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import { Observable } from 'rxjs';
import {User} from "../../models/user";
import {environment as ENV} from "../../environments/environment";
import {AngularFirestore} from "@angular/fire/firestore";
import { switchMap } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import UserCredential = firebase.auth.UserCredential;
import {NotifyProvider} from "../notify/notify";
import firebase from 'firebase/app';
import 'firebase/auth';

@Injectable()
export class AuthProvider {

  user: Observable<User>;
  restApi = ENV.apiURL + '/users';

  constructor(public http: HttpClient,
              private afAuth: AngularFireAuth,
              private afs: AngularFirestore,
              private notifyProv: NotifyProvider) {
    this.user = this.afAuth.authState.pipe(switchMap(
      user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null)
        }
      }
    ));
  }


  loginEmail(email: string, password: string): Promise<UserCredential> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  signOut(): void {
    this.afAuth.auth.signOut();
  }

  editUser(user: User, uid: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.restApi}/editar/${uid}`, user)
        .toPromise()
        .then(res => {
          resolve(res);
        }).catch(e => {
          this.handleError(e);
      });
    });
  }

  createUserWithEmail(email: string, password: string): Promise<UserCredential> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }


  createUser(user: User):Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.restApi, user)
        .toPromise()
        .then(res => {
          resolve();
        })
        .catch(e => {
          this.handleError(e);
        })
    });
  }

  registerUser(datos: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.post(`${this.restApi}/register`, datos)
        .toPromise()
        .then(res => {
          resolve();
        })
        .catch(e => {
          this.handleError(e);
        })
    })
  }

  loginWithGoogle(): Promise<any> {
    return this.afAuth.auth.signInWithPopup(
      new firebase.auth.GoogleAuthProvider()
    );
  }

  loginWithFacebook(): Promise<any> {
    return this.afAuth.auth.signInWithPopup(
      new firebase.auth.FacebookAuthProvider()
    );
  }

  deleteUser(uid: string) {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.restApi}/${uid}`)
        .toPromise()
        .then(res => {
          resolve();
        })
        .catch(e => {
          this.handleError(e);
        });
    })
  }

  public handleError(error):void {
    let err = null;
    if (error.error) {
      err = error.error.error
    } else {
      err = error.code;
    }
    switch (err) {
      case 'code/other-user-code':
        error = 'El codigo ingresado ya ha sido usado por otro usuario.';
        break;
      case 'code/not-exist':
        error = 'El codigo ingresado no existe. Compruebalo e intenta de nuevo';
        break;
      case 'auth/invalid-email':
        error = 'Ingrese un correo valido';
        break;
      case 'auth/phone-number-already-exists':
        error = 'El numero de telefono que ingreso ya esta registrado';
        break;
      case 'auth/email-already-exists':
        error = 'El correo electrónico que ingreso ya esta registrado';
        break;
      case 'auth/email-already-in-use':
        error = 'El correo electrónico que ingreso ya esta registrado';
        break;
      case 'auth/docRegister':
        error = 'Hay un usuario con ese numero de identificación registrado';
        break;
      default:
        error = 'Error inesperado';
        break;
    }
    this.notifyProv.dismissLoader();
    this.notifyProv.showToast(error);
  }

  // listUsers(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.http.get(`${this.restApi}/users`)
  //       .toPromise()
  //       .then(res => {
  //         resolve(res);
  //       })
  //       .catch(error => {
  //         console.log(error);
  //       });
  //   });
  // }
}
