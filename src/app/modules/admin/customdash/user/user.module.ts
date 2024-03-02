import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedModule } from 'app/shared/shared.module';
import { UserComponent } from 'app/modules/admin/customdash/user/user.component';
import { userRoutes } from 'app/modules/admin/customdash/user/user.routing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseHighlightModule } from '@fuse/components/highlight';
import { UserListComponent } from './list/list.component';
import { UserDetailsComponent } from './details/details.component';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { UserEditComponent } from './edit/edit.component';
import { UserAddComponent } from './add/add.component';

@NgModule({
    declarations: [
        UserComponent,
        UserListComponent,
        UserDetailsComponent,
        UserEditComponent,
        UserAddComponent
    ],
    imports     : [
        RouterModule.forChild(userRoutes),
        MatButtonModule,
        MatButtonToggleModule,
        MatIconModule,
        MatMenuModule,
        MatSortModule,
        MatTableModule,
        MatFormFieldModule,
        MatTabsModule,
        TranslocoModule,
        SharedModule,
        MatChipsModule,
        MatDatepickerModule,
        MatInputModule,
        MatSelectModule,
        FuseHighlightModule,
        MatSidenavModule,
        MatRippleModule,
        MatProgressBarModule,
        MatDividerModule,
        MatCheckboxModule,
        MatMomentDateModule,
        MatRadioModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        MatPaginatorModule
    ]
})
export class UserModule
{
}
