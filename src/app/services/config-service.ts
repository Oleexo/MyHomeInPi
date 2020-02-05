import { Injectable } from "@angular/core";
import * as config from "electron-json-config";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public get<T>(key: string, defaultValue?: T): T {
    return config.get(key, defaultValue);
  }

  public set(key: string, value: any): void {
    config.set(key, value);
  }
}
