import { Pipe, PipeTransform } from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {User} from "../../models/user";

/**
 * Generated class for the UserEmailPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'userEmail',
})
export class UserEmailPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  constructor(private afs: AngularFirestore) {
  }

  transform(value: string, ...args) {
    if (value) {
      return new Promise(resolve => {
        this.afs.doc<User>(`users/${value}`).valueChanges().subscribe(val => {
          if (val) {
            resolve(val.email);
          }
        });
      });
    }
    return null;
  }
}
