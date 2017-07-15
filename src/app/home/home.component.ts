declare var CanvasJS: any;
import { Component, OnInit } from '@angular/core';
import { Http } from "@angular/http";
import 'rxjs/Rx';
import { SP500 } from './sp500'

@Component({
    selector: 'home',
    styleUrls: ['./home.component.scss'],
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
    constructor(private http: Http) { }

    chart: any = null;
    dataPoints: any[] = [];
    equity: any;
    index: any;
    sp500 = SP500
    stockArr: any;
    symbol: string;

    public ngOnInit() {
        console.log('sp500: ', this.sp500)
        this.initChart()
    }

    initChart() {        
        if (this.chart) {
            this.chart = null;
        }
        this.dataPoints = [];
        this.symbol = this.getRandomSymbol()
        console.log('symbol', this.symbol);        
        this.getEquity()
    }

    getEquity() {
        this.http.get('./assets/stocks/' + this.symbol + '.json')
            .map(r=>r.json())
            .subscribe((result) => {
                if ( result ) {
                    //console.log('result', result)
                    this.equity = result;
                    //console.log('this.equity', this.equity)
                    this.index = this.getRandom( 120, this.equity.length - 200); //random start day up until 200 days ago.
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
}
