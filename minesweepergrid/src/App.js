//import React from 'react';
import ReactDOM from 'react-dom';
import React, { useState } from 'react';
import './App.css';
//import PropTypes from 'prop-types';

var playerName ="Diana";

class Cell extends React.Component {

  getValue(){
      if (!this.props.value.isRevealed){
          return this.props.value.isFlagged ? <img alt="flag" src ={ require("./purpleFlag.png")}></img> : null;
      }
      if (this.props.value.isMine) {
          return <img alt="bomb" src ={ require("./miscellaneous.png")}></img>;
      }
      if(this.props.value.neighbour === 0 ){
          return null;
      }
      return this.props.value.neighbour;
  }

  render(){
      let className = "cell" + (this.props.value.isRevealed ? "" : " hidden") + (this.props.value.isMine ? " is-mine" : "") + (this.props.value.isFlagged ? " is-flag" : "");


      return (
          <div ref="cell" onClick={this.props.onClick} className={className} onContextMenu={this.props.cMenu}>
              {this.getValue()}
          </div>
      );
  }
}

class Board extends React.Component {
  state = {
      boardData: this.initBoardData(this.props.height, this.props.width, this.props.mines),
      gameStatus: "Game in progress",
      gameWon: false,
      mineCount: this.props.mines,
      time: 0,
      hasStarted: false,
      interval: 0,
  };

  tick=()=> {
    if (this.state.gameStatus==="Game in progress"){
    

    this.setState({interval:setInterval(()=>{
      this.setState({
        time:this.state.time+1
      })
    },1000)})
    }
  }
 sendScoreToAPI = () => {
    //get player name from browser prompt
    prompt("Congrats for winning the game! 🎉");
    if (playerName != null) {
      var dataToSave = {
        playerScore: this.state.time, //replace 10 with your actual variable (probably this.state.gameScore or this.state.time)
        playerName: playerName,
        currentTime: new Date().toString()
      };
      console.log(dataToSave);
      // Actual API call
      fetch(
        "https://localhost:44375/api/TodoItems", // replace with the url to your API
        {method: 'POST', body: JSON.stringify(dataToSave), headers: {
            'Content-Type': 'application/json'
        },}
        )
        .then(res => res.json())
        .then(
          (result) => {
            alert('You saved your score! 🎉' );
          },
          // Note: it's important to handle errors here
          (error) => {
            alert('Bad API call 😞');
            console.log(error);
          }
        )
    }
  }

  

  /* Helper Functions */

  // get mines
  getMines(data) {
      let mineArray = [];

      data.map(datarow => {
          datarow.map((dataitem) => {
              if (dataitem.isMine) {
                  mineArray.push(dataitem);
              }
          });
      });

      return mineArray;
  }

  // get Flags
  getFlags(data) {
      let mineArray = [];

      data.map(datarow => {
          datarow.map((dataitem) => {
              if (dataitem.isFlagged) {
                  mineArray.push(dataitem);
              }
          });
      });

      return mineArray;
  }

  // get Hidden cells
  getHidden(data) {
      let mineArray = [];

      data.map(datarow => {
          datarow.map((dataitem) => {
              if (!dataitem.isRevealed) {
                  mineArray.push(dataitem);
              }
          });
      });

      return mineArray;
  }

  // get random number given a dimension
  getRandomNumber(dimension) {
      // return Math.floor(Math.random() * dimension);
      return Math.floor((Math.random() * 1000) + 1) % dimension;
  }

  // Gets initial board data
  initBoardData(height, width, mines) {
      let data = [];

      for (let i = 0; i < height; i++) {
          data.push([]);
          for (let j = 0; j < width; j++) {
              data[i][j] = {
                  x: i,
                  y: j,
                  isMine: false,
                  neighbour: 0,
                  isRevealed: false,
                  isEmpty: false,
                  isFlagged: false,
              };
          }
      }
      data = this.plantMines(data, height, width, mines);
      data = this.getNeighbours(data, height, width);
      console.log(data);
      return data;
  }

  // plant mines on the board
  plantMines(data, height, width, mines) {
      let randomx, randomy, minesPlanted = 0;

      while (minesPlanted < mines) {
          randomx = this.getRandomNumber(width);
          randomy = this.getRandomNumber(height);
          if (!(data[randomx][randomy].isMine)) {
              data[randomx][randomy].isMine = true;
              minesPlanted++;
          }
      }

      return (data);
  }

