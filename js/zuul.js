/*!
 * Copyright 2013 OpenStack Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Animated simulation of zuul operation
 */

var green = "#00bb44";
var red   = "#bb0000";

var light_green = "#8dbb9e";
var light_red   = "#bb7777";

function Change(paper, name, number, x, y, delay)
{
    this.set = paper.set();
    this.x = x;
    this.y = y;
    this.text = paper.text(x, y, name+'\n#'+number);
    this.set.push(this.text);
    this.text.attr({"font-size": 16});
    width = this.text.getBBox().width+16;
    height = this.text.getBBox().height+12;

    this.left = x-width/2;
    this.right = x+width/2;
    this.top = y-height/2;
    this.bottom = y+height/2;

    this.rect = paper.rect(this.left, this.top, width, height, 2);
    this.set.push(this.rect);
    this.rect.attr({fill: "#ccc", stroke: "#bbb"});
    this.rect.toBack();

    this.set.attr({opacity: 0});
    this.set.animate(Raphael.animation({opacity: 1}, 500, 'linear').delay(delay));

    this.hide = function ()
    {
	var set = this.set;
	var remove = function () { set.remove(); };
	this.set.animate({opacity: 0}, 1000, 'linear', remove);
    }

    this.merge = function(x, y)
    {
	this.set.toFront();
	this.text.animate(Raphael.animation({opacity: 0}, 500, 'linear'));
	this.rect.animate(Raphael.animation(
	    {width: 18, height: 18, r: 9, x: x, y: y, stroke: green},
	    1000).delay(500));
    }

    this.move = function(x, y, delay)
    {
        var width = this.text.getBBox().width+16;
        var height = this.text.getBBox().height+12;
        this.x = x;
        this.y = y;
        this.left = x-width/2;
        this.right = x+width/2;
        this.top = y-height/2;
        this.bottom = y+height/2;

        this.text.animate(Raphael.animation(
            {x: x, y: y}, 500, 'linear').delay(delay));
        this.rect.animate(Raphael.animation(
            {x: this.left, y: this.top},
            500, 'linear').delay(delay));
    }

    this.provisionalResult = function(success)
    {
	if (success)
	{
	    color = light_green;
	} else {
	    color = light_red;
	}
	this.rect.animate({fill: color}, 500);
    }

    this.result = function(success)
    {
	if (success)
	{
	    color = green;
	} else {
	    color = red;
	}
	this.rect.animate({fill: color}, 500);
    }

    this.reset = function(success)
    {
	this.rect.animate({fill: "#ccc"}, 500);
    }
}

function linePath(x1, y1, x2, y2) {
    return "M"+x1+","+y1+"L"+x2+","+y2;
}

function Dependency(paper, source, target, delay)
{
    this.set = paper.set();
    this.source = source;
    this.target = target;

    startx = this.source.right + 8;
    starty = this.source.y;
    tipx = this.target.left - 8;
    tipy = this.target.y;

    path =        "M" + (startx) + "," + starty;
    path = path + "L" + (tipx-15) + "," + tipy;
    this.line = paper.path(path);
    this.set.push(this.line);
    this.line.attr("stroke-width", "2");
    this.line.attr("fill", "#000");
    this.line.attr("stroke", "#000");

    path =        "M" + (tipx - 20) + "," + (tipy - 10);
    path = path + "L" + (tipx)      + "," + (tipy);
    path = path + "L" + (tipx - 20) + "," + (tipy + 10);
    path = path + "Q" + (tipx - 12) + "," + (tipy);
    path = path + "," + (tipx - 20) + "," + (tipy - 10);
    path = path + "Z";
    this.arrow = paper.path(path);
    this.set.push(this.arrow);
    this.arrow.attr("fill", "#000");
    this.arrow.attr("stroke", "#000");

    this.set.attr({opacity: 0});
    this.set.animate(Raphael.animation({opacity: 1}, 500, 'linear').delay(delay));

    this.hide = function ()
    {
	var set = this.set;
	var remove = function () { set.remove(); };
	this.set.animate({opacity: 0}, 1000, 'linear', remove);
    }
}

