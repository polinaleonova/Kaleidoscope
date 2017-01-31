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
        offset = 10,
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
            width: 300,
            height: 300
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
    var top_rectangle = Bodies.rectangle(150, 44, 212, 1, frame_options),
        bottom_rectangle = Bodies.rectangle(150, 256, 212, 1, frame_options),
        right_rectangle = Bodies.rectangle(256, 150, 1, 212, frame_options),
        left_rectangle = Bodies.rectangle(44, 150, 1, 212, frame_options),

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
//                opacity: 1
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
//    rotation = 0, rotation_stencil = $('.stencil'), //for stencil
        left_btn = $('#rotate_left_bt'),
        right_btn = $('#rotate_right_bt');

    rotateFrameLeft = function () {
        var degrees = 0.02;
        Composite.rotate(rectangle_frame_composite, degrees, {x: 150, y: 150});
    };
    rotateFrameRight = function () {
        var degrees = -0.02;
        Composite.rotate(rectangle_frame_composite, degrees, {x: 150, y: 150})
    };
    left_btn.mouseover(function () {
        interval_rotation_frame_left = setInterval(function () {
                                                       rotateFrameLeft()
                                                   }
            , 100)
    });
    left_btn.mouseleave(function () {
        clearInterval(interval_rotation_frame_left)
    });
    right_btn.mouseover(function () {
        interval_rotation_frame_right = setInterval(function () {
                                                        rotateFrameRight()
                                                    }
            , 100)
    });
    right_btn.mouseleave(function () {
        clearInterval(interval_rotation_frame_right)
    });
//end left and right buttons logic
//getting the image from current state of particles area
    getImageFromEngine = function () {
    };

    var piece_canvas = document.getElementById('piece'),
        piece_ctx = piece_canvas.getContext('2d');
        piece_canvas.width = 183.598;
        piece_canvas.height = 159;
    var kaleidoscope_canvas = document.getElementById('kaleidoscope'),
        kaleidoscope_ctx = kaleidoscope_canvas.getContext('2d');
    getImageFromEngine = function () {
    };
    kaleidoscope_ctx.translate(500, 200);

    $('#get_current_piece').click(function () {
        //clipping the party of engine_canvas image to piece_canvas

        piece_ctx.clearRect(0,0 ,piece_canvas.width, piece_canvas.height);
        kaleidoscope_ctx.clearRect(-200,-200 ,kaleidoscope_canvas.width, kaleidoscope_canvas.height);
        piece_ctx.beginPath();
        piece_ctx.moveTo(0, 159);
        piece_ctx.lineTo(91.799, 0);
        piece_ctx.lineTo(183.598, 159);
        piece_ctx.clip();
        var engine_image = engine_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

        //this piece will be dublicated across all kaleidoscope conteiner

        var current_img = new Image();
        current_img.src = engine_image;
        current_img.onload = function(){
            piece_ctx.drawImage(current_img, 58.201, 44, 183.598, 159, 0, 0, 183.598, 159);
            //2
            var piece_image = piece_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            var piece_img = new Image();
            piece_img.src = piece_image;
            piece_img.onload = function(){

                for (var i=0; i<3; i++){
                    kaleidoscope_ctx.scale(1, -1);
                    kaleidoscope_ctx.drawImage(piece_img,0,0,184,159,-91.799,0,184,159);
                    kaleidoscope_ctx.rotate(-120* Math.PI / 180);
                    kaleidoscope_ctx.scale(1, -1);
                }
                for (var i=0; i<3; i++){
                    kaleidoscope_ctx.drawImage(piece_img,0,0,184,159,-91.799,0,184,159);
                    kaleidoscope_ctx.rotate(-120* Math.PI / 180);
                }
                for (var i=0; i< 6; i++){
                    kaleidoscope_ctx.drawImage(piece_img,0,0,184,159,458.995,0,184,159);

                    kaleidoscope_ctx.rotate(-60* Math.PI / 180);
                }
            };
        };

    });

//Events.on(engine, "afterUpdate", getImageFromEngine)

//end getting the image from current state of particles area
});
//
//
//    getImageFromEngine = function () {
//    };
//
//        var kaleidoscope_canvas = document.getElementById('kaleidoscope');
//        var kaleidoscope_ctx = kaleidoscope_canvas.getContext('2d');
//        kaleidoscope_ctx.translate(200, 200);
//
//    $('#get_current_piece').click(function () {
//        var canvas = document.getElementsByTagName('canvas')[1];
//        var ctx = canvas.getContext('2d');
//        var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
//
//        var current_img = new Image();
//
//        current_img.width = 200;
//        current_img.height = 200;
//        current_img.src = image;
//        current_img.onload = function(){
//            kaleidoscope_ctx.beginPath();
//            kaleidoscope_ctx.moveTo(-92, 159);
//            kaleidoscope_ctx.lineTo(0, 0);
//            kaleidoscope_ctx.lineTo(92, 159);
//                    kaleidoscope_ctx.fill();
//            kaleidoscope_ctx.rotate(-60* Math.PI / 180);
//
//        };
//    });
