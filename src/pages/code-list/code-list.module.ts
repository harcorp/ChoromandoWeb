import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CodeListPage } from './code-list';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {PipesModule} from "../../pipes/pipes.module";

@NgModule({
  declarations: [
    CodeListPage,
  ],
  imports: [
    IonicPageModule.forChild(CodeListPage),
    NgxDatatableModule,
    PipesModule
  ],
})
export class CodeListPageModule {}
