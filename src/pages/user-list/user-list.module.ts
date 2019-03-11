import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserListPage } from './user-list';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {PipesModule} from "../../pipes/pipes.module";

@NgModule({
  declarations: [
    UserListPage,
  ],
  imports: [
    IonicPageModule.forChild(UserListPage),
    NgxDatatableModule,
    PipesModule
  ],
})
export class UserListPageModule {}
