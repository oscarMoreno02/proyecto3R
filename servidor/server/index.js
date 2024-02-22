import express from "express";
import http from "http";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(morgan("dev"));

let partidas = [];
let usuarios = [];
io.on("connection", (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    socket.on("buscar", (username) => {
        let buscando = false;

        for (const p of partidas) {
            if (p.usuario1 === socket.id || p.usuario2 === socket.id) {
                buscando = true;
                break;
            }
        }

        if (!buscando) {
            let partida = partidas.find(p => p.usuario1 === null);

            if (partida) {
              for(const p of partidas){
                if(p.usuario1==null){
                  p.usuario1=socket.id
                  p.username1=username
                  io.to(p.usuario1).emit('buscando', 'Creando partida');
                }
              }

            } else {
              partida = partidas.find(p => p.usuario2 === null);
              if(!partida){
                partida = { usuario1: socket.id, usuario2: null,turno:1,username1:username,username2:null };
                partidas.push(partida);
                io.to(partida.usuario1).emit('buscando', 'Creando partida');
              }else{
                io.to(socket.id).emit('buscando', 'Buscando partida');
                for(const p of partidas){
                  if(p.usuario2==null){
                    p.usuario2=socket.id
                    p.username2=username
                    io.to([p.usuario1,p.usuario2]).emit('encontrado', 'Partida encontrada');
                    // io.to(p.usuario2).emit('buscando','Partida encontrada')
                  }
                }
              }
            }
        } else {
          let enCurso=false
          for(const p of partidas){
            if(p.usuario1==socket.id && p.usuario2!=null){
              enCurso=true
            }
            if(p.usuario2==socket.id){
              enCurso=true
            }
            if(enCurso){
              break
            }
          }
          if(enCurso==false){

            io.to(socket.id).emit('buscando', 'Buscando rival');
          }
        }

        console.log(partidas);
    });
    socket.on('check-login',(username)=>{
     let disponible=true
     console.log('llega login')
      for(const u of usuarios){
        if(u.nombre==username){
          console.log('llega invalido')
          io.to(socket.id).emit('login-incorrecto')
          disponible=false
          break
        }
      }
      if(disponible==true){
        console.log('llega valido')
        usuarios.push({nombre:username,id:socket.id})
        io.to(socket.id).emit('login-correcto')
      }
    })


    socket.on('pedir-info',()=>{
     
      for(const p of partidas){
        if(p.usuario1==socket.id){
          io.to(socket.id).emit('inicio',{turno:1,rival:p.username2})
          console.log(p.username2)
          break
      
        }
        if(p.usuario2==socket.id){
          console.log(p.username1)
          io.to(socket.id).emit('inicio',{turno:2,rival:p.username1})
          break
         
        }
      }
    })


    socket.on('enviar-mensaje',(mensaje)=>{
     
      for(const p of partidas){
        if(p.usuario1==socket.id){
          io.to(p.usuario2).emit('recibir-mensaje',{mensaje})
          console.log(p.username2)
          break
      
        }
        if(p.usuario2==socket.id){
          console.log(p.username1)
          io.to(p.usuario1).emit('recibir-mensaje',{mensaje})
          break
         
        }
      }
    })
    socket.on('victoria',(partida)=>{
      let encontrado=false
      for(const p of partidas){
        if(p.usuario1==socket.id){
          io.to(p.usuario2).emit('derrota',{partida})
        }
        if(p.usuario2==socket.id){
          io.to(p.usuario1).emit('derrota',{partida})
         
        }
        if(encontrado==true){
          p.usuario1=null
          p.usuario2=null
          p.username1=null
          p.username2=null
          p.partida=null
          break
        }
      }
    })
    socket.on('empate',(partida)=>{
      let encontrado=false
      for(const p of partidas){
        if(p.usuario1==socket.id){
          io.to(p.usuario2).emit('empate',{partida})
          encontrado=true
        }
        if(p.usuario2==socket.id){
          io.to(p.usuario1).emit('empate',{partida})
          encontrado=true
        }
        if(encontrado==true){
          p.usuario1=null
          p.usuario2=null
          p.username1=null
          p.username2=null
          p.partida=null
          break
        }
      }


    })
    socket.on('disconnect',()=>{
      for(const p of partidas){

        if(p.usuario1==socket.id || p.usuario2==socket.id){

          if(p.usuario1==socket.id){
            io.to(p.usuario2).emit('abandono',{})
          }
          if(p.usuario2==socket.id){
            io.to(p.usuario1).emit('abandono',{})
          }
            p.usuario1=null
            p.usuario2=null
            p.username1=null
            p.username2=null
            p.partida=null
          break
        }
      }
      let nuevaLista=[]
      for(const u of usuarios){
        if(u.id!=socket.id){
          nuevaLista.push(u)
        }
      }
      usuarios=nuevaLista
    })
    socket.on('enviar-mano',(partida)=>{
      for(const p of partidas){
        if(p.usuario1==socket.id){
          io.to(p.usuario2).emit('recibir-mano',{partida})
          break
        }
        if(p.usuario2==socket.id){
          io.to(p.usuario1).emit('recibir-mano',{partida})
          break
        }
      }
    })
});

server.listen(3000, () => {
    console.log(`Server running on port 3000`);
});
