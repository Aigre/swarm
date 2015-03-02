'use strict'

###*
 # @ngdoc service
 # @name swarmApp.Kongregate
 # @description
 # # Kongregate
 # Service in the swarmApp.
 #
 # http://developers.kongregate.com/docs/api-overview/client-api
###
angular.module('swarmApp').factory 'isKongregate', ->
  return ->
    # use the non-# querystring to avoid losing it when the url changes. $location.search() won't work.
    # a simple string-contains is hacky, but good enough as long as we're not using the querystring for anything else.
    _.contains window.location.search, 'kongregate'
    # alternatives:
    # - #-querystring is overwritten on reload.
    # - url is hard to test, and flaky with proxies.
    # - separate deployment? functional, but ugly maintenance.
    # - when-framed-assume-kongregate? could work...
    # - hard-querystring (/?kongregate#/tab/meat) seems to work well! can't figure out how to get out of it in 30sec.

angular.module('swarmApp').factory 'Kongregate', (isKongregate, $log, $location, game, $rootScope, $interval, options) -> class Kongregate
  constructor: ->
  isKongregate: ->
    isKongregate()
  load: ->
    $log.debug 'loading kongregate script...'
    try
      @kongregate = window.parent.kongregate
      @parented = window.parent.document.getElementsByTagName('iframe')[0]
    catch e
      # pass - no kongregate_shell.html, or kongregate api's blocked in it. try to load the api ourselves
    if @kongregate
      $log.debug 'kongregate api loaded from parent frame'
      @_onLoad()
      return
    $.getScript 'https://cdn1.kongregate.com/javascripts/kongregate_api.js'
      .done (script, textStatus, xhr) =>
        $log.debug 'kongregate script loaded, now trying to load api', window.kongregateAPI
        # loadAPI() requires an actual kongregate frame, `?kongregate=1` in its own tab is insufficient. fails silently.
        window.kongregateAPI.loadAPI =>
          $log.debug 'kongregate api loaded'
          @kongregate = window.kongregateAPI.getAPI()
          @_onLoad()
      .fail (xhr, settings, exception) =>
        $log.error 'kongregate load failed', xhr, settings, exception

  onResize: -> #overridden on load
  _onResize: -> #overridden on load
  _resizeGame: (w, h) ->
    @kongregate.services.resizeGame w, h
    if @parented
      # kongregate resizes its shell instead of my game. scroll lock demands my game have the scrollbar, not the iframe.
      h = @parented.style.height
      w = @parented.style.width
      @parented.style.height = '100%'
      @parented.style.width = '100%'
      document.documentElement.style.height = h
      document.documentElement.style.width = w
  onScrollOptionChange: (noresizedefault, oldscroll) ->
    scrolling = options.scrolling()
    $log.debug 'updating kong scroll option', scrolling

    if scrolling == 'resize'
      # no blinking scrollbar on resize. https://stackoverflow.com/questions/2469529/how-to-disable-scrolling-the-document-body
      document.body.style.overflow = 'hidden'
      @onResize = @_onResize
      # selecting autoresize should always trigger a resize
      @onResize true
    else
      document.body.style.overflow = ''
      @onResize = ->

    if scrolling == 'lockhover'
      @bindLockhover()
    else
      @unbindLockhover()

    if scrolling != 'resize' and oldscroll == 'resize' and @isLoaded and not noresizedefault
      @_resizeGame null, null

  unbindLockhover: ->
    $('html').off 'DOMMouseScroll mousewheel'
  bindLockhover: ->
    # heavily based on https://stackoverflow.com/questions/5802467/prevent-scrolling-of-parent-element
    body = $('body')[0]
    $both = $('body,html')
    $('html').on 'DOMMouseScroll mousewheel', (ev) ->
      $this = $(this)
      scrollTop = this.scrollTop or body.scrollTop
      scrollHeight = this.scrollHeight
      #height = $this.height()
      #height = $this.outerHeight true
      height = window.innerHeight
      if ev.type == 'DOMMouseScroll'
        delta = ev.originalEvent.detail * -40
      else
        delta = ev.originalEvent.wheelDelta
      up = delta > 0
      # not even log.debugs; scroll events are performance-sensitve.
      #console.log 'mousewheelin', delta, up, scrollTop, scrollHeight, height

  unbindLockhover: ->
    $('html').off 'DOMMouseScroll mousewheel'
  bindLockhover: ->
    # heavily based on https://stackoverflow.com/questions/5802467/prevent-scrolling-of-parent-element
    body = $('body')[0]
    $both = $('body,html')
    $('html').on 'DOMMouseScroll mousewheel', (ev) ->
      $this = $(this)
      scrollTop = this.scrollTop or body.scrollTop
      scrollHeight = this.scrollHeight
      #height = $this.height()
      #height = $this.outerHeight true
      height = window.innerHeight
      if ev.type == 'DOMMouseScroll'
        delta = ev.originalEvent.detail * -40
      else
        delta = ev.originalEvent.wheelDelta
      up = delta > 0
      # not even log.debugs; scroll events are performance-sensitve.
      #console.log 'mousewheelin', delta, up, scrollTop, scrollHeight, height

      prevent = ->
        ev.stopPropagation()
        ev.preventDefault()
        ev.returnValue = false
        return false

      #console.log 'mousewheelin check down', !up, -delta, scrollHeight - height - scrollTop
      #console.log 'mousewheelin check up', up, delta, scrollTop
      if !up && -delta > scrollHeight - height - scrollTop
        #console.log 'mousewheelin blocks down', delta, up
        # Scrolling down, but this will take us past the bottom.
        $both.scrollTop scrollHeight
        return prevent()
      else if up && delta > scrollTop
        # Scrolling up, but this will take us past the top.
        #console.log 'mousewheelin blocks up', delta, up
        $both.scrollTop(0)
        return prevent()

  _onLoad: ->
    $log.debug 'kongregate successfully loaded!', @kongregate
    @isLoaded = true
    @reportStats()

    # configure resizing iframe
    html = $(document.documentElement)
    body = $(document.body)
    oldheight = null
    olddate = new Date 0
    @_onResize = (force) =>
      height = Math.max html.height(), body.height(), 600
      if height != oldheight or force
        date = new Date()
        datediff = date.getTime() - olddate.getTime()
        # jumpy height changes while rendering, especially in IE!
        # throttle height decreases to 1 per second, to avoid some of the
        # jumpiness. height increases must be responsive though, so don't
        # throttle those. seems to be enough. (if this proves too jumpy, could
        # add a 100px buffer to size increases, but not necessary yet I think.)
        if height > oldheight or (datediff >= 1000 and oldheight - height > 100) or force
          $log.debug "onresize: #{oldheight} to #{height} (#{if height > oldheight then 'up' else 'down'}), #{datediff}ms"
          oldheight = height
          olddate = date
          @_resizeGame 800, height
          if @parented
            @parented.style.height = height+'px'
    @onScrollOptionChange true
    # resize whenever size changes.
    #html.resize onResize
    # NOPE. can't detect page height changes with standard events. header calls onResize every frame.
    $log.debug 'setup onresize'

  reportStats: ->
    try
      if not @isLoaded or not game.session.kongregate
        return
      # don't report more than once per minute
      now = new Date()
      if @lastReported and now.getTime() < @lastReported.getTime() + 60 * 1000
        return
      #if not @lastReported
      #  @kongregate.stats.submit 'Initialized', 1
      @lastReported = now
      @kongregate.stats.submit 'Hatcheries', @_count game.upgrade 'hatchery'
      @kongregate.stats.submit 'Expansions', @_count game.upgrade 'expansion'
      @kongregate.stats.submit 'GameComplete', @_count game.unit 'ascension'
      @kongregate.stats.submit 'Mutations Unlocked', @_count game.upgrade 'mutatehidden'
      @kongregate.stats.submit 'Achievement Points', game.achievementPoints()
      @_submitTimetrialMins 'Minutes to First Nexus', game.upgrade 'nexus1'
      @_submitTimetrialMins 'Minutes to Fifth Nexus', game.upgrade 'nexus5'
      @_submitTimetrialMins 'Minutes to First Ascension', game.unit 'ascension'
    catch e
      $log.warn 'kongregate reportstats failed - continuing', e

  _count: (u) ->
    return u.count().floor().toNumber()
  _timetrialMins: (u) ->
    if (millis = u.statistics()?.elapsedFirst)
      return Math.ceil millis / 1000 / 60
  _submitTimetrialMins: (name, u) ->
    time = @_timetrialMins u
    if time
      @kongregate.stats.submit name, time

