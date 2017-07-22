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
    name: string = '';
    twitterLink: string;
    fbLink: string;

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
                    item.dateTimeFormatted = item.dateTime.format('MMM D YYYY')
                    console.log('moment diff: ', +moment(moment().diff(moment(item.dateTime))).format('H').toString())
                })
                this.highScoresToday = this.highScores.filter((item) => {
                    //return +moment(moment().diff(moment(item.dateTime))).format('H').toString() < 14 // Less than 24 hours ago
                    let now = moment();
                    let diff = moment.duration(now.diff(item.dateTime)).asHours();
                    console.log('diff ', diff)
                    return diff < 24; 
                })
                console.log(this.highScoresToday)
                this.makeSocialLinks();
            });
    }

    makeSocialLinks() {
        this.twitterLink = `http://twitter.com/share?text=I%20made%20$${this.localHighScore.score}%20on%20stockchartguru.com&url=http://stockchartguru.com&hashtags=stocks,trading,investing`
        this.fbLink = `https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fstockchartguru.com%2F&amp;src=sdkpreparse`;
    }

    // getHighScoresToday(limit: number) {
    //     this.leaderboardService.getHighScoresToday()
    //         .subscribe((result) => {
    //             if(result.highScores) {
    //                 this.highScores = result.highScores.slice(0, limit);
    //             }
    //         });
    // }

    postScore( score: number, date: moment.Moment, name: string) {
        //const date: moment.Moment = moment();
        this.leaderboardService.postScore( score, date, name)
            .subscribe((result) => {
                if(result.success) {
                    this.getHighScores(this.NUM_SCORES_TO_SHOW);
                }
            })
    }

    onClickSubmitScore() {
        this.postScore(this.localHighScore.score, this.localHighScore.date, this.name);
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
