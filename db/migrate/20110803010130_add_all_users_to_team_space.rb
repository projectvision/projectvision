class AddAllUsersToTeamSpace < ActiveRecord::Migration
  def self.up
    remove_column :users, :team_id
    create_table :teams_users, :id => false do |t|
      t.integer :user_id
      t.integer :team_id
    end
    
    team = Team.find_by_name('Team Space')
    if team
      User.all.each do |user|
        team.users << user
      end
      team.save!
    end
    
  end

  def self.down
    drop_table :teams_users
    add_column :users, :team_id, :string, :default => 1
  end
end
