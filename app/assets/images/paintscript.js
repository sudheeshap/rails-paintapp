  var board = document.getElementById("realCanvas");
  var tmp_board = document.getElementById("tempCanvas");
  var b_width = board.width, b_height = board.height;
  var ctx = board.getContext("2d"), tmp_ctx = tmp_board.getContext("2d");
  var x, y, saved = false, hold = false, fill = false, stroke = true, tool = 'pencil';
  tmp_ctx.lineCap = 'round';
  ctx.lineCap = 'round';
  cvs_data = {"line": [], "pencil": [], "rectangle": [], "circle": [], "eraser": [] };

  function curr_tool(selected){tool = selected;}

  function attributes(){
    if (document.getElementById("fill").checked)
      fill = true;
    else
      fill = false;
    if (document.getElementById("outline").checked)
      stroke = true;
    else
      stroke = false;
  }

  function thickness(){
    tmp_ctx.lineWidth = document.getElementById("thick").value;
  }

  function clears(){
    ctx.clearRect(0, 0, b_width, b_height);
    tmp_ctx.clearRect(0, 0, b_width, b_height);
    cvs_data = {"line": [], "pencil": [], "rectangle": [], "circle": [], "eraser": [] };
  }

  function linecolor(scolor){  
    if (document.getElementById("outline").checked)
      tmp_ctx.strokeStyle = scolor;
  }

  function fillcolor(fcolor){
    if (document.getElementById("fill").checked)
      tmp_ctx.fillStyle =  fcolor;
  }

  tmp_board.onmousedown = function(e) {
        attributes();
        hold = true;
        x = e.pageX - this.offsetLeft;
        y = e.pageY -this.offsetTop;
        begin_x = x;
        begin_y = y;
        tmp_ctx.beginPath();
        tmp_ctx.moveTo(begin_x, begin_y);    
  }

  tmp_board.onmousemove = function(e) {
        if (x == null || y == null) {
          return;
        }
        if(hold){
          x = e.pageX - this.offsetLeft;
          y = e.pageY - this.offsetTop;
          goDraw();
        }
  }
     
  tmp_board.onmouseup = function(e) {
        ctx.drawImage(tmp_board,0, 0);
        tmp_ctx.clearRect(0, 0, tmp_board.width, tmp_board.height);
        end_x = x;
        end_y = y;
        x = null;
        y = null;
        goDraw();
        hold = false;
  }

  function goDraw(){
    if (tool == 'pencil'){
      brush();  
    }
    else if (tool == 'line'){ 
      if(!x && !y){
        cvs_data.line.push({"x": begin_x, "y": begin_y, "end_x": end_x, "end_y": end_y,
                            "thick": tmp_ctx.lineWidth, "color": tmp_ctx.strokeStyle });
        return;
      }
      tmp_ctx.clearRect(0, 0, b_width, b_height);
      tmp_ctx.beginPath();
      tmp_ctx.moveTo(begin_x, begin_y);
      tmp_ctx.lineTo(x, y);
      tmp_ctx.stroke();
      tmp_ctx.closePath();
    }
    else if (tool == 'rectangle'){
      if(!x && !y){
        cvs_data.rectangle.push({"x": begin_x, "y": begin_y, "width": end_x-begin_x, "height": end_y-begin_y,
                                 "thick": tmp_ctx.lineWidth, "stroke": stroke, "strk_clr": tmp_ctx.strokeStyle, 
                                 "fill": fill, "fill_clr": tmp_ctx.fillStyle });
        return;
      }  
      tmp_ctx.clearRect(0, 0, b_width, b_height);
      tmp_ctx.beginPath();
      if(stroke)
        tmp_ctx.strokeRect(begin_x, begin_y, x-begin_x, y-begin_y);
      if(fill) 
        tmp_ctx.fillRect(begin_x, begin_y, x-begin_x, y-begin_y);
      tmp_ctx.closePath();
    }
    else if (tool == 'circle'){   
      if(!x && !y){
        cvs_data.circle.push({"x": begin_x, "y": begin_y, "radius": end_x-begin_x, 
                              "thick": tmp_ctx.lineWidth, "stroke": stroke, "strk_clr": tmp_ctx.strokeStyle,
                              "fill": fill, "fill_clr": tmp_ctx.fillStyle });   
        return;
      }   
      tmp_ctx.clearRect(0, 0, b_width, b_height);
      tmp_ctx.beginPath();
      tmp_ctx.arc(begin_x, begin_y, Math.abs(x-begin_x), 0 , 2 * Math.PI, false);
      if(stroke) 
        tmp_ctx.stroke();
      if(fill) 
        tmp_ctx.fill();
      tmp_ctx.closePath();
    }
    else if (tool == 'eraser'){
      tmp_ctx.strokeStyle = '#ffffff';
      brush();  
      tmp_ctx.strokeStyle = '#000000';
    }
  }

  function save(){
    var f_name =  document.getElementById("fname").value;
    var title = document.getElementById('name').innerHTML;
    if(!f_name){
      alert("Enter a Filename to save!");
      return;
    }
    var exist = is_there(f_name);
    if(!saved && exist){
      alert("Filename already exists!");
      return;
    } 
    $.post("/paint/add",{fname: f_name, whole_data: JSON.stringify(cvs_data)}, function(data, status) {
               //alert(JSON.parse(data));
       });
    title = f_name;
    
    alert("Saved! ");
  }

  function createNew(){
    window.location = "/paint/index";    
  }

  $(".img_files").click(function(){ 
    var img_fname = $(this).text();
    document.getElementById('name').innerHTML = img_fname;
    document.getElementById("fname").value = img_fname;
    clears();
    iter_py_data(img_fname);
  });

  function iter_py_data(img_name){
    saved = true;
    for(var key in py_data){
      if(py_data[key].fname == img_name){
        file_data = JSON.parse(py_data[key].img_data);
        for(var ptool in file_data){
          if(file_data[ptool].length != 0){
            for(var i=0; i<file_data[ptool].length; i++){
              cvs_data[ptool].push(file_data[ptool][i]);
              shape_draw(ptool, file_data[ptool][i]);
            }
          }
         }
       }
     }
  }
   
  function shape_draw(ctool, shape){
    if (ctool == 'pencil'){
      var bg_x = shape.x, bg_y = shape.y, x = shape.end_x, y = shape.end_y;
      ctx.lineWidth = shape.thick;
      ctx.strokeStyle = shape.color;
      ctx.beginPath();
      ctx.moveTo(bg_x, bg_y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    else if (ctool == 'line'){
      ctx.beginPath();
        var l_x = shape.x;
        var l_y = shape.y;
        var lend_x = shape.end_x;
        var lend_y = shape.end_y;
        ctx.lineWidth = shape.thick;
        ctx.strokeStyle = shape.color;
        ctx.moveTo(l_x, l_y);
        ctx.lineTo(lend_x, lend_y);
        ctx.stroke();
        ctx.closePath();
    }
    else if (ctool == 'rectangle'){
      var r_x = shape.x, r_y = shape.y, width = shape.width, height = shape.height;
          stroke = shape.stroke, fill = shape.fill;   
      ctx.beginPath();
      ctx.lineWidth = shape.thick;
      ctx.strokeStyle = shape.strk_clr;
      ctx.fillStyle = shape.fill_clr;
      if(stroke)
        ctx.strokeRect(r_x, r_y, width, height);
      if(fill) 
        ctx.fillRect(r_x, r_y, width, height);
        ctx.closePath();  
    }
    else if (ctool == 'circle'){   
      var c_x = shape.x, c_y = shape.y, width = shape.radius, stroke = shape.stroke,
      fill = shape.fill;
      ctx.beginPath();
      ctx.lineWidth = shape.thick;
      ctx.strokeStyle = shape.strk_clr;
      ctx.fillStyle = shape.fill_clr;
      ctx.arc(c_x, c_y, Math.abs(width), 0 , 2 * Math.PI, false);
      if(stroke) 
        ctx.stroke();
      if(fill) 
        ctx.fill();
      ctx.closePath();  
    }
    else if (ctool == 'eraser'){
      var l_x = shape.x, l_y = shape.y, lend_x = shape.end_x, lend_y = shape.end_y;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.lineWidth = shape.thick;
      ctx.moveTo(l_x, l_y);
      ctx.lineTo(lend_x, lend_y);
      ctx.stroke();
      ctx.closePath();
    }
  }
  
  function is_there(fname){
    for(var each in py_data){
      if(py_data[each].fname == fname) 
        return true;
    }
    return false;
  }

  function brush(){  
    if(!x && !y)
      return; 
    if(tool == 'pencil'){
     cvs_data.pencil.push({"x": begin_x, "y": begin_y, "end_x": x, "end_y": y,
                           "thick": tmp_ctx.lineWidth, "color": tmp_ctx.strokeStyle });
    }
    else{
      cvs_data.eraser.push({"x": begin_x, "y": begin_y, "end_x": x, "end_y": y,
                           "thick": tmp_ctx.lineWidth });
    }
    tmp_ctx.lineTo(x, y);
    tmp_ctx.stroke();
    begin_x = x;
    begin_y = y;
  }
