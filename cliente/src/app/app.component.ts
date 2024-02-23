import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { WebSocketService } from './servicios/websocket.service';
import * as io from 'socket.io-client';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AudioService } from './servicios/audio.service';
import { FormsModule } from '@angular/forms';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink,FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  req = false
  board: string[][] = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];
  jugadorActual: 'X' | 'O' = 'X';
  estado = ''
  ganador: string | null = null;
  jugadorNumero = 0
  tiempoRestante: number | null = null
  turnoActual = 1
  jugando = false
  finalizada = false
  isLogged=false
  labelLogin='Introduce un nombre de usuario'
  usuario={nombre:''}
  nombreRival:string=''
  mensaje=''
  buscando=false
  constructor(private websocket: WebSocketService, private audioService: AudioService) { }


  ngOnInit(): void {
    this.websocket.onBuscando().subscribe(data => {
      this.estado = data

    });
    this.websocket.onLoginCorrecto().subscribe(data=>{
      this.isLogged=true
    })
    this.websocket.onLoginIncorrecto().subscribe(data=>{
      this.labelLogin='Nombre de usuario en uso'
    })
    this.websocket.onEncontrado().subscribe(data => {
      this.estado = data
      this.pedirInfo()
      setTimeout(() => {
        this.estado = 'Comenzando partida...'
        this.tiempoRestante = 5
        this.iniciarCuentaRegresiva()
      }, 1000);

    });
    this.websocket.onDerrota().subscribe(data => {
      this.finalizada=true
      this.ganador='Has perdido'
      this.turnoActual=0
      this.board=data.partida
    });
    this.websocket.onEmpate().subscribe(data => {
      this.finalizada=true
      this.ganador='Empate'
      this.turnoActual=0
      this.board=data.partida
    });
    this.websocket.onRecibirMano().subscribe(data => {
      console.log(data)
      this.turnoActual=this.jugadorNumero
      this.playSound()
      this.board=data.partida
    });

    this.websocket.onInicio().subscribe(data => {
      this.jugadorNumero = data.turno
      this.nombreRival=data.rival
      if (data.turno == 2) {
        this.jugadorActual = 'O'
      }
    })

    this.websocket.onAbandono().subscribe(data => {
      this.finalizada=true
      this.ganador='El rival ha abandonado la partida'
      this.turnoActual=0
    })
    this.websocket.onRecibirMensaje().subscribe(data=>{
      alert(data)
       console.log(data)
    })
  }


  enviarMensaje() {
    const messageToSend = "Hola, amigo";
    this.websocket.socket.emit("message", messageToSend);
  }
  sendMessage(){
    this.websocket.enviarMensaje(this.mensaje)
    this.mensaje=''
  }
  //Método Mover
  mover(row: number, col: number): void {
    if (this.turnoActual == this.jugadorNumero) {

      if (this.board[row][col] != 'X' || this.board[row][col] != 'O') {
        this.board[row][col] = this.jugadorActual

        this.finalizada = this.checkWinner()
        if (this.finalizada == true) {
          this.heGanado()
          this.ganador='Has ganado'
        }else{

          if (this.estaLLeno()==true) {
            this.heEmpatado()
            this.ganador='Empate'
            this.finalizada=true
          }else{
            this.mandarMano()
            if(this.turnoActual==1){
              this.turnoActual=2
            }else{
              this.turnoActual=1
            }
          }
        }
      }
    }
  }
  playSound() {
    this.audioService.playSound('sonido.mp3');
  }
  checkWinner(): boolean {
    for (let i = 0; i < 3; i++) {
      if (
        (this.board[i][0] === this.jugadorActual && this.board[i][1] === this.jugadorActual && this.board[i][2] === this.jugadorActual) ||
        (this.board[0][i] === this.jugadorActual && this.board[1][i] === this.jugadorActual && this.board[2][i] === this.jugadorActual)
      ) {
        return true;
      }
    }
    if (
      (this.board[0][0] === this.jugadorActual && this.board[1][1] === this.jugadorActual && this.board[2][2] === this.jugadorActual) ||
      (this.board[0][2] === this.jugadorActual && this.board[1][1] === this.jugadorActual && this.board[2][0] === this.jugadorActual)
    ) {
      return true;
    }

    return false;
  }

  estaLLeno(): boolean {
    let lleno = true
    for (let i = 0; i < this.board.length; i++) {
      for (let x = 0; x < this.board[i].length; x++) {

        if (this.board[i][x] != 'O' && this.board[i][x] != 'X') {
          lleno = false
          break
        }
      }
        if (lleno == false) {
          console.log('vacio')
          break
        }
    }
    if(lleno){
      console.log('lleno')
    }

    return lleno
  }

  buscarRival() {
    this.websocket.buscar(this.usuario.nombre)
    this.buscando=true

  }

  pedirInfo() {
    this.websocket.pedir()

  }
  mandarMano() {
    this.websocket.jugar(this.board)

  }
  heGanado() {
    this.websocket.victoria(this.board)

  }
  heEmpatado() {
    this.websocket.empate(this.board)

  }
  verRequisitos() {
    this.req = true
    this.playSound()
  }
  ocultarRequisitos() {
    this.req = false
  }

  iniciarCuentaRegresiva(): void {
    const intervalo = setInterval(() => {
      if (this.tiempoRestante === 0) {
        clearInterval(intervalo);
        this.tiempoRestante = null
        this.jugando = true
        this.estado=''
      } else {
        this.tiempoRestante!--;
      }
    }, 1000);
  }
reiniciar(){
  window.location.reload()
}

login(){
  console.log(this.usuario.nombre)
  if(this.usuario.nombre.split(' ').join('').length < 4){
    this.labelLogin='Tamaño incorrecto (min 5)'
  }else{
    this.websocket.checkLogin(this.usuario.nombre)
  }
}
}
