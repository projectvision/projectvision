//Javascript for Inbox Tab


/*var inboxStore = Ext.StoreMgr.get('inbox_store');
inboxStore.load({
  params: {
    status: 0
  }
});
*/
var newThought = false;
var newTask = false;
var newUser = false;
var selectedThoughtID = 0;
var newButtonTask= true;
var newCatagory = false;

function newHandler(){
  newThought = true;
  if(!addWindow) addWindow = new Ext.Window({
    title: 'Add New Thought',
    width: 790,
    applyTo:'hello-win',
    closeAction:'hide',
    height: 620,
    layout: 'fit',
    plain:true,
    bodyStyle:'padding:5px;',
    buttonAlign:'center',
    //resizable:false,
    items: addPanel
  });
  else
    addWindow.setTitle('Add New Thought');

  console.log("new");
  addPanel.getForm().reset();
  addPanel.brief.setValue('');
  addPanel.detail.setValue('');
  //addPanel.category.setValue('General');
  addPanel.thoughtType.setValue('private').setVisible(true);
  addPanel.status.setValue(0);
  addPanel.getForm().findField('team').setVisible(false);
  addWindow.show();
  //addUserAndTeamSelectOptions();
  myTeamStore.load();
  //userStore.load();
  addCatagoryOptions();

  
}

function synchAllEmailHandler(){
  Ext.Ajax.request({
    url: '/imap_addresses/poll_all',
    waitMsg: 'Fetching Emails...',
    method: 'get',
    success: function(f,a){
      globalThoughtStore.reload({callback : function(records,option,success){
          globalThoughtStoreCallbackFn(records);    
         }
      });
      Ext.Msg.alert("Email Loaded", "Emails Synconized");
    }
  });
}

function deleteHandler(){

}

function gridRowClickHandler(addrGrid,rowIndex,e) {  
  // detailsPanel.update(inboxJsonStore.getAt(rowIndex).get('detail'));
  detailsPanel.items.items[0].setValue(inboxJsonStore.getAt(rowIndex).get('detail'));
  // detailsPanel.setValue(inboxJsonStore.getAt(rowIndex).get('detail'));
}


// create the Grid
var thoughtGrid = new Ext.grid.GridPanel({
  store: inboxJsonStore,
  columns: [
  {
    id       :'brief',
    header   : 'Thought',
    width    : 160,
    //    sortable : true,
    dataIndex: 'brief'
  },{
    header   : 'Category',
    width    : 75,
    //    sortable : true,
    dataIndex: 'category'
  },{
    header   : 'Team',
    width    : 75,
    //    sortable : true,
    dataIndex: 'myteam'
  },{
    header: 'Edit : Delete',
    xtype: 'actioncolumn',
    width: 70,
    items: [{
      icon   : '../images/icons/application_form_edit.gif',  // Use a URL in the icon config
      tooltip: 'Edit Thought',
      handler: showEditThoughtTabWindow  
    },
    {
      icon   : '../images/icons/delete.gif',
      tooltip: 'Delete Thought',
      handler: function(grid,rowIndex, colIndex)
      {
        selectedThoughtID = inboxJsonStore.getAt(rowIndex).data.id;
        selectedUserID = inboxJsonStore.getAt(rowIndex).data.user_id;
        if(is_admin == true || currentUser == selectedUserID)
        {
          Ext.Ajax.request({
            url: '/thoughts/'+selectedThoughtID,
            scope:this,
            params: {
              id: selectedThoughtID
            },
            waitMsg:'Deleting...',
            method: 'delete',
            success: function(f,a){
              globalThoughtStore.reload({callback : function(records,option,success){
					      globalThoughtStoreCallbackFn(records);		
				        }
			        });
			        teamThoughtStore.reload({
        	      callback : function(records, option, success) {
                teamThoughtStoreCallbackFn(records);
                }
              });
            }
          });
        //        myData.splice(rowIndex,1);
        //        thoughtStore.loadData(myData);
        }
        else
        {
        Ext.Msg.alert("Access violation","You don't have access to delete it");
        }
      }
    }]
  },
  {
    header: 'Organize',
    xtype: 'actioncolumn',
    width: 70,
    items: [{
      icon : '../images/icons/bell_button.png',
      tooltip : 'Move to Organized',
      handler: function(grid,rowIndex, colIndex)
      {
        selectedThoughtID = inboxJsonStore.getAt(rowIndex).data.id;
        Ext.Ajax.request({
			    url: '/thoughts/'+selectedThoughtID+'.json',
			    params: {
				  id: selectedThoughtID,
				  "thought[status]": "1"
			    },
			    method: 'put',
			    waitMsg: 'Saving...',
			    success: function(f,a) {
				    globalThoughtStore.reload({callback : function(records,option,success){					
							    globalThoughtStoreCallbackFn(records);}
					      });
				    //organizeStore.reload();
				    teamThoughtStore.load({callback : function(records,option,success){
              teamThoughtStoreCallbackFn(records);
              }
            });
			    }
        });
      //        Ext.Ajax.request({
      //          url: '/thoughts/update_status/'+selectedThoughtID,
      //          scope:this,
      //          params: {
      //            id: selectedThoughtID,
      //            status: 1
      //          },
      //          waitMsg:'Moving...',
      //          method: 'put',
      //          success: function(f,a){
      //            inboxStore.reload();
      //            organizeStore.reload();
      //          }
      //        });
      }
    }]
  },
  ],
  tbar: [
  {
    text: 'New Thought',
    iconCls: 'add-prop',
    handler: newHandler
  },
  {
    text: 'Sync Email',
    iconCls: 'add-prop',
    handler: synchAllEmailHandler
  }],
  listeners: {
    rowclick: {
      fn: gridRowClickHandler
    },
    rowdblclick: {
      fn: showEditThoughtTabWindow
    }
  },
  region:'center',
  stripeRows: true,
  autoExpandColumn: 'brief',
  height: 400,
  width: 600,
  //  title: 'Array Grid',
  // config options for stateful behavior
  stateful: true,
  stateId: 'grid'
});

