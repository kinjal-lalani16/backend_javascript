
/* /web/static/src/js/services/session.js defined in bundle 'web.report_assets_common' */
odoo.define('web.session',function(require){"use strict";var Session=require('web.Session');var modules=odoo._modules;var session=new Session(undefined,undefined,{modules:modules,use_cors:false});session.is_bound=session.session_bind();return session;});;

/* /web/static/src/js/public/public_root.js defined in bundle 'web.report_assets_common' */
odoo.define('web.public.root',function(require){'use strict';var ajax=require('web.ajax');var dom=require('web.dom');var ServiceProviderMixin=require('web.ServiceProviderMixin');var session=require('web.session');var utils=require('web.utils');var publicWidget=require('web.public.widget');var publicRootRegistry=new publicWidget.RootWidgetRegistry();function getLang(){var html=document.documentElement;return(html.getAttribute('lang')||'en_US').replace('-','_');}
var lang=utils.get_cookie('frontend_lang')||getLang();var localeDef=ajax.loadJS('/web/webclient/locale/'+lang.replace('-','_'));window.addEventListener('unhandledrejection',function(ev){if(!ev.reason||!(ev.reason instanceof Error)){ev.stopPropagation();ev.stopImmediatePropagation();ev.preventDefault();}});var PublicRoot=publicWidget.RootWidget.extend(ServiceProviderMixin,{events:_.extend({},publicWidget.RootWidget.prototype.events||{},{'submit .js_website_submit_form':'_onWebsiteFormSubmit','click .js_disable_on_click':'_onDisableOnClick',}),custom_events:_.extend({},publicWidget.RootWidget.prototype.custom_events||{},{'context_get':'_onContextGet','main_object_request':'_onMainObjectRequest','widgets_start_request':'_onWidgetsStartRequest','widgets_stop_request':'_onWidgetsStopRequest',}),init:function(){this._super.apply(this,arguments);ServiceProviderMixin.init.call(this);this.publicWidgets=[];},willStart:function(){return Promise.all([this._super.apply(this,arguments),session.is_bound,localeDef]);},start:function(){var defs=[this._super.apply(this,arguments),this._startWidgets()];this.$(".o_image[data-mimetype^='image']").each(function(){var $img=$(this);if(/gif|jpe|jpg|png/.test($img.data('mimetype'))&&$img.data('src')){$img.css('background-image',"url('"+$img.data('src')+"')");}});if(window.location.hash.indexOf("scrollTop=")>-1){this.el.scrollTop=+window.location.hash.match(/scrollTop=([0-9]+)/)[1];}
if($.fn.placeholder){$('input, textarea').placeholder();}
return Promise.all(defs);},_call_service:function(ev){if(ev.data.service==='ajax'&&ev.data.method==='rpc'){var route=ev.data.args[0];if(_.str.startsWith(route,'/web/dataset/call_kw/')){var params=ev.data.args[1];var options=ev.data.args[2];var noContextKeys=undefined;if(options){noContextKeys=options.noContextKeys;ev.data.args[2]=_.omit(options,'noContextKeys');}
params.kwargs.context=_computeContext.call(this,params.kwargs.context,noContextKeys);}}else if(ev.data.service==='ajax'&&ev.data.method==='loadLibs'){ev.data.args[1]=_computeContext.call(this,ev.data.args[1]);}
return ServiceProviderMixin._call_service.apply(this,arguments);function _computeContext(context,noContextKeys){context=_.extend({},this._getContext(),context);if(noContextKeys){context=_.omit(context,noContextKeys);}
return JSON.parse(JSON.stringify(context));}},_getContext:function(context){return _.extend({'lang':getLang(),},context||{});},_getExtraContext:function(context){return this._getContext(context);},_getPublicWidgetsRegistry:function(options){return publicWidget.registry;},_getRegistry:function(){return publicRootRegistry;},_startWidgets:function($from,options){var self=this;if($from===undefined){$from=this.$('#wrapwrap');if(!$from.length){$from=this.$el;}}
if(options===undefined){options={};}
this._stopWidgets($from);var defs=_.map(this._getPublicWidgetsRegistry(options),function(PublicWidget){var selector=PublicWidget.prototype.selector||'';var $target=dom.cssFind($from,selector,true);var defs=_.map($target,function(el){var widget=new PublicWidget(self,options);self.publicWidgets.push(widget);return widget.attachTo($(el));});return Promise.all(defs);});return Promise.all(defs);},_stopWidgets:function($from){var removedWidgets=_.map(this.publicWidgets,function(widget){if(!$from||$from.filter(widget.el).length||$from.find(widget.el).length){widget.destroy();return widget;}
return null;});this.publicWidgets=_.difference(this.publicWidgets,removedWidgets);},_onContextGet:function(ev){if(ev.data.extra){ev.data.callback(this._getExtraContext(ev.data.context));}else{ev.data.callback(this._getContext(ev.data.context));}},_onMainObjectRequest:function(ev){var repr=$('html').data('main-object');var m=repr.match(/(.+)\((\d+),(.*)\)/);ev.data.callback({model:m[1],id:m[2]|0,});},_onWidgetsStartRequest:function(ev){this._startWidgets(ev.data.$target,ev.data.options).then(ev.data.onSuccess).guardedCatch(ev.data.onFailure);},_onWidgetsStopRequest:function(ev){this._stopWidgets(ev.data.$target);},_onWebsiteFormSubmit:function(ev){var $buttons=$(ev.currentTarget).find('button[type="submit"], a.a-submit');_.each($buttons,function(btn){var $btn=$(btn);$btn.html('<i class="fa fa-spinner fa-spin"></i> '+$btn.text());$btn.prop('disabled',true);});},_onDisableOnClick:function(ev){$(ev.currentTarget).addClass('disabled');},});return{PublicRoot:PublicRoot,publicRootRegistry:publicRootRegistry,};});;

