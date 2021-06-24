import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Film } from 'src/app/models/film';
import { Person } from 'src/app/models/person';
import { Planet } from 'src/app/models/planet';

@Injectable({
  providedIn: 'root'
})
export class StarWarsService {
  starwarsUrl: any = {
    films: "https://swapi.dev/api/films/",
    people: "https://swapi.dev/api/people/",
    planets: "https://swapi.dev/api/planets/",
  };
  people: any = {};
  planets: any = {};
  films: any = {};

  constructor(
    private http: HttpClient
  ) { }

  async loadPeople(page = 1, searchTerm = ''): Promise<any> {
    const url = `${this.starwarsUrl.people}?search=${searchTerm}&page=${page}`;
    return this.http.get(url).toPromise();
  }

  async getPerson(url: string): Promise<Person> {
    if (url in this.people) {
      return this.people[url];
    }

    const id = url.split('people/')[1];
    const response = await this.http.get<Person>(this.starwarsUrl.people + id).toPromise();
    this.people[url] = response;

    return this.people[url];
  }

  async getPlanet(url: string): Promise<Planet> {
    if (url in this.planets) {
      return this.planets[url];
    }

    const id = url.split('planets/')[1];
    const response = await this.http.get<Planet>(this.starwarsUrl.planets + id).toPromise();
    this.planets[url] = response;

    return this.planets[url];
  }

  async getFilm(url: string): Promise<Film> {
    if (url in this.films) {
      return this.films[url];
    }

    const id = url.split('films/')[1];
    const response = await this.http.get<Film>(this.starwarsUrl.films + id).toPromise();
    this.films[url] = response;

    return this.films[url];
  }

  async search(urlKey: string, searchTerm: string, page: number): Promise<{ count: number, results: Person[] }> {
    if (!searchTerm.trim().length) {
      return {
        count: 0,
        results: []
      };
    }

    const url = `${this.starwarsUrl[urlKey]}?search=${searchTerm}&page=${page}`;
    const response: any = await this.http.get(url).toPromise();

    let results: Person[] = [];
    let count = 0;

    if (urlKey === 'planets') {
      const people = response.results.reduce((acc: any, curr: any) => [...acc, ...curr.residents], []);
      results = await Promise.all(people.map((person: any) => this.getPerson(person)));
      count = results.length;
    }

    if (urlKey === 'films') {
      const people = response.results.reduce((acc: any, curr: any) => [...acc, ...curr.characters], []);
      results = await Promise.all(people.map((person: string) => this.getPerson(person)));
      count = results.length;
    }

    console.log(results);

    return {
      count,
      results,
    };
  }
}
