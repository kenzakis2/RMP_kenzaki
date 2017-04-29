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

})();
