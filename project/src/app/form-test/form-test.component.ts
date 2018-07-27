import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {UserService} from '../user.service'

@Component({
  selector: 'app-form-test',
  templateUrl: './form-test.component.html',
  providers : [UserService],
  styleUrls: ['./form-test.component.css']
})
export class FormTestComponent implements OnInit {
  users = [];
  user = {};
  groups = ['A', 'B', 'C', 'D']

  constructor(private userService : UserService) {
    this.users = userService.getUsers();
  }

  ngOnInit() {
  }

  addUser(userData:NgForm){
    this.userService.userAdd(userData.value);
    this.users = this.userService.getUsers();
    //this.users.push(userData.value);
  }

}