angular.module('swarmApp').factory 'kongregateS3Syncer', ($log, kongregate, storage, game, env) -> new class KongregateS3Syncer
  constructor: ->
  init: (fn, userid, token) ->
    #@policy = storage.getItem 's3Policy'
    if not @policy?
      onRefresh = (data, status, xhr) =>
        if status == 'success'
          @policy = data
          storage.setItem 's3Policy', @policy
        else
          $log.warn "couldn't refresh s3 policy", data, status
        fn data, status, xhr
      @_refreshPolicy onRefresh, userid, token
    else
      fn()

  _refreshPolicy: (fn=(->), userid, token) ->
    userid ?= kongregate.kongregate.services.getUserId()
    token ?= kongregate.kongregate.services.getGameAuthToken()
    args = policy: {user_id:userid, game_auth_token:token}
    xhr = $.post "#{env.saveServerUrl}/policies", args, (data, status, xhr) =>
      $log.debug 'refreshed s3 policy', data, status, xhr
      fn data, status, xhr
    xhr.fail (data, status, xhr) ->
      console.log 'refreshing s3 failed', data, status, xhr

  # sync operations named after git commands.
  # fetch: get a local copy we might import/pull, but don't actually import
  fetch: (fn=(->)) ->
    if !@policy.get
      throw new Error 'no policy. init() first.'
    xhr = $.get @policy.get, (data, status, xhr) =>
      $log.debug 'fetched from s3', data, status, xhr
      @fetched = data
      fn data, status, xhr
    xhr.fail (data, status, xhr) ->
      $log.warn 's3 fetch failed', data, status, xhr
  # pull: actually import, after fetching
  pull: (fn=(->)) ->
    if not @fetched
      throw new Error 'nothing to pull'
    game.importSave @fetched.encoded
    fn()
  # push: export to remote. this is the tricky one; writes to s3.
  push: (fn=(->), encoded=game.session.exportSave()) ->
    if !@policy.post
      throw new Error 'no policy. init() first.'
    # post to S3. S3 requires a multipart post, which is not the default and is kind of a huge pain.
    # worth it overall, though.
    postbody = new FormData()
    for prop, val of @policy.post.params
      $log.debug 'form keyval', prop, val
      postbody.append prop, val
    pushed = encoded:encoded, date:game.now
    postbody.append 'file', new Blob [JSON.stringify pushed], {type: 'application/json'}
    # https://aws.amazon.com/articles/1434
    # https://stackoverflow.com/questions/5392344/sending-multipart-formdata-with-jquery-ajax
    $.ajax
      url: @policy.post.url,
      data: postbody,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      error: (data, status, xhr) =>
        $log.warn 's3 post fail', data.responseText, data, status, xhr
      success: (data, status, xhr) =>
        $log.debug 'exported to s3', data, status, xhr
        @fetched = pushed
        fn data, status, xhr
  clear: (fn=(->)) ->
    if !@policy.delete
      throw new Error 'no policy. init() first.'
    $.ajax
      type: 'DELETE'
      url: @policy.delete
      error: (data, status, xhr) =>
        $log.warn 's3 delete failed', data.responseText, data, status, xhr
      success: (data, status, xhr) =>
        $log.debug 'cleared from s3', data, status, xhr
        delete @fetched
        fn data, status, xhr

angular.module('swarmApp').factory 'kongregate', ($log, Kongregate) ->

  ret = new Kongregate()
  $log.debug 'isKongregate:', ret.isKongregate()
  if ret.isKongregate()
    ret.load()
  return ret
