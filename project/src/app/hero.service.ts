import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable}  from 'rxjs';
import {_throw} from 'rxjs/observable/throw';
import { map, catchError } from 'rxjs/operators';



@Injectable()
export class HeroService {

  constructor(private http:HttpClient) { }

  findHero(key:String){
    return this.http
    .get('http://localhost:4343/user/')
    .map(function(res){
      return res;
    });
    
  }

  addHero(userData:Object){
    return this.http
    .post('http://localhost:4343/user/add', userData)
    .map(function(res){
      console.log(res);
      return res;
    });
  }

}
