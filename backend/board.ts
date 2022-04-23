import { EmptyTile } from "./boardtile"
import { LetterTile } from "./boardtile"
import { ITile } from "./boardtile"
export class Board
{
    id:number 
    gameboard :any[][] = []
    players:string[] //list of player id's that are currently playing 
    constructor(x:Board)
    {
        this.id = x.id
        this.players = x.players    
    }
    public GenerateEmptyBoard() //method generating board
    {
        
        const rows:number = 14
        const columns:number = 14
        for (var i = 0; i < rows; i++)
        {
             for (var j = 0; j < columns; j++)
             {
                const emptytile: EmptyTile = new EmptyTile()
                this.gameboard[i][j].push(emptytile);
             }
        }       
    }
}