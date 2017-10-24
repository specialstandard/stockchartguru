import { Component, OnInit } from '@angular/core';
import { InfoService } from './info.service';
import * as moment from 'moment';

@Component({
    selector: 'info',
    styleUrls: ['./info.component.scss'],
    templateUrl: './info.component.html',
})
export class InfoComponent implements OnInit {
    public articles: any;
    public numArticles = 10;

    constructor( public infoService: InfoService, ) { }

    public ngOnInit() {
        this.getArticles();
    }

    public getArticles() {
        this.infoService.getArticles().subscribe(articles => {
            this.articles = articles.result
            this.articles.reverse();
            console.log('articles ', this.articles)
        });

    }

}
