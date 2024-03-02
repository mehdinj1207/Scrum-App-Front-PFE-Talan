import { KeycloakService } from "keycloak-angular";

export function initializeKeycloak(keycloak: KeycloakService) {
    return () =>
      keycloak.init({
        config: {
          url: 'http://localhost:8180/auth',
          realm: 'scrumwise',
          clientId: 'scrumwise-angular'
        },
        initOptions: {
            /*checkLoginIframe:true,
            checkLoginIframeInterval:1*/
            onLoad: 'login-required',
            checkLoginIframe: false

        },
        loadUserProfileAtStartUp:true

      });
  }