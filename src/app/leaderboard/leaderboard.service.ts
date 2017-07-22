import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/Rx';
import * as moment from 'moment';
import { ScoreService } from "../score/score.service";

@Injectable()
export class LeaderboardService {

    public GAMENAME: string = 'stockChartGuru';
    public lastPostId: string = '';
    public localHighScore;
    public RESET_SCORE_VALUE: number = 36000;
    public URL_GET_HIGH_SCORES: string;
    public URL_POST_HIGH_SCORE: string;

    constructor(private http: Http, private scoreService: ScoreService) {
        this.setupEnvironment();
    }

    setupEnvironment() {
        if(this.isLocalhost()){ // Localhost
            this.URL_GET_HIGH_SCORES = 'http://stockchartguru.com/api/highScores';
            this.URL_POST_HIGH_SCORE = 'http://stockchartguru.com/api/submitScore';
        } else { // Production
            this.URL_GET_HIGH_SCORES = '/api/highScores';
            this.URL_POST_HIGH_SCORE = '/api/submitScore';
        }
    }

    isLocalhost(): boolean {
        return window.location.host.indexOf('localhost') > -1;
    }

    setLocalHighScore() {
        if (localStorage.getItem('stockChartGuru.localHighScore')) {
            this.localHighScore = JSON.parse(localStorage.getItem('stockChartGuru.localHighScore'))
        } else {
            this.localHighScore = {
                score: 36000,
                date: moment().format('MMMM Do YYYY, H:mm')
            }
        }
        if (this.scoreService.accountValue > this.localHighScore.score) {
            this.localHighScore = {
                score: this.scoreService.accountValue,
                date: moment().format('MMMM Do YYYY, H:mm')
            }
            localStorage.setItem('stockChartGuru.localHighScore', JSON.stringify(this.localHighScore))
        }
    }

    resetLocalHighScore() {
        this.localHighScore = {
            score: this.RESET_SCORE_VALUE,
            date: moment().format('MMMM Do YYYY, H:mm')
        }
        localStorage.setItem('stockChartGuru.localHighScore', JSON.stringify(this.localHighScore))
    }

    getHighScores(): Observable<any> {
        let body = {
            gameName: this.GAMENAME
        }
        return this.http.post(this.URL_GET_HIGH_SCORES, body)
            .map(r => r.json())
    }

    postScore(score: number, date: moment.Moment, name: string): Observable<any> {
        console.log(`score: ${score}. date: ${date}`);
        const body = {
            date,
            gameName: this.GAMENAME,
            _id: this.lastPostId,
            score,
            name
        }
        return this.http.post(this.URL_POST_HIGH_SCORE, body)
            .map(r => r.json())
            .do((x) => {
                this.lastPostId = x._id
            })
    }

    // removeHighScore(): Observable<any> {
    //     const url: string = 'http://52.40.114.1/leaderboard/removeHighScore';
    //     let body = {
    //         gameName: this.GAMENAME
    //     }
    //     return this.http.post(url, body)
    //         .map(r => r.json())
    // }
    
    dateFromObjectId = function (objectId) {
        return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
    };
}
