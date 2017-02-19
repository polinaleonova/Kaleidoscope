
getRandomColor = function() {
    var letters = '0123456789ABCDEF';
    var color = '';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];  //example "2ffaa4"
    }
    return color;
};

getRandomNumberFromArray =function(current_array){
    return current_array[Math.floor(Math.random()*current_array.length)];
};