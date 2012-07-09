
set :application, "DeportedChat"

# Must change
set :user, 'root'
set :domain, 'p3ee.com'
set :applicationdir, "/var/www/#{application}"

set :scm, :git
set :repository,  "git@github.com:Alexandre-Strzelewicz/DeportedChat.git"
set :branch, :master
set :scm_verbose, true


set :node, '/root/nvm/v0.8.1/bin/node'

role :web, domain
role :app, domain
role :db, domain, :primary => true

set :deploy_to, applicationdir

set :deploy_via, :checkout

default_run_options[:pty] = true

#after "deploy",
after "deploy", "deploy:stop", "deploy:prepare", "deploy:start"

namespace :deploy do


  desc "Stop Forever"
  task :stop do
    run "/root/nvm/v0.8.1/bin/forever stopall" 
  end

  desc "Start Forever"
  task :start do
    run "cd #{current_path} && PORT=2123 /root/nvm/v0.8.1/bin/forever start app.js" 
  end
  
  # desc "Refresh shared node_modules symlink to current node_modules"
  # task :refresh_symlink do
  #   run "rm -rf #{current_path}/node_modules && ln -s #{shared_path}/node_modules #{current_path}/node_modules"
  # end

  task :prepare do
    run "cd #{release_path}; npm install"
  end

end
