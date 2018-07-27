import { Injectable } from '@angular/core';

@Injectable()
export class UserService {
  users = [];

  constructor() { 
    this.users = [{user_name: 'RAJ', user_group:'A'}];
  }

  getUsers(){
    return this.users;
  }
  userAdd(userData){
    this.users.push(userData);
  }

}
