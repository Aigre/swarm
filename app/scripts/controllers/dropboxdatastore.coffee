'use strict'

###*
 # @ngdoc function
 # @name swarmApp.controller:DropboxdatastoreCtrl
 # @description
 # # DropboxdatastoreCtrl
 # Controller of the swarmApp
###

#angular.module('swarmApp').controller 'OptionsCtrl', ($scope, $location, options, session, game, env, $log, backfill) ->

angular.module('swarmApp').controller 'DropboxdatastoreCtrl', ($scope, $log ,  env , session) ->

    #$scope.dropstore = dropstoreClient
    _datastore = null
    _recschanged = null
    $scope.env = env


    $scope.savedgames = [];
    $scope.newSavegame = ''; 

    $scope.app_key = env.dropboxAppKey
    $log.debug 'env.dropboxAppKey:', env.dropboxAppKey
    $scope.dsc =  new Dropbox.Client({key: $scope.app_key });
#	// Use a pop-up for auth.
    #$scope.dsc.authDriver(new Dropbox.AuthDriver.Popup({ receiverUrl: window.location.href + 'oauth_receiver.html' }));
    $scope.dsc.authDriver(new Dropbox.AuthDriver.Popup({ receiverUrl: "#{window.location.protocol}//#{window.location.host}#{window.location.pathname}views/dropboxauth.html"  }))

    #else
			#// If we're authenticated, update the UI to reflect the logged in status.
		#} else {
			#// Otherwise show the login button.
			#$('#login').show();
		#}


    $scope.isAuth = ->
        return $scope.dsc.isAuthenticated()

    getTable = ->
      return _datastore.getTable 'saveddata'

    newSavegame = 'game'
    $scope.updatesavelisting = (event) ->
       #records = event.affectedRecordsForTable('swarmstate');
       taskTable = getTable()
       $scope.savedgames = taskTable.query name:newSavegame
       $scope.savedgame = $scope.savedgames[0]

    $scope.loggedin = () ->
      $log.debug "loggedIn()";

      datastoreManager = new Dropbox.Datastore.DatastoreManager($scope.dsc);
      datastoreManager.openDefaultDatastore (err,datastore)->
          $log.debug "opendef err: "+err if err;
          $log.debug "opendef datastore: "+datastore;

          _datastore = datastore;
          datastore.recordsChanged.addListener( $scope.updatesavelisting );
          $scope.updatesavelisting();
   
    # First check if we're already authenticated.
    $scope.dsc.authenticate({ interactive : false});


    if $scope.dsc.isAuthenticated()
      # If we're authenticated, update the UI to reflect the logged in status.
      $scope.loggedin()


    $scope.droplogin = -> 
      $log.debug "attempt login";
      $scope.dsc
        .authenticate( (err,client)->
          $log.debug "authenticate err: "+err;
          $log.debug "authenticate client: "+client;
          $scope.loggedin()
         
        );
       

    $scope.droplogout = -> 
        $scope.savedgames = [];
        _datastore.recordsChanged.removeListener($scope.updatesavelisting) ;
        $scope.dsc.signOut({mustInvalidate: true});
    
    $scope.addSavegame = ->
        for save in $scope.savedgames
          $scope.deleteSavegame save
        $log.debug 'saving to dropbox'
        taskTable = getTable()

        firstTask = taskTable.insert
          name: newSavegame
          created: new Date()
          data: session.exportSave()
        $scope.updatesavelisting()

    $scope.importSavegame = (savegame=$scope.savedgame)  ->
        $log.debug 'do import of:'+ savegame;
        $scope.importSave(savegame.get('data'));
    
    $scope.deleteSavegame = (savegame=$scope.savedgame)  ->
        $log.debug 'do delete of:'+ savegame;
        getTable().get(savegame.getId()).deleteRecord()

    $scope.moment = (datestring=savedgame.get 'created') ->
      return moment datestring


angular.module('swarmApp').controller 'KongregateS3Ctrl', ($scope, $log, env, session, kongregate, kongregateS3Syncer) ->
  syncer = kongregateS3Syncer
  # http://www.kongregate.com/pages/general-services-api
  api = $scope.api = kongregate.kongregate.services
  $scope.kongregate = kongregate
  $scope.saveServerUrl = env.saveServerUrl
  if !kongregate.isKongregate()
    return
  api.addEventListener 'login', (event) ->
    $scope.$apply()
  userid = api.getUserId()
  token = api.getGameAuthToken()

  #userid = '21627386'
  #token = '1dd85395a2291302abdb80e5eeb2ec3a80f594ddaca92fa7606571e5af69e881'
  $scope.isGuest = ->
    #return false
    $scope.api.isGuest()

  $scope.remoteSave = -> syncer.fetched?.encoded
  $scope.remoteDate = -> syncer.fetched?.date
  $scope.policy = -> syncer.policy
  $scope.isPolicyCached = -> syncer.cached

  $scope.init = (force) ->
    syncer.init ((data, status, xhr) ->
      $log.debug 'kong syncer inited', data, status, xhr
      $scope.fetch()
    ), userid, token, force
  $scope.fetch = ->
    xhr = syncer.fetch (data, status, xhr) ->
      $scope.$apply()
      $log.debug 'kong syncer fetched', data, status, xhr
    xhr.error (data, status, xhr) ->
      $scope.$apply()
      $log.debug 'kong syncer failed to fetch', data, status, xhr
  $scope.push = ->
    syncer.push ->
      $scope.$apply()
  $scope.pull = ->
    syncer.pull()
  $scope.clear = ->
    syncer.clear ->
      $scope.$apply()

  $scope.init()
