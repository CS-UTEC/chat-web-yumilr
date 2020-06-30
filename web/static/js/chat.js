var current_user;
var user_to;

function logout(){
  $.post({
      url:'/deauthenticate',
      type: 'post',
      dataType: 'json',
      contentType: 'application/json',
      success: function(data){
          alert(data['msg']);
          location.href="http://127.0.0.1:8080";
      },
  });
}

function get_current_users(){
  get_current_user();
  $("#users").empty();
  console.log("Voy a traer a los usuarios");
  $.getJSON("/users", function(data){
    console.log(data);
    for(var i=0; i<data.length; i++){
      // var div='<li class="list-group-item d-block" id="user_id" onclick="get_messages(this)" attr-id="username_id">Username</li>';
      // var div='<br><buttontype="button" class="btn btn-default" onclick="get_messages(this)">Username</button>';
      var div='<div class="chat_list d-block" id="user_id" onclick="get_messages(this)" attr-id="username_id">'+
      '<div class="chat_people">'+
        '<div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>'+
        '<div class="chat_ib">'+
            '<h5>Username</h5>'+
        '</div>'+
      '</div>'+
      '</div>';
      div = div.replace('user_id', data[i]['username']);
      div = div.replace('username_id', data[i]['id']); //.replace(esto, en esto)
      div = div.replace('Username', data[i]['name'] + '<br><br>@'+data[i]['username']);
      $("#users").append(div);
    }
  });
}

function get_current_user(){
  console.log("Usuario loggeado");
  $.getJSON("/current", function(data){
    current_user=data;
  });
}

//TODO: optimize get messages
function get_messages(a){
  $("#messages").empty();  //elemento con texto concatenado
  console.log("Voy a traer los mensajes");
  //console.log(a);
  //console.log($(a).text());
  //user_to=$(a).text();  //formato jquery
  user_to=$(a).attr('attr-id');  //formato jquery
  let parent = $('#users');
  let hijos = parent.children(); //array de divs per user
  for(var i=0; i<hijos.length; i++) {
      var id = '#' + hijos[i].id;
      if($(id).hasClass('active_chat')) {
          $(id).removeClass('active_chat');
      }
  }
  $(a).addClass('active_chat');
  //  console.log(user_to);

  $.getJSON("/messages/"+current_user.id+"/"+user_to, function(data){
     $("#messages").empty();
    console.log(data);
    if (data!=null){
        for(var i=0; i<data.length; i++){
          if((current_user.id==data[i]['user_to_id'] && user_to==data[i]['user_from_id']) ||
             (current_user.id==data[i]['user_from_id'] && user_to==data[i]['user_to_id'])
            ){
                var div='<div class="Message_type">'+
                'image'+
                '<div class="received_msg">'+
                '<div class="received_withd_msg">'+
                '<p>Message</p>'+
                // '<span class="time_date"> 11:01 AM    |    June 9</span></div>'+
                    '</div>';
              if(current_user.id==data[i]['user_from_id']){
                div = div.replace('image', '');
                div = div.replace('Message_type', 'outgoing_msg');
                div = div.replace('received_msg', 'sent_msg');
                div = div.replace('<div class="received_withd_msg">', '');
              }else{
                div = div.replace('image', '<div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>');
                div = div.replace('Message_type', 'incoming_msg');
                div = div+'</div>';
              }
          //var div='<br><div>Message</div>';
          div = div.replace('Message', data[i]['content']);
        //  console.log(div);
          $("#messages").append(div);
          }
        }        
    }

  });
}

function send(){
  console.log("Sending Message");
  var message = $('#message').val();  // getting password by id

  var mssg = {'content':message, 'sent_on':"23/04/2", 'user_from_id':current_user.id, 'user_to_id':user_to};
  console.log(mssg);
  $.post({
      url:'/messages_json',
      type: 'post',
      dataType: 'json',
      contentType: 'application/json',
      success: function(data){
          console.log("Sent!");
          var out='<div class="outgoing_msg">'+
          '<div class="sent_msg">'+
          '<p>mssge</p>'+'</div></div>';
          out=out.replace('mssge',message);
          $("#messages").append(out);
          $("#message").val('');
      },
      data: JSON.stringify(mssg)
  });
}

function lookup() {
    let value = $('#search').val();
    // console.log(value);
    let parent = $('#users');
    let hijos = parent.children(); //array de divs per user
    for(var i=0; i<hijos.length; i++) {
        var id = '#' + hijos[i].id;
        // console.log(id);
        if(hijos[i].id.startsWith(value)) {
            if( $(id).hasClass('d-none')) {
                $(id).removeClass('d-none');
                $(id).addClass('d-block');
            }
        }else {
            if( $(id).hasClass('d-block')) {
                $(id).removeClass('d-block');
                $(id).addClass('d-none');
            }
        }
    }
}
