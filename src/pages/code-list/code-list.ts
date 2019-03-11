import { Component } from '@angular/core';
import {IonicPage, ModalController, NavController, NavParams} from 'ionic-angular';
import {Code} from "../../models/code";
import {AngularFirestore} from "@angular/fire/firestore";
import {CODE_ADD_PAGE, CODE_GENERATE_PAGE} from "../pages.constants";
import {Angular5Csv} from "angular5-csv/Angular5-csv";

@IonicPage()
@Component({
  selector: 'page-code-list',
  templateUrl: 'code-list.html',
})
export class CodeListPage {

  codes: Array<Code>;
  tablestyle = 'bootstrap';
  limit: number = 10;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private modalCtrl: ModalController,
              private afs: AngularFirestore) {
  }

  ionViewDidLoad() {
    this.afs.collection<Code>('codes').valueChanges().subscribe(codes => {
      this.codes = codes;
    });
  }



  goToGenerate() {
    let generateModal = this.modalCtrl.create(CODE_GENERATE_PAGE);
    generateModal.present();
  }

  addCode() {
    let addCodeModal = this.modalCtrl.create(CODE_ADD_PAGE);
    addCodeModal.present();
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

    let codes = this.codes.map(code => {
        return {
          code: code.code,
          createdAt: code.createDate.toDate(),
          updatedAt: code.updateDate.toDate()
        }
    });
    new Angular5Csv(codes, 'Lista de Codigos', options);
  }

}
