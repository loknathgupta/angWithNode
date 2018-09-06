import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import {_throw} from 'rxjs/observable/throw';
import { map, catchError } from 'rxjs/operators';
import 'rxjs/add/operator/toPromise';
import {Hero} from './hero';



@Injectable()
export class HeroService {

  constructor(private http:HttpClient) { }

  findHero(key:String){
    return this.http
    .get('http://localhost:4343/user/')
    .map(function(res){
      return res;
    })
    .pipe(catchError(this.handleError));
    
  }

  addHero(userData:Hero){
    return this.http
    .post('http://localhost:4343/user/add', userData)
    .map(function(res){
      console.log(res);
      return res;
    })
    .pipe(catchError(this.handleError));;
  }

  deleteHero(userId:Number){
    return this.http
    .get('http://localhost:4343/user/delete/'+userId)
    .map(function(res){
      console.log(res);
      return res;
    });
  }

  updateHero(udatedData: Hero){
    return this.http
    .post('http://localhost:4343/user/update', udatedData)
    .map(function(res){
      console.log(res);
      return res;
    })
    .pipe(catchError(this.handleError));;
  }

  // Implement a method to handle errors if any
  private handleError(err: HttpErrorResponse | any) {
    console.error('An error occurred here', err);
    return _throw(err.message || err);
  }



}
