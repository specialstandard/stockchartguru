declare var CanvasJS: any;
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ScoreService } from "../score/score.service";
import { Http } from "@angular/http";
import 'rxjs/Rx';
import { SP500 } from './sp500'
import { LeaderboardService } from "../leaderboard/leaderboard.service";
import * as moment from 'moment';

@Component({
    selector: 'home',
    styleUrls: ['./home.component.scss'],
    templateUrl: './home.component.html',
    //encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
    constructor(private http: Http, private scoreService: ScoreService, private leaderboardService: LeaderboardService) { }

    accountValue: number;
    accountValueTmp: number = 0;
    activeLong: boolean = false;
    activePosition: boolean = false;
    activeShort: boolean = false;
    APY: number = 0;
    averageDaysPerTrade: number = 0;
    averagePercentPerLoss: number = 0;
    averagePercentPerWin: number = 0;
    chart: any = null;
    currentPrice: number;
    currentPriceHigh: number = 0;
    currentPriceLow: number = 0;
    currentPriceOpen: number = 0;
    currentSP500Index: number = -1;
    dataPoints: any[] = [];
    daysInTrade: number = 0;
    daysToTest: number = 252;
    entryPrice: number = 0;
    entryEquityValue: number = 0;
    equity: any;
    equityValue: number = 0;
    index: number;
    isBatch: boolean = false;
    isLoading: boolean = false;
    lastStockSymbol: string = '';
    lastStockYear: string = '';
    lossProfitBucket: number = 0;
    maxDesiredDaysInTrade: number = 40;
    maxStockPrice: number = 40;
    minStockPrice: number = 2;
    numLost: number = 0;
    numOfTrades: number = 0;
    numShares: number = 0;
    numWon: number = 0;
    profit: number;
    profitLimitTriggered: boolean = false;
    profitPercentHigh: number = 0;
    showStatsModal: boolean = false;
    sp500: string[] = SP500;
    startingAccountValue: number = 36000;
    stock: any;
    stockArr: string[];
    stopLossPercent: number = 11;
    stopWinPercent: number = .5;
    symbol: string;
    takeProfit: number = .8;
    totalDaysInTrade: number = 0;
    totalProfit: number = 0;
    winProfitBucket: number = 0;

    public ngOnInit() {
        console.log('this.scoreService.accountValue: ', this.scoreService.accountValue)
        if( this.scoreService.accountValue < this.startingAccountValue){
            this.scoreService.accountValue = this.startingAccountValue;
        }
        this.averageDaysPerTrade = 0;
        this.initChart()
    }

    onClickNextChart() {
        this.lastStockSymbol = this.symbol;
        this.lastStockYear = moment(this.dataPoints[this.dataPoints.length-1].x).format('MMM YYYY')
        this.initChart();
    }

    initChart() {     
        this.accountValueTmp = this.scoreService.accountValue;
        if ( this.activeLong ) {
            this.profit = this.round(((this.currentPrice - this.entryPrice) / this.entryPrice) * 100);
            this.sellToClose( this.profit );
        } else if ( this.activeShort) {
            this.buyToCover();
        }
        this.entryPrice = 0;
        this.entryEquityValue = 0;
        this.currentPrice = 0;
        this.daysInTrade = 0;
        this.profit = 0;
        this.profitLimitTriggered = false;
        if (this.chart) {
            this.chart = null;
        }
        this.dataPoints = [];
        this.symbol = this.getRandomSymbol()
        //this.symbol = 'COG' // Select particular stock symbol
        console.log('symbol', this.symbol);        
        this.getEquity()
    }

    buy() {
        let closePrice = this.dataPoints[this.dataPoints.length - 1].y[3]
        this.entryPrice = closePrice;
        this.equityValue = this.scoreService.accountValue;
        this.numShares = this.scoreService.accountValue / closePrice;
        this.entryEquityValue = this.numShares * this.entryPrice;
        this.activePosition = true;
        this.activeLong = true;
        this.advanceChart()
    }

    short() {
        let closePrice = this.dataPoints[this.dataPoints.length - 1].y[3]
        this.entryPrice = closePrice;
        this.numShares = this.scoreService.accountValue / closePrice;
        this.entryEquityValue = this.numShares * this.entryPrice;
        this.activePosition = true;
        this.activeShort = true;
        this.advanceChart()
    }

    advanceChart() {
        if (this.stockArr[this.index]) {
            this.dataPoints.shift()
            this.dataPoints.push(
                {
                    x: new Date(this.stockArr[this.index][0]),
                    y: [
                        this.round(+this.stockArr[this.index][1]),
                        this.round(+this.stockArr[this.index][2]),
                        this.round(+this.stockArr[this.index][3]),
                        this.round(+this.stockArr[this.index][4])
                    ]
                }
            )
            // Check and handle stock split:
            let stockPriceRatio = this.dataPoints[this.dataPoints.length-2].y[3] / this.dataPoints[this.dataPoints.length-1].y[0]
            if (stockPriceRatio > 1.9 && stockPriceRatio < 2.1) { // Stock probably split in half so double the number of shares held.
                this.numShares = this.numShares * 2;
            }
            this.index++
            this.update(this.dataPoints[this.dataPoints.length - 1]);
            this.showChart()
            console.log('lastDataPoint', this.dataPoints[this.dataPoints.length-1])
        }
    }

    update( dataPoint: any ) {
        if( isNaN(dataPoint.y[0])) {
            this.initChart();
        }
        this.currentPrice = dataPoint.y[3];
        this.currentPriceLow = dataPoint.y[2];
        this.currentPriceHigh = dataPoint.y[1];
        this.currentPriceOpen = dataPoint.y[0];
        let isAutomated = false;
        
        if (this.activeLong) {
            this.currentPriceHigh = dataPoint.y[1];
            //let lowProfit = this.round(((dataPoint.y[2] - this.entryPrice) / this.entryPrice) * 100);
            this.daysInTrade += 1;
            this.equityValue = (this.numShares * dataPoint.y[3])
            this.profit = this.round(((this.equityValue - this.entryEquityValue) / this.entryEquityValue) * 100);
            this.scoreService.accountValue = Math.round(this.equityValue);
        } else if (this.activeShort) {
            this.updateShort(dataPoint, this.dataPoints[this.dataPoints.length - 2])
        }
    }

    updateShort( dataPoint: any, lastDataPoint: any ) {
        this.daysInTrade += 1;
        this.equityValue = (this.numShares * dataPoint.y[3])
        this.profit = this.round(-((this.equityValue - this.entryEquityValue) / this.entryEquityValue) * 100 );
        if ( this.profit > this.profitPercentHigh ) {
            this.profitPercentHigh = this.profit;
        }
        this.scoreService.accountValue = this.entryEquityValue + Math.round(this.entryEquityValue - this.numShares * dataPoint.y[3]);
    }

    sellToClose(profit: number){
        this.profit = profit;
        if ( profit > 0 ){
            this.numWon++;
            this.winProfitBucket += this.profit;
        } else if ( profit <= 0) {
            this.numLost++;
            this.lossProfitBucket += this.profit;
        }
        this.leaderboardService.setLocalHighScore();
        this.equityValue = 0;
        this.numShares = 0;
        this.activePosition = false;
        this.activeLong = false;
        this.profitPercentHigh = 0;
        this.totalDaysInTrade += this.daysInTrade;
        this.totalProfit = (this.scoreService.accountValue - this.startingAccountValue) / this.startingAccountValue;
        this.APY = 100 * ( this.totalProfit / this.totalDaysInTrade ) * 252;
        this.numOfTrades++;
        this.averagePercentPerWin = this.winProfitBucket / this.numWon;
        this.averagePercentPerLoss = this.lossProfitBucket / this.numLost;

        this.averageDaysPerTrade = this.totalDaysInTrade/this.numOfTrades;
        let n = 252/this.averageDaysPerTrade;
        let A = this.scoreService.accountValue;
        let t = this.totalDaysInTrade/252;
        let P = this.startingAccountValue;
        this.APY = 100 * n * ( Math.pow( 10, (Math.log10(A/P) / (n*t) ) ) - 1 )
    }

    buyToCover() {
        this.leaderboardService.setLocalHighScore();
        this.equityValue = 0;
        this.numShares = 0;
        this.activePosition = false;
        this.activeShort = false;
        this.profitPercentHigh = 0;
        this.totalDaysInTrade += this.daysInTrade;
        this.totalProfit = (this.scoreService.accountValue - this.startingAccountValue) / this.startingAccountValue;
        this.APY = 100 * ( this.totalProfit / this.totalDaysInTrade ) * 252;
        this.numOfTrades++;
        this.averageDaysPerTrade = this.totalDaysInTrade/this.numOfTrades;
        let n = 252/this.averageDaysPerTrade;
        let A = this.scoreService.accountValue;
        let t = this.totalDaysInTrade/252;
        let P = this.startingAccountValue;
        this.APY = 100 * n * ( Math.pow( 10, (Math.log10(A/P) / (n*t) ) ) - 1 )
    }
    getEquity() {
        this.isLoading = true;
        this.http.get('./assets/stocks/' + this.symbol + '.json')
            .map(r=>r.json())
            .subscribe((result) => {
                if ( result ) {
                    //console.log('result', result)
                    this.equity = result;
                    //console.log('this.equity', this.equity)
                    this.index = this.getRandom( 120, this.equity.length - 200); //random start day up until 200 days ago.
                    this.isLoading = false;
                    this.processData(this.equity);
                } else {
                    this.initChart();
                }
            },(err) => {
                this.initChart()
            });
    }

    processData(result: any) {
        this.stockArr = result;
        for (var i = this.index - 120; i < this.index; i++) {
            this.dataPoints.push(
                {
                    x: new Date(this.stockArr[i][0]),
                    y: [
                        this.round(+this.stockArr[i][1]),
                        this.round(+this.stockArr[i][2]),
                        this.round(+this.stockArr[i][3]),
                        this.round(+this.stockArr[i][4])
                    ]
                }
            )
        }
        this.showChart();
    }

    public showChart() {
        this.chart = new CanvasJS.Chart("chartContainer",
            {
                title: {
                    text: "",
                },
                exportEnabled: false,
                axisY: {
                    includeZero: false,
                    prefix: "$",
                },
                axisX: {
                    valueFormatString: "DD-MMM",
                },
                data: [
                    {
                        type: "candlestick",
                        dataPoints: this.dataPoints
                        
                        // dataPoints: [
                        //   {x: new Date('1970-01-01'), y:[99.91, 100.15, 99.33, 99.61]},
                        //   {x: new Date('1970-01-02'), y:[100.12, 100.45, 99.28, 99.51]},
                        //   {x: new Date('1970-01-03'), y:[99.28, 100.36, 99.27, 99.79]}                          
                        // ]                     
                    }
                ]
            });
        //console.log('dataPoints before chart.render: ', this.dataPoints)
            this.chart.render();
    }
        
    round(num: number) {
        return Math.round(num * 100) / 100;
    }
        //   between (min, max) ... (inclusive,exclusive)
    getRandom(min: any, max: any) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    
    getRandomSymbol(): string {
        let symbol = this.sp500[Math.floor(Math.random() * this.sp500.length)]
        if ( symbol === 'AA' || symbol == 'FTV' || symbol == 'UA' || symbol == 'KO') {
            this.getRandomSymbol();
        } else {
            return symbol;
        }
    }

    onClickStats() {
        this.showStatsModal = !this.showStatsModal;
    }

    onClickCloseStats() {
        this.showStatsModal = false;
    }
}
