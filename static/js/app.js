$(document).ready(function() {
//Matter js engine logic
// module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Events = Matter.Events,
        MouseConstraint = Matter.MouseConstraint,
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
        var particle = Bodies.polygon(x, y, 3, 10, {
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
    onMouseDownHandler = function (event) {

        mouseUp = false;
        mouseDown = true;
        var parentOffset = $(this).parent().offset();
        x = event.pageX - parentOffset.left;
        y = event.pageY - parentOffset.top;
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
        var parentOffset = $(this).parent().offset();
        x = event.pageX - parentOffset.left;
        y = event.pageY - parentOffset.top;
    };
    $('#engine_canvas').on('mousedown', event, onMouseDownHandler);
    $('#engine_canvas').on('mousemove', event, generateParticlesWhileMouseDown);
    $('#engine_canvas').on('mouseup', onMouseUpHandler);
    $('#engine_canvas').on('mouseleave', onMouseUpHandler);
//Matter js engine logic end

//left and right buttons logic
    var interval_rotation_frame_left,
        interval_rotation_frame_right,
        left_btn = $('#rotate_left_bt'),
        right_btn = $('#rotate_right_bt');

    rotateFrameLeft = function () {
        var degrees = 0.08;
        Composite.rotate(rectangle_frame_composite, degrees, {x: engine_canvas_w_h/2, y: engine_canvas_w_h/2});
    };
    rotateFrameRight = function () {
        var degrees = -0.08;
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
    var triangle_canvas = document.createElement('canvas');
    var triangle_ctx = triangle_canvas.getContext('2d');
        triangle_canvas.setAttribute("id", "triangle_piece");
        triangle_canvas.width = radius_ins_circle*Math.sqrt(3); //triangle width 183
        triangle_canvas.height = triangle_canvas.width*Math.sqrt(3)/2;  //triangle height 159
    var triangle_piece_width  = triangle_canvas.width,
        triangle_piece_height = triangle_canvas.height;

    var hexagon_canvas = document.createElement('canvas');
    var hexagon_ctx = hexagon_canvas.getContext('2d');
        hexagon_canvas.setAttribute("id", "hexagon_piece");
        hexagon_canvas.width = triangle_piece_width*2; //hexagon width 366
        hexagon_canvas.height = triangle_piece_height*2;  //hexagon height 318
    var hexagon_piece_width = hexagon_canvas.width,
        hexagon_piece_height = hexagon_canvas.height;

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
        var count_of_triangles_on_x_axis = Math.round(kaleidoscope_canvas.width/triangle_piece_width)+1; // + one hexagon on the right border of window
        var count_of_triangles_on_y_axis = Math.round(kaleidoscope_canvas.height/triangle_piece_height)+1; // + one hexagon on the bottom border of window
        for (var i = 0; i < count_of_triangles_on_x_axis; i++) {
            for (var j = 0; j < count_of_triangles_on_y_axis; j++) {
                if ((i % 3 == 0) && (j % 2 == 0)) {
                    coordinates_list.push([triangle_piece_width *i, triangle_piece_height *j])
                }
                if ((i % 3 == 0) && !(j % 2 == 0)){
                    coordinates_list.push([triangle_piece_width *(i+1.5), triangle_piece_height*j])
                }
            }
        }
        return coordinates_list
    };

    createHexagonInPoint = function(point,hexagon_canvas_img){
    /**
    * Draw hexagon with center in current point
    * @param {array} point - array from x and y coordinates the center of hexagon
    * @param {HTMLCanvasElement} hexagon_canvas_img - element with hexagon image
    */
        kaleidoscope_ctx.save();
        kaleidoscope_ctx.translate(point[0],point[1]);
        kaleidoscope_ctx.drawImage(hexagon_canvas_img, 0, 0, hexagon_piece_width,hexagon_piece_height, -hexagon_piece_width/2,-hexagon_piece_height/2, hexagon_piece_width, hexagon_piece_height);
        kaleidoscope_ctx.restore()
    };
    createIntermediateTriangle = function(engine_canvas_img){
    /**
    * Get the triangle image from render frame of engine
    * @param {HTMLCanvasElement}  engine_canvas_img- HTMLCanvasElement with image of current state render frame
    * @return {HTMLCanvasElement} triangle_canvas_img- HTMLCanvasElement with image of triangle
    */
    //clearing canvas
    triangle_ctx.clearRect(0,0 ,triangle_piece_width, triangle_piece_height);
     //creation triangle part of hexagon
    // which will be dublicated across hexagon canvas with function createIntermediateHexagon
    triangle_ctx.beginPath();
    triangle_ctx.moveTo(0, triangle_piece_height);
    triangle_ctx.lineTo(triangle_piece_width/2, 0);
    triangle_ctx.lineTo(triangle_piece_width, triangle_piece_height);
    // clipping the part of engine_canvas_img image to triangle_canvas
    triangle_ctx.clip();
    triangle_ctx.drawImage(engine_canvas_img, 58.201, 44, triangle_piece_width, triangle_piece_height, 0, 0, triangle_piece_width, triangle_piece_height);
    return triangle_canvas;
    };
    createIntermediateHexagon = function(triangle_canvas_img){
    /**
    * Get the image of hexagon from the triangle
    * @param {HTMLCanvasElement} triangle_canvas_img - HTMLCanvasElement with image of triangle
    * @return {HTMLCanvasElement} hexagon_canvas - HTMLCanvasElement with image of hexagon
    */
        //clearing canvas
        hexagon_ctx.clearRect(0,0,hexagon_piece_width,hexagon_piece_height);
        hexagon_ctx.save();
        hexagon_ctx.translate(183, 159);
        for (var i=0; i<3; i++){
            hexagon_ctx.scale(1, -1);
            hexagon_ctx.drawImage(triangle_canvas_img, 0, 0, triangle_piece_width,triangle_piece_height, -triangle_piece_width/2,0, triangle_piece_width, triangle_piece_height);
            hexagon_ctx.rotate(-120* Math.PI / 180);
            hexagon_ctx.scale(1, -1);
        }
        for (var j=0; j<3; j++){
            hexagon_ctx.drawImage(triangle_canvas_img, 0, 0, triangle_piece_width, triangle_piece_height, -triangle_piece_width/2, 0, triangle_piece_width, triangle_piece_height);
            hexagon_ctx.rotate(-120* Math.PI / 180);
        }
        hexagon_ctx.restore();
        return hexagon_canvas;
    };

    updateKaleidoscopeImgOnEngine = function(){
    /**
    * Get HTMLCanvasElement from render frame and update kaleidoscope canvas
    */
        var hexagons_map_coordinates = getCoordinatesOfHexagons();
        triangle_canvas = createIntermediateTriangle(engine_canvas);
        hexagon_canvas = createIntermediateHexagon(triangle_canvas);
        $.each(hexagons_map_coordinates, function (index, point) {
            createHexagonInPoint(point, hexagon_canvas)
        });
    };

//    $('#get_current_piece').click(updateKaleidoscopeImg);
    $( window ).resize(function() {
        kaleidoscope_canvas.width = $(document).width();
        kaleidoscope_canvas.height = $(document).height();
        updateKaleidoscopeImgOnEngine()
    });
var counter = 0;
Events.on(engine, "afterUpdate", function(){
    counter += 1;
    if (counter == 3){
        counter = 0;
        updateKaleidoscopeImgOnEngine()
    }
});

//end getting the image from current state of particles area
});
//show or hide settins panels
var bottom_panel = $('.bottom_panel_content');
$('.settings_panel').hover(function(){
    $(this).find('.panel_content').animate({width:"300"},1000)
    },function(){
    $(this).find('.panel_content').animate({width:"0"},1000)});
$('.bottom_panel_tab').on('click',function(){
    if (bottom_panel.css('height') == "0px"){
        bottom_panel.animate({height:"300"},1000)
    }else{
        bottom_panel.animate({height:"0"},1000)
    }
});
//end
//buttons for rotation render canvas with variable speed
//



