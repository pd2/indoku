const numeral_scripts = {
  
  "international" : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  
  "Devanagari"    : ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],

  "Kannada"       : ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"],

  "Tamil"         : ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"],

  "Telugu"        : ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"],

  "Malayalam"     : ["൦", "൧", "൨", "൩", "൪", "൫", "൬", "൭", "൮", "൯"],

  "Marathi"       : ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],

  "Gujrati"       : ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"],

  "Gurmukhi"      : ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"],

  "Oriya"         : ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"],

  "Bangla"        : ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],

  "Asomiya"       : ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],

  "Urdu"          : ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
};

const list_scripts = ["Kannada","Tamil","Telugu","Malayalam","Marathi",
                      "Gujrati","Gurmukhi","Oriya","Bangla","Asomiya","Urdu"];

var display_scripts = ["Kannada","international","international","Devanagari"];

var lang_rand_indx = -1;

// grid variable
var table;

// game number
var gameId = 0;

// puzzle grid
var puzzle = [];

// solution grid
var solution = [];

// remaining number counts
var remaining = [4, 4, 4, 4];

// variable to check if "Sudoku Solver" solve the puzzle
var isSolved = false;
var canSolved = true;

// stopwatch timer variables
var timer = 0;
var pauseTimer = false;
var intervalId;
var gameOn = false;

function newGame(difficulty) {
  
  do {
  // get random position for numbers from '1' to '4' to generate a random puzzle
  var grid = getGridInit();

  // prepare rows, columns and blocks to solove the initioaled grid
  var rows = grid;
  var cols = getColumns(grid);
  var blks = getBlocks(grid);

  //          solve the grid section
  // generate allowed digits for each cell
  var psNum = generatePossibleNumber(rows, cols, blks);

  // solve the grid
  solution = solveGrid(psNum, rows, true);
    
  } while(solution == undefined)

  // reset the game state timer and remaining number
  timer = 0;
  for (var i in remaining) remaining[i] = 4;

  // empty cells from grid depend on difficulty
  // for now it will be:
  // 4 empty cells for easy
  // 6 empty cells for normal
  // 8 empty cells for hard
  puzzle = makeItPuzzle(solution, difficulty);

  // game is on when the difficulty = [0, 2]
  gameOn = difficulty < 3 && difficulty >= 0;

  // update the UI
  ViewPuzzle(puzzle);
  updateRemainingTable();
  
  document.getElementById("language-1").innerText = display_scripts[0];
  document.getElementById("language-2").innerText = display_scripts[3];
  document.getElementById("language-2").style = "text-align:right";

  // finally, start the timer
  if (gameOn) startTimer();
}

function getGridInit() {
  var rand = [];
  // for each digits from 1 to 9 find a random row and column
  for (var i = 1; i <= 4; i++) {
    var row = Math.floor(Math.random() * 4);
    var col = Math.floor(Math.random() * 4);
    var accept = true;
    for (var j = 0; j < rand.length; j++) {
      // if number exist or there is a number already located in then ignore and try again
      if ((rand[j][0] == i) | ((rand[j][1] == row) & (rand[j][2] == col))) {
        accept = false;

        // try to get a new position for this number
        i--;
        break;
      }
    }
    if (accept) {
      rand.push([i, row, col]);
    }
  }

  // initialize new empty grid
  var result = [];
  for (var i = 0; i < 4; i++) {
    var row = "0000";
    result.push(row);
  }

  // put numbers in the grid
  for (var i = 0; i < rand.length; i++) {
    result[rand[i][1]] = replaceCharAt(
      result[rand[i][1]],
      rand[i][2],
      rand[i][0]
    );
  }

  return result;
}

// return columns from a row grid
function getColumns(grid) {
  var result = ["", "", "", ""];
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) result[j] += grid[i][j];
    /*try {
            result[j] += grid[i][j];
        } catch (err) {
            alert(grid);
        }*/
  }
  return result;
}

// return blocks from a row grid
function getBlocks(grid) {
  var result = ["", "", "", ""];
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++)
      result[Math.floor(i / 2) * 2 + Math.floor(j / 2)] += grid[i][j];
  }
  return result;
}

// function to replace char in string
function replaceCharAt(string, index, char) {
  if (index > string.length - 1) return string;
  return string.substr(0, index) + char + string.substr(index + 1);
}

