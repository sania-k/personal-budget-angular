import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public dataSource = {
    labels: [] as string[],
    datasets: [{
      data: [] as number[],
      backgroundColor: ['SteelBlue', 'LightSkyBlue', 'CadetBlue', 'CornflowerBlue', 'DarkSlateBlue', 'MidnightBlue', 'PaleTurquoise']
    }]
  };

  constructor(private http: HttpClient) {}

  fetchData(): Promise<any> {
    if (this.dataSource.labels.length === 0 && this.dataSource.datasets[0].data.length === 0) {
      return this.http.get('http://localhost:3456/budget').toPromise()
        .then((res: any) => {
          for (let i = 0; i < res.budget.length; i++) {
            this.dataSource.datasets[0].data[i] = res.budget[i].budget;
            this.dataSource.labels[i] = res.budget[i].title;
          }
          return this.dataSource;
        });
    } else {
      return Promise.resolve(this.dataSource);
    }
  }
}
