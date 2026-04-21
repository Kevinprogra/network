import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private apiKey = 'e3f571253469474c9ad412a174847d90';

  constructor(private http: HttpClient) {
    console.log('heyyyy constructor funcionando prueba inyeccion de HttpClient funciona ', this.http);
  }

  getNoticias() {
    console.log('aca llamado api ok probando');

    const url = `https://newsapi.org/v2/everything?q=universidad OR estudiantes OR educación&language=es&pageSize=20&sortBy=publishedAt&apiKey=${this.apiKey}`;

    console.log('kevin probando inyeccion de HttpClient funciona ', this.http);

    return this.http.get<any>(url);
  }
}