// get allowed numbers that can be placed in each cell
function generatePossibleNumber(rows, columns, blocks) {
  var psb = [];

  // for each cell get numbers that are not viewed in a row, column or block
  // if the cell is not empty then, allowed number is the number already exist in it
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      psb[i * 4 + j] = "";
      if (rows[i][j] != 0) {
        psb[i * 4 + j] += rows[i][j];
      } else {
        for (var k = "1"; k <= "4"; k++) {
          if (!rows[i].includes(k))
            if (!columns[j].includes(k))
              if (
                !blocks[Math.floor(i / 2) * 2 + Math.floor(j / 2)].includes(k)
              )
                psb[i * 4 + j] += k;
        }
      }
    }
  }
  return psb;
}

function solveGrid(possibleNumber, rows, startFromZero) {
  var solution = [];
  // debugger
  // solve Sudoku with a backtracking algorithm
  // Steps are:
  //  1.  get all allowed numbers that fit in each empty cell
  //  2.  generate all possible rows that fit in the first row depend on the allowed number list
  //` 3.  select one row from possible row list and put it in the first row
  //  4.  go to next row and find all possible number that fit in each cell
  //  5.  generate all possible row fit in this row then go to step 3 until reach the last row or there aren't any possible rows left
  //  6.  if next row hasn't any possible left then go the previous row and try the next possibility from possibility rows' list
  //  7.  if the last row has reached and a row fit in it has found then the grid has solved

  var result = nextStep(0, possibleNumber, rows, solution, startFromZero);
  if (result == 1) return solution;
}

// level is current row number in the grid
function nextStep(row_no, possibleNumber, rows, solution, startFromZero) {
  // get possible number fit in each cell in this row
  var x = possibleNumber.slice(row_no * 4, (row_no + 1) * 4);

  // generate possible numbers sequence that fit in the current row
  var y = generatePossibleRows(x);
  if (y.length == 0) return 0;

  // to allow check is solution is unique
  var start = startFromZero ? 0 : y.length - 1;
  var stop = startFromZero ? y.length - 1 : 0;
  var step = startFromZero ? 1 : -1;
  var condition = startFromZero ? start <= stop : start >= stop;

  // try every numbers sequence in this list and go to next row
  for (var num = start; condition; num += step) {
    var condition = startFromZero ? num + step <= stop : num + step >= stop;
    for (var i = row_no + 1; i < 4; i++) solution[i] = rows[i];
    solution[row_no] = y[num];
    if (row_no < 3) {
      /*if (solution[4] === undefined) {
                var x = 0;
                x++;
            }*/
      var cols = getColumns(solution);
      var blocks = getBlocks(solution);

      var poss = generatePossibleNumber(solution, cols, blocks);
      if (nextStep(row_no + 1, poss, rows, solution, startFromZero) == 1)
        return 1;
    }
    if (row_no == 3) return 1;
  }
  return -1;
}

// generate possible numbers sequence that fit in the current row
function generatePossibleRows(possibleNumber) {
  var result = [];

  function step(row_no, PossibleRow) {
    if (row_no == 4) {
      result.push(PossibleRow);
      return;
    }

    for (var i in possibleNumber[row_no]) {
      if (PossibleRow.includes(possibleNumber[row_no][i])) continue;
      step(row_no + 1, PossibleRow + possibleNumber[row_no][i]);
    }
  }

  step(0, "");

  return result;
}

// empty cell from grid depends on the difficulty to make the puzzle
function makeItPuzzle(grid, difficulty) {
  /*
        difficulty:
        // hard     : 0;
        // Normal   : 1;
        // easy     : 2;
    */

  // empty_cell_count = 3 * difficulty + 4
  // when difficulty = 4, empty_cell_count = 16 (total cells count)
  // so the puzzle is shown as solved grid
  if (!(difficulty < 3 && difficulty > -1)) difficulty = 4;
  var remainedValues = 16;
  var puzzle = grid.slice(0);

  // function to remove value from a cell and its symmetry then return remained values
  function clearValue(grid, x, y, remainedValues) {
    function getSymmetry(x, y) {
      var symX = 3 - x; //Symmetry
      var symY = 3 - y;
      return [symX, symY];
    }
    var sym = getSymmetry(x, y);
    if (grid[y][x] != 0) {
      grid[y] = replaceCharAt(grid[y], x, "0");
      remainedValues--;
      if (x != sym[0] && y != sym[1]) {
        grid[sym[1]] = replaceCharAt(grid[sym[1]], sym[0], "0");
        remainedValues--;
      }
    }
    return remainedValues;
  }

  // remove value from a cell and its symmetry to reach the expected empty cells amount
  while (remainedValues > difficulty * 2 + 9) {
    var x = Math.floor(Math.random() * 4);
    var y = Math.floor(Math.random() * 4);
    remainedValues = clearValue(puzzle, x, y, remainedValues);
  }
  return puzzle;
}

