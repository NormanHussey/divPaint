const dP = {};

dP.$board = $('.drawingBoard');
dP.boardWidth = dP.$board.width();
dP.boardHeight = dP.$board.height();
dP.boardCentreX = dP.$board.offset().left + dP.boardWidth / 2;
dP.boardCentreY = dP.$board.offset().top + dP.boardHeight / 2;
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
    '#addBorder',
    '#addBorderRadius',
    '#addBoxShadow',
    '#addTextShadow',
    '#addTextDecoration',
    '#addTextTransform',
    '#addFilterBlur',
    '#addFilterBrightness',
    '#addFilterContrast',
];
dP.savedBoard = [];
dP.reader = new FileReader();

dP.updateDisplay = function (string = '') {
    if (dP.selection) {
        const scaleX = parseFloat(dP.$selection.css('--scaleX')).toFixed(2);
        const scaleY = parseFloat(dP.$selection.css('--scaleY')).toFixed(2);
        const angle = dP.$selection.css('--angle');
        const skewX = parseFloat(dP.$selection.css('--skewX')).toFixed(2) + 'deg';
        const skewY = parseFloat(dP.$selection.css('--skewY')).toFixed(2) + 'deg';
        const zIndex = dP.$selection.css('--z');
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

    $('#message').text(string);

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
    '--borderThickness': 0,
    '--borderStyle': 'none',
    '--borderColour': 'transparent',
    '--borderRadiusTopLeft': 0,
    '--borderRadiusTopRight': 0,
    '--borderRadiusBottomRight': 0,
    '--borderRadiusBottomLeft': 0,
    '--boxShadowX': 0,
    '--boxShadowY': 0,
    '--boxShadowBlur': 0,
    '--boxShadowSpread': 0,
    '--boxShadowColour': 'transparent',
    '--filterBlur': 0,
    '--filterBrightness': '100%',
    '--filterContrast': '100%',
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
    '--borderThickness': 0,
    '--borderStyle': 'none',
    '--borderColour': 'transparent',
    '--borderRadiusTopLeft': 0,
    '--borderRadiusTopRight': 0,
    '--borderRadiusBottomRight': 0,
    '--borderRadiusBottomLeft': 0,
    '--boxShadowX': 0,
    '--boxShadowY': 0,
    '--boxShadowBlur': 0,
    '--boxShadowSpread': 0,
    '--boxShadowColour': 'transparent',
    '--filterBlur': 0,
    '--filterBrightness': '100%',
    '--filterContrast': '100%',
    '--fontSize': '2rem',
    '--fontWeight': 'normal',
    '--fontStyle': 'normal',
    '--fontFamily': 'serif',
    '--textShadowX': 0,
    '--textShadowY': 0,
    '--textShadowBlur': 0,
    '--textShadowColour': 'transparent',
    '--textDecorationLine': 'none',
    '--textDecorationStyle': 'solid',
    '--textDecorationColour': 'transparent',
    '--textDecorationThickness': 0,
    '--textTransform': 'none',
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
    };
    if (finalArray[finalArray.length - 1][2] !== undefined) {
        finalArray[finalArray.length - 1][1] += ':' + finalArray[finalArray.length - 1][2];
    }
    return finalArray;
};

dP.saveState = function() {
    if (dP.selection) {
        const currentStyles = dP.$selection.attr('style');
        dP.selectionState = dP.splitStyleString(currentStyles);
        if(dP.$selection.is('p')) {
            dP.selectionText = dP.$selection.text();
        }
    };
};

dP.convertToAttributesObject = function(styleArray) {
    const attributes = {};
    for (style of styleArray) {
        attributes[style[0]] = style[1];
    }
    return attributes;
};

dP.undoState = function () {
    const attributes = dP.convertToAttributesObject(dP.selectionState);
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
    };
};

