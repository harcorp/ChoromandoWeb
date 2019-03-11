import { NgModule } from '@angular/core';
import { CodeNamePipe } from './code-name/code-name';
import { UserEmailPipe } from './user-email/user-email';
@NgModule({
	declarations: [CodeNamePipe,
    UserEmailPipe],
	imports: [],
	exports: [CodeNamePipe,
    UserEmailPipe]
})
export class PipesModule {}
