import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { FuseValidators } from '@fuse/validators';
import { UserService } from 'app/modules/admin/customdash/user/user.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
    selector: 'settings-security',
    templateUrl: './security.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSecurityComponent implements OnInit {

    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

    securityForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _httpClient: HttpClient,
        private keycloakService: KeycloakService,
        private userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.securityForm = this._formBuilder.group({
            newPassword: ['', Validators.required],
            newPasswordRetype: ['', Validators.required]

        },
            {
                validators: FuseValidators.mustMatch('newPassword', 'newPasswordRetype')
            }


        );
    }

    passwordSecurityPass(myString: string): boolean {
        const regex = new RegExp("^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,24}$");
        return regex.test(myString);
    }

    updatePassword() {
        var username = localStorage.getItem('keycloakUsername')

        try {
            this.userService.changePassword(username, this.securityForm.value.newPassword).subscribe(
                data => {
                    this.keycloakService.logout()
                },
                error => { console.log('Error Changing password'); }
            );

        }
        catch {
            console.log("error changing password")
        }


    }
}