// view grid in html page
function ViewPuzzle(grid) {
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[i].length; j++) {
      var input = table.rows[i].cells[j].getElementsByTagName("input")[0];
      addClassToCell(table.rows[i].cells[j].getElementsByTagName("input")[0]);
      
      var script = display_scripts[Math.floor(i / 2) * 2 + Math.floor(j / 2)];
      
      if (grid[i][j] == "0") {
        
        input.disabled = false;
        input.value = "";
        
      } else {
        input.disabled = true;
        
        input.value = grid[i][j];
        input.value = numeral_scripts[script][grid[i][j]];
        
        
        remaining[grid[i][j] - 1]--;
      }
    }
  }
}

// read current grid
function readInput() {
  
  var result = [];
  
  for (var i = 0; i < 4; i++) {
    
    result.push("");
    
    for (var j = 0; j < 4; j++) {
      
      var input = table.rows[i].cells[j].getElementsByTagName("input")[0];
      
      // var script = display_scripts[Math.floor(i / 2) * 2 + Math.floor(j / 2)];
      
      if (input.value == "" || input.value.length > 1 || input.value == "0") {
        
        input.value = "";
        result[i] += "0";
      
      } else {
        result[i] += input.value;
        // result[i] += numeral_scripts[script].indexOf(input.value);
      }
    }
  }
  return result;
}

// check value if it is correct or wrong
// return:
//  0 for value can't be changed
//  1 for correct value
//  2 for value that hasn't any conflict with other values
//  3 for value that conflict with value in its row, column or block
//  4 for incorect input
function checkValue(value, row, column, block, defaultValue, correctValue, lang_num) {
  
  if (value === "" || value === "0") return 0;
  
  value = numeral_scripts[display_scripts[lang_num]].indexOf(value).toString();
  
  if (!(value > "0" && value < ":")) return 4;
  
  if (value === defaultValue) return 0;
  
  if (
    row.indexOf(value) != row.lastIndexOf(value) ||
    column.indexOf(value) != column.lastIndexOf(value) ||
    block.indexOf(value) != block.lastIndexOf(value)
  ) {
    return 3;
  }
  
  if (value !== correctValue) return 2;
  return 1;
}

// remove old class from input and add a new class to represent current cell's state
function addClassToCell(input, className) {
  // remove old class from input
  input.classList.remove("right-cell");
  input.classList.remove("warning-cell");
  input.classList.remove("wrong-cell");

  if (className != undefined) input.classList.add(className);
}

// update value of remaining numbers in html page
function updateRemainingTable() {
  for (var i = 1; i < 5; i++) {
    var item = document.getElementById("remain-" + i);
    item.innerText = remaining[i - 1];
    item.classList.remove("red");
    item.classList.remove("gray");
    if (remaining[i - 1] === 0) item.classList.add("gray");
    else if (remaining[i - 1] < 0 || remaining[i - 1] > 4)
      item.classList.add("red");
  }
}

// start stopwatch timer
function startTimer() {
  var timerDiv = document.getElementById("timer");
  clearInterval(intervalId);

  // update stopwatch value every one second
  pauseTimer = false;
  intervalId = setInterval(function () {
    if (!pauseTimer) {
      timer++;
      var min = Math.floor(timer / 60);
      var sec = timer % 60;
      timerDiv.innerText =
        (("" + min).length < 2 ? "0" + min : min) +
        ":" +
        (("" + sec).length < 2 ? "0" + sec : sec);
    }
  }, 1000);
}

// hide more option menu
function hideMoreOptionMenu() {
  var moreOptionList = document.getElementById("more-option-list");
  if (moreOptionList.style.visibility == "visible") {
    moreOptionList.style.maxWidth = "40px";
    moreOptionList.style.minWidth = "40px";
    moreOptionList.style.maxHeight = "10px";
    moreOptionList.style.opacity = "0";
    setTimeout(function () {
      moreOptionList.style.visibility = "hidden";
    }, 175);
  }
}

// UI Comunication functions

