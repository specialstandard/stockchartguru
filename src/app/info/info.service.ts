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
export class InfoService {

    constructor(public http: Http) {

    }

    getArticles(): Observable<any> {
        return this.http.get('http://stockchartguru.com/api/blog')
            .map(r => r.json())
    }
    getArticleByUrl(url: string): Observable<any> {
        let body = {
            url
        }
        return this.http.post('http://stockchartguru.com/api/blog', body)
            .map(r => r.json())
    }
    
    dateFromObjectId = function (objectId) {
        return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
    };

}
