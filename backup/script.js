const dP = {};

dP.$board = $('.drawingBoard');
dP.boardWidth = dP.$board.width();
dP.boardHeight = dP.$board.height();
dP.boardCentreX = dP.$board.offset().left + dP.boardWidth / 2;
dP.boardCentreY = dP.$board.offset().top + dP.boardHeight / 2;
dP.moving = false;
dP.moving = false;
dP.selection = undefined;
dP.move = $('#moveBtn');
dP.move.data('active', false);
dP.scale = $('#scaleBtn');
dP.scale.data('active', false);
dP.rotate = $('#rotateBtn');
dP.rotate.data('active', false);
dP.skew = $('#skewBtn');
dP.skew.data('active', false);
dP.tools = [dP.move, dP.scale, dP.rotate, dP.skew];
dP.$colour = $('#colourPicker');
dP.toolbarForms = [
    '#imgInsert',
    '#textInput',
];
// dP.keysDown = {};

dP.updateDisplay = function () {
    if (dP.selection) {
        const scaleX = parseFloat($(dP.selection).css('--scaleX')).toFixed(2);
        const scaleY = parseFloat($(dP.selection).css('--scaleY')).toFixed(2);
        const angle = $(dP.selection).css('--angle');
        const skewX = parseFloat($(dP.selection).css('--skewX')).toFixed(2) + 'deg';
        const skewY = parseFloat($(dP.selection).css('--skewY')).toFixed(2) + 'deg';
        const zIndex = $(dP.selection).css('--z');
        $('#scaleXDisplay').text(scaleX);
        $('#scaleYDisplay').text(scaleY);
        $('#rotateDisplay').text(angle);
        $('#skewXDisplay').text(skewX);
        $('#skewYDisplay').text(skewY);
        $('#zDisplay').text(zIndex);
    } else {
        $('#scaleXDisplay').text('1.00');
        $('#scaleYDisplay').text('1.00');
        $('#rotateDisplay').text('0deg');
        $('#skewXDisplay').text('0.00deg');
        $('#skewYDisplay').text('0.00deg');
        $('#zDisplay').text('1');
    }
};

dP.createDiv = function (classes = '', attributes = {
    '--bgColour':  dP.$colour.val(),
    '--x': 0,
    '--y': 0,
    '--scaleX': 1,
    '--scaleY': 1,
    '--angle': 0,
    '--skewX': 0,
    '--skewY': 0,
    '--z': 1,
    '--url': "url('')",
    }) {
    const $div = $('<div>');
    dP.$board.append($div);
    $div.css(attributes);
    $div.addClass(classes);
    $div.data('exists', true);
    return $div;
};

dP.createText = function(inputText, classes = '', attributes = {
    '--bgColour':  dP.$colour.val(),
    '--x': 0,
    '--y': 0,
    '--scaleX': 1,
    '--scaleY': 1,
    '--angle': 0,
    '--skewX': 0,
    '--skewY': 0,
    '--z': 1,
    '--fontWeight': 'normal',
    '--fontStyle': 'normal',
    '--fontFamily': 'serif',
    '--url': "url('')",
    }) {
        const $p = $('<p>');
        dP.$board.append($p);
        $p.text(inputText);
        $p.css(attributes);
        $p.addClass(classes);
        $p.data('exists', true);
        return $p;
    };

dP.selectButton = function ($selected) {
    let alreadySelected = false;
    if ($selected.data('active')) {
        alreadySelected = true;
    };
    for (let i = 0; i < dP.tools.length; i++) {
        dP.tools[i].removeClass('buttonSelected');
        dP.tools[i].data('active', false);
    }
    if (!alreadySelected) {
        $selected.addClass('buttonSelected');
        $selected.data('active', true);
    }
};

dP.showToolbarForm = function (selectedForm) {
    for (let form of dP.toolbarForms) {
        if (form === selectedForm) {
            $(form).removeClass('hidden');
        } else {
            $(form).addClass('hidden');
        }
    }
};

dP.splitStyleString = function (styleString) {
    const styleStringWithoutSpaces = styleString.replace(/\s/g, ''); 
    const styleArray = styleStringWithoutSpaces.split(';');
    styleArray.pop();
    const finalArray = [];
    for (let item of styleArray) {
        finalArray.push(item.split(':'));
    }
    finalArray[finalArray.length - 1][1] += ':' + finalArray[finalArray.length - 1][2];
    return finalArray;
};

