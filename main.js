if (Meteor.isClient) {

  Template.body.events({
    'click #cmdBtn' : function (e) {
      e.preventDefault();
      // template data, if any, is available in 'this'
      var cmd = $('#cmd').val().trim();
      var args = $('#args').val().trim();

      Meteor.call('run_cmd',cmd,args, function(err, r) {
        $('#console').text(r);  
      });
    },

    'click #clearBtn' : function(e) {
      e.preventDefault();
      $('#console').text("");   
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  
  Future = Npm.require('fibers/future')
  
  Meteor.methods({
    run_cmd: function(cmd,args) {

        check(cmd,String);

        var fut = new Future();
        
        var spawn = Npm.require('child_process').spawn;
        var child = spawn(cmd, [args]);
        var d = '';
        
        child.stderr.on('data', function (data) {
          console.log('stderr: ' + data);
          d += data ;
        });

        child.stdout.on('data', function (buffer) {
          d += buffer.toString();
          //fut.ret(d);
        });

        child.stdout.on('end', function () {
          fut.ret(d);
        });

      return fut.wait(); 
    }
  });
}
