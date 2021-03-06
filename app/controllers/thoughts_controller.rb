class ThoughtsController < ApplicationController
 after_filter :log_thought, :only =>[:create, :update]
  
  def index
    params[:user_id] = current_user.id
    thoughts, row_count = Thought.list(params)
    render :json => {
        :success => true,
        :totalRows => row_count,
        :data => thoughts.collect { |t| t.to_record}
    }
  end

  def create
    #debugger
    params[:actionable] = false;
    params[:action_type] = 1 if params[:action_type] == "To Do"
    params[:action_type] = 2 if params[:action_type] == "Reference"
    params[:action_type] = 3 if params[:action_type] == "Reminder"    
     
    if params[:thought]
      @thought = Thought.new(params[:thought])
    else
      @thought = Thought.new(params)
    end
    # if this is event form
    #debugger
    if params[:start_date]
      @thought.start_date = Time.zone.parse params[:start_date]
      #then merge fields to set data
     # sdate = params[:start_date].split('/')
      
      #stime = params[:start_date_time].split(':')
      #sstime = stime[1].split(' ')
                
    end
   # debugger
    if params[:due_date]
      #ddate = params[:due_date].split('/')
      #dtime = params[:due_date_time].split(':')
      #ddtime = dtime[1].split(' ')
      
      @thought.due_date = Time.zone.parse params[:due_date]
      #Time.utc(ddate[2],ddate[0],ddate[1],dtime[0],ddtime[0])
    end
    
    #@thought.team_id = 1 if @thought.scope == 'public'
    if params[:team] and @thought.scope == 'public'
      team = Team.find_by_name params[:team]
      @thought.team_id = team.id
    end
    
    @thought.user_id = current_user.id
    @success = @thought.save
    if @success
      render :json => {
          :notice => 'Saved',
          :success => true,
          :data => @thought.id
      }
    else
      render :json => { :success => false }
    end
  end

  def show
  #debugger
    thought = Thought.find(params[:id])

    render :json => {
      :success => true,
      :data => thought.to_record
    }
  end

  def update
    @thought = Thought.find(params[:id])
    params[:action_type] = 1 if params[:action_type] == "To Do"
    params[:action_type] = 2 if params[:action_type] == "Reference"
    params[:action_type] = 3 if params[:action_type] == "Reminder"
   
    if false and params[:start_date_time]     
        sdate = params[:start_date].split('/') 
        
        stime = params[:start_date_time].split(':')
        sstime = stime[1].split(' ')                
        params[:start_date] = params[:start_date]+' '+params[:start_date_time]
        
        #@thought.start_date = Time.utc(sdate[2],sdate[0],sdate[1],stime[0],sstime[0])           
        
    end
    if false and params[:due_date_time]
        ddate = params[:due_date].split('/')
        dtime = params[:due_date_time].split(':')
        ddtime = dtime[1].split(' ')
            
        params[:due_date] = params[:due_date] + ' ' + params[:due_date_time] 
        #params[:due_date] = Time.utc(ddate[2],ddate[0],ddate[1],dtime[0],ddtime[0])
    end
  
    if params[:thought]

      @thought.attributes = params[:thought]
      @thought.due_date = Time.zone.parse params[:thought][:due_date] if params[:thought][:due_date]
      @thought.start_date = Time.zone.parse params[:thought][:start_date] if params[:thought][:start_date]
      @success = @thought.save
    else
      @thought.attributes = params 
      if params[:team] and @thought.scope == 'public'     
          team = Team.find_by_name params[:team]
          params[:team_id] = team.id
          @success = @thought.save                 
      end      
      
      if @thought.scope == 'private'
         @thought.team_id = nil
         @success = @thought.save
      end
        @thought.attributes = params 
        #debugger
        @thought.start_date = Time.zone.parse params[:start_date] if params[:start_date]
        @thought.due_date = Time.zone.parse params[:due_date] if params[:due_date]
        @success = @thought.save
    end
    
    if @success
      render :json => { :success => true}
    else
      render :json => { :success => false}
    end
  end
  
  def destroy
    params
    id = params[:id]
    @thought= Thought.find(params[:id])
    @success = Thought.destroy(id)
    @thought.id = params[:id]
    render :json => { :success => true }
  end

  def log_thought
    if @success
      @action_logs = ActionLog.create :model_id => @thought.id, :model_type => "Thought", 
                                    :user_id =>current_user.id, :action_type => action_name,
                                    :message => current_user.user_name + ":" + action_name + " " + "Thought" + " " + "#{@thought.brief}"
    end
  end
end
