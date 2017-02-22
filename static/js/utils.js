getRandomColor = function() {
    /**
    * Get string with hexadecimal number
    * @return {string} - color in hex format without "#". Example "2ffaa4"
    */
    var letters = '0123456789ABCDEF';
    var color = '';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

getRandomNumberFromArray =function(current_array){
    return current_array[Math.floor(Math.random()*current_array.length)];
};