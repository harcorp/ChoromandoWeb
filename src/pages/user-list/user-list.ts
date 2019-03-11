import { Component } from '@angular/core';
import {AlertController, IonicPage, ModalController, NavController, NavParams} from 'ionic-angular';
import {User} from "../../models/user";
import {AuthProvider} from "../../providers/auth/auth";
import {NotifyProvider} from "../../providers/notify/notify";
import {AngularFirestore} from "@angular/fire/firestore";
import {USER_ADD_PAGE, USER_EDIT_PAGE} from "../pages.constants";

@IonicPage()
@Component({
  selector: 'page-user-list',
  templateUrl: 'user-list.html',
})
export class UserListPage {

  tablestyle = 'bootstrap';
  users: Array<User>;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private authService: AuthProvider,
              private notifyService: NotifyProvider,
              private afs: AngularFirestore,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController) {

    this.afs.collection<User>('users', ref => ref.where('role', '==', 1)).valueChanges().subscribe(users => {
      this.users = users;
    });

  }

  addUser() {
    let generateModal = this.modalCtrl.create(USER_ADD_PAGE);
    generateModal.present();
  }

  editUser(uid: string) {
    let generateModal = this.modalCtrl.create(USER_EDIT_PAGE, { uid: uid });
    generateModal.present();
  }

  deleteUser(uid: string) {
    const dialogRef = this.alertCtrl.create({
      title: 'Eliminar Usuario',
      message: '¿Esta seguro que desea eliminar este usuario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.notifyService.showToast('No se elimino el usuario');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.notifyService.showLoader('Eliminando...');
            this.authService.deleteUser(uid).then(res => {
              this.notifyService.dismissLoader();
              this.notifyService.showToast('Usuario Eliminado');
            });
          }
        }
      ]
    });
    dialogRef.present();
  }

}
