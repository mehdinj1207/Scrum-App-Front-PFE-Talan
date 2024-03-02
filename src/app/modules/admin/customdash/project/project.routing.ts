import { Route } from '@angular/router';
import { ProjectComponent } from 'app/modules/admin/customdash/project/project.component';
import { ProjectListComponent } from 'app/modules/admin/customdash/project/crud-project/list/list.component';

import { ProjectsResolver, ProjectsStatusResolver, TicketsPriorityResolver, TicketsTypeResolver, TicketsStatusResolver, EpicResolver } from 'app/modules/admin/customdash/project/project.resolvers';
import { SprintAddComponent } from './ressources-sprints/crud-sprint/add-sprint/add-sprint.component';
import { CanDeactivateAddSprint, CanDeactivateAddTask, CanDeactivateDetailsTask, CanDeactivateEditSprint, CanDeactivateEditTask } from './project.guards';
import { ProjectContentComponent } from './ressources-sprints/project-content/project-content.component';
import { SprintEditComponent } from './ressources-sprints/crud-sprint/edit-sprint/edit-sprint.component';
import { BacklogListComponent } from './backlog/list-backlog/list-backlog.component';
import { EditTaskComponent } from './backlog/list-backlog/edit-task/edit-task/edit-task.component';
import { AddTaskComponent } from './backlog/list-backlog/add-task/add-task/add-task.component';
import { TasksDetailsComponent } from '../../apps/tasks/details/details.component';
export const projectRoutes: Route[] = [

    {
        path: '',
        component: ProjectComponent,
        resolve: {
            projects: ProjectsResolver,
            projectsStatus: ProjectsStatusResolver,
        }
        ,
        children: [
            {
                path: '',
                component: ProjectListComponent,
                resolve: {
                    projects: ProjectsResolver,
                    projectsStatus: ProjectsStatusResolver,
                }
            },
            {
                path: 'project-content',
                component: ProjectContentComponent,
                resolve: {
                    projects: ProjectsResolver,
                }
                , children: [
                    {
                        path: 'sprint-add',
                        component: SprintAddComponent,
                        canDeactivate: [CanDeactivateAddSprint]
                    },
                    {
                        path: 'sprint-edit',
                        component: SprintEditComponent,
                        canDeactivate: [CanDeactivateEditSprint]
                    }
                ]
            },
            {
                path: 'backlog',
                component: BacklogListComponent,
                resolve: {
                },
                children: [
                    {
                        path: 'task-add',
                        component: AddTaskComponent,
                        canDeactivate: [CanDeactivateAddTask],
                        resolve : {
                            priorities : TicketsPriorityResolver,
                            types   : TicketsTypeResolver,
                            status: TicketsStatusResolver,
                            epic: EpicResolver
                        }

                    },
                    {
                        path: 'task-edit',
                        component: EditTaskComponent,
                        canDeactivate: [CanDeactivateEditTask],
                        resolve : {
                            priorities : TicketsPriorityResolver,
                            types   : TicketsTypeResolver,
                            status: TicketsStatusResolver,
                            epic: EpicResolver
                        }
                    },
                    {
                        path: 'task-details',
                        component: TasksDetailsComponent,
                        canDeactivate: [CanDeactivateDetailsTask]
                    }

                ]
            }
        ]
    }
];


