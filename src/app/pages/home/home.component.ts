import { Component, OnInit } from '@angular/core';
import { Person } from 'src/app/models/person';
import { StarWarsService } from 'src/app/services/star-wars/star-wars.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  numPeople = 0;
  numPages = 10;
  numPeoplePerPage = 10;
  numMaxPages = Number.MAX_SAFE_INTEGER;
  numMinPages = 1;
  currentPage = 1;
  filterOptions = [
    {
      key: 'people',
      val: 'Name',
    },
    {
      key: 'planets',
      val: 'Home World',
    },
    {
      key: 'films',
      val: 'Film',
    }
  ];
  filterKey = 'people';
  filterSearch = '';
  isSearch = false;

  currentSort = '';

  people: Person[] = [];
  allPeople: any;

  constructor(
    public starWarsService: StarWarsService
  ) { }

  ngOnInit(): void {
    this.loadPeople();
  }

  async loadPeople(page: number = 0, clearFilter = false) {
    if (clearFilter) {
      this.filterSearch = '';
    }

    this.isSearch = false;
    this.allPeople = await this.starWarsService.loadPeople(page || this.currentPage, this.filterSearch);
    this.updatePeople();
  }

  async search() {
    if (this.filterKey === 'people') {
      return this.loadPeople(1);
    }

    this.isSearch = true;
    this.currentPage = 1;
    this.allPeople = await this.starWarsService.search(this.filterKey, this.filterSearch, this.currentPage);
    this.updatePeople();
  }

  async updatePeople() {
    // Update count and max number of pages
    this.numPeople = this.allPeople.count;
    this.numMaxPages = Math.ceil(this.numPeople / this.numPeoplePerPage);

    // Pagination
    const count = this.isSearch ? (this.currentPage - 1) * this.numPeoplePerPage : 0;

    this.people = await Promise.all(
      this.allPeople.results
        // Show 10 people per page
        .slice(count, count + this.numPeoplePerPage)

        // Fetch each person's data
        .map(async (person: Person) => {
          const homeworld = (await this.starWarsService.getPlanet(person.homeworld)).name;
          const filmPromises = person.films.map(async film => (await this.starWarsService.getFilm(film)).title);
          const films = await Promise.all(filmPromises);

          return {
            name: person.name,
            homeworld,
            birth_year: person.birth_year,
            films,
          }
        })
    );
  }

  sortBy(colName: string): void {
    if (this.currentSort === colName) {
      this.people.reverse();
      return;
    }

    this.people.sort((a: any, b: any) => {
      return a[colName] > b[colName]
        ? -1
        : 1;
    });

    this.currentSort = colName;
  }

  goToPage(pageNum: number): void {
    this.currentPage = pageNum || 1;
    this.isSearch ? this.updatePeople() : this.loadPeople();
  }

  pageForward(): void {
    this.currentPage = Math.min(this.numMaxPages, ++this.currentPage);
    this.isSearch ? this.updatePeople() : this.loadPeople();
  }

  pageBack(): void {
    this.currentPage = Math.max(this.numMinPages, --this.currentPage);
    this.isSearch ? this.updatePeople() : this.loadPeople();
  }
}

export class PeopleResponse {
  results!: any[];
}
