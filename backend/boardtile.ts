export interface ITile
{
    
    readonly type: number // 0 = empty else its letter (A = 1, B = 2...)
    readonly value: number 
    readonly status: number// 0 = tile in storage / 1 = tile is in player's hand / 2 = tile is on gameboard during acceptance phase / 3 = tile is placed on board 
}

export class EmptyTile implements ITile
{
    
    readonly type: number // 0 = empty tile
    readonly value: number // 0 = empty tile
    public status: number // 3 because empty tile can only apear on gameboard during board generation / 4 if tile contains bonus (probably wont be implemented)
    public constructor(){

    }
    
   
}
export class LetterTile implements ITile
{
    readonly type: number // A = 1, B = 2 etc
    readonly value: number // value of tile that is used in counting score
    public status: number 
    public id: number // every letter tile has its unique id

    public constructor() // TO DO
    {
        
    }
}