import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule, ApplicationRef } from '@angular/core';
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr';
import { RouterModule, PreloadAllModules } from '@angular/router';

import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
import { ChartModule } from 'angular2-chartjs';

import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { HomeComponent } from './home';
import { AboutComponent } from './about/about.component';
import { AndiamoComponent } from "./andiamo/andiamo.component";
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { LeaderboardService } from './leaderboard/leaderboard.service';
import { ScoreService } from "./score/score.service";
import { SharedModule } from './shared/shared.module';

import { FacebookModule } from 'ngx-facebook';

import '../styles/styles.scss';
import '../styles/headings.css';
import { InfoComponent } from "./info/info.component";
import { InfoService } from "./info/info.service";
import { InfoDetailsComponent } from "./infoDetails/infoDetails.component";
import { SpeedReadingComponent } from "./speedRead/speedReading.component";

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
];

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    HomeComponent,
    LeaderboardComponent,
    AboutComponent,
    AndiamoComponent,
    InfoComponent,
    InfoDetailsComponent,
    SpeedReadingComponent
  ],
  /**
   * Import Angular's modules.
   */
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ChartModule,
    RouterModule.forRoot(ROUTES, { useHash: false, preloadingStrategy: PreloadAllModules }),
    FacebookModule.forRoot(),
    SharedModule.forRoot()
  ],
  /**
   * Expose our Services and Providers into Angular's dependency injection.
   */
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS,
    InfoService,
    LeaderboardService,
    ScoreService,
  ]
})
export class AppModule {

  constructor(
    public appRef: ApplicationRef,
  ) {}

}