// function that must run when document loaded
window.onload = function () {
  
  // assigne table to its value
  table = document.getElementById("puzzle-grid");
  
  // add ripple effect to all buttons in layout
  var rippleButtons = document.getElementsByClassName("button");
  
  for (var i = 0; i < rippleButtons.length; i++) {
    rippleButtons[i].onmousedown = function (e) {
      // get ripple effect's position depend on mouse and button position
      var x = e.pageX - this.offsetLeft;
      var y = e.pageY - this.offsetTop;

      // add div that represents the ripple
      var rippleItem = document.createElement("div");
      rippleItem.classList.add("ripple");
      rippleItem.setAttribute("style", "left: " + x + "px; top: " + y + "px");

      // if ripple item should have special color... get and apply it
      var rippleColor = this.getAttribute("ripple-color");
      if (rippleColor) rippleItem.style.background = rippleColor;
      this.appendChild(rippleItem);

      // set timer to remove the dif after the effect ends
      setTimeout(function () {
        rippleItem.parentElement.removeChild(rippleItem);
      }, 1500);
    };
  }
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      var input = table.rows[i].cells[j].getElementsByTagName("input")[0];
        // var lang_num = [Math.floor(i / 2) * 2 + Math.floor(j / 2)];
      input.i = i;
      input.j = j;

      // add function to remove color from cells and update remaining numbers table when it get changed
      input.onchange = function () {
        //remove color from cell
        addClassToCell(this);

        // check if the new value entered is allowed
        function checkInput(input) {
          if (input.value[0] < "1" || input.value[0] > "4") {
            if (input.value != "?" && input.value != "؟") {
              input.value = "";
              alert("only numbers [1-4] and question mark '?' are allowed!!");
              input.focus();
            }
          } 
        }
        checkInput(this);

        // compare old value and new value then update remaining numbers table
        if (this.value > 0 && this.value < 5) remaining[this.value - 1]--;
        if (this.oldvalue !== "") {
          if (this.oldvalue > 0 && this.oldvalue < 5)
            remaining[this.oldvalue - 1]++;
        }
        
        var lang_num = [Math.floor(this.i / 2) * 2 + Math.floor(this.j / 2)];
        
        var new_val = numeral_scripts[display_scripts[lang_num]][this.value];

        this.value = new_val;
        
        //reset canSolved value when change any cell
        canSolved = true;

        updateRemainingTable();
      };

      //change cell 'old value' when it got focused to track numbers and changes on grid
      input.onfocus = function () {
        this.oldvalue = this.value;
      };
    }
  }
};

// function to hide dialog opened in window
window.onclick = function (event) {
  var d1 = document.getElementById("dialog");
  var d2 = document.getElementById("about-dialog");
  var m1 = document.getElementById("more-option-list");

  if (event.target == d1) {
    hideDialogButtonClick("dialog");
  } else if (event.target == d2) {
    hideDialogButtonClick("about-dialog");
  } else if (m1.style.visibility == "visible") {
    hideMoreOptionMenu();
  }
};

// show hamburger menu
function HamburgerButtonClick() {
  // debugger
  var div = document.getElementById("hamburger-menu");
  var menu = document.getElementById("nav-menu");
  div.style.display = "block";
  div.style.visibility = "visible";
  setTimeout(function () {
    div.style.opacity = 1;
    menu.style.left = 0;
  }, 50);
}

// start new game
function startGameButtonClick() {
  var difficulties = document.getElementsByName("difficulty");
  var languages = document.getElementsByName("language");
  var language_rnd;

  // get language value
  for (var i = 0; i < languages.length; i++) {
    
    if (languages[i].checked) {
      
      lang_rand_indx++;

      if (lang_rand_indx == list_scripts.length){

        lang_rand_indx = 0;
      }

      language_rnd = list_scripts[lang_rand_indx];

      if (languages[i].value == "Random"){
        
        if (language_rnd == display_scripts[3]){
          
          lang_rand_indx++;

          if (lang_rand_indx == list_scripts.length){

            lang_rand_indx = 0;
          }

          language_rnd = list_scripts[lang_rand_indx];
          
        }
        
        display_scripts[0] = language_rnd;
        
      } else {
        
        display_scripts[0] = languages[i].value;
        
        if (language_rnd == languages[i].value){
          
          lang_rand_indx++;

          if (lang_rand_indx == list_scripts.length){

            lang_rand_indx = 0;
          }

          language_rnd = list_scripts[lang_rand_indx];
          
        }
        
        display_scripts[3] = language_rnd;
        
      }
      break;
    }
  }
  hideDialogButtonClick("lang");

  // difficulty:
  //  0 hard
  //  1 normal
  //  2 easy
  //  3 solved

  // initial difficulty to 3 (solved)
  var difficulty = 3;

  // get difficulty value
  for (var i = 0; i < difficulties.length; i++) {
    if (difficulties[i].checked) {
      newGame(2 - i);
      difficulty = i;
      break;
    }
  }
  if (difficulty > 2) newGame(3);

  hideDialogButtonClick("dialog");
  gameId++;
  document.getElementById("game-number").innerText = "game #" + gameId;

  // hide solver buttons
  // show other buttons
  document.getElementById("moreoption-sec").style.display = "block";
  document.getElementById("add-btn").style.display = "block";
  document.getElementById("check-btn").style.display = "block";

  // prerpare view for new game
  document.getElementById("timer-label").innerText = "Time";
  document.getElementById("timer").innerText = "00:00";
  document.getElementById("game-difficulty-label").innerText = "Status";

  document.getElementById("game-difficulty").innerText =
    difficulty < difficulties.length
      ? difficulties[difficulty].value
      : "solved";
}