/* /web/static/src/js/public/public_root_instance.js defined in bundle 'web.report_assets_common' */
odoo.define('root.widget',function(require){'use strict';var lazyloader=require('web.public.lazyloader');var rootData=require('web.public.root');var publicRoot=new rootData.PublicRoot(null);return lazyloader.allScriptsLoaded.then(function(){return publicRoot.attachTo(document.body).then(function(){return publicRoot;});});});;

/* /web/static/src/js/public/public_widget.js defined in bundle 'web.report_assets_common' */
odoo.define('web.public.widget',function(require){'use strict';var Class=require('web.Class');var dom=require('web.dom');var mixins=require('web.mixins');var session=require('web.session');var Widget=require('web.Widget');var RootWidget=Widget.extend({custom_events:_.extend({},Widget.prototype.custom_events||{},{'registry_update':'_onRegistryUpdate','get_session':'_onGetSession',}),init:function(){this._super.apply(this,arguments);this._widgets=[];this._listenToUpdates=false;this._getRegistry().setParent(this);},start:function(){var defs=[this._super.apply(this,arguments)];defs.push(this._attachComponents());this._listenToUpdates=true;return Promise.all(defs);},_attachComponent:function(childInfo,$from){var self=this;var $elements=dom.cssFind($from||this.$el,childInfo.selector);var defs=_.map($elements,function(element){var w=new childInfo.Widget(self);self._widgets.push(w);return w.attachTo(element);});return Promise.all(defs);},_attachComponents:function($from){var self=this;var childInfos=this._getRegistry().get();var defs=_.map(childInfos,function(childInfo){return self._attachComponent(childInfo,$from);});return Promise.all(defs);},_getRegistry:function(){},_onGetSession:function(event){if(event.data.callback){event.data.callback(session);}},_onRegistryUpdate:function(ev){ev.stopPropagation();if(this._listenToUpdates){this._attachComponent(ev.data);}},});var RootWidgetRegistry=Class.extend(mixins.EventDispatcherMixin,{init:function(){mixins.EventDispatcherMixin.init.call(this);this._registry=[];},add:function(Widget,selector){var registryInfo={Widget:Widget,selector:selector,};this._registry.push(registryInfo);this.trigger_up('registry_update',registryInfo);},get:function(){return this._registry;},});var PublicWidget=Widget.extend({selector:false,events:{},init:function(parent,options){this._super.apply(this,arguments);this.options=options||{};},destroy:function(){if(this.selector){var $oldel=this.$el;this.setElement(null);}
this._super.apply(this,arguments);if(this.selector){this.$el=$oldel;this.el=$oldel[0];this.$target=this.$el;this.target=this.el;}},setElement:function(){this._super.apply(this,arguments);if(this.selector){this.$target=this.$el;this.target=this.el;}},_delegateEvents:function(){var self=this;var originalEvents=this.events;var events={};_.each(this.events,function(method,event){if(typeof method!=='string'){events[event]=method;return;}
var methodOptions=method.split(' ');if(methodOptions.length<=1){events[event]=method;return;}
var isAsync=_.contains(methodOptions,'async');if(!isAsync){events[event]=method;return;}
method=self.proxy(methodOptions[methodOptions.length-1]);if(_.str.startsWith(event,'click')){method=dom.makeButtonHandler(method);}else{method=dom.makeAsyncHandler(method);}
events[event]=method;});this.events=events;this._super.apply(this,arguments);this.events=originalEvents;},_getContext:function(extra,extraContext){var context;this.trigger_up('context_get',{extra:extra||false,context:extraContext,callback:function(ctx){context=ctx;},});return context;},});var registry={};registry._fixAppleCollapse=PublicWidget.extend({selector:'div[data-toggle="collapse"]',events:{'click':function(){},},});return{RootWidget:RootWidget,RootWidgetRegistry:RootWidgetRegistry,Widget:PublicWidget,registry:registry,};});;

/* /web/static/src/js/report/utils.js defined in bundle 'web.report_assets_common' */
odoo.define('report.utils',function(require){'use strict';function get_protocol_from_url(url){var a=document.createElement('a');a.href=url;return a.protocol;}
function get_host_from_url(url){var a=document.createElement('a');a.href=url;return a.host;}
function build_origin(protocol,host){return protocol+'//'+host;}
return{'get_protocol_from_url':get_protocol_from_url,'get_host_from_url':get_host_from_url,'build_origin':build_origin,};});;

/* /web/static/src/js/report/report.js defined in bundle 'web.report_assets_common' */
odoo.define('report',function(require){'use strict';require('web.dom_ready');var utils=require('report.utils');if(window.self===window.top){return;}
$(document.body).addClass('o_in_iframe').addClass('container-fluid').removeClass('container');var web_base_url=$('html').attr('web-base-url');var trusted_host=utils.get_host_from_url(web_base_url);var trusted_protocol=utils.get_protocol_from_url(web_base_url);var trusted_origin=utils.build_origin(trusted_protocol,trusted_host);$('[res-id][res-model][view-type]').wrap('<a/>').attr('href','#').on('click',function(ev){ev.preventDefault();var action={'type':'ir.actions.act_window','view_mode':$(this).attr('view-mode')||$(this).attr('view-type'),'res_id':Number($(this).attr('res-id')),'res_model':$(this).attr('res-model'),'views':[[$(this).attr('view-id')||false,$(this).attr('view-type')],],};window.parent.postMessage({'message':'report:do_action','action':action,},trusted_origin);});});