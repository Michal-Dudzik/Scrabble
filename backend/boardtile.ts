export class BoardTile
{
    id:number 
    isempty:boolean //made to be able to check if you can assign letter to tile
    tiletype:number //temporary; most likely type = enum [differently scored tiles]
    letter:string //null or storing letter
    constructor(x:BoardTile)
    {
        this.isempty = x.isempty
        this.tiletype = x.tiletype
        this.letter = x.letter
    }
}