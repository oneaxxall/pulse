# pds-pusher-server

## Inspired by 
- [Pusher.com](https://pusher.com/) - anak perusahaan MessageBird yang menyediakan platform support API messaging secara subscription dan publisher / PubSub

## Requirements
- Node v14 - v18

## Dependencies 
- [uWebsocket.js](https://github.com/uNetworking/uWebSockets.js) - Namanya aja uWebsocket.js tapi di compile dari bahas C

## Disadvantages 
- Dikarenakan keterbatasan uWebsocket.js *pds-pusher-server* ini tidak tidak bisa berjalan pada CentOS 7 dan hanya bisa bekerja pada CentOS versi 8 (Tested), untuk Ubuntu belum dicoba 

## Installation 
- Secara default server akan menggunakan port 6001 dengan credentials App Id : `app-id` , App Key : `app-key` dan Secret : `app-secret`
- Agar server bisa berjalan secara permanent, kamu bisa install proses manager seperti [supervisor](https://github.com/petruisfan/node-supervisor), sebuah daemon yang bisa run dan restart proses pada background. Setelah install supervisor kamu bisa menggunakan konfigurasi [disini](#supervisor-configuration)
- Kamu juga bisa menggunakan [pm2](https://pm2.keymetrics.io/) sebagai proses manager dengan menggunakan command `pm2 start pds-pusher-server-pm2 -- start`
- Menggunakan docker (sedang di usahakan)

## How to install for the global cli 
- Masuk kedalam folder 
- Lalu ketik `npm install`
- Tunggu sampai selesai
- Lalu ketik `npm run build`
- Setelah berhasil terbuild
- Lalu ketik `npm link`
- Lalu bisa di coba di ketikan `pds-pusher-server` 

## Server Configuration
- untuk debug PDSPUSHER_DEBUG=1
- Kamu juga bisa menggunakan format JSON [seperti ini](#json-configuration)

## Supervisor Configuration
```
[program:pdspusher]
process_name=%(program_name)s_%(process_num)02d
command=pds-pusher start
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=ubuntu
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/pds-pusher-supervisor.log
stopwaitsecs=60
stopsignal=sigint
minfds=10240
```

## JSON Configuration
- pds-pushser-server --config=app.json
```json
{
    "debug": true,
    "port": 6002,
    "manager.array.apps": [
        {
            "id": "app",
            "key": "app",
            "secret": "app",
        }
    ]
}
```
