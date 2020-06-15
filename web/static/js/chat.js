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
       var div='<br><div onclick="get_messages(this)">Username</div>';
      // var div='<br><buttontype="button" class="btn btn-default" onclick="get_messages(this)">Username</button>';
      div = div.replace('Username', data[i]['username']);
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

function get_messages(a){
  $("#messages").empty();  //elemento con texto concatenado
  console.log("Voy a traer los mensajes");
  //console.log(a);
  //console.log($(a));
  //console.log($(a).text());
  user_to=$(a).text();  //formato jquery
  $.getJSON("/messages", function(data){
    for(var i=0; i<data.length; i++){
      if((current_user.username==data[i]['user_to_id'] && user_to==data[i]['user_from_id']) ||
         (current_user.username==data[i]['user_from_id'] && user_to==data[i]['user_to_id'])
        ){
          if(current_user.username==data[i]['user_from_id']){
            var div='<br><div style="text-align:right">Message</div>';
          }else{
            var div='<br><div style="text-align:left">Message</div>';
          }
      //var div='<br><div>Message</div>';
      div = div.replace('Message', data[i]['content']);
      console.log(div);
      $("#messages").append(div);
      }
    }
  });
}

function send(){
  console.log("Sending Message");
  var message = $('#message').val();  // getting password by id

  var mssg = {'content':message, 'sent_on':"23/04/2004", 'user_from_id':current_user.username, 'user_to_id':user_to};
  $.post({
      url:'/messages_json',
      type: 'post',
      dataType: 'json',
      contentType: 'application/json',
      success: function(data){
          console.log("Sent!");
          $("#messages").append("<br>"+message);
          $("#message").empty();
      },
      data: JSON.stringify(mssg)
  });
}
