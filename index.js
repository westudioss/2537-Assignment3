function setup () {

  document.getElementById("game_grid").innerHTML = "<h1>Loading...</h1>";
  document.getElementById("result_text").innerHTML = "";

  let pokelist = [];
  let cards = [];
  var difficulty = document.getElementById("difficulty").value;
  var difficultyNum = 0;
  var clicks = 0;
  var matches = 0;
  var pairsLeft = 0;
  var pairsTotal = 0;
  var timeLeft = 0;
  var canPlay = false;
  var gameEnded = false;
  var powerupAmount = 0;

  switch (difficulty) {
    case "Easy":
      difficultyNum = 6;
      timeLeft = 30;
      document.getElementById("game_grid").style.width = "600px";
      document.getElementById("game_grid").style.height = "400px";
      break;
    case "Medium":
      difficultyNum = 12;
      timeLeft = 60;
      document.getElementById("game_grid").style.width = "1200px";
      document.getElementById("game_grid").style.height = "400px";
      break;
    case "Hard":
      difficultyNum = 24;
      timeLeft = 120;
      document.getElementById("game_grid").style.width = "1600px";
      document.getElementById("game_grid").style.height = "600px";
      break;
    default:
  }

  pairsTotal = difficultyNum/2;
  pairsLeft = pairsTotal;

  for (var i = 0; i < difficultyNum; i++) {
      cards.push(0);
  }

  async function loadCards() {
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=500`);
    let jsonObj = await response.json();

    let pokemons = jsonObj.results;

    for (var i = 0; i < pokemons.length; i++) {
        var response2 = await fetch(pokemons[i].url);
        var jsonObj2 = await response2.json();

        pokelist.push({name: pokemons[i].name, image: jsonObj2.sprites.other['official-artwork'].front_default});
    }

    for (var i = 0; i < difficultyNum/2; i++)
    {
        var num = Math.floor(Math.random() * pokelist.length);
        var poke = pokelist[num];
        var cardNum = Math.floor(Math.random() * cards.length);
        
        while (true) {
            cardNum = Math.floor(Math.random() * cards.length);

            if (cards[cardNum] == 0) {
                cards[cardNum] = poke;
                break;
            }
        }

        while (true) {
            cardNum = Math.floor(Math.random() * cards.length);

            if (cards[cardNum] == 0) {
                var poke2 = structuredClone(poke);
                poke2.name += "2";
                cards[cardNum] = poke2;
                break;
            }
        }
    }

    var str = "";

    for (var i = 0; i < cards.length; i++) {
        str += `<div class="card">
                  <img id="${cards[i].name}" class="front_face" src="${cards[i].image}" alt="">
                  <img class="back_face" src="back.webp" alt="">
                </div>`
    }
    document.getElementById("game_grid").innerHTML = str;

    let firstCard = undefined;
    let secondCard = undefined;
    $(".card").on(("click"), function () {
      if (canPlay) {
        if (firstCard == undefined || secondCard == undefined) {
          var card = $(this).find(".front_face")[0];

          if (card != firstCard) {
            $(this).toggleClass("flip");
            clicks ++;
          }

          if (!firstCard) {
            firstCard = card;
          } else if (card != firstCard) {
            secondCard = card;
            
            if (firstCard.src == secondCard.src) {
              $(`#${firstCard.id}`).parent().off("click")
              $(`#${secondCard.id}`).parent().off("click")
              firstCard = undefined;
              secondCard = undefined;
              matches ++;
              pairsLeft --;
              powerupAmount ++;
            } else {
              setTimeout(() => {
                $(`#${firstCard.id}`).parent().toggleClass("flip")
                $(`#${secondCard.id}`).parent().toggleClass("flip")
                firstCard = undefined;
                secondCard = undefined;
              }, 1000)
              powerupAmount = 0;
            }
          }
        }

        if (powerupAmount >= 2) {
          timeLeft += 5;
          powerupAmount = 0;
        }

        if (matches >= difficultyNum/2) {
            document.getElementById("result_text").innerHTML =
            `
              <h1>You win!</h1>
            `
            canPlay = false;
            gameEnded = true;
        }
      }
    });
  }
  loadCards();

  document.getElementById("start").addEventListener("click", () => {
    if (gameEnded == false) {
      canPlay = true;
    }
    
    var timeInterval = setInterval(() => {
      timeLeft --;

      if (gameEnded == true || canPlay == false) {
        clearInterval(timeInterval);
      }

      if (timeLeft <= 0) {
        canPlay = false;
        gameEnded = true;
        document.getElementById("result_text").innerHTML =
        `
          <h1>You lose!</h1>
        `
        clearInterval(timeInterval);
      }
    }, 1000);
  });

  document.getElementById("restart").addEventListener("click", () => {
    clearInterval(interval);
    setup();
  });

  document.getElementById("difficulty").addEventListener("change", function () {
    clearInterval(interval);
    setup();
  });

  var interval = setInterval(() => {
    document.getElementById("timer").innerText = "Time left: " + timeLeft;
    document.getElementById("clicks").innerText = "Total clicks: " + clicks;
    document.getElementById("matches").innerText = "Matches made: " + matches;
    document.getElementById("pairsLeft").innerText = "Pairs left: " + pairsLeft;
    document.getElementById("pairsTotal").innerText = "Pairs total: " + pairsTotal;
  }, 100);
}

$(document).ready(setup)