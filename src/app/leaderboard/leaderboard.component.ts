import { Component, OnInit } from '@angular/core';
import { LeaderboardService } from './leaderboard.service';
import { ScoreService } from "../score/score.service";
import * as moment from 'moment';

@Component({
    selector: 'leaderboard',
    styleUrls: ['./leaderboard.component.scss'],
    templateUrl: './leaderboard.component.html'
})
export class LeaderboardComponent implements OnInit {
    
    constructor( private leaderboardService: LeaderboardService, private scoreService: ScoreService) { }
    
    NUM_SCORES_TO_SHOW: number = 10;
    highScores: any;
    highScoresToday: any;
    localHighScore: any;

    public ngOnInit() {
        this.getHighScores(this.NUM_SCORES_TO_SHOW);
        this.leaderboardService.setLocalHighScore();
        this.localHighScore = this.leaderboardService.localHighScore
        console.log('this.localHighScore', this.localHighScore)
        //this.localHighScore.date = this.localHighScore.date.format('MM/DD/YYYY')
    }

    getHighScores(limit: number) {
        this.leaderboardService.getHighScores()
            .subscribe((result) => {
                if(result.highScores) {
                    //this.highScores = result.highScores.slice(0, limit);
                    this.highScores = result.highScores;
                }
                this.highScores.map((item) => {
                    item.dateTime = moment(this.leaderboardService.dateFromObjectId(item._id));
                    item.dateTimeFormatted = item.dateTime.format('MMMM Do YYYY')
                    console.log('moment diff: ', +moment(moment().diff(moment(item.dateTime))).format('H').toString())
                })
                this.highScoresToday = this.highScores.filter((item) => {
                    return +moment(moment().diff(moment(item.dateTime))).format('H').toString() < 14 // Less than 24 hours ago
                })
                console.log(this.highScoresToday)
            });
    }

    // getHighScoresToday(limit: number) {
    //     this.leaderboardService.getHighScoresToday()
    //         .subscribe((result) => {
    //             if(result.highScores) {
    //                 this.highScores = result.highScores.slice(0, limit);
    //             }
    //         });
    // }

    postScore( score: number, date: moment.Moment) {
        //const date: moment.Moment = moment();
        this.leaderboardService.postScore( score, date)
            .subscribe((result) => {
                if(result.success) {
                    this.getHighScores(this.NUM_SCORES_TO_SHOW);
                }
            })
    }

    onClickSubmitScore() {
        this.postScore(this.localHighScore.score, this.localHighScore.date);
    }
    
    onClickResetLocalHighScore() {
        this.leaderboardService.resetLocalHighScore();
        this.localHighScore = this.leaderboardService.localHighScore
    }
    
    isNewHighScore(score: number, highScores: any): boolean {
        return highScores.some((highScore) => {
            return score > highScore.score;
        })
    }
}
