import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/Rx';
import * as moment from 'moment';
import { ScoreService } from "../score/score.service";
import * as cryptojs from 'crypto-js';
import * as circularjson from 'circular-json'

@Injectable()
export class LeaderboardService {

    public GAMENAME: string = 'stockChartGuru';
    public lastPostId: string = '';
    public localHighScore;
    public RESET_SCORE_VALUE: number = 36000;
    public URL_GET_HIGH_SCORES: string;
    public URL_POST_HIGH_SCORE: string;

    constructor(public http: Http, public scoreService: ScoreService) {
        this.setupEnvironment();
        this.setupLastPostId();
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
                date: moment().format('MMM D YYYY, H:mm')
            }
        }
        if (this.scoreService.accountValue > this.localHighScore.score) {
            this.localHighScore = {
                score: this.scoreService.accountValue,
                date: moment().format('MMM D YYYY, H:mm')
            }
            localStorage.setItem('stockChartGuru.localHighScore', JSON.stringify(this.localHighScore))
        }
    }

    resetLocalHighScore() {
        this.localHighScore = {
            score: this.RESET_SCORE_VALUE,
            date: moment().format('MMM D YYYY, H:mm')
        }
        localStorage.setItem('stockChartGuru.localHighScore', JSON.stringify(this.localHighScore))
        this.lastPostId = ''
        localStorage.setItem('stockChartGuru.lastPostId', JSON.stringify(this.lastPostId))
    }

    getHighScores(): Observable<any> {
        let body = {
            gameName: this.GAMENAME
        }
        return this.http.post(this.URL_GET_HIGH_SCORES, body)
            .map(r => r.json())
    }

    postScore(score: number, date: moment.Moment, name: string): Observable<any> {
        let nameCut = name.slice(0, 14);
        // console.log(`score: ${score}. date: ${date}`);
        var message = `${score}${nameCut}`
        var dateTimeStamp = cryptojs.MD5(message + 'function').toString();     
        const body = {
            date,
            gameName: this.GAMENAME,
            _id: this.lastPostId,
            score,
            name: nameCut,
            dateTimeStamp: dateTimeStamp
        }
        return this.http.post(this.URL_POST_HIGH_SCORE, body)
            .map(r => r.json())
            .do((x) => {
                if (x._id===undefined) {
                    this.lastPostId = ''
                } else {
                    this.lastPostId = x._id
                }
                localStorage.setItem('stockChartGuru.lastPostId', JSON.stringify(this.lastPostId))
            })
    }

    postTest(): Observable<any> {
    // Encrypt 
    // var ciphertext = cryptojs.AES.encrypt('my message', 'secret key 123');
    var ciphertext = cryptojs.MD5('my message', 'imbrianimamazing').toString();

    // Decrypt 
    // var bytes  = cryptojs.AES.decrypt(ciphertext.toString(), 'secret key 123');
    // var plaintext = bytes.toString(cryptojs.enc.Utf8);
        const body = {
            test: 'testtt',
            ciphertext: ciphertext
        }
        return this.http.post('http://stockchartguru.com/api/postTest', body)
            .map(r => r.json())           
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

    removeScore(score: number) {
        let obj = {score: score}
        return this.http.post('http://stockchartguru.com/api/andiamo', obj)
            .map(r => r.json())  
    }

    setupLastPostId() {
        if (localStorage.getItem('stockChartGuru.lastPostId') === undefined) {
            this.lastPostId = ''
            localStorage.setItem('stockChartGuru.lastPostId', JSON.stringify(this.lastPostId))
        } 
        if (localStorage.getItem('stockChartGuru.lastPostId')) {
            this.lastPostId = JSON.parse(localStorage.getItem('stockChartGuru.lastPostId'))
        }
    }
}
