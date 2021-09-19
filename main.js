
const puppeteer= require("puppeteer-extra")
const fs= require("fs")

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())



async function scrapePage(pageNo,page){
    var url=`https://www.bakerdays.com/occasion-cakes/search?bd_filter_product_type=5743&p=${pageNo}&product_list_limit=35`;
    await page.goto(url,{
        waitUntil:"networkidle0"
    })

    var products= await page.evaluate(()=>{
        var toReturn=[]
        document.querySelectorAll(".product-item-info").forEach(item=>{
            var url= item.querySelector("a").getAttribute("href")
            var name= item.querySelector(".name").textContent
            toReturn.push({
                name:name,
                url:url,
                crawled_date:Date.now()
            })
        })
        
        return toReturn
    })

    return products;
}

(async function(){
    console.log("ego ga")
    const browser= await  puppeteer.launch({
        headless:true
    })
    var [tab] = await browser.pages();

    var maxpages=26;

    for(var i=1;i<maxpages;i++){
        console.log("attempting page:",i)
        var products= await scrapePage(i,tab)
        fs.writeFileSync(`output/cakes2/cakes_${i}.json`,JSON.stringify(products,null,2),(err)=>{})
        console.log("scrapped page:",i)
        await tab.waitFor(4000)
    }

 

    await browser.close();

})()