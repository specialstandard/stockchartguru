import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { AboutComponent } from './about/about.component';
import { DataResolver } from './app.resolver';
import { AndiamoComponent } from "./andiamo/andiamo.component";
import { InfoComponent } from "./info/info.component";
import { InfoDetailsComponent } from "./infoDetails/infoDetails.component";
import { SpeedReadingComponent } from "./speedRead/speedReading.component";

export const ROUTES: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'leaderboard', component: LeaderboardComponent },
    { path: 'about', component: AboutComponent },
    { path: 'info', component: InfoComponent },
    { path: 'info/:url', component: InfoDetailsComponent },
    { path: 'andiamo', component: AndiamoComponent },
    { path: 'speed-reading', component: SpeedReadingComponent },
    { path: '**', component: HomeComponent },
];
