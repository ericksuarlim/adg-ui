import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { General } from '../models/general';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  baseUrl: string = environment.urlApi + "/general";

  constructor(private http:HttpClient) { }

  getGenerals(): Observable<General[]>{
    return this.http.get<General[]>(this.baseUrl);
  }

  // ObtenerAnunciosPorSindicato(id_sindicato:number): Observable<General[]>{
  //   return this.http.get<General[]>(`${this.baseUrl}/sindicato/${id_sindicato}`);
  // }

  // CrearAnuncio(anuncio:General):Observable<General>{
  //   return this.http.post<any>(this.baseUrl, anuncio, httpOptions);
  // }

  // ObtenerAnuncio(id_anuncio:number):Observable<General>{
  //   return this.http.get<General>(this.baseUrl+"/"+id_anuncio);
  // }
    
  // EditarAnuncio(anuncio:General):Observable<any>{
  //   return this.http.put(`${this.baseUrl}/${anuncio.id_anuncio}`, anuncio, httpOptions );
  // }

  // EliminarAnuncio(id_anuncio:number):Observable<any>{
  //   return this.http.delete<any>(this.baseUrl + "/" + id_anuncio,httpOptions)
  // }
}
