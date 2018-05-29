#! /usr/bin/env node
var exec = require('child_process').exec;

function find_pull_requests(username, slug_repository)
{
  var url = 'curl https://api.bitbucket.org/2.0/repositories/' + username + '/' + slug_repository + '/pullrequests';
  exec(url, (err, stdout, stderr) =>{
    if(err) throw err;
    if(stdout === "Forbidden")
    {
      console.log("Your repository is forbidden!");
    }
    else{
      stdout = JSON.parse(stdout);
      if(stdout.type !== "error")
      {
        if(stdout.size == 0)
        {
          console.log("There is no pullrequests!");
        }
        else
        {
          var isWritten = false;
          for(var i = 0;i < stdout.values.length;i++)
          {
            if(stdout.values[i].state == "OPEN")
            {
              exec("curl " + stdout.values[i].links.self.href, (err, stdout_by_id, stderr) =>{
                stdout_by_id = JSON.parse(stdout_by_id);
                var objFound = stdout_by_id.participants.find(obj => obj.role === "REVIEWER");
                if(objFound)
                {
                  console.log(objFound);
                  if(objFound.user.username === username && !objFound.approved)
                  {
                    console.log("---------------------------------")
                    console.log("Title: " + stdout_by_id.title);
                    console.log();
                    console.log("Description: " + stdout_by_id.description);
                    console.log();
                    console.log("Link: " + stdout_by_id.links.html.href);
                    console.log("---------------------------------");
                    isWritten = true;
                  }
                }
              });
            }
          }
          if(!isWritten)
          {
            console.log("There is no Pull Requests with criterias!");
          }
        }
      }
      else{
        console.log("Your username or repository is not correct!");
      }
    }

  });
}

function find_private_pull_requests(username, password, repository)
{
  var url = "curl --user " + username + ":" + password + " https://api.bitbucket.org/2.0/repositories/" + username;
  exec(url, (err, stdout, stderr) =>{
    if(err) console.log(err);
    if(stdout)
    {
      stdout = JSON.parse(stdout);
      var name_repos = stdout.values.find(obj => obj.name === repository);
      if(name_repos)
      {
        url += "/" + name_repos.name + "/pullrequests";
        exec(url, (err, respon, doc)=>{
          if(err) return console.log(err);
          respon = JSON.parse(respon);
          if(respon.size == 0)
          {
            console.log("There is no Pull Requests!");
          }
          else{
            var isWritten = false;
            for(var i = 0;i < respon.values.length;i++)
            {
              if(respon.values[i].state === "OPEN")
              {
                exec("curl " + respon.values[i].links.self.href, (err, stdout_by_id, stderr) =>{
                  stdout_by_id = JSON.parse(stdout_by_id);
                  var objFound = stdout_by_id.participants.find(obj => obj.role === "REVIEWER");
                  if(objFound)
                  {
                    console.log(objFound);
                    if(objFound.user.username === username && !objFound.approved)
                    {
                      console.log("---------------------------------")
                      console.log("Title: " + stdout_by_id.title);
                      console.log();
                      console.log("Description: " + stdout_by_id.description);
                      console.log();
                      console.log("Link: " + stdout_by_id.links.html.href);
                      console.log("---------------------------------");
                      isWritten = true;
                    }
                  }
                });
              }
            }
            if(!isWritten)
            {
              console.log("There is no Pull Requests!");
            }
          }
        });
      }
      else
      {
        console.log("The Username does not contain such repository!");
      }
    }
    else{
      console.log("Your username or password is not correct!")
    }
  });
}

if(process.argv[2] === '--help' || process.argv[2] === '-h')
{
  console.log('*******************************************');
  console.log("zensoft findpublic <username> <slug of repository>");
  console.log('------------------------------------------');
  console.log("zensoft findprivate <username> <password> <name of repository>");
  console.log('*******************************************');
}
else if(process.argv[2] === 'findpublic')
{
    var username = process.argv[3];
    var repo = process.argv[4];
    if(username && repo)
    {
      find_pull_requests(username, repo);
    }
    else{
      console.log("zensoft -h || --help");
    }
}
else if(process.argv[2] === 'findprivate')
{
    var username = process.argv[3];
    var password = process.argv[4];
    var repository = process.argv[5];
    if(username && password && repository)
    {
      find_private_pull_requests(username, password, repository);
    }
    else{
      console.log("zensoft -h || --help");
    }
}
else{
  console.log("zensoft -h || --help");
}
