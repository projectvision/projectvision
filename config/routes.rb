Pv::Application.routes.draw do

  devise_for :users, :controllers => { :sessions => "users/sessions", :omniauth_callbacks => "users/omniauth_callbacks"}
  match '/setup' => 'home#setup'
  root :to => "home#index"
  get "home/index"
  
  resources :catagories  
  resources :thoughts
  resources :action_logs do
    collection do
      get 'recent_team_logs'
    end
  end
  resources :home 
      
  resources :my_users do
    collection do
      post 'update_sync'
      get  'currentUser'
    end
  end   
  
  resources :teams do
    collection do
      post 'add_user'
      post 'remove_user' 
    end
    collection do
      get 'list'
      get 'admin_teams'
      end
  end
  
  match 'thoughts/update_status/:id' => 'thought#update_status'
  match 'home/login' => 'home#login'
  
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => "welcome#index"

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