dP.saveState = function() {
    if (dP.selection) {
        const currentStyles = $(dP.selection).attr('style');
        dP.selectionState = dP.splitStyleString(currentStyles);
        if($(dP.selection).is('p')) {
            dP.selectionText = $(dP.selection).text();
        }
    };
};

dP.undoState = function () {
    const styleArray = dP.selectionState;
    const attributes = {};
    for (style in styleArray) {
        attributes[styleArray[style][0]] = styleArray[style][1];
    }
    if ($(dP.lastSelected).data('exists')) {
        $(dP.lastSelected).css(attributes);
        if($(dP.lastSelected).is('p')) {
            $(dP.lastSelected).text(dP.selectionText);
        }
    } else {
        if ($(dP.lastSelected).is('div')) {
            dP.createDiv(dP.deletedClasses, attributes);
        } else {
            dP.createText(dP.selectionText, dP.deletedClasses, attributes);
        }
    }
};

dP.init = function () {

    // Menu Event Listeners

    $('#newBtn').on('click', function () {
        dP.$board.empty();
        dP.$board.css('--bgColour', 'transparent');
        dP.$board.css('--url', "url('')");
    });

    $('#fillBgBtn').on('click', function () {
        dP.$board.css('--bgColour', dP.$colour.val());
    });

    $('#imageBgBtn').on('click', function () {
        dP.showToolbarForm('#imgInsert');
    });

    $('#clearBgBtn').on('click', function () {
        dP.$board.css('--bgColour', 'transparent');
        dP.$board.css('--url', "url('')");
    });

    // Tools Event Listeners

    $('#squareBtn').on('click', function() {
        dP.createDiv();
    });

    $('#circleBtn').on('click', function() {
        const newDiv = dP.createDiv();
        newDiv.addClass('circle');
    });

    $('#triangleBtn').on('click', function() {
        const newDiv = dP.createDiv();
        newDiv.addClass('triangle');
    });

    $('#textBtn').on('click', function() {
        dP.showToolbarForm('#textInput');
        if (dP.selection) {
            $('#text').val($(dP.selection).text());
            $('#createText').val('Edit');
        } else {
            $('#text').val('');
            $('#createText').val('Add');
        }
    });

    $('#textInput').on('submit', function(e) {
        e.preventDefault();
        const inputText = $('#text').val();
        const inputTextFont = $('#fontFamily').val();
        const inputTextStyle = $('#textStyle').val();
        
        if (inputText !== '') {
            let fontWeight, fontStyle;
            switch(inputTextStyle) {
                case 'normal':
                    fontWeight = 'normal';
                    fontStyle = 'normal';
                    break;

                case 'bold':
                    fontWeight = 'bold';
                    fontStyle = 'normal';
                    break;

                case 'italic':
                    fontWeight = 'normal';
                    fontStyle = 'italic';
                    break;

                case 'bold-italic':
                    fontWeight = 'bold';
                    fontStyle = 'italic';
                    break;
            }

            let textToChange;
            if ($(dP.selection).is('p')) {
                textToChange = $(dP.selection);
                textToChange.text(inputText);
            } else {
                textToChange = dP.createText(inputText);
            }
            textToChange.css('--fontFamily', inputTextFont);
            textToChange.css('--fontWeight', fontWeight);
            textToChange.css('--fontStyle', fontStyle);
            dP.showToolbarForm('');
        }
    });

    dP.move.on('click', function () {
        dP.selectButton($(this));
    });

    dP.scale.on('click', function () {
        dP.selectButton($(this));
    });

    dP.rotate.on('click', function () {
        dP.selectButton($(this));
    });

    dP.skew.on('click', function () {
        dP.selectButton($(this));
    });

    $('#zUpBtn').on('click', function () {
        if (dP.selection) {
            let currentZ = parseInt($(dP.selection).css('--z'));
            currentZ++;
            $(dP.selection).css('--z', currentZ);
            dP.updateDisplay();
        }
    });

    $('#zDownBtn').on('click', function () {
        if (dP.selection) {
            let currentZ = parseInt($(dP.selection).css('--z'));
            currentZ--;
            $(dP.selection).css('--z', currentZ);
            dP.updateDisplay();
        }
    });

    $('#fillBtn').on('click', function () {
        if (dP.selection) {
            const colour = dP.$colour.val();
            $(dP.selection).css('--bgColour', colour);
        }
    });

    $('#eyeDropper').on('click', function() {
        if (dP.selection) {
            const colour = $(dP.selection).css('--bgColour');
            dP.$colour.val(colour);
        }
    });

    $('#imageBtn').on('click', function () {
        if (dP.selection) {
            dP.showToolbarForm('#imgInsert');
        }
    });

    $('#imgInsert').on('submit', function (e) {
        e.preventDefault();
        const image = $('#imageInsert').val();
        if (dP.selection) {
            dP.saveState();
            $(dP.selection).css('--url', `url(${image})`);
        } else {
            dP.$board.css('--url', `url(${image})`);
        }
        dP.showToolbarForm('');
    });

    $('#undoBtn').on('click', function () {
        dP.undoState();
    });

    $('#deleteBtn').on('click', function () {
        if (dP.selection) {
            dP.saveState();
            const classes = $(dP.selection).attr('class');
            dP.deletedClasses = classes.replace('selected', '');
            // if ($(dP.selection).is('p')) {
            //     dP.deletedText = $(dP.selection).text();
            // }
            $(dP.selection).remove();
            dP.selection = undefined;
        }
    });

    // $(window).on('keydown', function (e) {
    //     console.log(e.which);
    //     dP.keysDown[e.which] = true;
    // });

    // $(window).on('keyup', function (e) {
    //     dP.keysDown[e.which] = false;
    // });

    $(window).on('keypress', function(e) {
        console.log(e.which);
        if (!$('input').is(':focus')) {
            switch(e.which) {
                case 109: // M
                    dP.selectButton($(dP.move));
                    break;

                case 115: // S
                    dP.selectButton($(dP.scale));
                    break;

                case 114: // R
                    dP.selectButton($(dP.rotate));
                    break;

                case 107: // K
                    dP.selectButton($(dP.skew));
                    break;

                case 43: // Z
                    if (dP.selection) {
                        let currentZ = parseInt($(dP.selection).css('--z'));
                        currentZ++;
                        $(dP.selection).css('--z', currentZ);
                        dP.updateDisplay();
                    }
                    break;

                case 45:
                    if (dP.selection) {
                        let currentZ = parseInt($(dP.selection).css('--z'));
                        currentZ--;
                        $(dP.selection).css('--z', currentZ);
                        dP.updateDisplay();
                    }
                    break;

                case 113:
                    dP.saveState();
                    break;
            }
        }
    });

    dP.$board.on('mousemove', function(e) {
        dP.updateDisplay();
        if (dP.move.data('active') && dP.selection) {
            $(dP.selection).css({
                '--x': `${(e.pageX - this.offsetLeft - ($(dP.selection).width() / 2)) + 'px'}`,
                '--y': `${(e.pageY - this.offsetTop - ($(dP.selection).height() / 2)) + 'px'}`,
            });
        } else if (dP.scale.data('active') && dP.selection) {
            const scaleX = (e.pageX - dP.boardCentreX) / 50;
            const scaleY = (e.pageY - dP.boardCentreY) / 50;
            $(dP.selection).css('--scaleX', scaleX);
            $(dP.selection).css('--scaleY', scaleY);
        } else if (dP.rotate.data('active') && dP.selection) {
            const rotate = (e.pageY - this.offsetTop);
            $(dP.selection).css('--angle', rotate + 'deg');
        } else if (dP.skew.data('active') && dP.selection) {
            const skewX = (e.pageX - dP.boardCentreX) / 10;
            const skewY = (e.pageY - dP.boardCentreY) / 10;
            $(dP.selection).css('--skewX', skewX + 'deg');
            $(dP.selection).css('--skewY', skewY + 'deg');
        }

    });


    dP.$board.on('click', '*', function (e) {
        e.stopPropagation();
        if (dP.selection === this) {
            dP.selection = undefined;
            $(this).removeClass('selected');
            dP.showToolbarForm('');
        } else if (dP.selection && dP.selection !== this) {
            $(dP.selection).removeClass('selected');
            dP.selection = undefined; 
            dP.selection = this;
            dP.lastSelected = dP.selection;
            dP.saveState();
            $(this).addClass('selected');
        } else {
            dP.selection = this;
            dP.lastSelected = dP.selection;
            dP.saveState();
            $(this).addClass('selected');
        };
        dP.updateDisplay();
    });

    dP.$board.on('click', function() {
        dP.updateDisplay();
        if (dP.selection) {
            $(dP.selection).removeClass('selected');
            dP.selection = undefined;
            dP.showToolbarForm('');
        }
    });
};

$(function() {

    dP.init();

});