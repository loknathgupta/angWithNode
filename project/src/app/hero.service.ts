import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable}  from 'rxjs';
import {_throw} from 'rxjs/observable/throw';
import { map, catchError } from 'rxjs/operators';
import {Hero} from './hero';



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

  addHero(userData:Hero){
    return this.http
    .post('http://localhost:4343/user/add', userData)
    .map(function(res){
      console.log(res);
      return res;
    });
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
    });
  }



}
