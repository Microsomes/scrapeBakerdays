const fs= require("fs")


var dir=fs.readdirSync("../output/cakes2")

var allproducts=[]
for(var i=0;i<dir.length;i++){
    var current=dir[i]
    var data= fs.readFileSync("../output/cakes2/"+current);
    var pro=JSON.parse(data)
    allproducts.push(...pro)
}

fs.writeFileSync("product_cakes.json",JSON.stringify(allproducts,null,2),(err)=>{})
console.log(allproducts.length)