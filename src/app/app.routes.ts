import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { AboutComponent } from './about/about.component';
import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'leaderboard', component: LeaderboardComponent },
    { path: 'about', component: AboutComponent },
    { path: '**', component: HomeComponent },
];
