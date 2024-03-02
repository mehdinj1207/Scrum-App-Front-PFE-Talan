import { LOCALE_ID, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { projectRoutes } from 'app/modules/admin/customdash/project/project.routing';
import { ProjectComponent } from 'app/modules/admin/customdash/project/project.component';
import { ProjectListComponent } from 'app/modules/admin/customdash/project/crud-project/list/list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AddProjectComponent } from './crud-project/add-project/add-project.component'; 
import { FuseCardModule } from '@fuse/components/card';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { EditProjectComponent } from './crud-project/edit-project/edit-project.component'; 
import { MatRippleModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { DetailsProjectComponent } from './crud-project/details-project/details-project.component';
import { ProjectContentComponent } from './ressources-sprints/project-content/project-content.component'; 
import { ResourceAffectationComponent } from './ressources-sprints/resource-affectation/resource-affectation.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ProjectMembersComponent } from './crud-project/project-members/project-members.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { OneMemberComponent } from './ressources-sprints/one-member/one-member.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SprintAddComponent } from './ressources-sprints/crud-sprint/add-sprint/add-sprint.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { SprintEditComponent } from './ressources-sprints/crud-sprint/edit-sprint/edit-sprint.component';
import { BacklogListComponent } from './backlog/list-backlog/list-backlog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatRadioModule } from '@angular/material/radio';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AddTaskComponent } from './backlog/list-backlog/add-task/add-task/add-task.component';
import { DetailsTaskComponent } from './backlog/list-backlog/details-task/details-task/details-task.component';
import { EditTaskComponent } from './backlog/list-backlog/edit-task/edit-task/edit-task.component';
import { TicketAssignmentComponent } from './backlog/list-backlog/ticket-assignment/ticket-assignment.component';


@NgModule({
    declarations: [
        ProjectComponent,
        ProjectListComponent,
        AddProjectComponent,
        EditProjectComponent,
        DetailsProjectComponent,
        ProjectContentComponent,
        ResourceAffectationComponent,
        ProjectMembersComponent,
        OneMemberComponent,
        SprintAddComponent,
        SprintEditComponent,
        BacklogListComponent,
        AddTaskComponent,
        DetailsTaskComponent,
        EditTaskComponent,
        TicketAssignmentComponent
    ],
    imports     : [
        RouterModule.forChild(projectRoutes),
        DragDropModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        MatTabsModule,
        FuseCardModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        ScrollingModule,
        MatPaginatorModule,
        MatMenuModule,
        MatDividerModule,

        
        MatCheckboxModule,
        MatMomentDateModule,
        MatRadioModule,
        MatRippleModule,
    ],
    
})
export class ProjectModule
{
}
