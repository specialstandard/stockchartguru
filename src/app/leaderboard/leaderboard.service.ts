import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/Rx';
import * as moment from 'moment';
import { ScoreService } from "../score/score.service";

@Injectable()
export class LeaderboardService {

    public GAMENAME: string = 'stockChartGuru';
    public localHighScore;

    constructor(private http: Http, private scoreService: ScoreService){}

    setLocalHighScore(){
        if(localStorage.getItem('stockChartGuru.localHighScore')) {
            this.localHighScore = JSON.parse(localStorage.getItem('stockChartGuru.localHighScore'))
        } else {
            this.localHighScore = {
                score: 36000,
                date: moment().format('MMMM Do YYYY, h:mm:ss a')
            }
        }
        if( this.scoreService.accountValue > this.localHighScore.score){
            this.localHighScore = {
                score: this.scoreService.accountValue,
                date: moment().format('MMMM Do YYYY, h:mm:ss a')
            }
            localStorage.setItem('stockChartGuru.localHighScore', JSON.stringify(this.localHighScore))
        }
    }

    getHighScores(): Observable<any> {
        const url:string = 'http://52.40.114.1/leaderboard/highScores';
        let body =  {
            gameName: this.GAMENAME           
        }
        return this.http.post(url, body)
                .map(r => r.json())                    
    }

    postScore( score:number, date: moment.Moment ): Observable<any> {
        console.log(`score: ${score}. date: ${date}`);
        const url:string = 'http://52.40.114.1/leaderboard/submitScore';
        let body =  {
            gameName: this.GAMENAME,
            score,
            date
        }
        return this.http.post(url, JSON.stringify(body))
                .map(r => r.json())                    
    }

    removeHighScore(): Observable<any> {
        const url:string = 'http://52.40.114.1/leaderboard/removeHighScore';
        let body =  {
            gameName: this.GAMENAME           
        }
        return this.http.post(url, body)
                .map(r => r.json())                    
    }
}