var detailsPanel = new Ext.Panel({
  title: 'Details',
  region: 'south',
  ref: 'detailsPanel',
  height: 200,
  minSize: 75,
  
  maxSize: 250,  
  cmargins: '5 0 0 0',
  autoScroll: true,
  items: [{
      xtype: "tinymce",
      width: 'auto',
      ctCls: 'detail-though',
      height: 160,
      border: false,
      frame: true,
      tinymceSettings: no_toolbar_g_tinymce_settings,
      html: '<p>Select a Thought</p>'
  }]
});
/*var detailsPanel = new Ext.ux.TinyMCE({
  title: 'Details',
  region: 'south',
  ref: 'detailsPanel',
  height: 250,
  minSize: 75,
  
  maxSize: 250,  
  cmargins: '5 0 0 0',
  autoScroll: true,
  frame: true,
  border: true,
  ctCls: 'detail-though',
  tinymceSettings: no_toolbar_g_tinymce_settings,
  html: '<p>Select a Thought</p>'
});
*/
//loop , array

var inboxPanel = new Ext.TabPanel({
  title: 'Inbox',
  xtype: 'tabpanel',
  ref:'inbox',
  activeTab: 0,
  plain:true,
  defaults:{
    autoScroll: true
  },
  items:[{
    title: 'My Space',
    ref:'myspace',
    layout: 'border',
    items: [thoughtGrid,detailsPanel]
  }],
  listeners: {
          activate: function(tab){
				    if(addWindow) addWindow.hide();
				    if(todoEditWindow) todoEditWindow.hide();
				    if(refEditWindow) refEditWindow.hide();
				    if(remindEditWindow) remindEditWindow.hide();	
				    			
		      },
		      tabchange: function(panel ,tab)
		      {	
		        tabTeamId = tab.getItemId();	      
		        //console.log(tabTeamId);
		      
		      }
		      
  }
});

/*
function to show edit Thought item Window of Inbox tab
*/
function showEditThoughtTabWindow(grid, rowIndex, colIndex) {
  selectedUserID = inboxJsonStore.getAt(rowIndex).data.user_id;

  if(is_admin == true || currentUser == selectedUserID){
    if(!addWindow) addWindow = new Ext.Window({
      title: 'Edit Thought',
      width: 790,
      applyTo:'hello-win',
      closeAction:'hide',
      height: 620,
      layout: 'fit',
      plain:true,
      bodyStyle:'padding:5px;',
      buttonAlign:'center',
      //resizable:false,
      items: addPanel
    });
    else
      addWindow.setTitle('Edit Thought');    

    selectedThoughtID = inboxJsonStore.getAt(rowIndex).data.id;
    console.log("selcted id");      
    addPanel.getForm().reset();         
    addPanel.getForm().load({
      url: '/thoughts/' + inboxJsonStore.getAt(rowIndex).data.id + '.json',
      params: {
        id: inboxJsonStore.getAt(rowIndex).data.id
      },
      waitMsg: 'Loading...',
      method: 'get',
      success: function(f,a){
      },
      failure: function(form, action){
        Ext.Msg.alert("Load failed", action.result.errorMessage);
      }
    
    });
    //addUserAndTeamSelectOptions();
    myTeamStore.load();
    addWindow.show();
    addPanel.brief.focus();
  
  }
  else{
    Ext.Msg.alert("Access violation","You don't have access to edit ");
  }  
}
