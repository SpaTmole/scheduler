/**
 *  Author: Konstantin Oficerov
 *  Email: konstantin.oficerov@gmail.com
 **/

(function($, document, window){
    var CalendarItems = {
        calendar_holder: $('div#calendar-content'),
        form_holder: $('div#modalForm'),
        delete_btn: $('#delete_btn')
    };

    var Form = {
        obj: CalendarItems.form_holder,
        start: $('#start'),
        end: $('#end'),
        title: $('#title'),
        color: $('#color'),
        description: $('#description'),
        owner: $('#owner'),
        //guests: $(),
        allDay: $('#allDay'),
        privateMode: $('#privateMode'),
        header: $('#myModalLabel'),
        saveButton: $('#save-btn')
    };

    function Calendar(target, options, permission) {
    /*
    * target - DOM element to append.
    * options - function literal, options(perm) call of it returns obj with options and perm - permissions for cal.
    * permission - true or false; true allows to add, to edit and to delete events, false - allows to specate only.
    */
        var that = this;
        this.options = options(that, permission);
        this.target = target;
        this.permission = permission;
        this.loadCalendar = function(){
            that.target.fullCalendar(that.options);
        };
    }
    Calendar.fn = Calendar.prototype;
    // define more for API

    Calendar.fn.append_navigation_between_dates = function(){
        var that = this;
        $('span.fc-header-title')
            .addClass('fc-button fc-state-default btn-cal')
            .prepend('<input id="id_calendar_datepicker" style="position: relative; z-index: 999;" type="hidden"/>')
            .live('click', function(){
                $('#id_calendar_datepicker').datepicker('show');
            });

        $('span.fc-button-next')
//            .addClass('btn btn-default btn-lg ')
            .insertAfter($('span.fc-header-title'));
        $('span.fc-button-prev')
//            .addClass('btn btn-default btn-lg ')
            .insertBefore($('span.fc-header-title'));

        $('#id_calendar_datepicker').datepicker({
            changeYear: true,
            changeMonth: true,
            showWeek: true,
            showMonthAfterYear: true,
            showOtherMonths: true,
            selectOtherMonths: true,
            buttonImageOnly: true,
            dateFormat: "dd-mm-yy",
            buffer: undefined,
            firstDay: 1,
            onSelect: function (date) {
                var _date = date.split('-');
                date = new Date(_date[2], _date[1]-1,  _date[0]);
                that.target.fullCalendar('changeView','agendaDay').fullCalendar('gotoDate', date);
            }
        });
    };

    Calendar.fn.checkGlobalPermissions = function(){
        if(!this.permission){
            Form.saveButton.hide();
            Form.allDay.attr('disabled', 'disabled');
            Form.privateMode.attr('disabled', 'disabled');
            Form.description.attr('disabled', 'disabled');
            Form.end.attr('disabled', 'disabled');
            Form.owner.attr('disabled', 'disabled');
            Form.start.attr('disabled', 'disabled');
            Form.title.attr('disabled', 'disabled');
            Form.color.attr('disabled', 'disabled');
        }
    };

//    Calendar.fn.appendFilterByTypes = function(){
//        var that = this;
//        var hintBox = $('#id_hint_box');
//        hintBox.append($('<a class="btn btn-default type-select type-select-all">').attr('value','all').text('All types'));
//        for(var i = 0; i<EVENT_TYPE_LIST.length; ++ i){
//            var option = $('<a class="opt option-'+EVENT_TYPE_LIST[i].value+' btn type-select ">').attr('value',EVENT_TYPE_LIST[i].value).append(EVENT_TYPE_LIST[i].text);
//            if (this.permission){
//                option.append($('<b> </b><i class="icon-bended-arrow-down" style="font-size: 10px"></i>'))
//            }else{
//                option.append($('<b> </b><i class="icon-bended-arrow-down faded-arrow" style="font-size: 10px"></i>'))
//            }
//            hintBox.append(option);
//        }
//        var type_select_nodes = $('a.type-select');
//        type_select_nodes.slice(0,1).wrapAll($('<span class="btn-bar-group">'));
//        type_select_nodes.slice(1,4).wrapAll($('<span class="btn-bar-group">'));
//        type_select_nodes.slice(4,6).wrapAll($('<span class="btn-bar-group">'));
//        type_select_nodes.slice(6,8).wrapAll($('<span class="btn-bar-group">'));
//        type_select_nodes.slice(8,9).wrapAll($('<span class="btn-bar-group">'));
//        // Handler for above
//        type_select_nodes
//            .live('click', function(e){
//            var hintBox = $('#id_hint_box');
//            hintBox.find('.active').removeClass('active');
//            $(this).addClass('active');
//            FILTER_TYPE = $(this).attr('value');
//            that.options.events = {
//                url: GET_EVENTS_URL,
//                data:{
//                    type: FILTER_TYPE,
//                    owner: FILTER_OWNER
//                }
//            };
//            var calendar = work_tools.calendarFrame;
//            var currentDate = calendar.fullCalendar('getDate'),
//                currentView = calendar.fullCalendar('getView');
//
//            calendar.fullCalendar('destroy'); // not better way to resolve this problem, but who cares...
//            calendar.fullCalendar(that.options);
//            calendar.fullCalendar('changeView', currentView.name);
//            calendar.fullCalendar('gotoDate', currentDate);
//            that.append_navigation_between_dates();
//            })
//            .attr('unselectable', 'on')
//            .css('user-select', 'none')
//            .on('selectstart', false);
//        if(this.permission){
//            type_select_nodes.not('.type-select-all').draggable({
//                revert: true,
//                revertDuration: 0
//            });
//        }
//
//    };

    Calendar.fn.saveEvent = function (callback){
        $('div.alert[name="error_field"]').remove();
        var action = Form.header.text(),
            all_day = Form.allDay,
            endDatepicker = Form.end,
            startDatepicker = Form.start,
            calendar = this.target,
            saveBtn = Form.saveButton;

        if(all_day.attr('checked')){
            var endDate = endDatepicker.datetimepicker('getDate'),
                startDate = startDatepicker.datetimepicker('getDate');
            endDate.setHours(23);
            endDate.setMinutes(59);
            endDate.setSeconds(59);
            startDate.setHours(0);
            startDate.setMinutes(0);
            startDate.setSeconds(0);

            endDatepicker.datetimepicker('setDate', endDate);
            startDatepicker.datetimepicker('setDate', startDate);

            endDatepicker.val(endDatepicker.val()+" 23:59:59");
            startDatepicker.val(startDatepicker.val()+" 00:00:00");
        }

        var form = Form.obj.serialize();
        if(all_day.attr('disabled') && all_day.attr('value') == 'y')
            form += '&all_day=y';
        saveBtn.text('').attr('disabled','disabled').append('<img style="width: 15px;" src="/media/MoonCakeTheme/assets/images/preloaders/2.gif"/>');
        if(action == "New event:"){ //create;
                window.lock();
                send_ajax_request(document.API.url, form,
                    function(data){
                        calendar.fullCalendar('renderEvent', data);
                        calendar.fullCalendar('unselect');
                        CalendarItems.form_holder.modal('hide');
                    }, 'post', callback);
        }
        else{ // update;
                window.lock();
                send_ajax_request(document.API.url, form + "&key="+calendar.fullCalendar.eventTransaction.eventObject.key,
                    function(data){
                        var incomming_event = calendar.fullCalendar.eventTransaction.eventObject;
                        for(field in incomming_event){
                            incomming_event[field] = data[field];
                        }
                        calendar.fullCalendar('renderEvent', data);
                        calendar.fullCalendar('unselect');
                        $('#ModalCreate').modal('hide');
                    }, 'post', callback);
        }
    };

//    Calendar.fn.appendFilterByUsers = function(){
//        var that = this;
//        var navList = $('#navigation').find('li.active .inner-nav');
//        navList.append($('<li class="staff-divider"><a><hr/></a></li>'));
//        var scrollableLine = $('<li><ul id="id_workers_filter_list" class="inner-nav scrollable"></ul></li>');
//        navList.append(scrollableLine);
//        var forAll = $('<li class="workman active">')
//            .attr('data-key', 'all')
//            .append($('<a href="#" ></a>')
//            .append($('<i class="icon-hand-right"></i>'))
//            .append(' All'));
//        $('#id_workers_filter_list').append(forAll);
//        for (var i = 0; i < STAFF_LIST.length; ++i){
//            var option = $('<li class="workman">')
//                .attr('data-key',STAFF_LIST[i].value)
//                .append($('<a href="#" name="frameWorkerLink"></a>')
//                .append($('<i class="icon-hand-right hide"></i>'))
//                .append(' '+STAFF_LIST[i].text));
//            $('#id_workers_filter_list').append(option);
//        }
//        navList.append($('<li class="staff-divider"><hr/></li>'));
//        // Handler for above
//        $('li.workman').on('click', function(e){
//            var navList = $('#navigation').find('li.active .inner-nav');
//            navList.find('li.active').removeClass('active').find('i').addClass('hide');
//            $(this).addClass('active').find('i').removeClass('hide');
//            FILTER_OWNER = $(this).attr('data-key');
//            that.options.events = {
//                url: GET_EVENTS_URL,
//                data:{
//                    type: FILTER_TYPE,
//                    owner: FILTER_OWNER
//                }
//            };
//            var calendar = work_tools.calendarFrame;
//            var currentDate = calendar.fullCalendar('getDate'),
//                currentView = calendar.fullCalendar('getView');
//
//            calendar.fullCalendar('destroy'); // not best way to resolve this problem, but who cares...
//            calendar.fullCalendar(that.options);
//            calendar.fullCalendar('changeView', currentView.name);
//            calendar.fullCalendar('gotoDate', currentDate);
//            that.append_navigation_between_dates();
//
//        });
//    };

    Calendar.fn.fillForm = function(calEvent){
        Form.title.val(calEvent.name);
        if(!calEvent.end){
            calEvent.end = calEvent.start;
            calEvent.end.setHours(23,59,59);
        }
        Form.header.text("Edit '"+calEvent.title+'\'s '+calEvent.name+"' event:");
        Form.description.val(calEvent.description);
        if(calEvent.allDay)
            Form.allDay.prop('checked', true).trigger('change');
        Form.end.datepicker('setDate', calEvent.end);
        Form.start.datepicker('setDate', calEvent.start);
        Form.color.find('[value="'+calEvent.color.toString().split('-')[1]+'"]').attr('selected','selected');
        Form.owner.find('[value="'+calEvent.owner.key+'"]').attr('selected','selected');
    };

    $(document).ready(function(){
        if(!$.fn.fullCalendar.length){
            CalendarItems.calendar_holder.append($('<div class="alert alert-block alert-alarm">Aw, snap! ' +
                'We can\'t find FullCalendar module. Please, make sure, ' +
                'that fullcalendar.js was included to media/static files.</div>'));
            return;
        }
        /* TODO: re-edit everything below!*/
        var calendarOptions = function(permission, cls){

        return{
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },
                selectable: permission,
                selectHelper: permission,
                firstDay: 1,
                eventTransaction: undefined,
                weekMode: 'liquid',
                editable: permission,
                events: {
                    url: document.API.url,
                    data:{
                        owner: document.API.owner_filter
                    }
                },
                theme: false,
                axisFormat: 'HH:mm',
                timeFormat: 'HH:mm{-HH:mm }',
                buttonText: {
                    prev: '<i class="icon-caret-left"></i>',
                    next: '<i class="icon-caret-right"></i>',
                    prevYear: '<i class="icon-caret-left"></i><i class="icon-caret-left"></i>',
                    nextYear: '<i class="icon-caret-right"></i><i class="icon-caret-right"></i>',
                    today: '<i class="icon-calendar"> Today </i>',
                    agendaDay: '<i class="icon-th-list"> Day</i>',
                    agendaWeek: '<i class="icon-th-large"> Week</i>',
                    month: '<i class="icon-th"> Month</i>'
                },
                droppable: permission,
//                drop: function(date, allDay) {
//                    var end = new Date(date.getFullYear(), date.getMonth(),date.getDate(), date.getHours()+1, date.getMinutes());
//                    if(allDay){
//                        work_tools.modalEvent.modalTools.allDayField.prop('checked', true).trigger('change');
//                        end.setHours(23,59,59);
//                    }
//                    work_tools.modalEvent.modalTools.startDatePicker.datepicker('setDate', date);
//                    work_tools.modalEvent.modalTools.endDatePicker.datepicker('setDate', end);
//                    work_tools.modalEvent.modalTools.typeSelect.find('[value="'+$(this).attr('class').split(' ')[1].split('-')[1]+'"]').attr('selected','selected');
//                    work_tools.modalEvent.modalHeader.text("New event:");
//                    work_tools.modalEvent.modalWindow.modal('show');
//                },
                loading: function( isLoading, view ){
                    if(isLoading){
                        window.lock();
                    }else{
                        window.lock();
                    }
                },
                select: function(start, end, allDay) {
                    if(allDay){
                        Form.allDay.prop('checked', true).trigger('change');
                        end.setHours(23, 59, 59);
                    }
                    Form.end.datepicker('setDate', end);
                    Form.start.datepicker('setDate', start);
                    Form.header.text("New event:");
                    Form.obj.modal('show');
                },

                eventMouseover: function( event, jsEvent, view ) {
                    var name = event.name;
                    if(!name)
                        name = 'Noname';

                    var title_element = $(this).find('[class="fc-event-title"]');

                    title_element.animate({opacity: 0.1}, 200, function(){
                        title_element.text('Name: '+event.name).animate({opacity: 1.0}, 200);
                    });
                    var posToPaste = title_element,
                        time_element = $(this).find('[class="fc-event-time"]');
                    if(time_element.length)
                        posToPaste = time_element;

                    if(!CalendarItems.delete_btn.length){

                        var delete_btn = $("<a id='delete_btn' class='del-event-btn'><i class='icon-remove-sign'></i></a>");
                        if(permission){
                            delete_btn.fadeIn(300).insertBefore(posToPaste);
                        }
                        CalendarItems.delete_btn = delete_btn;
                    }
                },
                eventMouseout: function( event, jsEvent, view ) {

                    var title_element = $(this).find('[class="fc-event-title"]');
                    title_element.animate({opacity: 0.1}, 200, function(){
                        title_element.text(event.title).animate({opacity: 1.0}, 200);
                    });

                    CalendarItems.delete_btn.remove();
                    CalendarItems.delete_btn = $();
                },
                eventClick: function(calEvent, jsEvent, view) {
                    if(!(CalendarItems.delete_btn.is(":hover")))
                    {
                        cls.fillForm(calEvent);
                        Form.obj.modal('show');
                    }
                    CalendarItems.calendar_holder.fullCalendar.eventTransaction = {eventObject:calEvent, htmlObject:$(this)};
                },
                eventDrop: function(calEvent,dayDelta,minuteDelta,allDay,revertFunc) { // put it in savebtnhandler
                    if(allDay){
                        calEvent.end.setHours(23,59,59);
                        calEvent.start.setHours(0,0,0);
                        Form.allDay.prop('checked', true).trigger('change');
                    }

                    CalendarItems.calendar_holder.fullCalendar('updateEvent', function(_event){
                        return (_event == calEvent);
                    });

                    cls.fillForm(calEvent);
                    CalendarItems.calendar_holder.fullCalendar.eventTransaction = {eventObject:calEvent, htmlObject:$(this)};
                    cls.saveEvent(revertFunc);
                },
                eventResize: function(calEvent,dayDelta,minuteDelta,revertFunc) { // put it in savebtnhandler
                    if(calEvent.allDay){
                        calEvent.end.setHours(23,59,59);
                        Form.allDay.prop('checked', true).trigger('change');
                    }

                    CalendarItems.calendar_holder.fullCalendar('updateEvent', function(_event){
                        return (_event == calEvent);
                    });

                    cls.fillForm(calEvent);
                    CalendarItems.calendar_holder.fullCalendar.eventTransaction = {eventObject:calEvent, htmlObject:$(this)};
                    cls.saveEvent(revertFunc);
                }
            }
        };

        $(document).ready(function(){
            var calendar = new Calendar(CalendarItems.calendar_holder, calendarOptions, /*Default permission*/true);
            calendar.loadCalendar();
            var datepicker_options = {
                    firstDay: 1,
                    dateFormat: "dd-mm-yy",
                    onSelect: function (date) {
                              $(this).datepicker('setDate', date);
                    },
                    beforeShow: function(e, o){
                       $(e).datepicker('setDate', $(e).datepicker('getDate'));
                    }
                },
                datetimepicker_options = {
                     firstDay: 1,
                     stepMinute: 1,
                     hourGrid: 4,
                     minuteGrid: 10,
                     dateFormat: "dd-mm-yy",
                     timeFormat: "hh:mm:ss",
                     dateOnly: false,
                     buffer: undefined,
                     onSelect: function (date) {
                         $(this).datetimepicker('setDate', date);
                     },
                     beforeShow: function(e, o){
                         $(e).datetimepicker('setDate', $(e).datetimepicker('getDate'));
                     }

                };

        });
    });

    function all_day_change(d_opts, dt_opts){
        var all_day = Form.allDay,
            pickers = [Form.start, Form.end];
        if(all_day.prop('checked')){
            $(pickers).each(function(){
                $(this).datepicker('destroy');
                $(this).datepicker(d_opts);
            });
        }
        else{
            $(pickers).each(function(){
                $(this).datepicker('destroy');
                $(this).datetimepicker(dt_opts);
            });
        }
    }

    function eventDelBtnHandler(){
            work_tools.modalConfirm.modalWindow.modal('show');
    }

    function hideModalHandler(){
            Form.owner.val('').find('option:selected').removeAttr('selected');
            Form.color.val('').find('option:selected').removeAttr('selected');
            Form.title.val('');
            Form.start.val('');
            Form.end.val('');
            Form.description.val('');
            Form.allDay.prop('checked', false).trigger('change');
            $('div.alert.alert-block.alert-error').remove();
            CalendarItems.calendar_holder.fullCalendar('unselect');
            return true;
        }

    function saveBtnHandler(e, o){
            e.preventDefault();
            o.saveEvent();
        }

    function modalDelBtnHandler(e){
        var calendar = CalendarItems.calendar_holder;
        window.lock();
        calendar.fullCalendar.eventTransaction.htmlObject.fadeOut(1000);
        send_ajax_request(window.API.url+'?key='+calendar.fullCalendar.eventTransaction.eventObject.key, null, function(){
            calendar.fullCalendar('removeEvents', function(event){
                return (event == calendar.fullCalendar.eventTransaction.eventObject);
            });
            unlock_screen();
        }, 'delete', function(o){calendar.fullCalendar.eventTransaction.htmlObject.fadeIn(200);});
        work_tools.modalConfirm.modalWindow.modal('hide');
    }


    function send_ajax_request(url, object, success_function, type, revertFunc){
        $.ajax({
                   data: object,
                   url: url,
                   type: type,
                   dataType: 'json'

               }).done(function(data){
                    window.unlock();
                    if(data.status == 'error'){

                        if(data.form){
                           var tmp = function(msg){
                               return ('<div name="error_field" class="alert alert-block alert-error fade in">' +
                                       '<button type="button" class="close" data-dismiss="alert">&times;</button> '+msg+' </div>') };
                           for (var field in data.form){
                               $('#'+field).parent().append($(tmp(data.form[field])));
                           }
                        }
                        if( revertFunc ){
                            revertFunc(object);
                        }
                        return false;
                    }
                    success_function(data);
                    return true;
                }).fail(function(){
                    CalendarItems.form_holder.modal('hide');
                    CalendarItems.calendar_holder.prepend(
                        $('<div style="height: 100px; z-index: 999; position: relative; top: 10%;" class="alert alert-block alert-error fade in">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Error!</strong> Unexpected request error. </div>'));
                    if( revertFunc ){
                        revertFunc(object);
                    }
                }).always(
                function(){
                    var button = Form.saveButton;
                    button.contents().remove();
                    button.text('Save').removeAttr('disabled');
                    window.unlock();
                }
        );
    }



})(jQuery, window.document, window);

