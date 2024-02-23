import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket,SocketIoConfig } from 'ngx-socket-io';

import { io } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})

export class WebSocketService {
  socket?:any
   
  constructor() {
   this.socket = io('http://192.168.206.76:3000/')

   this.socket.on('connect', () => {
    console.log('Conectado');
  });
  this.socket.on('disconnect', () => {
    this.socket.emit('abandono');
  });
  }
  // this.socket.on('buscando', (data: any) => {
  //   console.log( data);
  // });

  // this.socket.on('encontrado', (data: any) => {
  //   console.log( data);
  // });
  checkLogin(nombre:string){
    console.log('llega login')
    this.socket.emit('check-login',nombre);
  }
  onLoginCorrecto(){
    return new Observable(observer => {
      this.socket.on('login-correcto', (data:any) => {
        observer.next(data);
      });
    });
  }
  onLoginIncorrecto(){
    return new Observable(observer => {
      this.socket.on('login-incorrecto', (data:any) => {
        observer.next(data);
      });
    });
  }
  onRecibirMensaje(){
    return new Observable(observer => {
      this.socket.on('recibir-mensaje', (data:any) => {
        observer.next(data.mensaje);
      });
    });
  }
 
  buscar(username:string): void {
    this.socket.emit('buscar',username);
  }
  enviarMensaje(mensaje:string): void {
    this.socket.emit('enviar-mensaje',mensaje);
  }
  pedir(): void {
    this.socket.emit('pedir-info');
  }
  victoria(partida:any){
    this.socket.emit('victoria',partida)
  }
  empate(partida:any){
    this.socket.emit('empate',partida)
  }
  jugar(partida:any): void {
    this.socket.emit('enviar-mano',partida);
  }

  onDerrota(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('derrota', (data:any) => {
        observer.next(data);
      });
    });
  }
  onEmpate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('empate', (data:any) => {
        observer.next(data);
      });
    });
  }
  onRecibirMano(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('recibir-mano', (data:any) => {
        observer.next(data);
      });
    });
  }
  onBuscando(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('buscando', (data:any) => {
        observer.next(data);
      });
    });
  }

  onEncontrado(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('encontrado', (data:any) => {
        observer.next(data);
      });
    });
  }
  onInicio(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('inicio', (data:any) => {
        observer.next(data);
      });
    });
  }
  onAbandono(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('abandono', (data:any) => {
        observer.next();
      });
    });
  }
  loginValido(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('login-valido', (data:any) => {
        observer.next();
      });
    });
  }


  }
  
    
  
 


  
 
 
  

