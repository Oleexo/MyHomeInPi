import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../config-service";
import { Observable } from "rxjs";
import { REPL_MODE_SLOPPY } from "repl";

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private lastUpdate: Date;
  private cache: WeatherHttpReponse;

  constructor(private httpClient: HttpClient,
    private configService: ConfigService) {

  }

  public getCurrentWeather(): Observable<WeatherHttpReponse> {
    return new Observable(o => {
      if (this.lastUpdate) {
        let boundaryTime = new Date(this.lastUpdate.getTime() + (3 * 60 * 60 * 1000));
        if (boundaryTime < new Date()) {
          o.next(this.cache);
          return;
        }

      }
      let locationId = this.configService.get<number>('Weather-LocationId', 2996944);
      let apiKey = this.configService.get<string>('Weather-ApiKey');
      if (!apiKey) {
        o.error({
          message: 'missing api key'
        });
        return;
      }

      let url = `http://api.openweathermap.org/data/2.5/forecast?id=${locationId}&appid=${apiKey}&units=metric&lang=fr`;
      this.httpClient.get<WeatherHttpReponse>(url)
        .subscribe(data => {
          this.cache = data;
          o.next(data);
        });
    });

  }
}

export interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

export interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface Clouds {
  all: number;
}

export interface Wind {
  speed: number;
  deg: number;
}

export interface Rain {
  '3h': number;
}

export interface Sys {
  pod: string;
}

export interface List {
  dt: number;
  main: Main;
  weather: Weather[];
  clouds: Clouds;
  wind: Wind;
  rain: Rain;
  sys: Sys;
  dt_txt: string;
}

export interface Coord {
  lat: number;
  lon: number;
}

export interface City {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface WeatherHttpReponse {
  cod: string;
  message: number;
  cnt: number;
  list: List[];
  city: City;
}

