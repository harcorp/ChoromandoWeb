import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CodeAddPage } from './code-add';

@NgModule({
  declarations: [
    CodeAddPage,
  ],
  imports: [
    IonicPageModule.forChild(CodeAddPage),
  ],
})
export class CodeAddPageModule {}