dP.save = function () {
    dP.savedBoard = [];
    const boardElement = 'board';
    const attrString = dP.$board.attr('style');
    const attrArray = dP.splitStyleString(attrString);
    const attributes = dP.convertToAttributesObject(attrArray);
    const boardObject = {
        element: boardElement,
        attributes: attributes,
        classes: '',
        text: '',
    };
    dP.savedBoard.push(boardObject);
    let board = dP.$board.children();
    for (let i = 0; i < board.length; i++) {
        const element = $(board[i]).prop('nodeName').toLowerCase();

        const attrString = $(board[i]).attr('style');
        const attrArray = dP.splitStyleString(attrString);
        const attributes = dP.convertToAttributesObject(attrArray);

        const classes = $(board[i]).attr('class');
        const text = $(board[i]).text();
        const savedBoardObject = {
            element: element,
            attributes: attributes,
            classes: classes,
            text: text,
        };
        dP.savedBoard.push(savedBoardObject);
    }
    dP.savedJson = JSON.stringify(dP.savedBoard);
    dP.saveToLocalDrive(dP.savedJson, 'divBoard.txt', 'text/plain');
    dP.updateDisplay('Saved');
};

dP.reader.addEventListener('load', function (e) {
    const loadedFileText = e.target.result;
    dP.loadedJson = JSON.parse(loadedFileText);
    dP.load();
});

dP.load = function () {
    if(dP.loadedJson.length > 0) {
        dP.$board.empty();
        for (let item of dP.loadedJson) {
            let classes = '';
            if (item.classes) {
                classes = item.classes;
            };
            if (item.element === 'div') {
                dP.createDiv(classes, item.attributes);
            } else if (item.element === 'p') {
                dP.createText(item.text, classes, item.attributes);
            } else if (item.element === 'board') {
                dP.$board.css(item.attributes);
            };
        };
        dP.updateDisplay('Loaded');
    };
}

dP.loadFromJson = function (jsonString) {
    const loadedObject = JSON.parse(jsonString);
};

