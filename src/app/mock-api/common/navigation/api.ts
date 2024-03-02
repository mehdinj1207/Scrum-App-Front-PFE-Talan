import { ChangeDetectorRef, Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { compactNavigation, defaultNavigation, futuristicNavigation, horizontalNavigation } from 'app/mock-api/common/navigation/data';

@Injectable({
    providedIn: 'root'
})
export class NavigationMockApi {

    userRole: string = localStorage.getItem('userRole')
    private readonly _compactNavigation: FuseNavigationItem[] = compactNavigation;
    private  _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    private readonly _defaultNavigationByRole: FuseNavigationItem[] = defaultNavigation;

    private readonly _futuristicNavigation: FuseNavigationItem[] = futuristicNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] = horizontalNavigation;

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService,) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        // -----------------------------------------------------------------------------------------------------
        // @ Navigation - GET
        // -----------------------------------------------------------------------------------------------------

        // Fill default navigation according to current role

        if (this.userRole === 'Human Ressources') {
            // Find the Personal Dashboards group item
            const personalDashboardsGroup = this._defaultNavigation.find(item => item.id === 'personaldashboards');

            // Find the Projects menu item
            const projectsMenuItem = personalDashboardsGroup.children.find(item => item.id === 'dashboards.projects');

            // Remove the Projects menu item from the list of children
            personalDashboardsGroup.children = personalDashboardsGroup.children.filter(item => item.id !== 'dashboards.projects' && item.id !== 'dashboards.calendar' );
        }

        if (this.userRole == null){
        
            setTimeout(() => {
                window.location.reload()
              }, 100);
        
        }
        else{
        this._fuseMockApiService
            .onGet('api/common/navigation')
            .reply(() => {

                // Fill compact navigation children using the default navigation
                this._compactNavigation.forEach((compactNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if (defaultNavItem.id === compactNavItem.id) {
                            compactNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Fill futuristic navigation children using the default navigation
                this._futuristicNavigation.forEach((futuristicNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if (defaultNavItem.id === futuristicNavItem.id) {
                            futuristicNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Fill horizontal navigation children using the default navigation
                this._horizontalNavigation.forEach((horizontalNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if (defaultNavItem.id === horizontalNavItem.id) {
                            horizontalNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });



                // Return the response
                return [
                    200,
                    {
                        compact: cloneDeep(this._compactNavigation),
                        default: cloneDeep(


                            this._defaultNavigation

                        ),
                        futuristic: cloneDeep(this._futuristicNavigation),
                        horizontal: cloneDeep(this._horizontalNavigation)
                    }
                ];
            });
        }




    }
}
