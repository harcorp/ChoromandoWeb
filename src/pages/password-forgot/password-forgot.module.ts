import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PasswordForgotPage } from './password-forgot';

@NgModule({
  declarations: [
    PasswordForgotPage,
  ],
  imports: [
    IonicPageModule.forChild(PasswordForgotPage),
  ],
})
export class PasswordForgotPageModule {}