dP.saveToLocalDrive = function (content, fileName, contentType) {
    let a = document.createElement("a");
    let file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

dP.init = function () {

    // Menu Event Listeners

    // File
    $('#newBtn').on('click', function () {
        dP.$board.empty();
        dP.$board.css('--bgColour', 'transparent');
        dP.$board.css('--url', "url('')");
    });

    // $('#loadBtn').on('click', function () {
    //     dP.load();
    // });

    $('#fileLoad').on('change', function () {
        const loadedFile = this.files[0];
        dP.reader.readAsText(loadedFile);
    });

    $('#saveBtn').on('click', function () {
        dP.save();
    });

    // Background
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

    // Text
    $('#textShadowBtn').on('click', function () {
        if(dP.selection && dP.$selection.is('p')) {
            dP.showToolbarForm('#addTextShadow');
        }
    });

    $('#textDecorationBtn').on('click', function () {
        if(dP.selection && dP.$selection.is('p')) {
            dP.showToolbarForm('#addTextDecoration');
        }
    });

    $('#textTransformBtn').on('click', function () {
        if(dP.selection && dP.$selection.is('p')) {
            dP.showToolbarForm('#addTextTransform');
        }
    });

    // Styles
    $('#borderBtn').on('click', function() {
        if(dP.selection) {
            dP.showToolbarForm('#addBorder');
        }
    });

    $('#borderRadiusBtn').on('click', function () {
        if(dP.selection) {
            dP.showToolbarForm('#addBorderRadius');
        }
    });

    $('#boxShadowBtn').on('click', function () {
        if(dP.selection) {
            dP.showToolbarForm('#addBoxShadow');
        }
    });

    // Filter
    $('#filterBlurBtn').on('click', function () {
        dP.showToolbarForm('#addFilterBlur');
    });

    $('#filterBrightnessBtn').on('click', function () {
        dP.showToolbarForm('#addFilterBrightness');
    });

    $('#filterContrastBtn').on('click', function () {
        dP.showToolbarForm('#addFilterContrast');
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
            $('#text').val(dP.$selection.text());
            $('#createText').val('Edit');
        } else {
            $('#text').val('');
            $('#createText').val('Add');
        }
    });

    $('#textInput').on('submit', function(e) {
        e.preventDefault();
        const inputText = $('#text').val();
        const inputTextSize = $('#textSize').val();
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
            if (dP.selection && dP.$selection.is('p')) {
                textToChange = dP.$selection;
                textToChange.text(inputText);
            } else {
                textToChange = dP.createText(inputText);
            }
            textToChange.css('--fontSize', inputTextSize + 'px');
            textToChange.css('--fontFamily', inputTextFont);
            textToChange.css('--fontWeight', fontWeight);
            textToChange.css('--fontStyle', fontStyle);
            dP.showToolbarForm('');
        }
    });

    $('#addBorder').on('submit', function (e) {
        e.preventDefault();
        if (dP.selection) {
            const borderThickness = $('#borderThickness').val();
            const borderStyle = $('#borderStyle').val();
            const borderColour = $('#borderColour').val();
            dP.$selection.css('--borderThickness', borderThickness + 'px');
            dP.$selection.css('--borderStyle', borderStyle);
            dP.$selection.css('--borderColour', borderColour);
            dP.showToolbarForm('');
        }
    });

    $('#addBorderRadius').on('submit', function (e) {
        e.preventDefault();
        if(dP.selection) {
            const borderRadiusTopLeft = $('#borderRadiusTopLeft').val();
            const borderRadiusTopRight = $('#borderRadiusTopRight').val();
            const borderRadiusBottomRight = $('#borderRadiusBottomRight').val();
            const borderRadiusBottomLeft = $('#borderRadiusBottomLeft').val();
            dP.$selection.css('--borderRadiusTopLeft', borderRadiusTopLeft + '%');
            dP.$selection.css('--borderRadiusTopRight', borderRadiusTopRight + '%');
            dP.$selection.css('--borderRadiusBottomRight', borderRadiusBottomRight + '%');
            dP.$selection.css('--borderRadiusBottomLeft', borderRadiusBottomLeft + '%');
            dP.showToolbarForm('');
        }
    });

    $('#addBoxShadow').on('submit', function (e) {
        e.preventDefault();
        if(dP.selection) {
            const boxShadowX = $('#boxShadowX').val();
            const boxShadowY = $('#boxShadowY').val();
            const boxShadowBlur = $('#boxShadowBlur').val();
            const boxShadowSpread = $('#boxShadowSpread').val();
            const boxShadowColour = $('#boxShadowColour').val();
            dP.$selection.css('--boxShadowX', boxShadowX + 'px');
            dP.$selection.css('--boxShadowY', boxShadowY + 'px');
            dP.$selection.css('--boxShadowBlur', boxShadowBlur + 'px');
            dP.$selection.css('--boxShadowSpread', boxShadowSpread + 'px');
            dP.$selection.css('--boxShadowColour', boxShadowColour);
            dP.showToolbarForm('');
        }
    });

    $('#addTextShadow').on('submit', function(e) {
        e.preventDefault();
        if (dP.selection && dP.$selection.is('p')) {
            const textShadowX = $('#textShadowX').val();
            const textShadowY = $('#textShadowY').val();
            const textShadowBlur = $('#textShadowBlur').val();
            const textShadowColour = $('#textShadowColour').val();
            dP.$selection.css('--textShadowX', textShadowX + 'px');
            dP.$selection.css('--textShadowY', textShadowY + 'px');
            dP.$selection.css('--textShadowBlur', textShadowBlur + 'px');
            dP.$selection.css('--textShadowColour', textShadowColour);
            dP.showToolbarForm('');
        }
    });

    $('#addTextDecoration').on('submit', function (e) {
        e.preventDefault();
        if (dP.selection && dP.$selection.is('p')) {
            const textDecorationLine = $('#textDecorationLine').val();
            const textDecorationStyle = $('#textDecorationStyle').val();
            const textDecorationColour = $('#textDecorationColour').val();
            const textDecorationThickness = $('#textDecorationThickness').val();
            dP.$selection.css('--textDecorationLine', textDecorationLine);
            dP.$selection.css('--textDecorationStyle', textDecorationStyle);
            dP.$selection.css('--textDecorationColour', textDecorationColour);
            dP.$selection.css('--textDecorationThickness', textDecorationThickness + 'px');
            dP.showToolbarForm('');
        }
    });

    $('#addTextTransform').on('submit', function (e) {
        e.preventDefault();
        if (dP.selection && dP.$selection.is('p')) {
            const textTransform = $('#textTransform').val();
            dP.$selection.css('--textTransform', textTransform);
            dP.showToolbarForm('');
        }
    });

    $('#addFilterBlur').on('submit', function (e) {
        e.preventDefault();
        if (dP.selection) {
            const filterBlur = $('#filterBlur').val();
            dP.$selection.css('--filterBlur', filterBlur + 'px');
            dP.showToolbarForm('');
        }
    });

    $('#addFilterBrightness').on('submit', function (e) {
        e.preventDefault();
        if(dP.selection) {
            const filterBrightness = $('#filterBrightness').val();
            dP.$selection.css('--filterBrightness', filterBrightness + '%');
            dP.showToolbarForm('');
        }
    });

    $('#addFilterContrast').on('submit', function (e) {
        e.preventDefault();
        if(dP.selection) {
            const filterContrast = $('#filterContrast').val();
            dP.$selection.css('--filterContrast', filterContrast + '%');
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
            let currentZ = parseInt(dP.$selection.css('--z'));
            currentZ++;
            dP.$selection.css('--z', currentZ);
            dP.updateDisplay();
        }
    });

    $('#zDownBtn').on('click', function () {
        if (dP.selection) {
            let currentZ = parseInt(dP.$selection.css('--z'));
            currentZ--;
            dP.$selection.css('--z', currentZ);
            dP.updateDisplay();
        }
    });

    $('#fillBtn').on('click', function () {
        if (dP.selection) {
            const colour = dP.$colour.val();
            dP.$selection.css('--bgColour', colour);
        }
    });

    $('#eyeDropper').on('click', function() {
        if (dP.selection) {
            const colour = dP.$selection.css('--bgColour');
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
            dP.$selection.css('--url', `url(${image})`);
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
            const classes = dP.$selection.attr('class');
            dP.deletedClasses = classes.replace('selected', '');
            dP.$selection.remove();
            dP.selection = undefined;
        }
    });

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

                case 43: // +
                    if (dP.selection) {
                        let currentZ = parseInt(dP.$selection.css('--z'));
                        currentZ++;
                        dP.$selection.css('--z', currentZ);
                        dP.updateDisplay();
                    }
                    break;

                case 45: // -
                    if (dP.selection) {
                        let currentZ = parseInt(dP.$selection.css('--z'));
                        currentZ--;
                        dP.$selection.css('--z', currentZ);
                        dP.updateDisplay();
                    }
                    break;

                case 122: // Z
                    dP.undoState();
                    break;

                case 113: // Q
                    dP.save = dP.saveBoard();
                    break;

            }
        }
    });

    dP.$board.on('mousemove', function(e) {
        dP.updateDisplay();
        if (dP.move.data('active') && dP.selection) {
            dP.$selection.css({
                '--x': `${(e.pageX - this.offsetLeft - (dP.$selection.width() / 2)) + 'px'}`,
                '--y': `${(e.pageY - this.offsetTop - (dP.$selection.height() / 2)) + 'px'}`,
            });
        } else if (dP.scale.data('active') && dP.selection) {
            const scaleX = (e.pageX - dP.boardCentreX) / 50;
            const scaleY = (e.pageY - dP.boardCentreY) / 50;
            dP.$selection.css('--scaleX', scaleX);
            dP.$selection.css('--scaleY', scaleY);
        } else if (dP.rotate.data('active') && dP.selection) {
            const rotate = (e.pageY - this.offsetTop);
            dP.$selection.css('--angle', rotate + 'deg');
        } else if (dP.skew.data('active') && dP.selection) {
            const skewX = (e.pageX - dP.boardCentreX) / 10;
            const skewY = (e.pageY - dP.boardCentreY) / 10;
            dP.$selection.css('--skewX', skewX + 'deg');
            dP.$selection.css('--skewY', skewY + 'deg');
        }

    });


    dP.$board.on('click', '*', function (e) {
        e.stopPropagation();
        if (dP.selection === this) {
            dP.selection = undefined;
            dP.$selection = undefined;
            $(this).removeClass('selected');
            dP.showToolbarForm('');
        } else if (dP.selection && dP.selection !== this) {
            dP.$selection.removeClass('selected');
            dP.selection = this;
            dP.$selection = $(this);
            dP.lastSelected = dP.selection;
            dP.$lastSelected = dP.$selection;
            dP.saveState();
            $(this).addClass('selected');
        } else {
            dP.selection = this;
            dP.$selection = $(this);
            dP.lastSelected = dP.selection;
            dP.$lastSelected = dP.$selection;
            dP.saveState();
            $(this).addClass('selected');
        };
        dP.updateDisplay();
    });

    dP.$board.on('click', function() {
        dP.updateDisplay();
        if (dP.selection) {
            dP.$selection.removeClass('selected');
            dP.selection = undefined;
            dP.$selection = undefined;
            dP.showToolbarForm('');
        }
    });
};

$(function() {

    dP.init();

});