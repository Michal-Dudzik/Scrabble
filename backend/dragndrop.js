var position;
var offset = [0,0];
var isDown = false;

function makeDraggable(el){

    ['mousedown', 'touchstart'].forEach( evt => 
        el.addEventListener(evt, pickup, true)
    );
    
    ['mousemove', 'touchmove'].forEach( evt => 
        el.addEventListener(evt, move, true)
    );

    ['mouseup', 'touchend'].forEach( evt => 
        el.addEventListener(evt, drop, true)
    );      
        
    function pickup(e) {
        isDown = true;
        if (e.clientX) {
            offset = [el.offsetLeft - e.clientX, el.offsetTop - e.clientY];
        }
        else if (e.touches) {  
            // for touch devices, use 1st touch only
            offset = [el.offsetLeft - e.touches[0].pageX, el.offsetTop - e.touches[0].pageY];
        }       
    }
    function move(e) {
        if (isDown) {
            if (e.clientX) {
                position = {x : e.clientX, y : e.clientY};
            }
            else if (e.touches) {
                position = {x : e.touches[0].pageX, y : e.touches[0].pageY};            
            }           
            el.style.left = (position.x + offset[0]) + 'px';
            el.style.top  = (position.y + offset[1]) + 'px';
        }
    }
    function drop(e) {
        // seems not to be needed for Android Chrome
        // and modern browsers on Mac & PC
        // but is required for iPad & iPhone
        isDown = false;     
        el.style.left = (position.x + offset[0]) + 'px';
        el.style.top  = (position.y + offset[1]) + 'px';
    }
}