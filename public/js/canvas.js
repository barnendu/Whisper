window.onload = canvasConf
var doAnim = true, ctx, canvas, coordinate, copyCoordinate, addBlock=false;
function canvasConf() {
    ctx = document.querySelector("canvas").getContext("2d");
    canvas = document.getElementById("myCanvas");
    canvas.width = 800;
    canvas.height = 550;
    var node = document.getElementById("node_count").value;
        coordinate = [];
    var x = 500, y = 260;
    var a = (Math.PI * 2) / node;
    ctx.translate(x, y);
    for (var i = 1; i <= node; i++) {
        x = 225 * Math.cos(a * i);
        y = 225 * Math.sin(a * i);
        coordinate.push({ x: x, y: y })
        var length = coordinate.length;
        if (length == node) {
            var coords = coordinate.slice(0);
            copyCoordinate = coordinate.slice(0);
            var img = new Image();
            img.src = "computer.jpg";
            img.onload=function(){
            coords.forEach(function (cord, ind) {
                ctx.drawImage(img, cord.x - 25, cord.y - 25);
            })
    }
        }
    }

}
function drawNodes(ctx, coords) {
    var img = new Image();
    var mine=new Image();
     img.src="computer.jpg";
     mine.src="file1.png";
     var exp =document.getElementById("parent_selection").value.split("-")[1] ,prnit;
        prnit = exp, i=1;
   coords.forEach(function (cord) {
       
        ctx.drawImage(img, cord.x - 25, cord.y - 25);
        ctx.font = "20px Arial";
            if(addBlock && i==1)
               ctx.drawImage(mine, cord.x +35, cord.y+40);
        ctx.fillText(prnit,cord.x+10, cord.y+10);
        prnit=(i >= exp ) ? i+1 : i;
        i++;
    })
    
}
function stopPropagation() {
    setTimeout(function () {
        doAnim = false;
        addBlock=true;
        clearScreen();

    }, 8000);
}
function clearScreen() {
    setTimeout(function () {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        drawNodes(ctx, copyCoordinate);
    }, 1);
}
function drawConnector() {
    for (var i = 0; i < coordinate.length; i++) {
        coordinate.forEach(function (cord, ind) {
            if (ind > 0) {
                if (doAnim && !i) {
                    startOcilation(ctx, coordinate[0].x, coordinate[0].y, cord.x, cord.y);
                }

            }
        });
         coordinate.splice(0, 1)
    }
}

function startOcilation(ctx, x1, y1, x2, y2) {
    var y1 = y1, y2 = y2, x1 = x1, x2 = x2                  // source and destination positions
    current = 0, max = 1000, delta = 1;    // counters for calculating/animating t

    (function loop() {
        // calc t
        current += delta;
        var t = current / max;                 // normalize so we get [0, 1]
       // if (t <= 0 || t >= 1) delta = - delta;  // to ping-pong the animation for demo
        if(t <= 0 || t >= 1){
            current = 0;
            delta = 1;
        }
        // calc lerp linear
        var yl = lerp(y1, y2, t),
            xl = lerp(x1, x2, t);             // linear

        var a = new Image()
        a.src = "file1.png";
        ctx.drawImage(a, xl, yl);
        clearScreen();


        if (doAnim) {
            requestAnimationFrame(loop);
        }
        else {
            return;
        }

    })();
}
function lerp(p1, p2, t) {
    return p1 + (p2 - p1) * t
}