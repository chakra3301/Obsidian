const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

const IMAGE_FOLDER = path.join(__dirname, 'images');
const JSON_FOLDER = path.join(__dirname, 'json');

if (!fs.existsSync(IMAGE_FOLDER)) fs.mkdirSync(IMAGE_FOLDER);
if (!fs.existsSync(JSON_FOLDER)) fs.mkdirSync(JSON_FOLDER);

const BASE_URL = 'https://drugsdata.org/view.php?id=';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function extractTableData(tableSelector, $) {
  const tableData = {};
  $(tableSelector + " tr").each(function(i, row) {
    const th = $(row).find("th").first();
    const td = $(row).find("td").first();
    if (th.length) {
      let key = th.text().trim();
      if (key.endsWith(":")) {
        key = key.slice(0, -1).trim();
      }
      if (td.find("ul").length > 0) {
        const listItems = [];
        td.find("ul li").each(function(i, li) {
          listItems.push($(li).text().trim());
        });
        tableData[key] = listItems;
      } else {
        tableData[key] = td.text().trim();
      }
    } else if (td.length) {
      if (td.find("ul").length > 0) {
        const listItems = [];
        td.find("ul li").each(function(i, li) {
          listItems.push($(li).text().trim());
        });
        tableData["list_" + i] = listItems;
      } else {
        tableData["misc_" + i] = td.text().trim();
      }
    }
  });
  return tableData;
}

async function processId(id) {
  const url = `${BASE_URL}${id}`;
  try {
    const { data } = await axios.get(url, { httpsAgent });
    const $ = cheerio.load(data);

    let imageSrc = "";
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('/display') && src.includes('.jpg')) {
        imageSrc = src;
        return false; 
      }
    });

    let imageField = "";
    if (imageSrc) {
      if (imageSrc.startsWith('/')) {
        imageSrc = `https://drugsdata.org${imageSrc}`;
      }
      try {
        const imgResponse = await axios.get(imageSrc, { responseType: 'arraybuffer', httpsAgent });
        fs.writeFileSync(path.join(IMAGE_FOLDER, `${id}.jpg`), imgResponse.data);
        imageField = `${id}.jpg`;
      } catch (imgError) {
        console.log(`Error downloading image for id ${id}: ${imgError.message}`);
        imageField = "Not Available";
      }
    } else {
      console.log(`No image found for id ${id}`);
      imageField = "Not Available";
    }

    let soldAs = $('#drug-sold-as .otherinfo').text().trim() || "Not Available";
    let expectedToBe = $('#drug-expected .otherinfo').text().trim() || "Not Available";

    let labComments = "Not Available";
    let warning = "Not Available";
    $('#comment-container .comment').each(function() {
      const titleText = $(this).find('.title').text().trim().toLowerCase();
      if (titleText.indexOf('lab comments') !== -1) {
        labComments = $(this).find('.otherinfo').text().trim() || labComments;
      } 
      if (titleText.indexOf('warning') !== -1) {
        warning = $(this).find('.otherinfo').text().trim() || warning;
      } else if (titleText.indexOf('caution') !== -1) {
        warning = $(this).find('.otherinfo').text().trim() || warning;
      } else if (titleText.indexOf('note') !== -1) {
        warning = $(this).find('.otherinfo').text().trim() || warning;
      }
    });

    const tableDataLeft = extractTableData("table.TabletDataLeft", $);
    const tableDataRight = extractTableData("table.TabletDataRight", $);

    const jsonData = {
      "Sold as": soldAs,
      "Expected to be": expectedToBe,
      "Lab Comments": labComments,
      "Warning": warning,
      "Image": imageField,
      "table data left": tableDataLeft,
      "table data right": tableDataRight
    };

    fs.writeFileSync(path.join(JSON_FOLDER, `${id}.json`), JSON.stringify(jsonData, null, 2));
    console.log(`Processed id ${id}`);
  } catch (error) {
    console.log(`Error processing id ${id}: ${error.message}`);
  }
}

async function main() {
  for (let id = 14230; id <= 20216; id++) {
    await processId(id);
  }
}

main();
