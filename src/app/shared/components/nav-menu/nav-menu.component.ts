import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../../../services/weather/weather-service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
  public now: Date = new Date();
  public outDoor: OutDoorInformation;
  public inDoor: InDoorInformation;

  constructor(private weatherService: WeatherService) {
    setInterval(() => {
      this.now = new Date();
    }, 60 * 1000);
    this.outDoor = {
      temperature: 5.5,
      humidity: 84,
      description: 'nuageux'
    };
    this.inDoor = {
      temperature: 22.1,
      humidity: 70
    };
  }

  ngOnInit(): void {
    /*this.weatherService.getCurrentWeather().subscribe((r) => {
      this.outDoor = {
        temperature: r.list[0].main.temp,
        description: r.list[0].weather[0].description,
        humidity: r.list[0].main.humidity
      }
    });*/
  }
}

interface OutDoorInformation {
  temperature: number;
  description: string;
  humidity: number;
}

interface InDoorInformation {
  temperature: number;
  humidity: number;
}
