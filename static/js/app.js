$(document).ready(function() {
//Matter js engine logic
// module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Events = Matter.Events,
        Composite = Matter.Composite;


    var engine_canvas_w_h = 300,
        render_options = {
            wireframes: false,
            width: engine_canvas_w_h,
            height: engine_canvas_w_h
        },
    engine = Engine.create(), // create an engine
    world = engine.world;

    var cursor_x, cursor_y,
        interval_particles_creation,
        interval_rotation_frame,
        mouseUp = false,
        mouseDown = false,
        manual_mode = false,
        auto_mode = false,
        kaleidoscope = $('#kaleidoscope'),
        mouse_x, mouse_y,
        prev_degree = 0;

    var particles_container = document.getElementById('particles_container');
    var engine_canvas = document.createElement('canvas');
        engine_canvas.setAttribute("id", "engine_canvas");
    var render = Render.create({
                                   element: particles_container, // container for engine_canvas
                                   canvas: engine_canvas,
                                   options: render_options,
                                   engine: engine
                               });
    // run the engine
    Engine.run(engine);
    // run the renderer
    Render.run(render);
    var rectangle_w = (engine_canvas_w_h/2)*Math.sqrt(2), //212
        rectangle_x0_y0 = (engine_canvas_w_h-rectangle_w)/ 2, //44
        rectangle_x1_y1 = rectangle_x0_y0 + rectangle_w, //256
        rectangle_h = 20,
        rectangle_frame_options = {
            isStatic: true,
            density: 0.01,
            render: {
                visible: false
            }
        },
        top_rectangle = Bodies.rectangle(engine_canvas_w_h/2,rectangle_x0_y0 - rectangle_h/2, rectangle_w+rectangle_h*2, rectangle_h, rectangle_frame_options),
        bottom_rectangle = Bodies.rectangle(engine_canvas_w_h/2, rectangle_x1_y1+ rectangle_h/2, rectangle_w+rectangle_h*2, rectangle_h, rectangle_frame_options),
        right_rectangle = Bodies.rectangle(rectangle_x1_y1+rectangle_h/2, engine_canvas_w_h/2, rectangle_h, rectangle_w+rectangle_h*2, rectangle_frame_options),
        left_rectangle = Bodies.rectangle(rectangle_x0_y0-rectangle_h/2, engine_canvas_w_h/2, rectangle_h, rectangle_w+rectangle_h*2, rectangle_frame_options),
        rectangle_frame = Body.create({
                                          parts: [top_rectangle, bottom_rectangle, right_rectangle, left_rectangle],
                                          isStatic: true
                                      }),
        rectangle_frame_composite = Composite.create(),
        all_particles_composite = Composite.create();
    Composite.add(rectangle_frame_composite, rectangle_frame);
    World.addComposite(world, rectangle_frame_composite);
    World.addComposite(world, all_particles_composite);

    addParticle = function () {
        var body_parameters = setStyleForNewParticles();
        var options = {
            density: 0.01,
            frictionAir: 0.01,
            friction: 0.001,
            wireframes: false,
            render: {
                fillStyle: body_parameters.color_fill,
                strokeStyle: body_parameters.color_stroke,
                opacity: 0.7
            }
        };
        if (body_parameters.stroke_width !== 0){
           options.render.lineWidth = body_parameters.stroke_width
        }
        var particle = Bodies.polygon(cursor_x, cursor_y, body_parameters.particle_shape, body_parameters.particle_size, options);
        Composite.add(all_particles_composite, particle);
    };
    addParticleOnMouseDown = function (event) {
        mouseUp = false;
        mouseDown = true;
        var parentOffset = $(this).parent().offset();
        cursor_x = event.pageX - parentOffset.left;
        cursor_y = event.pageY - parentOffset.top;
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
        cursor_x = event.pageX - parentOffset.left;
        cursor_y = event.pageY - parentOffset.top;
    };
    //show settings panels when page load
    $('.left_settings_panel').addClass('left_panel_show');
    $('.right_settings_panel').addClass('right_panel_show');
    // mouse events on engine_element
    var engine_element = $('#engine_canvas');
    engine_element.on('mousedown', addParticleOnMouseDown);
    engine_element.on('mousemove', generateParticlesWhileMouseDown);
    engine_element.on('mouseup', onMouseUpHandler);
    engine_element.on('mouseleave', onMouseUpHandler);
    //
    //Auto & Manually rotation modes (TODO: to make one controller for all modes)
    //manually rotation engine logic
    rotateRenderFrameOnMouseMove = function(mouse_x, mouse_y) {
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
        auto_mode = false;
    };
    returnFromManualRotationMode = function(event){
        if (event.button == 2){
            event.preventDefault();
            manual_mode = false;
        }
    };
    getCurrentMousePositionAndCallRotationFunc = function( event){
        if (manual_mode){
            mouse_x =  event.pageX;
            mouse_y =  event.pageY;
            rotateRenderFrameOnMouseMove(mouse_x, mouse_y)
        }
    };

    $('#hand_rotation_btn').on('mousedown', manuallyRotateKaleidoscope);
    //prevent context menu on right mouse button click
    kaleidoscope.bind('contextmenu', function(e) {
       return false;
    });
    kaleidoscope.on('mousemove', getCurrentMousePositionAndCallRotationFunc);
    //engine_element.on('mousemove', getCurrentMousePositionAndCallRotationFunc);
    kaleidoscope.on('mousedown', returnFromManualRotationMode);

    //auto rotation engine buttons logic
    autoRotationEngine = function(){
        manual_mode = false;
        auto_mode = true;
        var current_rate, current_degree;
        var min_degree_step = 0.08;
        if (interval_rotation_frame) {
            clearInterval(interval_rotation_frame);
            Composite.rotate(rectangle_frame_composite, 0, {x: engine_canvas_w_h / 2, y: engine_canvas_w_h / 2});
        }
        current_rate = parseInt($(this).val());
        current_degree = current_rate * min_degree_step;
        if (current_rate != 0) {
            interval_rotation_frame = setInterval(function () {
                    if (auto_mode == false){
                        clearInterval(interval_rotation_frame);
                    }else{
                        Composite.rotate(rectangle_frame_composite, current_degree, {x: engine_canvas_w_h / 2, y: engine_canvas_w_h / 2});
                        }
            }, 100)
        }
    };
    $('.auto_rotation_btn').on('click', autoRotationEngine);


    //getting the image from current state of particles area
    var radius_ins_circle = rectangle_w/2 - rectangle_h/2; //106
    var triangle_canvas = document.createElement('canvas');
    var triangle_ctx = triangle_canvas.getContext('2d');
        triangle_canvas.setAttribute("id", "triangle_piece");
        triangle_canvas.width = radius_ins_circle*Math.sqrt(3); //triangle width 183
        triangle_canvas.height = triangle_canvas.width*Math.sqrt(3)/2;  //triangle height 159
    var triangle_x0 = rectangle_x0_y0 + (rectangle_w - rectangle_h - triangle_canvas.height)/2; //57,..
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
        var count_of_triangles_on_y_axis = Math.round(kaleidoscope_canvas.height/triangle_piece_height)+2; // + one hexagon on the bottom border of window
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
    triangle_ctx.drawImage(engine_canvas_img, triangle_x0, rectangle_x0_y0, triangle_piece_width, triangle_piece_height, 0, 0, triangle_piece_width, triangle_piece_height);
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
        hexagon_ctx.translate(triangle_piece_width, triangle_piece_height);
        for (var i=0; i<3; i++){
            hexagon_ctx.scale(1, -1);
            hexagon_ctx.drawImage(triangle_canvas_img, 0, 0, triangle_piece_width,triangle_piece_height, (-triangle_piece_width)/2-0.5, -0.5, triangle_piece_width+1, triangle_piece_height+1); //-0.5 and +1 - for "gluing" together edges of nearby triangle
            hexagon_ctx.rotate(-120* Math.PI / 180);
            hexagon_ctx.scale(1, -1);
        }
        for (var j=0; j<3; j++){
            hexagon_ctx.drawImage(triangle_canvas_img, 0, 0, triangle_piece_width,triangle_piece_height, (-triangle_piece_width)/2-0.5, -0.5, triangle_piece_width+1, triangle_piece_height+1);
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
    clearKaleidoscopeCanvas = function(){
        Composite.clear(all_particles_composite, true);
        kaleidoscope_ctx.clearRect(0, 0, kaleidoscope_canvas.width, kaleidoscope_canvas.height);
    };
    $('#clear_canvas_btn').on('click', clearKaleidoscopeCanvas);
    $( window ).resize(function() {
        kaleidoscope_canvas.width = $(document).width();
        kaleidoscope_canvas.height = $(document).height();
        updateKaleidoscopeImgOnEngine()
    });
    var counter = 0;
    Events.on(engine, "afterUpdate", function(){
        counter += 1;
        if (counter == 3){ // counter value define how will be look the plume of moving particles
            counter = 0;
            updateKaleidoscopeImgOnEngine()
        }

//end getting the image from current state of particles area
});
//show or hide settins panels
$('#left_tab').on('click', function(){
    $('.left_settings_panel').toggleClass('left_panel_show');
});
$('#right_tab').on('click', function(){
    $('.right_settings_panel').toggleClass('right_panel_show');
});
//end
//set attributes dom elements
var min_particle_size = 5,
    max_particle_size = 50,
    min_stroke_width = 0,
    max_stroke_width = 5;
$('#particle_size').jRange({
    from: min_particle_size,
    to: max_particle_size,
    step: 1,
    scale: [min_particle_size, max_particle_size],
    format: '%s',
    width: 190,
    showLabels: true,
    showScale: false,
    theme: "theme-orange",
    snap : true
})
   .jRange('setValue', '20');
$('#width_stroke').jRange({
    from: min_stroke_width,
    to: max_stroke_width,
    step: 1,
    scale: [min_stroke_width, max_stroke_width],
    format: '%s',
    width: 190,
    showLabels: true,
    showScale: false,
    theme: "theme-orange",
    snap : true
})
    .jRange('setValue', '0');
//settings styles for new particles
//var particle_size, color_fill, color_stroke, particle_shape, stroke_width;
setStyleForNewParticles = function(){
    var current_settings = {};
    var random_color;
    var particle_shape_value = $('input[name="particle_shape"]:checked').val();
    if (particle_shape_value == "random"){
       current_settings.particle_shape = getRandomNumberFromArray([2, 3, 4]);
    }else {
        current_settings.particle_shape = parseInt(particle_shape_value);
    }
    if ($('input[name="get_random_particle_size"]:checked').length > 0){
         current_settings.particle_size  = Math.floor(Math.random() * ((max_particle_size - min_particle_size)+1) + min_particle_size);
    }else {
        current_settings.particle_size = parseInt($('#particle_size').val());
    }
    //get color for new particles
    if ($('input[name="get_random_color_fill"]:checked').length > 0){
       random_color = getRandomColor();
       current_settings.color_fill = "#" + random_color;
    }else{
        current_settings.color_fill = $('#color_fill').val();
    }
    if ($('input[name="get_random_color_stroke"]:checked').length > 0){
       random_color = getRandomColor();
       current_settings.color_stroke = "#" + random_color;
    }else {
        current_settings.color_stroke = $('#color_stroke').val();//get color for new particles stroke,
    }
    if ($('input[name="get_random_stroke_width"]:checked').length > 0){
         current_settings.stroke_width  = Math.floor(Math.random() * ((max_stroke_width - min_stroke_width)+1) + min_stroke_width);
    }else {
        current_settings.stroke_width = parseInt($('#width_stroke').val());
    }
    return current_settings
};
updateCanvasColor = function(color_canvas){
    $('body').css({'background-color': '#'+color_canvas})
};
setRandomColorCanvas = function() {
    var color_canvas;
    color_canvas = getRandomColor();
    document.getElementById('color_canvas').jscolor.fromString(color_canvas); // styles and value for input
    updateCanvasColor(color_canvas)
};
setRandomColorCanvas(); //set body background after load page
$('input[name="get_random_color_canvas"]').on('click', setRandomColorCanvas);
});

