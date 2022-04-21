import { BoardTile } from "./boardtile"
export class Board
{
    id:number 
    gameboard:BoardTile[][] = []
    players:string[] //list of player id's that are currently playing 
    constructor(x:Board)
    {
        this.id = x.id
        this.players = x.players    
    }
    public GenerateBoard() //method generating board
    {
        const emptyTile:BoardTile = {}
        const rows:number = 14
        const columns:number = 14
        for (var i = 0; i < rows; i++)
        {
             for (var j = 0; j < columns; j++)
             {
                this.gameboard[i][j].push();
             }
        }       
    }
}