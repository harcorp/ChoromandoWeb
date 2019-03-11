import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Code} from "../../models/code";
import {AngularFirestore} from "@angular/fire/firestore";
import {NotifyProvider} from "../../providers/notify/notify";
import firebase from "firebase";

@IonicPage()
@Component({
  selector: 'page-code-add',
  templateUrl: 'code-add.html',
})
export class CodeAddPage {

  codeForm: FormGroup;
  code: Code;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private formBuilder: FormBuilder,
              private afs: AngularFirestore,
              private notifyProv: NotifyProvider,
              private viewCtrl: ViewController) {

    this.codeForm = this.formBuilder.group({
      'code' : ['', Validators.required]
    });

  }

  submit() {
    this.notifyProv.showLoader('Creando...');
    let createDate = firebase.firestore.Timestamp.now();
    this.code = this.codeForm.value;
    this.code.createDate = createDate;
    this.code.updateDate = createDate;
    this.code.uidUser = null;
    this.afs.collection('codes').add(this.code).then(res => {
      this.notifyProv.dismissLoader();
      this.notifyProv.showToast('Codigo generado correctamente.');
      this.viewCtrl.dismiss();
    })
      .catch(error => {
        this.notifyProv.dismissLoader();
        this.notifyProv.showToast('No se pudo crear el codigo. Intente de nuevo');
      });
  }

}
