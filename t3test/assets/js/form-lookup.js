(function ($) {
    $(function () {
        console.log('lookup', 'started');
        $('select[data-lookup]:not([data-lookupbindings])').each(function () {
            var $this = $(this),
                lookup = $this.attr('data-lookup').split('#'),
                type = lookup[1],
                childName = lookup[0],
                parentId = $this.val();

            $this.attr('data-lookupbindings', true);
            if (childName) {
                var child = $('select[name=' + childName + ']', $this.closest('form'));
                if (child.length) {
                    if (!parentId) {
                        child.removeData('parentId').empty();
                    }
                    if (child.data('parentId') !== parentId) {
                        child.data('parentId', parentId);
                        $this.prop('disabled', true);
                        $this.on('change', function () {
                            parentId = $(this).val() ?? '';
                            child.empty();
                            if (parentId.length > 0) {
                                if (typeof parentId === 'object')
                                    parentId = parentId[0];
                                $.ajax({
                                    'type': 'get',
                                    'url': '/ajax/lookup/' + type + (parentId ? '/' + parentId : ''),
                                    'global': false
                                }).done(function (result) {
                                    var extra = child.data('value-extra');
                                    if (!child.prop('multiple')) {
                                        child.append(
                                            $('<option/>', {
                                                value: '',
                                                text: 'Seçiniz'
                                            })
                                        );
                                    }
                                    result.forEach(function (item) {
                                        child.append(
                                            $('<option/>', {
                                                value: item.id,
                                                text: childName === 'address' ? item.house_number:item.name
                                            })
                                        );
                                    });
                                    child.selectpicker('destroy').selectpicker({liveSearch: true});
                                    var val = child.data('default-val');
                                    child.val(val).trigger('change');
                                    // App.initPlugins();
                                }).fail(function (jqXHR, textStatus) {
                                    App.alert('Sunucu hatası oluştu, sayfayı yenileyin!');
                                });
                            }
                        });
                        $this.prop('disabled', false);
                        $this.removeData('lookup');
                    }
                }
            }
        });
    });
})(jQuery);