function TestSeries(paper, change, tests)
{
    this.x = change.x - 20;
    this.y = change.bottom + 6;
    offset = 40; // the "merge" test length

    height = 0;
    for (test in tests)
    {
	len = tests[test][0];
	if (len > height)
	{
	    height = len;
	}
    }

    this.width = (1+10*tests.length)
    this.height = offset + height + 10;
    this.set = paper.set();

    startpath = "M" + this.x + "," + this.y;
    line = paper.path(startpath+"l0," + offset);
    this.set.push(line);

    startpath = "M" + this.x + "," + (this.y + offset);
    line = paper.path(startpath+"l0," + (this.height - offset));
    this.set.push(line);
    line.attr("stroke-dasharray", "-");
    line.attr("stroke", green);

    line = paper.path(startpath + "l" + (1+10*tests.length) + ",0");
    this.set.push(line);

    var global_success = true;
    curx = this.x;
    cury = this.y + offset;
    for (var test in tests)
    {
	len = tests[test][0];
	success = tests[test][1];
	curx = curx + 10;
	line = paper.path("M" + curx + "," + cury + "l0," + len);
	this.set.push(line);
	line = paper.path("M" + curx + "," + cury + "m0," + len +
			  "l0," + (this.height-offset-len));
	this.set.push(line);
	line.attr("stroke-dasharray", "-");
	if (success) {
	    line.attr("stroke", green);
	} else {
	    line.attr("stroke", red);
	    global_success = false;
	}
    }

    var complete = function ()
    {
	change.provisionalResult(global_success);
    }

    this.rect = paper.rect(this.x-2, this.y-2, this.width+4, this.height+2);
    this.rect.attr({fill: "#fff", stroke: "#fff"})
    this.rect.animate({y: this.y+this.height+2, height: 0}, 36*this.height,  //36
		      'linear', complete);

    this.hide = function ()
    {
	var set = this.set;
	var remove = function () { set.remove(); };
	this.set.animate({opacity: 0}, 2000, 'linear', remove);
    }

    this.move = function (delay)
    {
        var old_x = this.x;
        var old_y = this.y;
        this.x = change.x - 20;
        this.y = change.bottom + 6;
        var dX = this.x - old_x;
        var dY = this.y - old_y;
        this.set.forEach(function (line) {
            line.animate(Raphael.animation(
                {transform: 't' + dX + ',' + dY}, 500, 'linear').delay(delay));
        });
    }
}

