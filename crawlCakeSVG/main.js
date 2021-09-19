const fs= require("fs")

var data= fs.readFileSync("product_cakes.json")
var products= JSON.parse(data)


const puppeteer= require("puppeteer")


async function checkIsPersonlise(tab){
    var isPersonliseProduct=await tab.evaluate(()=>{
        var submitval= document.querySelector("button[form='product_addtocart_form']").textContent
        if(submitval==='Add to Cart'){
            return false
        }
        return true
     })
     return isPersonliseProduct
}

async function checkAmountSelectors(tab){
    var selectAmount= await tab.evaluate(()=>{
        return document.querySelectorAll("select").length
    })
    return selectAmount;
}

async function getDefaultValsOfSelect(tab){
    return await tab.evaluate(()=>{
        var toReturn=[]
        document.querySelectorAll("select").forEach(item=>{
           var val= item.querySelectorAll("option")[1].value;
           toReturn.push(val)
        })
        return toReturn
    })
}

async function setSelectVal(tab,index,val){
    await tab.evaluate((index,val)=>{
        document.querySelectorAll("select")[index].value=val
    },index,val)
}

async function addBasketOrPersonlsie(tab){
    await tab.evaluate(()=>{
        document.querySelector("button[form='product_addtocart_form']").click()
    })
}

async function sleep(tosleep,tab){
    await tab.waitForTimeout(tosleep)
}

async function requestCake(tab,url){
    await tab.goto(url,{
        waitUntil:"networkidle2"
    })
    var isPersonlise= await checkIsPersonlise(tab)
    if(isPersonlise){
    var selectorAmount=await checkAmountSelectors(tab);
        if(selectorAmount==2){
            var defaultVal=await getDefaultValsOfSelect(tab)
            await setSelectVal(tab,1,defaultVal[1])


            await sleep(1000,tab)
           
            await addBasketOrPersonlsie(tab)

           
            await sleep(5000,tab)

           
            return 1;
        }else{
            return -1
        }
    }else{
       return -1
    }
}

async function start(){
    const browser= await puppeteer.launch({
        headless:true,
        args: ['--enable-features=NetworkService'],
        ignoreHTTPSErrors:true
    })
    const tab = await browser.newPage()

    var allInitCodes=[]

    tab.on('console', async e => {
        const args = await Promise.all(e.args().map(a => a.jsonValue()));
        var first= args.length
        if(first==1){
            try{
                if(args[0].includes("init")){
                    var initCode= args[0];
                    allInitCodes.push(initCode)
                }
            }catch(err){

            }
        }
      });

      
  
     
      var reso=[]

      //check if output/run.json exists

      if(fs.existsSync("output/run.json")){
          //if exists read it
          var data=fs.readFileSync("output/run.json")
          reso=JSON.parse(data)
      }

      if(fs.existsSync("output/initcodes.json")){
          console.log("init codes exist")
        //if exists read it
        var data=fs.readFileSync("output/initcodes.json")
        allInitCodes=JSON.parse(data)
    }
    console.log(allInitCodes)

      while (products.length>=1){
          try{
            console.log("total:",products.length)
            var currentUrl= products.shift();
            console.log(currentUrl.url)
            await sleep(1000,tab)
            console.log("Extracting:",currentUrl.url)
            var isDone=await requestCake(tab,currentUrl.url)
            if(isDone==-1){
                console.log("not a cake product")
                reso.push({
                    ...currentUrl,
                    isPersono:false                
                })
            }else{
                reso.push({
                    ...currentUrl,
                    isPersono:true                
                })
            }
            console.log("Done:",currentUrl.url)
            fs.writeFileSync("output/initcodes.json",JSON.stringify(allInitCodes,null,2),(err)=>{})
            fs.writeFileSync("output/run.json",JSON.stringify(reso,null,2),(err)=>{})
            fs.writeFileSync("product_cakes.json",JSON.stringify(products,null,2),(err)=>{})
            await sleep(1000,tab)
        }catch(err){
            console.log("skipping")
            reso.push({
                type:"ERROR",
                ...currentUrl,
                isPersono:false                
            })        }
      }

  
    await browser.close()
    

}

start();