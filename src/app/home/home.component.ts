import { Component, OnInit } from '@angular/core';
import { HueService, Group } from '../services/hue/hue.service';
import { MatSliderChange } from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public hueGroups: Group[];

  constructor(private hueService: HueService) { }

  ngOnInit(): void {
    this.hueService.getGroups().subscribe(g => {
      this.hueGroups = g;
      console.log(this.hueGroups);
    });
  }

  public toggleLightGroup(group: Group) {
    if (!group.state.any_on) {
      this.hueService.turnGroupOn(group);
    } else {
      this.hueService.turnGroupOff(group);
    }
  }

  public onBrightnessChange(event: MatSliderChange, group: Group) {
    if (group.state.any_on) {
      this.hueService.turnGroupOn(group, event.value);
    }
  }
}
