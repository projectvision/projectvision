class TeamRole < ActiveRecord::Base
set_table_name :teams_users
belongs_to :team
belongs_to :user
end
