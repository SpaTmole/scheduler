/**
 *  Author: Konstantin Oficerov
 *  Email: konstantin.oficerov@gmail.com
 **/

(function($, document, window){

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



    $(document).ready(function(){
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
            header: $('#myModalLabel')
        };

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
                        window.locker.show();
                    }else{
                        window.locker.hide();
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
            var calendar = new Calendar(CalendarItems.calendar_holder, calendarOptions, true);
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
            Form.end.datetimepicker(datetimepicker_options);
            Form.start.datetimepicker(datetimepicker_options);

        });
    });


})(jQuery, window.document, window);