// pause \ continue button click function
function pauseGameButtonClick() {
  var icon = document.getElementById("pause-icon");
  var label = document.getElementById("pause-text");

  // change icon and label of the button and hide or show the grid
  if (pauseTimer) {
    icon.innerText = "pause";
    label.innerText = "Pause";
    table.style.opacity = 1;
  } else {
    icon.innerText = "play_arrow";
    label.innerText = "Continue";
    table.style.opacity = 0;
  }

  pauseTimer = !pauseTimer;
}

// check grid if correct
function checkButtonClick() {
  // check if game is started
  if (gameOn) {
    var currentGrid = [];

    // read gritd status
    currentGrid = readInput();

    var columns = getColumns(currentGrid);
    var blocks = getBlocks(currentGrid);

    var errors = 0;
    var corrects = 0;
    
    var copyText;

    for (var i = 0; i < currentGrid.length; i++) {
      for (var j = 0; j < currentGrid[i].length; j++) {
        
        if (currentGrid[i][j] == "0") continue;
        
        var input = table.rows[i].cells[j].getElementsByTagName("input")[0];
        
        if (input.disabled) {
          
          result = 1;
          
        } else {
        
          var lang_num = [Math.floor(i / 2) * 2 + Math.floor(j / 2)];

          // check value if it is correct or wrong
          var result = checkValue(
            currentGrid[i][j],
            currentGrid[i],
            columns[j],
            blocks[Math.floor(i / 2) * 2 + Math.floor(j / 2)],
            puzzle[i][j],
            solution[i][j],
            lang_num
          );
          
          // remove old class from input and add a new class to represent current cell's state
          addClassToCell(
            table.rows[i].cells[j].getElementsByTagName("input")[0],
            result === 1
              ? "right-cell"
              : result === 2
              ? "warning-cell"
              : result === 3
              ? "wrong-cell"
              : undefined
          );
        }


        if (result === 1 || result === 0) {
          corrects++;
        } else if (result === 3) {
          errors++;
        }
      }
    }

    // if all values are correct and they equal original values then game over and the puzzle has been solved
    // if all values are correct and they aren't equal original values then game over but the puzzle has not been solved yet
    if (corrects === 16) {
      gameOn = false;
      pauseTimer = true;
      document.getElementById("game-difficulty").innerText = "Solved";
      clearInterval(intervalId);
      
      // alert("Congrats, You solved it.");
      
      let linkURL = "https://indoku.glitch.me";

      copyText = `I solved #Indoku Indianized sudoku puzzle with ${display_scripts[0]} and ${display_scripts[3]} scripts in ${timer} sec at ${linkURL}`;

      navigator.clipboard.writeText(copyText);

       if (navigator.canShare) {
        navigator.share({
          title: 'Share results',
          text: copyText,
          // url: linkURL,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
      }

    } else if (errors === 0 && corrects === 0) {
      alert(
        "Congrats, You solved it, but this is not the solution that I want."
      );
    }
    
    // add one minute to the stopwatch as a cost of grid's check
    timer += 60;
  }
}

// restart game
function restartButtonClick() {
  if (gameOn) {
    // reset remaining number table
    for (var i in remaining) remaining[i] = 4;

    // review puzzle
    ViewPuzzle(puzzle);

    // update remaining numbers table
    updateRemainingTable();

    // restart the timer
    // -1 is because it take 1 sec to update the timer so it will start from 0
    timer = -1;
  }
}

// surrender
function SurrenderButtonClick() {
  if (gameOn) {
    // reset remaining number table
    for (var i in remaining) remaining[i] = 4;

    // review puzzle
    ViewPuzzle(solution);

    // update remaining numbers table
    updateRemainingTable();

    // stop the game
    gameOn = false;
    pauseTimer = true;
    clearInterval(intervalId);

    // mark game as solved
    document.getElementById("game-difficulty").innerText = "Gave up";
  }
}

// hint
function hintButtonClick() {
  if (gameOn) {
    // get list of empty cells and list of wrong cells
    var empty_cells_list = [];
    var wrong_cells_list = [];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        var input = table.rows[i].cells[j].getElementsByTagName("input")[0];
        if (input.value == "" || input.value.length > 1 || input.value == "0") {
          empty_cells_list.push([i, j]);
        } else {
          if (input.value !== solution[i][j]) wrong_cells_list.push([i, j]);
        }
      }
    }

    // check if gird is solved if so stop the game
    if (empty_cells_list.length === 0 && wrong_cells_list.length === 0) {
      gameOn = false;
      pauseTimer = true;
      document.getElementById("game-difficulty").innerText = "Solved";
      clearInterval(intervalId);
      alert("Congrats, You solved it.");
    } else {
      // add one minute to the stopwatch as a cost for given hint
      timer += 60;

      // get random cell from empty or wrong list and put the currect value in it
      var input;
      if (
        (Math.random() < 0.5 && empty_cells_list.length > 0) ||
        wrong_cells_list.length === 0
      ) {
        var index = Math.floor(Math.random() * empty_cells_list.length);
        input = table.rows[empty_cells_list[index][0]].cells[
          empty_cells_list[index][1]
        ].getElementsByTagName("input")[0];
        input.oldvalue = input.value;
        input.value =
          solution[empty_cells_list[index][0]][empty_cells_list[index][1]];
        remaining[input.value - 1]--;
      } else {
        var index = Math.floor(Math.random() * wrong_cells_list.length);
        input = table.rows[wrong_cells_list[index][0]].cells[
          wrong_cells_list[index][1]
        ].getElementsByTagName("input")[0];
        input.oldvalue = input.value;
        remaining[input.value - 1]++;
        input.value =
          solution[wrong_cells_list[index][0]][wrong_cells_list[index][1]];
        remaining[input.value - 1]--;
      }

      // update remaining numbers table
      updateRemainingTable();
    }

    // make updated cell blinking
    var count = 0;
    for (var i = 0; i < 6; i++) {
      setTimeout(function () {
        if (count % 2 == 0) input.classList.add("right-cell");
        else input.classList.remove("right-cell");
        count++;
      }, i * 750);
    }
  }
}

