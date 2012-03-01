/*!
 * Open source under the BSD License
 * Copyright (c) 2011, Philippe Le Van, Kitpages, http://www.kitpages.fr
 */
(function( $ ){
    
    var WidgetSlider = (function() {
        // constructor
        function WidgetSlider(boundingBox, options) {
            this._settings = {
                // durations
                moveDelay: 30, // time in ms between moves
                // speed
                speedStart: 1,
                speedEnd: 15,
                speedAcceleration: 1,
                // size
                maxWidth: 10000,
                maxHeight: 10000,
                // keys
                keyCodeLeftArrow: 37, // from http://www.javascripter.net/faq/keycodes.htm
                keyCodeRightArrow: 39,
                // events
                render: null, // after rendering of dom
                move: null, // before move begining
                stop: null // before stop of move
            };
            // settings
            if (options) {
                $.extend(this._settings, options);
            }

            // variable used
            this._moveState = {
                currentSpeed: this._settings.speedStart,
                isMoving: false
            };

            // DOM Nodes
            this._boundingBox = boundingBox;

            // memory
            this._boundingBox.data( "kitSlider", this );

            this.init();
        };
        
        // methods
        WidgetSlider.prototype = {
            init: function() {
                var self = this;
                var eventList = ['render', 'move', 'stop'];
                // init custom events according to settings callback values
                for (var i = 0 ; i < eventList.length ; i++ ) {
                    if (this._settings[eventList[i]]) {
                        this._boundingBox.bind(eventList[i]+"_kitSlider", {self:self}, this._settings[eventList[i]]);
                    }
                }
                // init custom events according to settings callback values
                for (var i = 0 ; i < eventList.length ; i++ ) {
                    var callbackName = "_"+eventList[i]+"Callback";
                    this._boundingBox.bind(eventList[i]+"_kitSlider", {self:self}, this[callbackName]);
                }
                var self = this;
                self._isDocumentReadyRendered = false;
                self._isWindowLoadRendered = false;
                $(document).ready(function() {
                    self.render();
                });
            },

            ////
            // callbacks
            ////
            _renderCallback: function(event) {
                if (event.isDefaultPrevented()) {
                    return;
                }

                var self = event.data.self;
                self._render();
            },
            _moveCallback: function(event, direction) {
                if (event.isDefaultPrevented()) {
                    return;
                }

                var self = event.data.self;
                self._move(direction);
            },
            _stopCallback: function(event) {
                if (event.isDefaultPrevented()) {
                    return;
                }

                var self = event.data.self;
                self._stop();
            },

            ////
            // real methods that do something
            ////
            _render: function() {
                var self = this;
                if (self._isDocumentReadyRendered == true) {
                    return;
                }
                self._isDocumentReadyRendered = true;
                var html = self._boundingBox.html();
                self._boundingBox.css({
                    'overflow':'hidden',
                    'position': 'relative'
                });
                self._boundingBox.empty().append(
                    '<div class="kit-slider-wrapper">'+
                    '<div class="kit-slider-container">'+html+'</div>'+
                    '</div>'+
                    '<div class="kit-slider-button-left"></div>'+
                    '<div class="kit-slider-button-right"></div>'
                );
                self._boundingBox.find('.kit-slider-wrapper').css({
                    'position': 'relative',
                    'width': self._settings.maxWidth+'px',
                    'height': self._settings.maxHeight+'px'
                });
                self._boundingBox.find('.kit-slider-container').css({
                    'position': 'absolute',
                    'top': '0px',
                    'left': '0px'
                });
                self._buttonLeft = self._boundingBox.find('.kit-slider-button-left');
                self._buttonRight = self._boundingBox.find('.kit-slider-button-right');
                self._container = self._boundingBox.find('.kit-slider-container');
                self._wrapper = self._boundingBox.find('.kit-slider-wrapper');

                $(window).load(function() {
                    if (self._isWindowLoadRendered == true) {
                        return;
                    }
                    self._isWindowLoadRendered = true;
                    self._buttonLeft.css({
                        'height': self._container.height()+'px'
                    });
                    self._buttonRight.css({
                        'height': self._container.height()+'px'
                    });
                    self._renderButton();
                    self._buttonRight.mousedown(function(e) {
                        self._boundingBox.trigger("move_kitSlider", ["right"]);
                    });
                    self._buttonRight.mouseup(function(e) {
                        self._boundingBox.trigger("stop_kitSlider", ["right"]);
                    });
                    self._buttonLeft.mousedown(function(e) {
                        self._boundingBox.trigger("move_kitSlider", ["left"]);
                    });
                    self._buttonLeft.mouseup(function(e) {
                        self._boundingBox.trigger("stop_kitSlider", ["left"]);
                    });
                });
            },

            _renderButton: function() {
                var self = this;
                if (self._container.position().left < 0) {
                    self._buttonLeft.show();
                } else {
                    self._buttonLeft.hide();
                }

                if (self._container.position().left  > self._boundingBox.width() - self._container.width() ) {
                    self._buttonRight.show();
                } else {
                    self._buttonRight.hide();
                }
            },

            _move: function(direction) {
                var self = this;
                self._moveState.isMoving = true;
                self._moveState.currentSpeed = 1;
                clearTimeout(self.moveTimer);
                if (direction=="right") {
                    var moveRight = function() {
                        if (self._moveState.isMoving == false) {
                            return;
                        }
                        var newLeft = self._container.position().left - self._moveState.currentSpeed;
                        if (newLeft < self._boundingBox.width() - self._container.width() ) {
                            newLeft = self._boundingBox.width() - self._container.width();
                        }
                        if (newLeft != self._container.position().left) {
                            self._container.css('left', newLeft+'px');
                        }
                        self._renderButton();
                        var newSpeed = self._moveState.currentSpeed + self._settings.speedAcceleration;
                        if (newSpeed > self._settings.speedEnd) {
                            newSpeed = self._settings.speedEnd;
                        }
                        self._moveState.currentSpeed = newSpeed;
                        self.moveTimer = setTimeout(function() {
                            moveRight()
                        }, self._settings.moveDelay);
                    };
                    moveRight();
                }
                if (direction=="left") {
                    var moveLeft = function() {
                        if (self._moveState.isMoving == false) {
                            return;
                        }
                        var newLeft = self._container.position().left + self._moveState.currentSpeed;
                        if (newLeft > 0 ) {
                            newLeft = 0;
                        }
                        if (newLeft != self._container.position().left) {
                            self._container.css('left', newLeft+'px');
                        }
                        self._renderButton();
                        var newSpeed = self._moveState.currentSpeed + self._settings.speedAcceleration;
                        if (newSpeed > self._settings.speedEnd) {
                            newSpeed = self._settings.speedEnd;
                        }
                        self._moveState.currentSpeed = newSpeed;
                        self.moveTimer = setTimeout(function() {
                            moveLeft()
                        }, self._settings.moveDelay);
                    };
                    moveLeft();
                }
            },

            _stop: function() {
                var self = this;
                self._moveState.isMoving = false;
                self._moveState.currentSpeed = 1;
                clearTimeout(self.moveTimer);
            },

            ////
            // external methods
            ////
            render: function() {
                var self = this;
                self._boundingBox.trigger("render_kitSlider");
            }
        };
        return WidgetSlider;
    })();
    
    var methods = {
        /**
         * add events to a dl instance
         * @this the dl instance (jquery object)
         */
        init : function ( options ) {
            var self = $(this);
            // chainability => foreach
            return this.each(function() {
                var widget = new WidgetSlider($(this), options);
            });
        },

        render: function() {
            return this.each(function() {
                var widget = $(this).data("kitSlider");
                widget.render();
            });
        },
        /**
         * unbind all kitSlider events
         */
        destroy : function( ) {
        }
        
    };
    
    $.fn.kitSlider = function( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.kitSlider' );
        }
    };
})( jQuery );