  // get number of neighbouring mines for each board cell
  getNeighbours(data, height, width) {
      let updatedData = data, index = 0;

      for (let i = 0; i < height; i++) {
          for (let j = 0; j < width; j++) {
              if (data[i][j].isMine !== true) {
                  let mine = 0;
                  const area = this.traverseBoard(data[i][j].x, data[i][j].y, data);
                  area.map(value => {
                      if (value.isMine) {
                          mine++;
                      }
                  });
                  if (mine === 0) {
                      updatedData[i][j].isEmpty = true;
                  }
                  updatedData[i][j].neighbour = mine;
              }
          }
      }

      return (updatedData);
  };

  // looks for neighbouring cells and returns them
  traverseBoard(x, y, data) {
      const el = [];

      //up
      if (x > 0) {
          el.push(data[x - 1][y]);
      }

      //down
      if (x < this.props.height - 1) {
          el.push(data[x + 1][y]);
      }

      //left
      if (y > 0) {
          el.push(data[x][y - 1]);
      }

      //right
      if (y < this.props.width - 1) {
          el.push(data[x][y + 1]);
      }

      // top left
      if (x > 0 && y > 0) {
          el.push(data[x - 1][y - 1]);
      }

      // top right
      if (x > 0 && y < this.props.width - 1) {
          el.push(data[x - 1][y + 1]);
      }

      // bottom right
      if (x < this.props.height - 1 && y < this.props.width - 1) {
          el.push(data[x + 1][y + 1]);
      }

      // bottom left
      if (x < this.props.height - 1 && y > 0) {
          el.push(data[x + 1][y - 1]);
      }

      return el;
  }

  // reveals the whole board
  revealBoard() {
      let updatedData = this.state.boardData;
      updatedData.map((datarow) => {
          datarow.map((dataitem) => {
              dataitem.isRevealed = true;
          });
      });
      this.setState({
          boardData: updatedData
      })
  }

  /* reveal logic for empty cell */
  revealEmpty(x, y, data) {
      let area = this.traverseBoard(x, y, data);
      area.map(value => {
          if (!value.isRevealed && (value.isEmpty || !value.isMine)) {
              data[value.x][value.y].isRevealed = true;
              if (value.isEmpty) {
                  this.revealEmpty(value.x, value.y, data);
              }
          }
      });
      return data;

  }

  // Handle User Events

  handleCellClick(x, y) {
      let win = false;
      
      
      if(this.state.hasStarted ===false){
        this.setState({hasStarted:true})
        this.tick()
      }
      // check if revealed. return if true.
      if (this.state.boardData[x][y].isRevealed) return null;

      // check if mine. game over if true
      if (this.state.boardData[x][y].isMine) {
          this.revealBoard();
          clearInterval(this.state.interval)
          alert("Game over 😞");
      }

      let updatedData = this.state.boardData;
      updatedData[x][y].isFlagged = false;
      updatedData[x][y].isRevealed = true;

      if (updatedData[x][y].isEmpty) {
          updatedData = this.revealEmpty(x, y, updatedData);
      }

      if (this.getHidden(updatedData).length === this.props.mines) {
          win = true;
          this.revealBoard();
          clearInterval(this.state.interval)
          this.sendScoreToAPI();
        //   this.getScoreFromAPI();
          let score = this.state.time
          alert("You Win 🎉. Score: " + score);
          
      }

      this.setState({
          boardData: updatedData,
          mineCount: this.props.mines - this.getFlags(updatedData).length,
          gameWon: win,
      });
  }

  _handleContextMenu(e, x, y) {
      e.preventDefault();
      let updatedData = this.state.boardData;
      let mines = this.state.mineCount;
      let win = false;

      // check if already revealed
      if (updatedData[x][y].isRevealed) return;

      if (updatedData[x][y].isFlagged) {
          updatedData[x][y].isFlagged = false;
          mines++;
      } else {
          updatedData[x][y].isFlagged = true;
          mines--;
      }

      if (mines === 0) {
          const mineArray = this.getMines(updatedData);
          const FlagArray = this.getFlags(updatedData);
          win = (JSON.stringify(mineArray) === JSON.stringify(FlagArray));
          if (win) {
              this.revealBoard();
              let score = this.state.time
              this.sendScoreToAPI();
            //   this.getScoreFromAPI();
              alert("You win 🎉. Score: " + score);
              clearInterval(this.state.interval)
          }
      }

      this.setState({
          boardData: updatedData,
          mineCount: mines,
          gameWon: win,
      });
  }

