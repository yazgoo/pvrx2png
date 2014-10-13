function pvrx2png(name, text)
{
    var output;
    var output_name = name.substr(0, name.lastIndexOf(".")) + ".png";
    Module['preRun'] = function() {
        console.log(Module);
        console.log("prerun")
        output = Module["FS_createDataFile"]('/', output_name, "", true, true);
        Module["FS_createDataFile"]('/', name, text, true, true);
    }
    Module['postRun'] = function(e) {
        console.log('done.....');
        console.log(output);
        console.log('done.....');
    }
    Module.preRun()
    Module.callMain([name])
    Module.postRun()
    console.log("<output");
    console.log(output);
    console.log(">output");
    return output.contents;
}
var input = document.getElementById("input");
var image = document.getElementById("image");
var text = document.getElementById("text");
input.addEventListener('change', function(e) {
        var file = input.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            var bytes = pvrx2png(file.name, reader.result);
            for(i in bytes)
                if(bytes[i] < 0) bytes[i] += 256
            console.log(bytes);
            image.src = "data:image/png;base64," +
                btoa(String.fromCharCode.apply(null, new Uint8Array(bytes)));
        }
        reader.readAsBinaryString(file);    
        });
