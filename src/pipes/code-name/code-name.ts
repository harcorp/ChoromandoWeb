import { Pipe, PipeTransform } from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {Code} from "../../models/code";

/**
 * Generated class for the CodeNamePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'codeName',
})
export class CodeNamePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */

  constructor(private afs: AngularFirestore) {}
  transform(value: string, ...args) {
    if (value) {
      return new Promise(resolve => {
        this.afs.doc<Code>(`codes/${value}`).valueChanges().subscribe(val => {
          if (val) {
            resolve(val.code);
          }
        });
      });
    }
    return null;
  }
}
