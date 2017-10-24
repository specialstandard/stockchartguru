import { Component, OnInit } from '@angular/core';
import { InfoService } from "../info/info.service";
import * as moment from 'moment';
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

@Component({
    selector: 'info-details',
    styleUrls: ['./infoDetails.component.scss'],
    templateUrl: './infoDetails.component.html',
})
export class InfoDetailsComponent implements OnInit {
    public article: any;
    public sub: Subscription
    public url: string;

    constructor( public infoService: InfoService,
        private router: Router,
        private route: ActivatedRoute) { }

    public ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.url = params['url'];
            this.getArticleByUrl(this.url);
        });
    }
//#region get
    public getArticleByUrl(url: string) {
        this.infoService.getArticleByUrl(url).subscribe(result => {
            if (result.result) {
                this.article = result.result
                console.log('article ', this.article)
            } else {
                this.router.navigate(['/info'])
            }
        });
    }
//#endregion
    public ngOnDestroy() {
        this.sub.unsubscribe();
    }

}
