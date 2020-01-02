/* jshint esversion: 8 */
const express = require('express') // 익스프레스
var app = express(); // 익스프레스
const session = require('express-session') // 세션
const Redis = require('redis') // 레디스
const client = Redis.createClient() // 레디스
var redisStore = require('connect-redis')(session) // 레디스
const bodyParser = require('body-parser') // 바디 파서
var sessionData = require('./imc/session.data')
var server = require('http').createServer(app)
var io = require('socket.io')(server)

app.use(bodyParser.urlencoded({ extended: false })) // 바디 파서 init
app.use(session({ // 세션 init
  secret: '1a3sdfg3#$#@13%#45asfsd',
  store: new redisStore({ client:client }),
  resave: false,
  saveUninitialized: true
}))

app.set('view engine', 'pug'); // 뷰 엔진 pug
app.set('views', './views'); // pug 'views' 폴더 사용
app.use('/', express.static(__dirname)); // 기본 디렉터리 위치 사용
app.use('/adm', require('./adm')); // adm는 모두 /adm 을 사용
app.use('/', require('./chatbot')); // chatbot은 모두 / 를 사용
app.locals.pretty = true; // 클라이언트 코드 설정

server.listen(3000, function(err) { // 포트실행
  console.log("connected 3000 port");
});

io.on('connection', function(socket) {
  console.log('소켓아이디', socket.id)
  // 접속한 클라이언트의 정보가 수신되면
  socket.on('login', function(data) {
    // sessionData[{
    //   dancode : 1413,
    //   username : '챗봇테스터001'
    // }] = socket.id

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    io.to(socket.id).emit('logout', "HIddddd");
  })
})
