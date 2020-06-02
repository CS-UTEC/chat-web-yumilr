$(function(){
    var url = '/messages'
    $("#grid").dxDataGrid({
        dataSource: DevExpress.data.AspNet.createStore({
            key: "id",
            loadUrl: url,   //get message
            insertUrl: url, //post message
            updateUrl: url, //put message
            deleteUrl: url, //delete message
            onBeforeSend: function(method, ajaxOptions) {
                ajaxOptions.xhrFields = { withCredentials: true };
            } //convierto todo a json antes de enviarlo
        }),

        editing: {
            allowUpdating: true,
            allowDeleting: true,
            allowAdding: true
        },

        paging: {
            pageSize: 12
        },

        pager: {
            showPageSizeSelector: false,
            allowedPageSizes: [8, 12, 20]
        },

        columns: [{
            dataField: "id",
            dataType: "number",
            allowEditing: false
        }, {
            dataField: "content"
        }, {
            dataField: "sent_on"
        }, {
            dataField: "user_from_id"
        }, {
            dataField: "user_to_id"
        }, ],
    }).dxDataGrid("instance");
});
