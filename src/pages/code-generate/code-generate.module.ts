import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CodeGeneratePage } from './code-generate';

@NgModule({
  declarations: [
    CodeGeneratePage,
  ],
  imports: [
    IonicPageModule.forChild(CodeGeneratePage),
  ],
})
export class CodeGeneratePageModule {}