function showDialogClick(dialogId) {
  // to hide navigation bar if it opened
  // hideHamburgerClick();

  var dialog = document.getElementById(dialogId);
  var dialogBox = document.getElementById(dialogId + "-box");
  dialogBox.focus();
  dialog.style.opacity = 0;
  dialogBox.style.marginTop = "-500px";
  dialog.style.display = "block";
  dialog.style.visibility = "visible";

  // to view and move the dialog to the correct position after it set visible
  setTimeout(function () {
    dialog.style.opacity = 1;
    dialogBox.style.marginTop = "64px";
  }, 200);
}

// show more option menu
function moreOptionButtonClick() {
  var moreOptionList = document.getElementById("more-option-list");

  // timeout to avoid hide menu immediately in window event
  setTimeout(function () {
    if (moreOptionList.style.visibility == "hidden") {
      moreOptionList.style.visibility = "visible";
      setTimeout(function () {
        moreOptionList.style.maxWidth = "160px";
        moreOptionList.style.minWidth = "160px";
        moreOptionList.style.maxHeight = "160px";
        moreOptionList.style.opacity = "1";
      }, 50);
    }
  }, 50);
}

function hideDialogButtonClick(dialogId) {
  var dialog = document.getElementById(dialogId);
  var dialogBox = document.getElementById(dialogId + "-box");
  dialog.style.opacity = 0;
  dialogBox.style.marginTop = "-500px";

  setTimeout(function () {
    dialog.style.visibility = "collapse";
    //dialog.style.display = "none";
  }, 500);
}

// hide hamburger menu when click outside
function hideHamburgerClick() {
  var div = document.getElementById("hamburger-menu");
  var menu = document.getElementById("nav-menu");
  menu.style.left = "-256px";

  setTimeout(function () {
    div.style.opacity = 0;
    //divstyle.display = "none";
    div.style.visibility = "collapse";
  }, 200);
}
