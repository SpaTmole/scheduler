/**
 *  Author: Konstantin Oficerov
 *  Email: konstantin.oficerov@gmail.com
 **/

(function($, document, window){
    var CalendarItems = {
        calendar_holder: $('div#calendar-content'),
        form_holder: $('div#modalForm'),
        form: $('form#main-form'),
        delete_btn: $("<a id='delete_btn' class='delete-btn'><i class='icon-remove-sign'></i></a>")
    };

    var Form = {
        obj: CalendarItems.form_holder,
        start: $('#start'),
        end: $('#end'),
        title: $('#title'),
        color: $('#color'),
        description: $('#description'),
        owner: $('#owner'),
        guests: $('#guests'),
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

        var feed = CalendarItems.form.serialize();
        console.log(feed);
        if(all_day.attr('disabled') && all_day.attr('value') == 'y')
            feed += '&allDay=y';
        saveBtn.text('').attr('disabled','disabled').append('<img style="width: 15px;" src="'+$('#preloader2').attr('href')+'"/>');
        if(action == "New event:"){ //create;
                window.lock();
                send_ajax_request(document.API.url, feed,
                    function(data){
                        calendar.fullCalendar('renderEvent', data);
                        calendar.fullCalendar('unselect');
                        CalendarItems.form_holder.modal('hide');
                    }, 'post', callback);
        }
        else{ // update;
                window.lock();
                send_ajax_request(document.API.url, feed + "&key="+calendar.fullCalendar.eventTransaction.eventObject.key,
                    function(data){
                        var incomming_event = calendar.fullCalendar.eventTransaction.eventObject;
                        for(field in incomming_event){
                            incomming_event[field] = data[field];
                        }
                        calendar.fullCalendar('renderEvent', data);
                        calendar.fullCalendar('unselect');
                        CalendarItems.form_holder.modal('hide');
                    }, 'post', callback);
        }
    };

    Calendar.fn.fillForm = function(calEvent){
        Form.title.val(calEvent.title);
        if(!calEvent.end){
            calEvent.end = calEvent.start;
            calEvent.end.setHours(23,59,59);
        }
        Form.header.text("Edit '"+calEvent.title+"' event:");
        Form.description.val(calEvent.description);
        if(calEvent.allDay)
            Form.allDay.prop('checked', true).trigger('change');
        Form.privateMode.prop('checked', calEvent.privateMode);
        Form.end.datepicker('setDate', calEvent.end);
        Form.start.datepicker('setDate', calEvent.start);
        Form.color.find('[value="'+calEvent.color+'"]').attr('selected','selected');
        Form.owner.val(calEvent.owner);
        for(var guest_ind in calEvent.guests){
            Form.guests.find('[value="' + calEvent.guests[guest_ind] + '"]').prop('selected', true);
        }

    };

    $(document).ready(function(){
        $.ajaxSetup({
            crossDomain: false, // obviates need for sameOrigin test
            beforeSend: function(xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", document.API.csrf_token);
                console.log(xhr);
            }
        });

        if(!$.fn.fullCalendar.length){
            CalendarItems.calendar_holder.append($('<div class="alert alert-block alert-alarm">Aw, snap! ' +
                'We can\'t find FullCalendar module. Please, make sure, ' +
                'that fullcalendar.js was included to media/static files.</div>'));
            return;
        }
        /* TODO: re-edit everything below!*/
        var calendarOptions = function(cls, permission){

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
                eventColor: 'blue',
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
                loading: function( isLoading, view ){
                    if(isLoading){
                        window.lock();
                    }else{
                        window.unlock();
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

                    var title_element = $(this).find('[class="fc-event-title"]');

//                    title_element.animate({opacity: 0.1}, 200, function(){
//                        title_element.text('Name: '+event.name).animate({opacity: 1.0}, 200);
//                    });
                    var posToPaste = title_element,
                        time_element = $(this).find('[class="fc-event-time"]');
                    if(time_element.length)
                        posToPaste = time_element;

                    if(permission){
                        CalendarItems.delete_btn.insertBefore(posToPaste);
                        $.data(CalendarItems.delete_btn, 'event', {event: event, obj: $(this)});
                    }
                },
                eventMouseout: function( event, jsEvent, view ) {
                    CalendarItems.delete_btn.detach();
                    $.data(CalendarItems.delete_btn, 'event', null);
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
        Form.allDay.on('change', function(){all_day_change(datepicker_options, datetimepicker_options)});
        Form.allDay.trigger('change');  //For initialization of datepickers
        Form.obj.on('hide', function(){ afterHideModal() });
        Form.obj.on('shown', function(){ afterShowModal() });
        Form.saveButton.live('click', function(e){
            saveBtnHandler(e, calendar);
        });
        CalendarItems.delete_btn.on('click', function(){ eventDelBtnHandler(); });
    });

    function colorPick(item){
        if(!item.id) return item.text; //opt-group
        return "<div class='color-spot' style='background:"+item.id+";'></div> " + item.text;
    }

    function all_day_change(d_opts, dt_opts){
        var all_day = Form.allDay,
            pickers = [Form.start, Form.end];
        if(all_day.prop('checked')){
            $(pickers).each(function(){
                $(this).datepicker('destroy');
                $(this).datepicker(d_opts);
                $(this).datepicker('setDate', $(this).datepicker('getDate'));
            });
        }
        else{
            $(pickers).each(function(){
                $(this).datepicker('destroy');
                $(this).datetimepicker(dt_opts);
                $(this).datetimepicker('setDate', $(this).datetimepicker('getDate'));
            });
        }
    }

    function afterHideModal(){
        Form.color.select2('destroy');
        Form.color.val('').find('option:selected').removeAttr('selected');
        Form.title.val('');
        Form.start.val('');
        Form.end.val('');
        Form.description.val('');
        Form.privateMode.iButton('destroy');
        Form.privateMode.prop('checked', false);
        Form.allDay.iButton('destroy');
        Form.allDay.prop('checked', false).trigger('change');
        $('div.alert.alert-block.alert-error').remove();
        CalendarItems.calendar_holder.fullCalendar('unselect');
        Form.guests.select2('destroy').find('option:selected').removeAttr('selected');
        return true;
    }

    function afterShowModal(){
        Form.color.select2({
            formatResult: colorPick,
            formatSelection: colorPick,
            escapeMarkup: function(m) { return m; }
        })
        Form.guests.select2();
        Form.allDay.iButton({
            labelOn: 'All day',
            labelOff: 'Flexible time'
        });
        Form.privateMode.iButton({
            labelOn: 'Private',
            labelOff: 'Public'
        })
    }


    function saveBtnHandler(e, o){
            e.preventDefault();
            o.saveEvent();
        }

    function eventDelBtnHandler(){
        if($('#deleteConfirmDlg').length){
            $('#deleteConfirmDlg').dialog('destroy').remove();
        }
        var eventObj =  $.data(CalendarItems.delete_btn, 'event');
        $('<div id="deleteConfirmDlg">Delete ' + eventObj.event.title + ' event?</div>').dialog({
            buttons: [
                { text: "Yes", click: function(e) { modalDelBtnHandler(eventObj);
                                                    $(this).dialog('close');
                                                    $(this).remove()} },
                { text: "No", click: function(){$(this).dialog('close');
                                                $(this).remove(); }}
            ],
            title: "Are you sure?",
            appendTo: eventObj.obj
        }).on('close', function(){
            $.data(CalendarItems.delete_btn, 'event', null);
            $(this).dialog('destroy');
        });
    }

    function modalDelBtnHandler(e){
        if(!e) return;
        var event = e.event,
            htmlItem = e.obj;
        window.lock();
        htmlItem.fadeOut(1000);
        send_ajax_request(document.API.url+'?key='+event.key, htmlItem, function(){
            CalendarItems.calendar_holder.fullCalendar('removeEvents', function(_event){
                return (_event == event);
            });
        }, 'delete', function(o){o.fadeIn(200);});
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

