import { Component, ViewEncapsulation } from '@angular/core';
import { FacebookService, LoginResponse, InitParams } from "ngx-facebook/dist/esm";

/**
 * This class represents the toolbar component.
 */
@Component({
    //moduleId: module.id,
    selector: 'sd-toolbar',
    templateUrl: 'toolbar.component.html',
    styleUrls: ['toolbar.component.scss'],
    //encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent {

    initParams: InitParams = { // For Facebook
        //appId: '1846116319035890', // Prod
        appId: '330818054025918', // Test App
        xfbml: true,
        version: 'v2.8'
    };

    constructor(private fbService: FacebookService) {
        this.fbService.init(this.initParams);
    }

    loginWithFacebook(): void {
        this.fbService.login()
        .then((response: LoginResponse) => console.log(response))
        .catch((error: any) => console.error(error));
    }
}

