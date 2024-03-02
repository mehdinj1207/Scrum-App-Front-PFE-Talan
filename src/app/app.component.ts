import { ChangeDetectorRef, Component } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { UserService } from './modules/admin/customdash/user/user.service';
import { User as User2 } from 'app/modules/admin/customdash/user/User';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public static urlProjet = 'http://localhost:8090';
    isLoading = true;
    public currentUser: User2 = new User2();
    /**
     * Constructor
     */
    constructor(private keycloakService: KeycloakService, 
        private userService: UserService,
        private _changeDetectorRef: ChangeDetectorRef) {
           localStorage.setItem('token',this.keycloakService.getKeycloakInstance().token);
        this.keycloakService.loadUserProfile().then(profile => {
            localStorage.setItem("username", profile.firstName + ' ' + profile.lastName)
            localStorage.setItem("email", profile.email)
            localStorage.setItem("keycloakUsername", profile.username)
        

            this.userService.getUserByEmail2(profile.email).subscribe((user: User2) => {
                this.currentUser = user;
                localStorage.setItem("userRole", user.role.toString())
                localStorage.setItem("userDepartement", user.department.name.toString())
                localStorage.setItem("idCurrentUser", user.idUser.toString())
                // Mark for check
                this._changeDetectorRef.markForCheck();
            })
        })
        this.keycloakService.getToken().then(token => {
            localStorage.setItem("token", token);
          });
          
          
        

    }

    ngOnInit() {
        this.userService.loggedIn().subscribe(
            data=>{
               
            }
          )
     

    }   
    
}
