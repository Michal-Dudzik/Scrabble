import { BoardTile } from "./boardtile"
export class Board
{
    boardid:number 
    gameboard:BoardTile[][] = []
    matrix = new Array(5).fill(0).map(() => new Array(4).fill(0));

}