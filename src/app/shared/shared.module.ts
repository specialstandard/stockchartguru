import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ToolbarComponent } from './toolbar/index';
import { NavbarComponent } from './navbar/index';
import { FacebookModule } from "ngx-facebook/dist/esm";
import { FooterComponent } from "./footer/footer.component";

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FacebookModule.forRoot()
    ],
    declarations: [
        ToolbarComponent,
        NavbarComponent,
        FooterComponent
    ],
    exports: [
        ToolbarComponent,
        NavbarComponent,
        FooterComponent,
        CommonModule,
        FormsModule,
        RouterModule
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule
        };
    }
}
