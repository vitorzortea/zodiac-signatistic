import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
//import { environment } from 'src/environments/environment';

let environment:any = {};
environment.apiUrl = 'temp';


@Injectable({
  providedIn: 'root'
})
export class CrudService<T> {
  private API_httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json',})};
  constructor(
    protected http: HttpClient, 
  ) { }
  
  get(url:string){
    return this.http.get<T>(url, this.API_httpOptions)
    .pipe( /* tap(console.log), take(1) */ );
  }
  /*

  getById(url:string, id:string): Observable<T> {
    return this.http.get<T>(`${environment['apiUrl']+url}/${id}`, this.API_httpOptions)
    .pipe(
      tap(console.log),
      take(1)
    );
  }

  post(url:string, record: T) { 
    if(record.hasOwnProperty('id')){delete record['id']}
    return this.create(url, record);
  }
  put(url:string, record: T) { return this.update(url, record); }

  save(url:string, record: any) {
    if (record['id']){
      return this.update(url+'/'+record.id, record);
    }
    return this.create(url, record);
  }
  
  private create(url:string, record: any): any {
    return this.http.post(environment['apiUrl']+url, JSON.stringify(record), this.API_httpOptions)
    .pipe( take(1) );
  }

  private update(url:string, record: any): any {
    return this.http.put(environment['apiUrl']+url, JSON.stringify(record), this.API_httpOptions)
    .pipe( take(1) );
  }

  remove(url:string, record: any) {
    return this.http.delete(`${environment['apiUrl']+url}/${record}`, this.API_httpOptions)
    .pipe(
      take(1)
    );
  }
  */


}