var zuul_simulation = {

    paper: null,
    state: 0,
    finished: false,
    running: false,

    setup: function()
    {
        this.paper = Raphael(200, 200, 760, 400);
        this.running = true;
        this.finished = false;
        this.state = 0;
    },

    teardown: function()
    {
        if (this.paper != null) {
            this.paper.remove();
            this.paper = null;
        }
        this.finished = true;
        this.running = false;
    },

    next: function()
    {
        this.state = this.state + 1;
        if (this.state == 1)
        {
            head_label = this.paper.text(520, 385, "HEAD");
            head_label.attr({"font-size": 16});

            nova_label = this.paper.text(520, 300, "nova");
            nova_label.attr({"font-size": 16});
            nova_label.attr({x:this.paper.width-(nova_label.getBBox().width/2)-10});
            nova_end = [(this.paper.width-nova_label.getBBox().width-16), 300];
            nova_line = this.paper.path(linePath(520, 300, nova_end[0], nova_end[1]))

            nova_line.attr({"stroke-width": 2, fill: "#000", stroke: "#000"});
            nova_head = this.paper.circle(520, 300, 9);
            nova_head.attr({fill: "#5069c9", stroke:"#5069c9"});

            keystone_label = this.paper.text(520, 360, "keystone");
            keystone_label.attr({"font-size": 16});
            keystone_label.attr({x:this.paper.width-(keystone_label.getBBox().width/2)-10});
            keystone_end = [(this.paper.width-keystone_label.getBBox().width-16), 360];
            keystone_line = this.paper.path(linePath(520, 360, keystone_end[0], keystone_end[1]));
            keystone_line.attr({"stroke-width": 2, fill: "#000", stroke: "#000"});
            keystone_head = this.paper.circle(520, 360, 9);
            keystone_head.attr({fill: "#eead5f", stroke:"#eead5f"});
        }
        if (this.state == 2)
        {
            change1 = new Change(this.paper, 'nova', '1', 480, 40, 0);
            change2 = new Change(this.paper, 'nova', '2', 340, 40, 1000);
            dep21 = new Dependency(this.paper, change2, change1, 1800);

            change3 = new Change(this.paper, 'keystone', '3', 180, 40, 2000);
            dep32 = new Dependency(this.paper, change3, change2, 2800);

            change4 = new Change(this.paper, 'nova', '4', 40, 40, 3000);
            dep43 = new Dependency(this.paper, change4, change3, 3800);
        }
        if (this.state == 3) {
            change1_test = new TestSeries(this.paper, change1, [[80, 1], [60, 1], [95, 1]]);
            change2_test = new TestSeries(this.paper, change2, [[80, 1], [60, 1], [90, 1]]);
            change3_test = new TestSeries(this.paper, change3, [[50, 1], [30, 0]]);
            change4_test = new TestSeries(this.paper, change4, [[80, 1], [60, 1], [85, 0]]);
        }
        if (this.state == 4) {
            change4_test.hide();
            dep43.hide();
        }
        if (this.state == 5) {
            dep32.hide();
            change3.move(180, 80, 200);
            change3_test.move(change3, 200);
            dep32 = new Dependency(this.paper, change3, change2, 1000);
        }
        if (this.state == 6) {
            change4.hide();

            change4 = new Change(this.paper, 'nova', '4', 40, 40, 1000);
            dep42 = new Dependency(this.paper, change4, change2, 1000);
        }
        if (this.state == 7) {
            change4_test = new TestSeries(this.paper, change4, [[80, 1], [60, 1], [85, 1]]);
        }
        if (this.state == 8) {
            change1_test.hide();
            change1.result(1);
        }
        if (this.state == 9) {
            change1.merge(480, 290);
            dep21.hide();
            setTimeout(function() {
                nova_line.attr({path: linePath(490, 300, nova_end[0], nova_end[1])})
            } , 2000);
        }
        if (this.state == 10) {
            change2_test.hide();
            change2.result(1);
        }
        if (this.state == 11) {
            change2.merge(450, 290);
            dep32.hide();
            dep42.hide();
            setTimeout(function() {
                nova_line.attr({path: linePath(460, 300, nova_end[0], nova_end[1])})
            } , 2000);
        }
        if (this.state == 12) {
            change3_test.hide();
            change3.result(0);
        }
        if (this.state == 13) {
            change3.hide();
        }
        if (this.state == 14) {
            change4_test.hide();
            change4.result(1);
        }
        if (this.state == 15) {
            change4.merge(420, 290);
            setTimeout(function() {
                nova_line.attr({path: linePath(430, 300, nova_end[0], nova_end[1])})
            } , 2000);
        }
        if (this.state == 16) {
            this.finished = true;
        }
    },
};  /* zuul_simulation */


Reveal.addEventListener( 'zuul', function() {

    w3c_slidy.zuul_orig_show_slide = w3c_slidy.show_slide;
    var advance = function() {
        zuul_simulation.next();

        if (zuul_simulation.finished) {
            $("#zuul").unbind('click');
            $(document).unbind('keypress');
            w3c_slidy.mouse_click_enabled = true;
        }
    };
    var show_slide = function (slide) {
        w3c_slidy.zuul_orig_show_slide(slide);
        if ($("#zuul")[0] === slide) {
            if (!zuul_simulation.running) {
                zuul_simulation.setup();
                zuul_simulation.next();
                w3c_slidy.mouse_click_enabled = false;
                $("#zuul").bind('click', advance);
                $(document).bind('keypress', function(event) {
                    var key = null;
                    if (window.event) {
                        key = window.event.keyCode;
                    } else if (event.which) {
                        key = event.which;
                    }
                    // 'x' key
                    if (key == 120) {
                        advance();
                    }
                });
           }
        } else {
            if (zuul_simulation.running) {
                $("#zuul").unbind('click');
                $(document).unbind('keypress');
                w3c_slidy.mouse_click_enabled = true;
                zuul_simulation.teardown();
            }
        }
    };
    w3c_slidy.show_slide = show_slide;
}); /* zuul slide */
