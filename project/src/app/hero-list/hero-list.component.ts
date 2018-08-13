import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HeroService } from '../hero.service';
import 'rxjs/Rx'
import {Hero} from '../hero';

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.css']
})
export class HeroListComponent implements OnInit {
  heroes: String[] = [];
  newHeroName: String = '';

  selectedHero: Hero = new Hero();
  searchedHero: Hero[] = [];
  searchtext: String;
  actionMessage: String = '';
  isdeleted: Boolean = false;
  serverError: Boolean = false
  allHero: Hero[] = [];
  newHero: Hero = new Hero();

  constructor(private heroService: HeroService) { }

  ngOnInit() {
    this.heroService.findHero('')
      .subscribe(
        (heros:Hero[]) => {
          this.allHero = heros;
        },
        (err) => {
          this.serverError = true;
          this.actionMessage = 'Server side error occured.(' + err.message + ')';
          console.error(err.message);
        }
      );
  }

  addHero(addHeroForm: NgForm) {
    this.heroService.addHero(this.newHero)
      .subscribe(
        (addedHero:Hero) => {
          this.allHero.push(addedHero);
          this.actionMessage = 'Hero has been added.';
        },
        (err) => {
          this.serverError = true;
          this.actionMessage = 'Server side error occured.(' + err.message + ')';
          console.error(err.message);
        }
      );
  }

  searchHero(event: any) {
    let inputText = event.target.value;
    this.searchtext = inputText;
    var matchedHero:Hero[] = [];
    this.allHero.forEach(function (hero:Hero) {
      if (hero.name.indexOf(inputText) != -1) {
        matchedHero.push(hero);
      }
    });
    if (matchedHero.length) {
      this.actionMessage = 'Hero with searched key found.';
    }

    this.searchedHero = matchedHero;
    this.selectedHero = new Hero();
  }

  selectHero(hero: Hero) {
      this.selectedHero = hero;
  }

  hasNameUpdated(newDetails: NgForm) {
    // var data = newDetails.value;
    // var oldName = data['old-name'];
    // var newName = data['new-name'];
    // if (this.heroes.indexOf(oldName) != -1) {
    //   this.heroes[this.heroes.indexOf(oldName)] = newName;
    //   this.actionMessage = 'Hero name has been updated from ' + oldName + ' to ' + newName + '.'
    // }
    // if (this.searchedHero.indexOf(oldName) != -1) {
    //   this.searchedHero[this.searchedHero.indexOf(oldName)] = newName;
    // }
  }


  deleteHero(heroToDelete: Hero) {
    var heroId = heroToDelete.id;    
    this.selectedHero = new Hero();
    this.searchedHero.forEach((hero, index)=>{
      if(hero.id == heroId){
        this.searchedHero.splice(index, 1);
      }
    });

    this.allHero.forEach((hero, index)=>{
      if(hero.id == heroId){
        this.allHero.splice(index, 1);
      }
    });
    
 }

}
