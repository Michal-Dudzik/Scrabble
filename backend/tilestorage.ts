import { ITile  } from "./boardtile"
import { LetterTile } from "./boardtile"
export class PlayerHand
{
    playerhand: [LetterTile] //array storing letters currently held by player
    tradetiles(chosentile: LetterTile, unusedtilestorage: UnusedTiles["unusedtilestorage"]) //TO DO removes tile chosen by player from his hand and gives him random one from unusedtilestorage
    {
        const index = this.playerhand.map(object => object.id).indexOf(chosentile.id) //find index of choesentile
        this.playerhand.splice(index, 1) //remove chosentile from players hand
        const newtile: LetterTile = unusedtilestorage[Math.floor(Math.random()*unusedtilestorage.length)]//find random tile from unusedtilestorage
        unusedtilestorage.push(chosentile) //return tile to unusedtilestorage
        this.playerhand.push(newtile)
        console.log("Tile {0} has been removed from players hand and tile {1} has been added", chosentile.value, newtile.value)
    }
    drawtile(unusedtilestorage: UnusedTiles["unusedtilestorage"])
    {
        const newtile: LetterTile = unusedtilestorage[Math.floor(Math.random()*unusedtilestorage.length)]//find random tile from unusedtilestorage
        this.playerhand.push(newtile)
        console.log("TIle {0} has been added to players hand", newtile.value)
    }
}
export class UnusedTiles
{
    unusedtilestorage: [LetterTile] //array storing lettertiles
    //idk what else can be stored in this class
    filltilestorage()
    {
       // this.unusedtilestorage{} @Michał Dudzik to twoje zadanie masz wypisać tu wpisać wszystkie literki wraz z ich wartościami dzięki <3
    }
}