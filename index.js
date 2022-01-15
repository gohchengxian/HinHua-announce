const fetch = require("node-fetch");
const express = require("express");
const app = express();
const fs = require("fs");
const cheerio = require("cheerio");
const Discord = require("discord.js");
const path = require("path");

app.get('/', async (req, res) => {
  console.log("start")
  res.status(200).send("owo")
});

app.get('/rss', async (req, res) => {
  res.set('Content-Type', 'application/rss+xml');;
  res.send(fs.readFileSync('feed.rss', 'utf8'))
});

app.get('/ping', async (req, res) => {
  var config = JSON.parse(fs.readFileSync('config.json'));
  if (Date.now() - config.last_check > 1800000) {
    const uwu = await fetchingsd()
    if (uwu !== config.last_announce) {
      console.log("nfecwi");
      config.webhook_url.forEach(xd => {
        fetch(xd,
          {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: '兴华中学',
              avatar_url:
                'http://www.hinhua.edu.my/cn/about/images/emblem.png',
              content: uwu,
              allowed_mentions: {
                parse: ['users', 'roles'],
              },
            }),
          }
        );
      });
      config.last_check = Date.now();
      config.last_announce = uwu;
    } else {
      config.last_check = Date.now();
    };
    fs.writeFileSync('config.json', JSON.stringify(config))
  };
  console.log('ping')
  res.sendStatus(200)
});

app.listen(80);

setInterval(async () => {
  const fetching = await fetch('http://www.hinhua.edu.my/cn/home01.html');
  const html = await fetching.text();
  var filter = html.replace(/&nbsp;/g, "").replace(/|/g, "").split(`images/line01.gif`);
  var i = 0;
  var xml = [];
  filter.forEach(async xd => {
    i++;
    if (i === 0 || i === filter.length - 1) return;
    console.log(i)
    var filters = xd.split("</tr>").slice(1).join("").split('<tr>').slice(0, -1).join("");
    const $ = cheerio.load(filters);
    const data = [];
    var xddd = [];
    var txts = $.text().split(" ").filter(xd => xd.length !== 0).join("").split('\n').filter(xd => xd.length !== 0).join("").split('\t').filter(xd => xd.length !== 0);
    if (xd.split('<a class="auto-style').length !== 0) {
      xd.split('<a class="auto-style').slice(1).forEach(xdd => {
        var txts = xdd.split("</a>");
        if (txts.length === 0) return;
        var txt = txts[0].split(">");
        var word = [];
        if (txt[1].includes("<")) {
          txt.slice(1).forEach(xddd => {
            if (xddd.split("<")[0].replace(/\n/g, "").replace(/\t/g, "").length !== 0) {
              word.push(xddd.split("<")[0].replace(/\n/g, "").replace(/\t/g, ""))
            };
          });
        };
        if (word.length !== 0) {
          var txt = word.join("")
        } else {
          var txt = txt[1].replace(/\n/g, "").replace(/\t/g, "").replace(/|/g, "").replace(/ /g, "");
        };
        var link = txts[0].split(`href="`)[1].split("\"")[0];
        if (link.startsWith('http')) {
          var link = link
        } else {
          var link = "http://www.hinhua.edu.my/cn/" + link;
        };
        data.push({ id: txt, item: `[${txt}](${link})` })
      })
    };
    txts.forEach(xd => {
      if (xd.length !== 1) {
        var check_item = data.filter(xdd => xdd.id === xd.replace(/ /g).replace(/|/g, ""));
        if (check_item.length !== 0) {
          xddd.push(check_item[0].item)
        } else {
          xddd.push(xd)
        }
      }
    });
    if (xddd[0] === undefined) return;
    if (xddd[1].includes("(")) {
      xml.push(`
  <item>
    <title>${xddd[0]}</title>
    <pubDate>${xddd[1]}</pubDate>
    <description>${xddd.slice(2).join("\\n")}</description>
  </item>`);
    } else {
      xml.push(`
  <item>
    <title>${xddd[1]}</title>
    <description>${xddd.slice(2).join("\\n")}</description>
  </item>`);
    }
  });
  fs.writeFileSync('feed.rss', `<?xml version="1.0" encoding="iso-8859-1" xml:lang="zh-CN"?>\n<rss version="2.0" >\n<channel>\n<title>最新消息</title>\n<link>http://www.hinhua.edu.my/cn/index.html</link><lastBuildDate>${Date.now()}</lastBuildDate>${xml.join("")}</channel></rss>`);
}, 3600000);

async function fetchingsd() {
  const fetching = await fetch('http://www.hinhua.edu.my/cn/home01.html');
  const html = await fetching.text();
  var filter = html.split(`images/line01.gif`)[1].split("</tr>").slice(1).join("").split('<tr>').slice(0, -1).join("");
  //console.log(filter);
  const $ = await cheerio.load(filter);
  const data = [];
  var xddd = [];
  var txts = $.text().split(" ").filter(xd => xd.length !== 0).join("").split('\n').filter(xd => xd.length !== 0).join("").split('\t').filter(xd => xd.length !== 0);
  $('a').each(i => {
    var url = $('a').eq(i);
    var txt = url.text();
    var link = url.attr('href');
    if (link.startsWith('http')) {
      data.push({ id: txt, item: `[${txt}](${link})` })
    } else {
      data.push({ id: txt, item: `[${txt}](http://www.hinhua.edu.my/cn/${link})` })
    }
  });
  txts.forEach(xd => {
    if (xd.length !== 1) {
      var check_item = data.filter(xdd => xdd.id === xd);
      if (check_item.length !== 0) {
        xddd.push(check_item[0].item)
      } else {
        xddd.push(xd)
      }
    }
  });
  var reply = xddd.join("\n");
  console.log(reply)
  return reply;
};