  renderBoard(data) {
      return data.map((datarow) => {
          return datarow.map((dataitem) => {
              return (
                  <div key={dataitem.x * datarow.length + dataitem.y}>
                      <Cell
                          onClick={() => this.handleCellClick(dataitem.x, dataitem.y)}
                          cMenu={(e) => this._handleContextMenu(e, dataitem.x, dataitem.y)}
                          value={dataitem}
                      />
                      {(datarow[datarow.length - 1] === dataitem) ? <div className="clear" /> : ""}
                  </div>);
          })
      });

  }
  // Component methods
  componentWillReceiveProps(nextProps) {
      if (JSON.stringify(this.props) !== JSON.stringify(nextProps)) {
          this.setState({
              boardData: this.initBoardData(nextProps.height, nextProps.width, nextProps.mines),
              gameWon: false,
              mineCount: nextProps.mines,
          });
      }
  }

  render() {
      return (
          <div className="game"><Leaderboard />
          <Legend />
          <div className="board">
            <div className="game">
              <div className="game-info">
                  <span className="info">Remaining mines: {this.state.mineCount}</span><br />
                  <span className="info">Timer: {this.state.time}</span><br />
                  <span className="info">{this.state.gameWon ? "You win! 🎉" : ""}</span>
              </div>
              </div>
              <div className="board-container">
              {
                  this.renderBoard(this.state.boardData)
              }
              </div>
              
          </div>
          </div>
      );
  }
}

class Legend extends React.Component{
    render(){
        return(
            <div className="legend">
           <div className="legend-container">
            <div className="legend-title">
                <span>Legend</span>
            </div>
            <div className = "legend-content">
                <div className="legend-item">
                    <span>Beginner</span>
                    <img src= { require("./B.png")}></img>
                </div>
                <div className="legend-item">
                    <span>Intermediate</span>
                    <img src= { require("./I.png")}></img>
                </div>
                <div className="legend-item">
                    <span>Advanced</span>
                    <img src= { require("./A.png")}></img>
                </div>
                <div className="legend-item">
                    <span>Expert</span>
                    <img src= { require("./E.png")}></img>
                </div>
            </div>
            </div>
            </div>
            
        )
    }
}

class Leaderboard extends React.Component{

    state = {
        leaderboard: []
    }

    getLeaderboardFromAPI = () => {
        // Actual API call
    
        fetch(
          "https://localhost:44375/api/TodoItems", // replace with the url to your API
          {
            method: 'GET', 
            headers: {
               'Content-Type': 'application/json'
            },
          }
          )
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({leaderboard: result}) //where you already initiated leaderboard in this.state as [] (empty array)
              console.log(result)
            },
            // Note: it's important to handle errors here
            (error) => {
              alert('Bad API call 😞');
              console.log(error);
            }
          )
    }
    
    getImage = (score) => {
        if(score <= 30)
            return(<img src= { require("./E.png")}></img>)
        else if(score > 30 && score <= 60)
            return(<img src= { require("./A.png")}></img>)
        else  if(score > 60 && score <= 90)
            return(<img src= { require("./I.png")}></img>)
        else
        return(<img src= { require("./B.png")}></img>)
    }

    render(){
       return( <div className="leaderboard">
           <div className="leaderboard-container">
            <div className="leaderboard-title">
                <span>Leaderboard</span>
            </div>
            <div className="leaderboard-content">
                {this.state.leaderboard.map((player) => (
                <div className="leaderboard-player" key ={player.id} >
                    <span> {player.playerName} : {player.playerScore} </span>
                    {this.getImage(player.playerScore)}
                </div>
                
                ))}
                
               
            </div>
            </div>
        </div>
       )}

       componentDidMount(){
           this.getLeaderboardFromAPI()
       }
}
class Game extends React.Component {
  state = {
      height: 8,
      width: 8,
      mines: 10,
  };

  
  render() {
      playerName = prompt("Please enter your name: ", "");
      const { height, width, mines } = this.state;
      return (
          <div className="game">
              <div className="player">
                  Welcome, {playerName}!
              </div>
                  <Board height={height} width={width} mines={mines} />
                
          </div>
      );
  }
}





export default Game;
