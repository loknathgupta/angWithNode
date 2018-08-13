import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {NgForm} from '@angular/forms';
import {Hero} from '../hero';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit {
  @Input() heroSelected: Hero;
  @Output() updateHeroDetails = new EventEmitter();
  @Output() deleteHeroDetails = new EventEmitter();
  oldName : String;
  isdeleted : Boolean;

  constructor() {}

  ngOnInit() {
    //alert('hhhh');
    console.log(this.heroSelected);
    this.oldName = this.heroSelected.name;
    this.isdeleted = false;
  }

  updateHero(updatedData:NgForm){ 
    console.log(updatedData.value);
    this.updateHeroDetails.emit(updatedData); 
  }

  deleteHero(){
    this.deleteHeroDetails.emit(this.heroSelected);  
    this.isdeleted = true;
  }

}
