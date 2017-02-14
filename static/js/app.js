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

//        color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58', '#E6F73C']),
        frame_options = {
            isStatic: true,
            density: 0.01,
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
        rectangle_h = 40;
    var top_rectangle = Bodies.rectangle(engine_canvas_w_h/2,rectangle_x0_y0-20 , rectangle_w+80, rectangle_h, frame_options),
        bottom_rectangle = Bodies.rectangle(engine_canvas_w_h/2, rectangle_x1_y1+20, rectangle_w+80, rectangle_h, frame_options),
        right_rectangle = Bodies.rectangle(rectangle_x1_y1+20, engine_canvas_w_h/2, rectangle_h, rectangle_w+80, frame_options),
        left_rectangle = Bodies.rectangle(rectangle_x0_y0-20, engine_canvas_w_h/2, rectangle_h, rectangle_w+80, frame_options),
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
        setStyleForNewParticles();
        var options = {
            density: 0.01,
            frictionAir: 0.073,
            friction: 1,
            wireframes: false,
            render: {
                fillStyle: color_fill,
                strokeStyle: color_stroke,
                opacity: 1
            }
        };
        if (stroke_width !== 0){
           options.render.lineWidth = stroke_width
        }
        var particle = Bodies.polygon(x, y, particle_shape, particle_size, options);
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
    var engine_element = $('#engine_canvas');
        engine_element.on('mousedown', event, onMouseDownHandler);
        engine_element.on('mousemove', event, generateParticlesWhileMouseDown);
        engine_element.on('mouseup', onMouseUpHandler);
        engine_element.on('mouseleave', onMouseUpHandler);
    var manual_mode = false;
    var kaleidoscope = $('#kaleidoscope');
    var mouse_x, mouse_y ;
    var prev_degree = 0;

rotateRenderFrame = function(mouse_x, mouse_y) {
    var offset = kaleidoscope.offset();
    var curr_degree;
    var center_x = (offset.left) + (kaleidoscope.width() / 2);
    var center_y = (offset.top) + (kaleidoscope.height() / 2);
    var radians = Math.atan2(mouse_y - center_y, -(mouse_x - center_x));
    curr_degree = (radians * (180 / Math.PI)+180);

    if (prev_degree < curr_degree){
       Composite.rotate(rectangle_frame_composite, -0.02, {x: engine_canvas_w_h / 2, y: engine_canvas_w_h / 2});
    }
    else{
       Composite.rotate(rectangle_frame_composite, 0.02, {x: engine_canvas_w_h / 2, y: engine_canvas_w_h / 2});
    }
    prev_degree = curr_degree;
};
manuallyRotateKaleidoscope = function(){
    manual_mode = true;
    $('.left_settings_panel').removeClass('left_panel_show');
    $('.right_settings_panel').removeClass('right_panel_show');
};

$('#hand_rotation_btn').on('click', manuallyRotateKaleidoscope);
var getCurrentMousePositionAndCallRotationFunc = function( event){
    if (manual_mode){
        mouse_x =  event.pageX;
        mouse_y =  event.pageY;
        rotateRenderFrame(mouse_x, mouse_y)
    }
};
var returnFromManualRotationMode = function( event){
    if (event.button == 2){
        event.preventDefault();
        manual_mode = false;
    }
};
//prevent context menu on right mouse button click
kaleidoscope.bind('contextmenu', function(e) {
   return false;
});
kaleidoscope.on('mousemove', getCurrentMousePositionAndCallRotationFunc);
//engine_element.on('mousemove', getCurrentMousePositionAndCallRotationFunc);
kaleidoscope.on('mousedown', returnFromManualRotationMode);

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

//$('.left_panel_tab').on('click', function(){
//    var current_panel_content = $('#panel_content');
//    if (current_panel_content.css('left') == "-300px"){
//        current_panel_content.animate({left:"0"},1000)
//    }
//    else{
//        current_panel_content.animate({left:"-300"},1000)
//    }
//});
$('#left_tab').on('click', function(){
    $('.left_settings_panel').toggleClass('left_panel_show');
});
$('#right_tab').on('click', function(){
    $('.right_settings_panel').toggleClass('right_panel_show');
});
//$('.bottom_panel_tab').on('click',function(){
//    var bottom_panel = $('.bottom_panel_content');
//    if (bottom_panel.css('height') == "0px"){
//        bottom_panel.animate({height:"300"}, 500, "swing")
//    }else{
//        bottom_panel.animate({height:"0"}, 500, "swing")
//    }
//});
//end
//buttons for rotation render canvas with variable speed

//
//settings styles for new particles
var particle_size, color_fill, color_stroke, particle_shape, stroke_width;
setStyleForNewParticles = function(){
    particle_shape = parseInt($('input[name="particle_shape"]:checked').val());
    particle_size = parseInt($('#particle_size').val());
    color_fill = $('#color_fill').val();//get color for new particles
    color_stroke = $('#color_stroke').val();//get color for new particles stroke,
    stroke_width = parseInt($('#width_stroke').val());
};
//end settings styles for new particles
fillColorCanvas = function(){
    var color_canvas = $('#color_canvas').val();
    $('body').css({'background-color': color_canvas})
};
$('#color_canvas').on("change", fillColorCanvas);

