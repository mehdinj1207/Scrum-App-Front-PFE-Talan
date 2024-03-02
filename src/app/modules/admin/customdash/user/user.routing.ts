import { Route } from '@angular/router';
import { UserComponent } from 'app/modules/admin/customdash/user/user.component';
import { UserDataResolver, UserResolver, UsersCountriesResolver, UserUserResolver } from 'app/modules/admin/customdash/user/user.resolvers';
import { UserAddComponent } from './add/add.component';
import { UserDetailsComponent } from './details/details.component';
import { UserEditComponent } from './edit/edit.component';
import { UserListComponent } from './list/list.component';
import { CanDeactivateUserAdd, CanDeactivateUserDetails, CanDeactivateUserEdit } from './user.guards'; 

export const userRoutes: Route[] = [
    {
        path     : '',
        component: UserComponent,
        resolve  : {
            data: UserResolver
        }
        ,
        children : [
            {
                path     : '',
                component: UserListComponent,
                resolve  : {
                    users    : UserResolver,
                    data: UserDataResolver,
                    departments : UserUserResolver
                },
                children : [
                    {
                        path         : 'user-detail',
                        component    : UserDetailsComponent,
                        canDeactivate: [CanDeactivateUserDetails]
                    },
                    {
                        path         : 'user-edit',
                        component    : UserEditComponent,
                        resolve      : {
                            departments : UserUserResolver,
                            data   : UserDataResolver,
                            countries: UsersCountriesResolver
                        },
                        canDeactivate: [CanDeactivateUserEdit]
                    },
                    {
                        path         : 'user-add',
                        component    : UserAddComponent,
                        resolve      : {
                            departments : UserUserResolver,
                            data   : UserDataResolver,
                            countries: UsersCountriesResolver
                        },
                        canDeactivate: [CanDeactivateUserAdd]
                    }
                ]
            }
        ]
    }
];

