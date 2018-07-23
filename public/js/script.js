var Upload = function (file) {
    this.file = file;
};

Upload.prototype.getType = function() {
    return this.file.type;
};
Upload.prototype.getSize = function() {
    return this.file.size;
};
Upload.prototype.getName = function() {
    return this.file.name;
};
Upload.prototype.doUpload = function () {
    var that = this;
    var formData = new FormData();

    // add assoc key values, this will be posts values
    formData.append("file", this.file, this.getName());
    formData.append("node", $("#parent_selection").val());
    formData.append("account" , $("#child_selection").val())
     $(".card").hide();
    $("#mine").show();
    drawConnector();
    $.ajax({
        type: "POST",
        url: "/deployContract",
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
            }
            return myXhr;
        },
        success: function (data) {
            // your callback here
        },
        error: function (error) {
            // handle error
        },
        async: true,
        data: formData,
        cache: false,
        enctype: 'multipart/form-data', 
        contentType: false,
        processData: false,
        timeout: 60000
    });
}
var upload;
$("#ingredient_file").on("change", function (e) {
    var file = $(this)[0].files[0];
     upload = new Upload(file);
     // maby check size or type here with upload.getSize() and upload.getType()

});
function onSubmit(){
 // execute upload
    upload.doUpload();
}

const socket = io.connect(window.location.host);

socket.on('connect', () => {
  console.log(socket.id); // 'G5p5...'
});
socket.on('mined', function(data){
    console.log("mine complete:"+data);   
 if(data.status){
       stopPropagation();
    }
});
$("#parent_selection").change(function() {
    var parent = $(this).val(); 
     $("#child_selection").html('');  
     list(JSON.parse($("#server_info").val())[parent])
    
});
//function to populate child select box
function list(array_list)
{
    $("#child_selection").html(""); //reset child options
    $(array_list).each(function (i) { //populate child options 
        $("#child_selection").append("<option value="+array_list[i]+">"+array_list[i]+"</option>");
    });
}