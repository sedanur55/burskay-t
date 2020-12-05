var Datatable = function () {
    var tableOptions; // main options
    var dataTable; // datatable object
    var table; // actual table jquery object
    var tableContainer; // actual table container object
    var tableWrapper; // actual table wrapper jquery object
    var tableInitialized = false;
    var ajaxParams = {}; // set filter mode
    var the;
    var columns = [];
    var countSelectedRecords = function (instance) {
        var selected = instance.getSelectedRowsCount();
        var text = tableOptions.dataTable.language.groupActions;
        if (selected > 0) {
            $('.table-group-actions > span', instance.getTableWrapper()).text(text.replace('_TOTAL_', selected));
        } else {
            $('.table-group-actions > span', instance.getTableWrapper()).text('');
        }
    };
    return {
        //main function to initiate the module
        init: function (options) {
            if (!$().dataTable) {
                return;
            }
            the = this;
            $('thead > tr:first > th', options.src).each(function () {
                columns.push({
                    'data': $(this).attr('data-id'),
                    'sClass': $(this).attr('class'),
                    'orderable': ($(this).attr('data-sortable') === 'true')
                });
            });
            $('.filter', options.src).find('input, select').each(function () {
                if (!$(this).attr('name')) {
                    $(this).attr('name', 'filter_' + $(this).closest('th').data('id'));
                }
                if ($(this).prop('tagName') === 'SELECT' || $(this).hasClass('date-picker')) {
                    $(this).on('change', function () {
                        the.submitFilter();
                    });
                } else {
                    $(this).on('keypress', function (e) {
                        if (e.which === 13) {
                            the.submitFilter();
                        }
                    });
                }
            });
            // default settings
            // noinspection JSAnnotator
            // noinspection JSAnnotator
            options = $.extend(true, {
                src: '', // actual table
                filterApplyAction: 'filter',
                filterCancelAction: 'filter_cancel',
                resetGroupActionInputOnSuccess: true,
                dataTable: {
                    'dom': "<'row'<'col-6'ir><'col-6'p>><'table-scrollable't><'row'<'col-5'i><'col-2'l><'col-12 col-sm-5'p>>", // datatable layout
                    'bStateSave': false, // save datatable state(pagination, sort, etc) in cookie.
                    'lengthMenu': [
                        [10, 20, 50, 100, 1000],
                        [10, 20, 50, 100, 1000] // change per page values here
                    ],
                    'fixedHeader': {
                        header: false,
                        headerOffset: 68
                    },
                    'pageLength': 50, // default records per page
                    'language': { // language settings
                        'processing': 'Yükleniyor...',
                        // app spesific
                        'groupActions': '_TOTAL_ kayıt seçili:  ',
                        'ajaxRequestGeneralError': 'İşlem gerçekleştirilemedi, tekrar deneyin',
                        // data tables spesific
                        'lengthMenu': '_MENU_ Satır',
                        'info': 'Toplam _TOTAL_ kayıt',
                        'infoEmpty': '&nbsp; Görüntülenecek kayıt yok',
                        'emptyTable': '<div class="text-center text-danger">Tabloda kayıt yok</div>',
                        'zeroRecords': '<div class="text-center text-danger">Kayıt bulunamadı</div>',
                        'paginate': {
                            'page': '',
                            'pageOf': ' - Sayfa: '
                        },
                        'sInfoFiltered': ' - _MAX_ kayıttan süzüldü'
                    },
                    'responsive': false, //{'details': {'type': 'column'}},
                    'orderCellsTop': true,
                    'columns': columns,
                    'order': [
                        [$(options.src).data('sort-col'), $(options.src).data('sort-dir')]
                    ],
                    'columnDefs': [
                        {
                            'targets': 'hiddencol',
                            'visible': false
                        }
                    ],
                    'buttons': [
                        {
                            text: 'Excel (T)',
                            className: $(options.src).data('export-all') ? 'btn btn-sm btn-secondary' : 'hide',
                            titleAttr: 'Hepsini Excele Aktar',
                            action: function (e, dt, button, config) {
                                KTApp.block($('body'), {});
                                var dtParams = dt.ajax.params();
                                dtParams['export-excel'] = true;
                                $.ajax({
                                    'type': 'GET',
                                    'url': dt.ajax.url(),
                                    'cache': false,
                                    'dataType': 'text',
                                    'data': jQuery.param(dtParams)
                                }).done(function (result) {
                                    KTApp.unblock($('body'));
                                    var csvData = new Blob(['\ufeff' + result], {type: 'text/csv;charset=utf-8;'});
                                    var csvURL = window.URL.createObjectURL(csvData);
                                    var tempLink = document.createElement('a');
                                    tempLink.href = csvURL;
                                    tempLink.setAttribute('download', 'Liste.csv');
                                    tempLink.click();
                                    KTApp.notify('Dosyanız oluşturuldu.');
                                    //KTApp.alert(result.message);
                                }).fail(function (jqXHR, textStatus) {
                                    KTApp.unblock($('body'));
                                    console.log('xhr', jqXHR);
                                    console.log('textStatus', textStatus);
                                    KTApp.alert('Sunucu hatası oluştu, sayfayı yenileyin!');
                                });

                            }
                        },
                        {
                            extend: 'excel',
                            text: 'Excel',
                            className: 'btn btn-sm btn-secondary',
                            exportOptions: {
                                columns: 'thead th:not(.no-export)'
                            }
                        },
                        {
                            extend: 'pdf',
                            className: 'btn btn-sm btn-secondary',
                            exportOptions: {
                                columns: 'thead th:not(.no-export)'
                            }
                        }
                    ],
                    'scrollX': false,
                    'scrollCollapse': true,
                    'pagingType': 'full_numbers', // pagination type(bootstrap, bootstrap_full_number or bootstrap_extended)
                    'autoWidth': false, // disable fixed width and enable fluid table
                    'processing': true, // enable/disable display message box on record load
                    'serverSide': true, // enable/disable server side ajax loading
                    'ajax': { // define ajax settings
                        'url': '', // ajax URL
                        'type': 'GET', // request type
                        'global': false,
                        'timeout': 20000,
                        'data': function (data) { // add request parameters before submit
                            the.setAjaxParam('action', tableOptions.filterApplyAction);
                            // get all typeable inputs
                            $('textarea.form-filter, select.form-filter, input.form-filter:not(.date-picker,[type="radio"],[type="checkbox"])', table)
                                .each(function () {
                                    the.setAjaxParam($(this).attr('name').replace('filter_', ''), $(this).val());
                                });
                            $('input.form-filter.date-picker', table).each(function () {
                                var val = $(this).val().trim();
                                if (val.length > 7)
                                    the.setAjaxParam($(this).attr('name').replace('filter_', ''), moment(val, 'DD.MM.YYYY').locale('tr').format("YYYY-MM-DD"));
                                else
                                    the.setAjaxParam($(this).attr('name').replace('filter_', ''), '');
                            });
                            // get all checkboxes
                            $('input.form-filter[type="checkbox"]:checked', table).each(function () {
                                the.addAjaxParam($(this).attr('name').replace('filter_', ''), $(this).val());
                            });
                            // get all radio buttons
                            $('input.form-filter[type="radio"]:checked', table).each(function () {
                                the.setAjaxParam($(this).attr('name').replace('filter_', ''), $(this).val());
                            });
                            the.setAjaxParam('export-excel', table.data('export-excel'));
                            $.each(ajaxParams, function (key, value) {
                                data[key] = value === 'null' ? '' : value;
                            });
                        },
                        'dataSrc': function (result) { // Manipulate the data returned from the server
                            result.data.forEach(function (data, index) {
                                data['_responsive'] = '';
                                if ($(options.src).find('th[data-id="_numbering"]').length) {
                                    data['_numbering'] = (parseFloat(result.start) + index + 1);
                                }
                                if ($(options.src).find('th[data-id="_checkable"]').length) {
                                    data['_checkable'] = '<label class="m-checkbox m-checkbox--single m-checkbox--solid m-checkbox--brand"><input type="checkbox" name="check" class="m-checkable" value="' + (data['id'] || 0) + '" data-index="' + (parseFloat(result.start) + index + 1) + '"><span></span></label>';
                                }
                            });
                            if (tableOptions.onSuccess) {
                                tableOptions.onSuccess.call(undefined, the);
                            }
                            return result.data;
                        },
                        'error': function () { // handle general connection errors
                            if (tableOptions.onError) {
                                tableOptions.onError.call(undefined, the);
                            }
                            App.alertBox({
                                type: 'danger',
                                icon: 'warning',
                                message: tableOptions.dataTable.language.ajaxRequestGeneralError,
                                container: tableWrapper,
                                place: 'prepend',
                                closeInSeconds: 10
                            });
                        }
                    },
                    'drawCallback': function (oSettings) { // run some code on table redraw
                        if (tableInitialized === false) { // check if table has been initialized
                            tableInitialized = true; // set table initialized
                            table.show(); // display table
                        }
                        //the.setAllAjaxParams();
                        countSelectedRecords(the); // reset selected records indicator
                        // callback for ajax data load
                        if (tableOptions.onDataLoad) {
                            tableOptions.onDataLoad.call(undefined, the);
                        }
                        $('input[name="check_all"]', table).prop('checked', false).off('click').on('click', function () {
                            $('input[name="check"]', table).prop('checked', $(this).is(':checked'));
                            var tr = $('input[name="check"]', table).closest('tr');
                            tr.removeClass('selected');
                            if ($(this).is(':checked')) {
                                tr.addClass('selected');
                            }
                            countSelectedRecords(the);
                        });
                        $('input[name="check"]', table).on('click', function () {
                            $('input[name="check_all"]', table).prop(
                                'checked',
                                $('input[name="check"]:checked', table).length === $('input[name="check"]', table).length
                            );
                            var tr = $(this).closest('tr');
                            tr.removeClass('selected');
                            if ($(this).is(':checked')) {
                                tr.addClass('selected');
                            }
                        });
                        if (table.data('drawcallback') !== '') {
                            eval(table.data('drawcallback'))(the);
                        }
                        App.initPlugins();
                    }
                }
            }, options);
            tableOptions = options;
            // create table's jquery object
            table = $(options.src);
            tableContainer = table.parent();
            // apply the special class that used to restyle the default datatable
            var tmp = $.fn.dataTableExt.oStdClasses;
            $.fn.dataTableExt.oStdClasses.sWrapper = $.fn.dataTableExt.oStdClasses.sWrapper + ' dataTables_extended_wrapper';
            $.fn.dataTableExt.oStdClasses.sFilterInput = 'form-control form-control-sm form-filter';
            $.fn.dataTableExt.oStdClasses.sLengthSelect = 'custom-select custom-select-sm form-control form-control-sm';
            // initialize a datatable
            dataTable = table.DataTable(options.dataTable);
            // revert back to default
            $.fn.dataTableExt.oStdClasses.sWrapper = tmp.sWrapper;
            $.fn.dataTableExt.oStdClasses.sFilterInput = tmp.sFilterInput;
            $.fn.dataTableExt.oStdClasses.sLengthSelect = tmp.sLengthSelect;
            // get table wrapper
            tableWrapper = table.parents('.dataTables_wrapper');
            // build table group actions panel
            if ($('.table-actions-wrapper', tableContainer).length === 1) {
                $('.table-group-actions', tableWrapper).html($('.table-actions-wrapper', tableContainer).html()); // place the panel inside the wrapper
                $('.table-actions-wrapper', tableContainer).remove(); // remove the template container
            }
            // handle group checkboxes check/uncheck
            $('.group-checkable', table).change(function () {
                var set = $('tbody > tr input[name="check"]', table);
                var checked = $(this).is(':checked');
                $(set).each(function () {
                    $(this).attr('checked', checked);
                });
                countSelectedRecords(the);
            });
            // handle row's checkbox click
            table.on('change', 'tbody > tr input[name="check"]', function () {
                countSelectedRecords(the);
            });
            // handle filter submit button click
            table.on('click', '.filter-submit', function (e) {
                e.preventDefault();
                the.submitFilter();
            });
            // handle filter cancel button click
            table.on('click', '.filter-cancel', function (e) {
                e.preventDefault();
                the.resetFilter();
            });
        },
        submitFilter: function () {
            dataTable.ajax.reload();
        },
        resetFilter: function () {
            $('textarea.form-filter, select.form-filter, input.form-filter', table).each(function () {
                $(this).val('');
            });
            $('input.form-filter[type="checkbox"]', table).each(function () {
                $(this).attr('checked', false);
            });
            the.clearAjaxParams();
            the.addAjaxParam('action', tableOptions.filterCancelAction);
            dataTable.ajax.reload();
        },
        getSelectedRowsCount: function () {
            var total = $('tbody > tr input[name="check"]:checked', table).length;
            $('.selected-rows-count').each(function () {
                var text = $(this).data('default');
                var target = $(this).find('span');
                if (!text) {
                    text = target.text();
                    $(this).data('default', text);
                }
                if (total) {
                    target.text(text + ' (' + total + ')');
                } else {
                    target.text(text);
                }
            });
            return total;
        },
        getSelectedIds: function () {
            var ids = [];
            $('tbody > tr input[name="check"]:checked', table).each(function () {
                ids.push($(this).val());
            });
            return ids;
        },
        setAjaxParam: function (name, value) {
            ajaxParams[name] = value;
        },
        addAjaxParam: function (name, value) {
            if (!ajaxParams[name]) {
                ajaxParams[name] = [];
            }
            var skip = false;
            for (var i = 0; i < (ajaxParams[name]).length; i++) { // check for duplicates
                if (ajaxParams[name][i] === value) {
                    skip = true;
                }
            }
            if (skip === false) {
                ajaxParams[name].push(value);
            }
        },
        clearAjaxParams: function (name, value) {
            ajaxParams = {};
        },
        getDataTable: function () {
            return dataTable;
        },
        getTableWrapper: function () {
            return tableWrapper;
        },
        getTableContainer: function () {
            return tableContainer;
        },
        getTable: function () {
            return table;
        }
    };
};

function redirectFromDT(resp) {
    if (resp.success && resp.hasOwnProperty('url')) {
        window.location = resp.url;
    }
}