import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {Code} from "../../models/code";
import {NotifyProvider} from "../../providers/notify/notify";
import {AngularFirestore} from "@angular/fire/firestore";
import firebase from "firebase";
import 'firebase/firestore';
import {Angular5Csv} from "angular5-csv/Angular5-csv";

@IonicPage()
@Component({
  selector: 'page-code-generate',
  templateUrl: 'code-generate.html',
})
export class CodeGeneratePage {

  quantity: number;
  codigos: Code[] = [];
  generated = false;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private viewCtrl: ViewController,
              private notifyProv: NotifyProvider,
              private afs: AngularFirestore) {
  }

  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  generateCodes(): void {
    this.notifyProv.showLoader('Generando...');
    this.arrayCodes();
  }

  arrayCodes() {
    let i = 0;
    let batch = this.afs.firestore.batch();
    while(i < this.quantity) {
      let code = this.generateCode();
      let createDate = firebase.firestore.Timestamp.now();
      let createDateSeconds = createDate.seconds;
      let codeArray: Code = {
        code: code,
        createDate: createDate,
        updateDate: createDate,
        uidUser: null
      };
      let downloadCode: Code = {
        code: code,
        createDate: new Date(createDateSeconds * 1000),
        updateDate: new Date(createDateSeconds * 1000)
      };
      this.codigos.push(downloadCode);
      let uid = this.afs.createId();
      let codeDoc = this.afs.firestore.doc(`codes/${uid}`);
      batch.set(codeDoc, codeArray);
      i++;
    }
    this.notifyProv.dismissLoader();
    this.generated = true;
    batch.commit().then(res => {
      this.generated = true;
      this.notifyProv.dismissLoader();
      this.notifyProv.showToast('Codigos generados correctamente');
    });

  }

  generateCode() {
    let caracteres = 'abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ123467890';
    let contrasena = '';
    for (let i = 0; i < 11; i++) contrasena += caracteres.charAt(Math.floor(Math.random()*caracteres.length));
    return contrasena;
  }

  downloadCSV() {
    let options = {
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      useBom: true,
      headers: ["Codigo", "Fecha de Creación", "Fecha de Modificiación"]
    };
    new Angular5Csv(this.codigos, 'Lista de Codigos', options);
  }

}
