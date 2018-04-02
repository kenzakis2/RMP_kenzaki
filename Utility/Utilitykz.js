(function() {
function Utilitykz()
{throw "this is a static method";}

//------Util----------
//Arrayの各要素からnameの名前を持つPropertyを抽出する
Utilitykz.extractMetaData = function(name, array)
{
    //extract all elements with tag specified
    var available = array.filter(function(singleelement)
    {
       return singleelement.meta.hasOwnProperty(name);
    });

    //flatten the array by extracting all the data with specified name
    var flatStrings = available.map(function(singleelement)
    {
       return singleelement.meta[name];
    });
    return flatStrings;
}

//Arrayの各要素が','を含んだ文字列である場合、それを更に切り分け2-DArrayに。
Utilitykz.splitStringToArray = function(array)
{
    var result = array.map(function(target)
    {
       return target.split(',')
    });
    return result;
}

var kz_DataManager_extractMetadata = DataManager.extractMetadata;
DataManager.extractMetadata = function(data) {
  var re = /<([^<>:]+)(:?)([^>]*)>/g;
  data.metaArray = {};
  for (;;) {
      var match = re.exec(data.note);
      if (match) {
          if (!data.metaArray[match[1]])
          {
             data.metaArray[match[1]] = [];
          }
          if (match[2] === ':') {
              data.metaArray[match[1]].push(match[3]);
          } 
      } else {
          break;
      }
  }
  kz_DataManager_extractMetadata.call(this, data);
}

})();
