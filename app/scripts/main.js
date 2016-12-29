// Initialize Firebase
var config = {
	apiKey: "AIzaSyBOJC2_Dj_BvqKkVBUZnV9jay-euuIrrhI",
	authDomain: "kuggis-99246.firebaseapp.com",
	databaseURL: "https://kuggis-99246.firebaseio.com",
	storageBucket: "kuggis-99246.appspot.com",
	messagingSenderId: "625398520132"
};
firebase.initializeApp(config);
var gamesRef = firebase.database().ref('/games');
//Hämtar alla spel som är igång
function getGames(){
	gamesRef.on('value', function(snapshot){



		$('#game-list').html('');

		if(!snapshot.val()){
			$('#game-list').html('<li>No open games</li>');
		}
		snapshot.forEach(function(game){
			if(!game.val().players){
				gamesRef.child(game.key).remove();
			}else{
				gameTemplate(game);
			}
		});
	});
}



function createGame(title, password){
	if(password === ''){
		password = false;
	}
	gamesRef.push({
		'title': title,
		'password': password,
		'players': 'temp'
	}).then(function(snapshot){
		console.log(snapshot.key);
		var username = $('#username').val();
		joinGame(snapshot.key, username);
	});
}

function joinGame(gameId, username){
	gamesRef.child(gameId+'/players').push({
		'username': username
	}).then(function(snapshot){
		sessionStorage.gameUserId = snapshot.key;
		sessionStorage.gameId = gameId;
		setMyCurrentGame(gameId);
	});
}

function setMyCurrentGame(gameId){

	$('.window').hide();
	var game = $('.game');
	game.show();
	gamesRef.child(gameId).on('value', function(snapshot){
		$('#gameName').html(snapshot.val().title);
		$('#playerList').html('');
		snapshot.child('players').forEach(function(player){
			playerTemplate(player);
		});
	});
}

function leaveCurrentGame(){
	$('.window').hide();
	$('.lobby').show();
	var currentGame = sessionStorage.gameId;
	var currentPlayer = sessionStorage.gameUserId;
	gamesRef.child(currentGame+'/players/'+currentPlayer).remove();
	sessionStorage.gameId = "";
	sessionStorage.gameUserId = "";

}

function showNewGameWindow(){
	$('.window').hide();
	$('.new').show();
};


// Listar ut spelare inne i valt spel
function playerTemplate(player){
	var template = $('<li>'+player.val().username+'</li>');
	$('#playerList').append(template);
}

//Listar ut spel i listan
function gameTemplate(game){

	var template = $('<li>'+game.val().title+' <button class="joinGame" data-id="'+game.key+'">Join</button></li>');
	$('#game-list').append(template);
}

window.onbeforeunload = function(e){
	if(sessionStorage.gameId){
		disconnect();
		return true;
	}
};

(function(){ 
	getGames();
	
	if(sessionStorage.gameId && sessionStorage.gameId != ''){
		console.log(sessionStorage.gameId);
		setMyCurrentGame(sessionStorage.gameId);
	}

	$('#newGame').on('click', function(){
		showNewGameWindow();
	});

	$('#newGameButton').on('click', function(){
		var title = $('#newGameTitle').val();
		if($('#newGamePassword').val()){
			var pw = $('#newGamePassword').val();
		}else{
			var pw = false;
		}
		
		createGame(title, pw);
	});

	$('#game-list').on('click', 'button', function(){
		var gameId = $(this).attr('data-id');
		var username = $('#username').val();
		joinGame(gameId, username);
	})

	$('.leaveGame').on('click', function(){
		if(sessionStorage.gameId){
			if(confirm('Vill du verkligen lämna spelet?')){
				leaveCurrentGame();
			}
		}else{
			leaveCurrentGame();
		}
		
	});
	
})();