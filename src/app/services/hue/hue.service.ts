import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ConfigService } from "../config-service";

@Injectable({
  providedIn: 'root'
})
export class HueService {
  private bridgeIp: string;
  private username: string;

  constructor(private httpClient: HttpClient,
    private configService: ConfigService) {
    this.bridgeIp = this.configService.get<string>("Hue-BridgeIp");
    this.username = this.configService.get<string>("Hue-Username");
  }

  private findBridgeIp(): Observable<string> {
    return new Observable((o) => {
      if (this.bridgeIp) {
        o.next(this.bridgeIp);
        return;
      }
      this.httpClient.get<DiscoveryResponse[]>('https://discovery.meethue.com/')
        .subscribe((r) => {
          if (r && r.length > 0) {
            this.configService.set("Hue-BridgeIp", r[0].internalipaddress);
            o.next(r[0].internalipaddress);
          } else {
            o.error({
              message: 'No bridge found'
            });
          }
        });
    });
  }

  public getGroups(): Observable<Group[]> {
    return new Observable(o => {
      this.findBridgeIp().subscribe(ip => {
        let url = `http://${ip}/api/${this.username}/groups`;
        this.httpClient.get<{ [id: string]: Group; }>(url)
          .subscribe(r => {
            let returnGroups = []
            for (const key in r) {
              if (r.hasOwnProperty(key)) {
                const group = r[key];
                if (group.type != 'Room') {
                  continue;
                }
                group.id = key;
                group.action.hexColor = this.xyBriToRgb(group.action.xy[0], group.action.xy[1], group.action.bri);
                returnGroups.push(group);
              }
            }
            o.next(returnGroups);
          });
      });
    });
  }

  public turnGroupOn(group: Group, brightness?: number): void {
    if (brightness && brightness <= 0) {
      this.turnGroupOff(group);
      return;
    }
    this.findBridgeIp().subscribe(ip => {
      let url = `http://${ip}/api/${this.username}/groups/${group.id}/action`;
      let param: any = {
        on: true,
        bri: group.action.bri
      };
      if (brightness) {
        param.bri = brightness;
      }
      this.httpClient.put(url, param).subscribe((r: any) => {
        group.state.all_on = true;
        group.state.any_on = true;
        if (brightness) {
          group.action.bri = brightness;
          group.action.hexColor = this.xyBriToRgb(group.action.xy[0], group.action.xy[1], group.action.bri);
        };
      });
    });
  }

  public turnGroupOff(group: Group): void {
    this.findBridgeIp().subscribe(ip => {
      let url = `http://${ip}/api/${this.username}/groups/${group.id}/action`;
      let param: any = {
        on: false
      };
      this.httpClient.put(url, param).subscribe((r: any) => {
        group.state.all_on = false;
        group.state.any_on = false;
      });
    });
  }
  private xyBriToRgb(x, y, bri) {
    let z = 1.0 - x - y;

    let Y = bri / 255.0; // Brightness of lamp
    let X = (Y / y) * x;
    let Z = (Y / y) * z;
    let r = X * 1.612 - Y * 0.203 - Z * 0.302;
    let g = -X * 0.509 + Y * 1.412 + Z * 0.066;
    let b = X * 0.026 - Y * 0.072 + Z * 0.962;
    r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
    g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
    let maxValue = Math.max(r, g, b);
    r /= maxValue;
    g /= maxValue;
    b /= maxValue;
    r = r * 255; if (r < 0) { r = 255 };
    g = g * 255; if (g < 0) { g = 255 };
    b = b * 255; if (b < 0) { b = 255 };
    let r_str = Math.round(r).toString(16);
    let g_str = Math.round(g).toString(16);
    let b_str = Math.round(b).toString(16);

    if (r_str.length < 2)
      r_str = "0" + r_str;
    if (g_str.length < 2)
      g_str = "0" + g_str;
    if (b_str.length < 2)
      b_str = "0" + r_str;
    let rgb = "#" + r_str + g_str + b_str;
    return rgb;
  }

}

interface DiscoveryResponse {
  id: string;
  internalipaddress: string;
}

export interface State {
  all_on: boolean;
  any_on: boolean;
}

export interface Action {
  on: boolean;
  bri: number;
  hue: number;
  sat: number;
  effect: string;
  xy: number[];
  ct: number;
  alert: string;
  colormode: string;
  hexColor: string;
}

export interface Group {
  id: string;
  name: string;
  lights: string[];
  sensors: any[];
  type: string;
  state: State;
  recycle: boolean;
  class: string;
  action: Action;
}


