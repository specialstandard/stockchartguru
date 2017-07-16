import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/Rx';
import * as moment from 'moment';

@Injectable()
export class ScoreService {

    public accountValue: number = 0;

    constructor(){}

}
