import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HeroService } from '../hero.service';
import 'rxjs/Rx'

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.css']
})
export class HeroListComponent implements OnInit {
  heroes: String[] = [];

  newHeroName: String = '';
  selectedHero: any = {name:''};
  searchedHero: any = [];
  searchtext: String;
  actionMessage: String = '';
  isdeleted: Boolean = false;
  serverError: Boolean = false
  allHero: any = [];
  newHero: Object = { name: '', email: '', phone: '' };

  constructor(private heroService: HeroService) { }

  ngOnInit() {
    //this.heroes = ['Ajay', 'Sunny', 'Abhay', 'Tushar', 'Ranveer', 'Sanjay'];
    //this.heroes = [];
    this.heroService.findHero('')
      .subscribe(
        (heros) => {
          console.log(heros);
          this.allHero = heros;
          for (let hero in heros) {
            //this.heroes.push(heros[hero]);
            //this.allHero[heros[hero]['id']] = heros[hero];
          }
          //console.log(this.allHero);
        },
        (error) => {
          this.serverError = true;
          this.actionMessage = 'Server side error occured.(' + error.message + ')';
          console.error(error.message);
        }
      );
  }

  addHero(addHeroForm: NgForm) {
    console.log(this.allHero);
    console.log(this.newHero);
    this.heroService.addHero(this.newHero)
      .subscribe(
        (addedHero) => {
          this.allHero.push(addedHero);
          console.log(this.allHero);
        },
        (err) => {
          console.error(err.message);
        }
      );
  }

  searchHero(event: any) {
    let inputText = event.target.value;
    this.searchtext = inputText;
    var sHero = [];
    this.allHero.forEach(function (hero) {
      if (hero.name.indexOf(inputText) != -1) {
        sHero.push(hero);
      }
    });

    this.searchedHero = sHero;
    if (sHero.length) {
      this.actionMessage = 'Hero with searched key found.';
    }
    this.selectedHero = {};
  }

  selectHero(hero: Object) {
      this.selectedHero = hero;
  }

  hasNameUpdated(newDetails: NgForm) {
    var data = newDetails.value;
    var oldName = data['old-name'];
    var newName = data['new-name'];
    if (this.heroes.indexOf(oldName) != -1) {
      this.heroes[this.heroes.indexOf(oldName)] = newName;
      this.actionMessage = 'Hero name has been updated from ' + oldName + ' to ' + newName + '.'
    }
    if (this.searchedHero.indexOf(oldName) != -1) {
      this.searchedHero[this.searchedHero.indexOf(oldName)] = newName;
    }
  }


  deleteHero(hero: String) {
    if (this.heroes.indexOf(hero) != -1) {
      this.heroes.splice(this.heroes.indexOf(hero), 1);
      this.isdeleted = true;
    }
    if (this.searchedHero.indexOf(hero) != -1) {
      this.searchedHero.splice(this.searchedHero.indexOf(hero), 1);
    }

    this.selectedHero = '';
    this.actionMessage = 'Hero with name ' + hero + ' has been deleted.';
  }

}
