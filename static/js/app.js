$(document).ready(function() {
//Matter js engine logic
// module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Events = Matter.Events,
        Mouse = Matter.MouseConstraint,
        Composite = Matter.Composite,
        Common = Matter.Common;

    var x, y,
        interval_particles_creation,
        mouseUp = false,
        mouseDown = false,
        engine_canvas_w_h = 300,

        color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58', '#E6F73C']),
        frame_options = {
            isStatic: true,
//        wireframes: false,
            render: {
                visible: true
            }
        },
        render_options = {
            wireframes: false,
            width: engine_canvas_w_h,
            height: engine_canvas_w_h
        };

// create an engine
    var engine = Engine.create(),
        world = engine.world;
    var elem = document.getElementById('particles_container');
    var engine_canvas = document.createElement('canvas');
    engine_canvas.setAttribute("id", "engine_canvas");

    var render = Render.create({
                                   element: elem,
        canvas: engine_canvas,
                                   options: render_options,
                                   engine: engine
                               });
    var rectangle_w = (engine_canvas_w_h/2)*Math.sqrt(2), // 212
        rectangle_x0_y0 = (engine_canvas_w_h-rectangle_w)/ 2, //44
        rectangle_x1_y1 = rectangle_x0_y0 + rectangle_w, //256
        rectangle_h = 1;
    var top_rectangle = Bodies.rectangle(engine_canvas_w_h/2,rectangle_x0_y0 , rectangle_w, rectangle_h, frame_options),
        bottom_rectangle = Bodies.rectangle(engine_canvas_w_h/2, rectangle_x1_y1, rectangle_w, rectangle_h, frame_options),
        right_rectangle = Bodies.rectangle(rectangle_x1_y1, engine_canvas_w_h/2, rectangle_h, rectangle_w, frame_options),
        left_rectangle = Bodies.rectangle(rectangle_x0_y0, engine_canvas_w_h/2, rectangle_h, rectangle_w, frame_options),

        rectangle_frame = Body.create({
                                          parts: [top_rectangle, bottom_rectangle, right_rectangle, left_rectangle],
                                          isStatic: true
                                      });
    var rectangle_frame_composite = Composite.create();
    Composite.add(rectangle_frame_composite, rectangle_frame);
    World.add(world, rectangle_frame_composite);

// run the engine
    Engine.run(engine);
// run the renderer
    Render.run(render);
    addParticle = function () {
        var particle = Bodies.polygon(x, y, 3, 30, {
            density: 5,
            friction: 10,
            wireframes: false,
            fillStyle: color,
            render: {
//                opacity: 0.7
            }
        });
        World.add(world, particle);
    };
    onMouseDownHandler = function () {
        mouseUp = false;
        mouseDown = true;
        x = event.pageX;
        y = event.pageY;
        addParticle();
        interval_particles_creation = setInterval(function () {
            addParticle()
        }, 100);
    };
    onMouseUpHandler = function () {
        mouseUp = true;
        mouseDown = false;
        clearInterval(interval_particles_creation)
    };
    generateParticlesWhileMouseDown = function (event) {
        if (!mouseDown) {
            return
        }
        x = event.pageX;
        y = event.pageY;
    };
    $(document).on('mousedown', event, onMouseDownHandler);
    $(document).on('mousemove', event, generateParticlesWhileMouseDown);
    $(document).on('mouseup', onMouseUpHandler);
//Matter js engine logic end

//left and right buttons logic
    var interval_rotation_frame_left,
        interval_rotation_frame_right,
        left_btn = $('#rotate_left_bt'),
        right_btn = $('#rotate_right_bt');

    rotateFrameLeft = function () {
        var degrees = 0.02;
        Composite.rotate(rectangle_frame_composite, degrees, {x: engine_canvas_w_h/2, y: engine_canvas_w_h/2});
    };
    rotateFrameRight = function () {
        var degrees = -0.02;
        Composite.rotate(rectangle_frame_composite, degrees, {x: engine_canvas_w_h/2, y: engine_canvas_w_h/2})
    };
    left_btn.mouseover(function () {
        interval_rotation_frame_left = setInterval(function () {
           rotateFrameLeft()
       }, 100)
    });
    left_btn.mouseleave(function () {
        clearInterval(interval_rotation_frame_left)
    });
    right_btn.mouseover(function () {
        interval_rotation_frame_right = setInterval(function () {
            rotateFrameRight()
        }, 100)
    });
    right_btn.mouseleave(function () {
        clearInterval(interval_rotation_frame_right)
    });
//end left and right buttons logic
//getting the image from current state of particles area
    getImageFromEngine = function () {
    };
    var radius_ins_circle = rectangle_w/2; //106
    var piece_canvas = document.createElement('canvas');
    var piece_ctx = piece_canvas.getContext('2d');
        piece_canvas.setAttribute("id", "piece");
        piece_canvas.width = radius_ins_circle*Math.sqrt(3); //triangle width 183
        piece_canvas.height = piece_canvas.width*Math.sqrt(3)/2;  //triangle height 159
    var piece_width  = piece_canvas.width,
        piece_height = piece_canvas.height;

//    var hexagon_canvas = document.createElement('canvas');
//    var hexagon_ctx = hexagon_canvas.getContext('2d');
//        hexagon_canvas.setAttribute("id", "hexagon_piece");
//        hexagon_canvas.width = piece_width*2; //hexagon width 366
//        hexagon_canvas.height = piece_height*2;  //hexagon height 318

    var kaleidoscope_canvas = document.getElementById('kaleidoscope'),
        kaleidoscope_ctx = kaleidoscope_canvas.getContext('2d');
        kaleidoscope_canvas.width = $(document).width();
        kaleidoscope_canvas.height = $(document).height();

    getCoordinatesOfHexagons = function () {
    /**
    * Calculate how many hexagons will be located along x and y axis. And return
    * array of points for every hexagon
    * @return  {array} array from coordinates of centers for hexagons.
    */
            var coordinates_list = [];
            var count_of_triangles_on_x_axis = Math.round(kaleidoscope_canvas.width/piece_width)+1; // + one hexagon on the right border of window
            var count_of_triangles_on_y_axis = Math.round(kaleidoscope_canvas.height/piece_height)+1; // + one hexagon on the bottom border of window
            for (var i = 0; i < count_of_triangles_on_x_axis; i++) {
                for (var j = 0; j < count_of_triangles_on_y_axis; j++) {
                    if ((i % 3 == 0) && (j % 2 == 0)) {
                        coordinates_list.push([piece_width *i, piece_height *j])
                    }
                    if ((i % 3 == 0) && !(j % 2 == 0)){
                        coordinates_list.push([piece_width *(i+1.5), piece_height*j])
                    }
                }
            }
            return coordinates_list
        };

        createHexagon = function(point, piece_img){
        /**
        * Description: take coordinates of the hexagon's center and image with triangle.
        * Add in kaleidoscope field  two triangles: 1'st with existed image and 2'nd with reversed copy of image.
        * Rotate even triangle around the center point and draw it
        * @param {array} point: list with x and y for hexagon's center
        * @param {number} piece_img: an element to draw into the context. The specification permits any canvas image source (CanvasImageSource).
        * @return none
        */
            kaleidoscope_ctx.save();
            kaleidoscope_ctx.translate(point[0], point[1]);
            for (var i=0; i<3; i++){
                kaleidoscope_ctx.scale(1, -1);
                kaleidoscope_ctx.drawImage(piece_img, 0, 0, piece_width,piece_height, -piece_width/2,0, piece_width, piece_height);
                kaleidoscope_ctx.rotate(-120* Math.PI / 180);
                kaleidoscope_ctx.scale(1, -1);
            }
            for (var j=0; j<3; j++){
                kaleidoscope_ctx.drawImage(piece_img, 0, 0, piece_width, piece_height, -piece_width/2, 0, piece_width, piece_height);
                kaleidoscope_ctx.rotate(-120* Math.PI / 180);
            }
            kaleidoscope_ctx.restore();
        };

        updateKaleidoscopeImg = function(){
        /**
        * Description:
        * @return none
        */
        //clearing canvases
        piece_ctx.clearRect(0,0 ,piece_canvas.width, piece_canvas.height);
//        kaleidoscope_ctx.clearRect(0, 0,kaleidoscope_canvas.width, kaleidoscope_canvas.height);
        //creation triangle part of kaleidoscope which will
        // be dublicated across all kaleidoscope container with function createHexagon
        piece_ctx.beginPath();
        piece_ctx.moveTo(0, piece_canvas.height);
        piece_ctx.lineTo(piece_width/2, 0);
        piece_ctx.lineTo(piece_width, piece_canvas.height);
        // clipping the part of engine_canvas image to piece_canvas
        piece_ctx.clip();
        var engine_image = engine_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        var current_img = new Image(); // here will be saving triangle image
        current_img.src = engine_image;
        current_img.onload = function(){
            piece_ctx.drawImage(current_img, 58.201, 44, piece_width, piece_height, 0, 0, piece_width, piece_height);
            //2
            var piece_image = piece_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            var piece_img = new Image();
            piece_img.src = piece_image;


            piece_img.onload = function(){

                var hexagons_map_coordinates = getCoordinatesOfHexagons()
                $.each(hexagons_map_coordinates, function(index, point){
                    createHexagon(point,piece_img)
                });
            };
        };

    };
//    $('#get_current_piece').click(updateKaleidoscopeImg);
    $( window ).resize(function() {
        kaleidoscope_canvas.width = $(document).width();
        kaleidoscope_canvas.height = $(document).height();
        updateKaleidoscopeImg()
    });
var counter = 0;
Events.on(engine, "beforeUpdate", function(){
    counter += 1;

        if (counter === 5){
            counter = 0;
            updateKaleidoscopeImg()
        }
})

//end getting the image from current state of particles area
});




