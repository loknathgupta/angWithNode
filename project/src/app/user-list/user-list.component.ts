import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  @Output() emitterToParent = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.callEmiter();
  }

  callEmiter(){
    this.emitterToParent.emit();
    console.log('Child called');
  }

}
