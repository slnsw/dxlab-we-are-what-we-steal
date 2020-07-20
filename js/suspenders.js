'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var words = [106226, 287391, 256133, 339379, 353081, 414712, 436334, 381301, 405443, 437375, 346269, 351715, 385033, 434372, 424232, 414808, 455900, 496667, 564945, 570023, 588850, 598293, 609066, 601260, 608376, 447477, 471986, 440611, 442112, 431511, 461641, 505152, 509599, 516403, 494226, 509614, 494874, 495671, 499637, 527974, 530629],
    pop = [338003, 352954, 361731, 371592, 383657, 399368, 418337, 436113, 453294, 471657, 489388, 507348, 525449, 543515, 563408, 583673, 603328, 628067, 656954, 689865, 724904, 759084, 793214, 832401, 877301, 921535, 963693, 999063, 1029449, 1059215, 1093708, 1133223, 1168164, 1194827, 1219126, 1243629, 1263934, 1283977, 1306517, 1328330, 1349760],
    numYears = words.length,
    totalWords = d3.sum(words),
    //absMaxRate = 824, //'gold'
absMaxRate = 400,
    currentMaxRateCompare = 0,
    maxRatesCompare = {
  'a': 0,
  'b': 0
},
    xScale = d3.scaleLinear().domain([0, numYears - 1]).range([0, 100]),
    yScale = d3.scaleLinear().domain([0, absMaxRate]).range([0, 100]),
    troveUrl = 'https://trove.nla.gov.au/search/advanced/category/newspapers?date.from=1860-01-01&date.to=1900-12-31&sortBy=dateAsc&l-advtitle=1476&keyword=',
    setNotes = {
  'gold rush towns': 'based on places mentioned in the libray\'s <a href="https://www.sl.nsw.gov.au/stories/eureka-rush-gold" target="_blank">Eureka! The rush for gold →</a>',
  'a native of': "* based on the gazette format that described people as 'a native of _____'",
  'job': '* based on the top jobs following \'working\',\'works\', \'employed\',\'worked\' (the format used by the gazette). e.g. <a href="https://trove.nla.gov.au/search/advanced/category/newspapers?date.from=1860-01-01&date.to=1900-12-31&sortBy=dateAsc&l-advtitle=1476&keyword=%22employed%20as%22" target="_blank">employed as →</a>'
},
    termNotes = {
  'gray/grey hair': 'The gazette switched from using \'grey\' to \'gray\' in mid November 1869',
  'cabbagetree hat': 'made from the leaves of the cabbagetree palm, it was one of the first distinctively Australian hats',
  'Roman': '\'Roman nose\' often appeared in the descriptions of horses as well',
  //'Hyde Park': 'mention popularity of \'whilst drunk\' (32) \'whilst asleep\' (86) or \'drunk and asleep'' (101)',
  'masher hat': '\'mashers\' was the term used for men who would harass young women',
  'obscene language': '\'using obscene language\' was a crime, hence its frequency',
  //"selector" : "Selectors were...",
  //"squatter" : "Squatters were...",
  'gray/grey': 'The gazette switched from using \'grey\' to \'gray\' in mid November 1869',
  'riotous manner': '\'behaving in a riotous manner\' was a crime, hence its frequency',
  'alias': 'most alias was XX by XX. view on Trove here',
  'star(s) tattooed': 'star tattoos were often to symbolise finding one\'s way back home.',
  'moustache & goatee': 'aka the \'Van Dyke\'' //'chinstrap' : "aka the 'Abe'"

},
    mths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    rgbStr = {
  'people': '250, 200, 226',
  'places': '125, 244, 213',
  'things': '167, 188, 240'
},
    $body = d3.select('body'),
    $info = d3.select('#info'),
    pageId = $body.attr('id'),
    w = window.screen.width,
    //FIX!
isTouch = 'ontouchstart' in document.documentElement || 'ontouchstart' in window;

function roundTo(n, places) {
  var p = Math.pow(10, places);
  return Math.round(n * p) / p;
}

function ratePer100K(n) {
  return roundTo(n * 100000, 2);
}

function addRegex(rx) {
  var rx1 = rx[0].replace(/\x08/g, '\\b');
  return "regex used: /".concat(rx1, "/").concat(rx[1]);
}

if (isTouch) {
  $body.on('click', hideInfo);
}

function createPath(arr, max, w, h) {
  return d3.area().curve(d3.curveMonotoneX).x(function (d, i) {
    return d3.scaleLinear() //.domain([0, numYears-1])
    .domain([0, arr.length - 1]).range([0, w])(i);
  }).y0(function (d, i) {
    return d3.scaleLinear() //.scaleLog()
    .domain([max, 0]).range([0, h])(d);
  }).y1(h)(arr);
} // COMBINE!!!


function createLine(arr, max, w, h) {
  return d3.line().curve(d3.curveMonotoneX).x(function (d, i) {
    return d3.scaleLinear().domain([0, arr.length - 1]).range([0, w])(i);
  }).y(function (d, i) {
    return d3.scaleLinear().domain([max, 0]).range([0, h])(d);
  })(arr);
} // per 100K


function getRatesPerYear(arr) {
  var rates = [];
  arr.forEach(function (a, i) {
    rates.push(a / words[i] * 100000);
  });
  return rates;
}

function maxMaxIndex(arr) {
  var max = 0,
      maxIndex = 0,
      l = arr.length;

  for (var i = 0; i < l; i++) {
    var n = arr[i];

    if (n > max) {
      max = n;
      maxIndex = i;
    }
  }

  return [max, maxIndex];
}

function minMinIndex(arr) {
  var min = 10000,
      minIndex = 0,
      l = arr.length;

  for (var i = 0; i < l; i++) {
    var n = arr[i];

    if (n < min) {
      min = n;
      minIndex = i;
    }
  }

  return [min, minIndex];
} // SELECTIVE REPORTING


var $selectiveReporting = d3.select('#selective-reporting-years'),
    $selectiveReportingWrapper = d3.select('#selective-reporting .ie-sad-face'),
    $reportedMurders = d3.select('#reported-murders'),
    $reportedMurdersIND = $reportedMurders.select('.IND'),
    $reportedMurdersNonIND = $reportedMurders.select('.non-IND'),
    _murdersCount = [0, 0],
    //released = discharged or acquitted
reportedMurders = [{
  "desc": "20 Aboriginals killed near the Brewarinna Fish Traps, Barwon River",
  "url": "https://www.theguardian.com/australia-news/ng-interactive/2019/mar/04/massacre-map-australia-the-killing-times-frontier-wars?incident=166",
  "date": "1861-01-01",
  "actual": "1861-01-01",
  "S": "n",
  "V": "y"
}, {
  "desc": "Barney, Soldier, and Billy, Aboriginals, are suspected of murdering Laurence Bruce and Duncan McRae",
  "url": "https://trove.nla.gov.au/newspaper/article/252046631?searchTerm=Barney,%20Soldier,%20Billy",
  "date": "1862-06-11",
  "actual": "1862-04-26",
  "S": "y",
  "V": "n"
}, {
  // John Clarke did it: https://trove.nla.gov.au/newspaper/article/251747715?searchTerm=Billy%20Noonang%22
  "desc": "the body of Billy Noonang, aboriginal native, was found floating in the Shoalhaven River, near Ballalaba, with a chain round the waist, which was fastened to a bag containing stones; hot wound in breast",
  "url": "https://trove.nla.gov.au/newspaper/article/252041969?searchTerm=Billy%20Noonang",
  "date": "1865-11-22",
  "actual": "1865-11-13",
  "S": "n",
  "V": "y"
}, {
  "desc": "Charley, an aboriginal, charged with the wilful murder of Richard Hickson",
  "url": "https://trove.nla.gov.au/newspaper/article/252042033/27919289?searchTerm=Charley",
  "date": "1865-12-13",
  "actual": "1865-11-18",
  "S": "y",
  "V": "n"
}, {
  //acquitted: https://trove.nla.gov.au/newspaper/article/251750167/27959560?searchTerm=Peter%20Leigh%22
  "desc": "Peter Leigh and George Graham have been arrested by Senior Constable Moesch, Euston Police, on suspicion of having murdered black tracker Prince Albert",
  "url": "https://trove.nla.gov.au/newspaper/article/251749680/27959312?searchTerm=Peter%20Leigh%20George%20Graham",
  "date": "1868-09-30",
  "actual": "1868-09-09",
  "S": "n",
  "V": "y",
  "released": true
}, {
  "desc": "about <b>400 men, women & children</b> were killed at Hospital Creek, Brewarinna",
  "url": "https://www.theguardian.com/australia-news/ng-interactive/2019/mar/04/massacre-map-australia-the-killing-times-frontier-wars?incident=167",
  "date": "1870-01-01",
  "actual": "1870-01-01",
  "S": "n",
  "V": "y"
}, {
  // incident: https://trove.nla.gov.au/newspaper/article/252050182?searchTerm=Gungolgon
  "desc": "Lumpy, Jemmy, Harry, and Tommy Driver, aboriginals, charged with the murder of a man, name unknown, found in Marra Creek, near Gongolgan",
  "url": "https://trove.nla.gov.au/newspaper/article/252050320?searchTerm=Lumpy,%20Jemmy,%20Harry",
  "date": "1871-06-21",
  "actual": "1871-04-10",
  "S": "y",
  "V": "n"
}, {
  "desc": "Henry Percival, charged with the murder of Peter (an aboriginal), on the Warrego Road",
  "url": "https://trove.nla.gov.au/newspaper/article/251601768/27920716?searchTerm=Henry%20Percival",
  "date": "1872-03-06",
  "actual": "1872-01-24",
  "S": "n",
  "V": "y"
}, {
  // "shot a black boy". https://trove.nla.gov.au/newspaper/article/251602366?searchTerm=Croker
  "desc": "It has been reported that about 8 p.m., the 15th instant, a man named Croker shot a black boy named Gordon, at the Tea Gardens, Myall River",
  "url": "https://trove.nla.gov.au/newspaper/article/251602300/27920900",
  "date": "1872-09-25",
  "actual": "1872-09-15",
  "S": "n",
  "V": "y"
}, {
  "desc": "a man named Howell and a boy named Pullbrook, were murdered whilst encamped under their dray on the Gobanding Road, about ten miles from Forbes. Three aboriginals are suspected",
  "url": "https://trove.nla.gov.au/newspaper/article/251603186",
  "date": "1873-08-13",
  "actual": "1873-08-08",
  "S": "y",
  "V": "n"
}, {
  "desc": "Boney, an aboriginal, charged with the murder of William Mullens, at Wheelbah",
  "url": "https://trove.nla.gov.au/newspaper/article/251603206?searchTerm=Boney",
  "date": "1873-08-20",
  "actual": "1873-07-24",
  "S": "y",
  "V": "n"
}, {
  //insufficient evidence"
  "desc": "Eugene de Beramount, charged on suspicion of having caused the death of an aboriginal named Betsy, has been... Discharged, insufficient evidence",
  "url": "https://trove.nla.gov.au/newspaper/article/251603291/27921330?searchTerm=Eugene%20de%20Beramount",
  "date": "1873-09-17",
  "actual": "1873-09-17",
  "S": "n",
  "V": "y",
  "released": true
}, {
  // victim Chinese
  "desc": "Warrants have been issued by the Armidale Bench for the arrest of an aboriginal and his gin, charged with the murder of Ah Cheung",
  "url": "https://trove.nla.gov.au/newspaper/article/251603900",
  "date": "1874-05-06",
  "actual": "1874-04-09",
  "S": "y",
  "V": "n"
}, {
  // shot by police
  "desc": "Harry Ryan alias Flanagan, an aboriginal, charged with the murder of Ellen Barber, another aboriginal, has been shot dead at Euabolong, by Constable Caban, Condobolin Police",
  "url": "https://trove.nla.gov.au/newspaper/article/252087697",
  "date": "1875-03-03",
  "actual": "1875-03-03",
  "S": "n",
  "V": "y",
  "NB": "shot by police"
}, {
  //bail
  "desc": "Thomas Larkins, charged with having caused the death of Boney Jack, an aboriginal, at Lees Villa, Jindabyne",
  "url": "https://trove.nla.gov.au/newspaper/article/252087959?searchTerm=Boney%20Jack",
  "date": "1875-06-09",
  "actual": "1875-05-19",
  "S": "n",
  "V": "y",
  "bail": true
}, {
  "desc": "William George Brown and Sally (aboriginals), charged with the murder of one John Baker, at Newton Boyd",
  "url": "https://trove.nla.gov.au/newspaper/article/252088401?searchTerm=Newton%20Boyd",
  "date": "1875-11-10",
  "actual": "1875-10-26",
  "S": "y-2",
  "V": "n"
}, {
  //bail
  "desc": "Harry Giles, charged with the murder of Tommy, an Aboriginal, at Wilcannia",
  "url": "https://trove.nla.gov.au/newspaper/article/252089090?searchTerm=Harry%20Giles",
  "date": "1876-07-12",
  "actual": "1876-06-22",
  "S": "n",
  "V": "y",
  "bail": true
}, {
  "desc": "Turner, an Aboriginal, charged with the manslaughter of Frederick Towney, at Goorah, has been arrested by Constable McGarry, Moree Police",
  "url": "https://trove.nla.gov.au/newspaper/article/252089308?searchTerm=Turner",
  "date": "1876-09-27",
  "actual": "1876-09-27",
  "S": "y",
  "V": "n",
  "NB": "later upgraded to murder"
}, {
  "desc": "Yarrow Creek Tommy, alias Tommy McPherson (an aboriginal)... shot by police near Glen Innes",
  "url": "https://trove.nla.gov.au/newspaper/article/251895610?searchTerm=Tommy",
  "date": "1879-12-31",
  "actual": "1879-11-05",
  "S": "n",
  "V": "y",
  "NB": "shot by police"
}, {
  "desc": "Dickey Murry, an aboriginal, was murdered at Pinegobla Station, by another aboriginal named Tommy, who, on the 6th instant, was shot dead by Constable Clancy, Mogil Mogil Police",
  "url": "https://trove.nla.gov.au/newspaper/article/252052975",
  "date": "1882-07-26",
  "actual": "1882-07-05",
  "S": "n",
  "V": "y",
  "NB": "shot by police"
}, {
  "desc": "Two aboriginals, named Combo and Gibson, charged with the murder of Henry Kitz, at Jones' Hand have been arrested by the Cundletown Police",
  "url": "https://trove.nla.gov.au/newspaper/article/251653981",
  "date": "1885-09-30",
  "actual": "1885-09-26",
  "S": "y-2",
  "V": "n"
}, {
  // bail allowed
  "desc": "Herbert Bailey Pulver, charged on warrant with shooting and killing William Nerang (an aboriginal), at Kunopia, near Moree",
  "url": "https://trove.nla.gov.au/newspaper/article/251654295",
  "date": "1886-01-13",
  "actual": "1885-10-29",
  "S": "n",
  "V": "y",
  "bail": true
}, {
  "desc": "Serverin Mursczhavitz, who was speared by two aboriginals, at Bassin Creek, Dora Dora, Upper Murray",
  "url": "https://trove.nla.gov.au/newspaper/article/251638423",
  "date": "1891-05-13",
  "actual": "1891-05-02",
  "S": "y-2",
  "V": "n"
}, {
  "desc": "'Tommy' (aboriginal), charged with maliciously wounding Ellen Shiner, at West Maitland... Mrs. Shiner has since died",
  "url": "https://trove.nla.gov.au/newspaper/article/251638761",
  "date": "1891-09-09",
  "actual": "1891-08-19",
  "S": "y",
  "V": "n"
}, {
  //move??????????
  "desc": "It is now believed that Jarvis and his wife were murdered by an aboriginal named 'Supple Jacky', since deceased",
  "url": " https://trove.nla.gov.au/newspaper/article/251630871?searchTerm=Mundooran",
  "date": "1900-03-07",
  //"actual": "1899-09-15",
  "actual": "1873-11-07",
  "S": "y",
  "V": "n-2"
}, {
  "desc": "the residence of Mr. Mawbey... was entered by a number of aborigines, who murdered Helen Josephine Kerz (21), Grace Mawbey (16), Percival Mawbey (16), and Hilda Mawbey (11), and also seriously wounded Mrs. Mawbey and Elsie Clarke (19). Mrs. Mawbey died on the 24th, and Miss Clarke is not expected to recover",
  "url": "https://trove.nla.gov.au/newspaper/article/251631221/27948066",
  "date": "1900-07-25",
  "actual": "1900-07-20",
  "S": "y-4/5",
  "V": "n-5" //"NB": "Governor Brothers"

}, {
  // multiple events!!!
  "desc": "...two aborigines (no doubt Jimmy and Joe Governor) entered the residence of Alexander McKay, selector, at Sportman's Hollow, near Gulgong, and murdered Mr. McKay (60) and Mrs. McKay (60).",
  "url": "https://trove.nla.gov.au/newspaper/article/251631221/27948066",
  "date": "1900-07-25",
  "actual": "1900-07-23",
  "S": "y-2",
  "V": "n-2" //"NB": "Governor Brothers"

}, {
  "desc": "two aborigines (no doubt Jimmy and Joe Governor), rushed into the residence of Michael O'Brien... When relief came it was found that Mrs. O'Brien and Mrs. Bennett's son, 18 months' of age, had been murdered.",
  "url": "https://trove.nla.gov.au/newspaper/article/251631221/27948066",
  "date": "1900-07-25",
  "actual": "1900-07-24",
  "S": "y-2",
  "V": "n-2" //"NB": "Governor Brothers"

}, _defineProperty({
  //
  "desc": "Joe Governor (aboriginal), outlawed for murder, was, on the 31st ultimo, shot dead at Glen Rock, St. Clair, about 30 miles from Singleton, by Mr. John Wilkinson",
  "url": "https://trove.nla.gov.au/newspaper/article/251631474",
  "date": "1900-11-07",
  "actual": "1900-10-31",
  "S": "n",
  "V": "y",
  //"NB": "Governor Brothers"
  "NB": "at the inquest: \"We find that the said John Wilkinson was perfectly justified in shooting the said outlaw, Joe Governor\""
}, "NB", "shot by police")],
    murdersStr = "",
    dotW = 15;

var _loop = function _loop(i) {
  var thisYear = 1860 + i,
      yearCount = 0;
  murdersStr += "<g transform=\"translate(".concat(dotW * i, ")\" data-year=\"").concat(thisYear, "\">");
  reportedMurders.forEach(function (report, j) {
    //let year = report.date.split('-')[0]
    var year = report['actual'].split('-')[0];

    if (thisYear == year) {
      var classStr = '',
   a = report['S'],
   b = report['V'],
   url = report['url'],
   tmpStr = ""; // INDIGENOUS MURDERER(s), Non-INDIGENOUS VICTIM

      if (a.charAt(0) == 'y' && b.charAt(0) == 'n') {
 classStr = 'IND';
 _murdersCount[0]++;
      } // NON-INDIGENOUS MURDERER(s), INDIGENOUS VICTIM(s)
      else if (a.charAt(0) == 'n' && b.charAt(0) == 'y') {
   if (url.indexOf('guardian') > 0) {
     classStr = 'known';
   } else {
     classStr = 'non-IND';

     if (report['NB'] == 'shot by police') {
       classStr += ' shot';
     } else {
       _murdersCount[1]++;
     }
   }
 }

      if (classStr != '') {
 tmpStr = "<circle r=\"".concat(dotW / 2, "\" cx=\"0\" cy=\"-").concat(dotW * yearCount, "\" class=\"").concat(classStr, "\" data-index=\"").concat(j, "\"/>");

 if (!isTouch) {
   tmpStr = "<a href=\"".concat(url, "\">").concat(tmpStr, "</a>");
 }

 murdersStr += tmpStr;
 yearCount++;
      }
    }
  });
  murdersStr += "</g>";
};

for (var i = 0; i < numYears; i++) {
  _loop(i);
} // CHECK THESE!!!


// IE11
$selectiveReportingWrapper.html('<svg class="outer" viewBox="0 0 600 15" preserveAspectRatio="xMinYMin"><line class="base" x1="-100" y1="100%" x2="100%" y2="100%" transform="translate(50, 0)" /><g class="years" transform="translate(0, 0)"><line x1="0" y1="-60" x2="0" y2="100%" /><line x1="25%" y1="-60" x2="25%" y2="100%" /><line x1="50%" y1="-60" x2="50%" y2="100%" /><line x1="75%" y1="-60" x2="75%" y2="100%" /><line x1="100%" y1="-60" x2="100%" y2="100%" /></g><g id="selective-reporting-years" transform="translate(7, 7)">'+murdersStr+'</g><g class="arrow" transform="translate(300, 80)"><line x1="0" y1="-65" x2="0" y2="10" /><polyline points="-10,0 0,10 10,0" /></g><svg x="100%" y="100%" class="gov"><g transform="translate(7.5, -90)"><text x="0" y="-35" class="year">(1900)</text><text x="0" y="-22">Governor Brothers</text><text x="0" y="-10" class="t"><a href="https://www.sl.nsw.gov.au/stories/bushrangers-new-south-wales/governor-brothers">Read more</a></text><line x1="0" y1="0" x2="0" y2="30"></g></svg></svg>');
//$selectiveReporting.append(murdersStr);

var INDmurders = _murdersCount[0],
    nonINDmurders = _murdersCount[1],
    INDmurdersPercent = Math.round(INDmurders / (INDmurders + nonINDmurders) * 100),
    nonINDmurdersPercent = 100 - INDmurdersPercent;
$reportedMurders.select('.ratio').html(Math.round(INDmurders / nonINDmurders) + ':1');
$reportedMurders.select('.bar').style('height', "".concat(nonINDmurdersPercent, "%"));
$reportedMurders.select('.IND span').html("".concat(INDmurders, " incidents"));
$reportedMurders.select('.IND b').html("".concat(INDmurdersPercent, "%"));
$reportedMurders.select('.non-IND span').html("".concat(nonINDmurders, " incidents"));
$reportedMurders.select('.non-IND b').html("".concat(nonINDmurdersPercent, "%"));
$selectiveReportingWrapper.selectAll('circle').on(isTouch ? 'click' : 'mousemove', function () {
  var $node = d3.select(this),
      e = d3.event,
      xPos = e.pageX,
      yPos = e.pageY,
      i = $node.attr('data-index') * 1,
      d = reportedMurders[i],
      date = d['actual'].split('-'),
      url = d['url'],
      str = '';
  str = "<h3>".concat(mths[date[1] - 1], ", ").concat(date[0], "</h3>\n <div>\n     <p>\u201C").concat(d.desc, "\u201D</p>\n     <p><a href=\"").concat(url, "\" target=\"_blank\">click to view on</a></p>\n </div>");
  $info.attr('class', $node.attr('class')).attr("style", "left:".concat(xPos, "px;top:").concat(yPos, "px;display:block")).html(str);
  d3.event.stopPropagation();
}).on("mouseout", function () {
  if (!isTouch) {
    hideInfo();
  }
});

function hideInfo() {
  $info.attr('class', '').attr('style', '');
} // WORDS VS POP


d3.select('path.words').attr('d', createPath(words, 1000000, 500, 125));
d3.select('path.pop').attr('d', createPath(pop, 1000000, 500, 125));
var $setPeople = d3.select('#set-people'),
    $setPlaces = d3.select('#set-places'),
    $setThings = d3.select('#set-things'),
    $setNotes = d3.select('#set-notes'),
    topTowns = [//"Sydney",  
"Bathurst", "Maitland", "Parramatta", "Newcastle", "Newtown", "Goulburn", "Wagga Wagga", "Hay", "Orange", "Bourke", "Mudgee", "Darlinghurst", "Albury", "Dubbo", "Forbes", //"Liverpool",
"Balmain", "Armidale", "Tamworth", "Grafton", "Glebe", "Deniliquin"],
    topTownsDone = false;

function showSet(set, category) {
  var setArr = [],
      maxRateForSet = 0,
      maxAvgRateForSet = 0,
      $target = d3.select("#set-".concat(category)),
      str = "",
      filterStr = set == 'tatts (type)' ? 'tattooed' : set,
      firstTime = $target.attr('data-type') == null ? true : false,
      notes = setNotes[set],
      noteStr = notes != null ? notes : '';
  $target.attr('data-type', set); //console.warn('set : '+set)

  $setNotes.html(noteStr); // GET ALL TERMS FOR set... fix, so only do once!

  if (set == 'towns' && category == 'places') {
    var l = topTowns.length,
 l1 = places.length;

    for (var _i = 0; _i < l; _i++) {
      var name = topTowns[_i];

      for (var j = 0; j < l1; j++) {
 var thisPlace = places[j],
     tmpObj = {};

 if (thisPlace[0] == name) {
   tmpObj = {
     'name': name,
     'n': thisPlace[1],
     'rx': ['', '']
   };
   setArr.push(tmpObj);
   terms[name] = tmpObj;
   break;
 }
      }
    }

    topTownsDone = true;
  } else {
    for (var t in terms) {
      var thisTerm = terms[t];

      if (thisTerm['s'] == set) {
 thisTerm['name'] = t;
 setArr.push(thisTerm);
      }
    }
  } // CONVERT COUNTS TO RATES ETC AND GET MAX


  setArr.forEach(function (term, i) {
    var //name = term['name'],
    counts = term['n'],
 ratesPer100k = getRatesPerYear(counts),
 maxVals = maxMaxIndex(ratesPer100k),
 _avgRatesPer100k = roundTo(d3.sum(ratesPer100k) / numYears, 1);

    maxRateForSet = Math.max(maxRateForSet, maxVals[0]);
    maxAvgRateForSet = Math.max(maxAvgRateForSet, _avgRatesPer100k);
    term['_avgRatesPer100k'] = _avgRatesPer100k;
  }); // SORT DESCENDING!

  setArr.sort(function (a, b) {
    return b['_avgRatesPer100k'] - a['_avgRatesPer100k'];
  });
  var relYScale = d3.scaleLinear().domain([maxRateForSet, 0]).range([0, 100]); //for (let i=0;i<setArr.length;i++){

  for (var _i2 = 0; _i2 < 12; _i2++) {
    var term = setArr[_i2],
 _name = term['name'],
 nameClean = _name.replace(/\(e?s\)/g, '').trim(),
 d = getData(_name, maxRateForSet),
 total = d._total.toLocaleString(),
 yPos = relYScale(d._max),
 avgRate = d._avgRatesPer100k,
 opacity = .8 * avgRate / maxAvgRateForSet + .2,
 bgStr = "rgba(".concat(rgbStr[category], ", ").concat(opacity, ")"),
 url = getTroveURL(_name),
 NB = termNotes[_name],
 NBStr = NB != null ? NB : '',
 nameDisplay = nameClean;

    if (set == 'mt') {
      nameDisplay = nameDisplay.replace('Mount', 'Mt.');
    } else if (set == 'road') {
      nameDisplay = nameDisplay.replace('Road', 'Rd');
    } else if (set == 'st') {
      nameDisplay = nameDisplay.replace('Street', 'St');
    } else if (set == 'Hotel') {
      nameDisplay = nameDisplay.replace('The', '');
    } else if (set == 'Bank') {} else {
      nameDisplay = nameDisplay.replace(filterStr, '');
    }

    if (firstTime) {
      str += "<li class=\"".concat(d.flag, "\"> <div class=\"label\" style=\"background:").concat(bgStr, "\">     <h5 title=\"").concat(addRegex(d.data['rx']), "\" data-term=\"").concat(nameClean, "\">").concat(nameDisplay, "</h5>     <p><a href=\"").concat(url, "\">").concat(total, " mentions</a></p> </div> <svg>     <g class=\"years\" transform=\"translate(0, 0)\">  <line x1=\"25%\" y1=\"-8\" x2=\"25%\" y2=\"100%\"></line>  <line x1=\"50%\" y1=\"-8\" x2=\"50%\" y2=\"100%\"></line>  <line x1=\"75%\" y1=\"-8\" x2=\"75%\" y2=\"100%\"></line>     </g>     <svg class=\"paths\" viewBox=\"0 0 500 125\" preserveAspectRatio=\"none\">  <path d=\"").concat(d.pathStr, "\" />  <path class=\"abs\" d=\"").concat(d.pathStrAbs, "\" />     </svg>     <svg class=\"max\" x=\"").concat(d.xPos, "%\" y=\"").concat(yPos, "%\">  <circle r=\"2.5\" cx=\"0\" cy=\"0\" />  <text y=\"-7\">").concat(d._maxYear, "</text>     </svg>     <div class=\"note\">").concat(NBStr, "</div> </svg>    </li>");
    } else {
      var $li = $target.select(".terms li:nth-child(".concat(_i2 + 1, ")")),
   $label = $li.select('.label'),
   $max = $li.select('.max');
      $li.attr('class', d.flag);
      $label.style("background", bgStr).html("<h5 title=\"".concat(addRegex(d.data['rx']), "\" data-term=\"").concat(nameClean, "\">").concat(nameDisplay, "</h5><p><a href=\"").concat(url, "\" target=\"_blank\">").concat(total, " mentions</a></p>"));
      $li.select('path').transition().duration(333).attr('d', d.pathStr);
      $li.select('path.abs').transition().duration(333).attr('d', d.pathStrAbs);
      $max.transition().duration(333).attr('x', "".concat(d.xPos, "%")).attr('y', "".concat(yPos, "%"));
      $max.select('text').html(d._maxYear);
      $li.select('.note').html(NBStr);
    }
  }

  if (firstTime) {
    $target.select('.results').html("<ul class=\"terms\">".concat(str, "</ul>"));
  }
}

d3.selectAll('.set select').on('change', function () {
  var $node = d3.select(this),
      set = this.value;
  showSet(set, $node.attr('data-category'));
});
$setPeople.select('[value="appearance"]').property('selected', true);
$setPlaces.select('[value="towns"]').property('selected', true);
$setThings.select('[value="fabric"]').property('selected', true);
d3.selectAll('.set select').dispatch("change");

function getData(term, altMaxRate) {
  var data = terms[term],
      counts = data['n'],
      catStr = data['c'],
      rx = data['rx'],
      flagStr = '',
      ratesPer100k = getRatesPerYear(counts),
      maxVals = maxMaxIndex(ratesPer100k),
      _total = d3.sum(counts),
      _max = altMaxRate != null ? altMaxRate : maxVals[0],
      //_max = maxVals[0],
  _maxIndex = maxVals[1],
      _maxYear = 1860 + _maxIndex,
      pathStr = createPath(ratesPer100k, _max, 500, 125),
      //pathStrLine = createLine(ratesPer100k, _max, 500, 125),
  pathStrAbs = createLine(ratesPer100k, absMaxRate, 500, 125),
      pathStrAlt = '',
      xPos = xScale(_maxIndex),
      _avgRatesPer100k = roundTo(d3.sum(ratesPer100k) / numYears, 1),
      obj = {}; //if (data['*']!=null){


  if (rx[1] == 'gi' || /[\[\?\|]/.test(rx[0])) {
    flagStr = 'flag';
  }

  obj = {
    'data': data,
    'catStr': catStr,
    '_total': _total,
    // ACTUAL MAX!
    '_max': maxVals[0],
    '_maxIndex': _maxIndex[1],
    '_maxYear': _maxYear,
    'pathStr': pathStr,
    //'pathStrLine': pathStrLine,
    'pathStrAbs': pathStrAbs,
    'pathStrAlt': pathStrAlt,
    'xPos': xPos,
    '_avgRatesPer100k': _avgRatesPer100k,
    'ratesPer100k': ratesPer100k,
    'flag': flagStr
  };
  return obj;
} // ADD


d3.selectAll('.blockquote-wrapper').each(function () {
  var $wrapper = d3.select(this),
      str = "";
  $wrapper.selectAll('[data-term]').each(function () {
    var $node = d3.select(this),
 term = $node.attr('data-term'),
 d = getData(term),
 loc = $node.attr('data-loc'),
 shiftStr = '',
 svgStr = '';
    $node.classed(d.catStr, true);
    svgStr = "<svg viewBox=\"0 0 500 125\" preserveAspectRatio=\"none\"><path d=\"".concat(d.pathStr, "\" /><path class=\"abs\" d=\"").concat(d.pathStrAbs, "\" /> </svg> <svg x=\"").concat(d.xPos, "%\" y=\"0\" ><circle r=\"2.5\" cx=\"0\" cy=\"0\" /><text y=\"-8\">").concat(d._maxYear, "</text></svg>");
    str += "<div class=\"graph solo ".concat(loc, " ").concat(d.catStr, "\" data-name=\"").concat(term, "\"><svg>").concat(svgStr, "</svg><h5 title=\"").concat(addRegex(d.data['rx']), "\">").concat(term, "</h5><p><a href=\"").concat(getTroveURL(term), "\">").concat(d._total.toLocaleString(), " mentions</a></p></div>");
    this.insertAdjacentHTML('afterend', "<svg class=\"".concat(d.catStr, "\">").concat(svgStr, "</svg>"));
  });
  this.innerHTML += str;
}); // JOIN WITH QUOTES NUMBNUTS!!!

d3.selectAll('.photos div[data-term]').each(function (a, i) {
  var $node = d3.select(this),
      $dots = d3.select(this.parentNode).select('.dots'),
      term = $node.attr('data-term'),
      d = getData(term),
      str = ""; //add dot

  $dots.html($dots.html() + "<span data-term=\"".concat(term, "\"></span>"));
  $node.attr('data-c', i + 1);
  str += "<div class=\"graph ".concat(d.catStr, "\"><svg><svg viewBox=\"0 0 500 125\" preserveAspectRatio=\"none\"> <path d=\"").concat(d.pathStr, "\" /> <path class=\"abs\" d=\"").concat(d.pathStrAbs, "\" /></svg><svg x=\"").concat(d.xPos, "%\" y=\"0\"> <circle r=\"2.5\" cx=\"0\" cy=\"0\" /> <text y=\"-8\">").concat(d._maxYear, "</text>    </svg></svg><h5 title=\"").concat(addRegex(d.data['rx']), "\"  data-c=\"").concat($node.attr('data-c'), "\">").concat(term, "</h5><p><a href=\"").concat(getTroveURL(term), "\">").concat(d._total.toLocaleString(), " mentions</a></p></div>");
  this.innerHTML = str;
});
d3.selectAll('.by-quote [data-term]').each(function () {
  var $node = d3.select(this),
      term = $node.attr('data-term'),
      d = getData(term),
      str = "<div class=\"graph ".concat(d.catStr, "\"><svg><svg viewBox=\"0 0 500 125\" preserveAspectRatio=\"none\"> <path d=\"").concat(d.pathStr, "\" /> <path class=\"abs\" d=\"").concat(d.pathStrAbs, "\" /></svg><svg x=\"").concat(d.xPos, "%\" y=\"0\"> <circle r=\"2.5\" cx=\"0\" cy=\"0\" /> <text y=\"-8\">").concat(d._maxYear, "</text>    </svg></svg><h5 title=\"").concat(addRegex(d.data['rx']), "\">").concat(term, "</h5><p><a href=\"").concat(getTroveURL(term), "\">").concat(d._total.toLocaleString(), " mentions</a></p></div>");
  $node.attr('title', addRegex(d.data['rx']));
  this.parentNode.innerHTML += str;
}); // can be place or term!

d3.selectAll('.inline[data-term]').each(function () {
  var $node = d3.select(this),
      term = $node.attr('data-term'),
      d = getData(term),
      str = "<div class=\"graph ".concat(d.catStr, "\"><svg><svg viewBox=\"0 0 500 125\" preserveAspectRatio=\"none\"> <path d=\"").concat(d.pathStr, "\" /> <path class=\"abs\" d=\"").concat(d.pathStrAbs, "\" /></svg><svg x=\"").concat(d.xPos, "%\" y=\"0\"> <circle r=\"2.5\" cx=\"0\" cy=\"0\" /> <text y=\"-8\">").concat(d._maxYear, "</text>    </svg></svg><h5 title=\"").concat(addRegex(d.data['rx']), "\">").concat(term, "</h5><p><a href=\"").concat(getTroveURL(term), "\">").concat(d._total.toLocaleString(), " mentions</a></p></div>");
  this.innerHTML += str;
}); // GENDER

var $gender = d3.select('#gender'),
    $genderMaxM = $gender.select('.max-M'),
    $genderMaxF = $gender.select('.max-F'),
    genderOpts = {
  'female': ['female', 'male'],
  'she': ['she', 'he'],
  'her': ['her', 'him'],
  'woman': ['woman', 'man'],
  'girl': ['girl', 'boy']
};

function showGender(opt) {
  var genderBreakdown = [],
      termF = genderOpts[opt][0],
      termM = genderOpts[opt][1],
      sheCount = terms[termF]['n'],
      heCount = terms[termM]['n'];

  for (var _i3 = 0; _i3 < numYears; _i3++) {
    var she = sheCount[_i3],
 he = heCount[_i3];
    genderBreakdown.push(he / (he + she));
  }

  var genderMaxVals = maxMaxIndex(genderBreakdown),
      genderMinVals = minMinIndex(genderBreakdown),
      genderMaxIndex = genderMaxVals[1],
      genderMinIndex = genderMinVals[1],
      percentMax = Math.round(genderMaxVals[0] * 100),
      percentMin = Math.round(genderMinVals[0] * 100),
      avgM = Math.round(d3.mean(genderBreakdown) * 100),
      avgF = 100 - avgM;
  $gender.select('li:first-child').html("'".concat(termF, "' (avg. ").concat(avgF, "%)"));
  $gender.select('li:last-child').html("'".concat(termM, "' (avg. ").concat(avgM, "%)"));
  $gender.select('path').transition().duration(333).attr('d', createPath(genderBreakdown, 1, 500, 125));
  $genderMaxF.transition().duration(333).attr('x', "".concat(xScale(genderMinIndex), "%")).attr('y', "".concat(100 - percentMin, "%"));
  $genderMaxM.transition().duration(333).attr('x', "".concat(xScale(genderMaxIndex), "%")).attr('y', "".concat(100 - percentMax, "%"));
  $genderMaxM.select('text').html(1860 + genderMaxIndex);
  $genderMaxM.select('.opt').html("'".concat(termM, "'<!--(").concat(percentMax, "%)--></text>"));
  $genderMaxF.select('text').html(1860 + genderMinIndex);
  $genderMaxF.select('.opt').html("'".concat(termF, "'<!--(").concat(100 - percentMin, "%)--></text>"));
}

d3.select('#gender select').on('change', function () {
  showGender(this.value);
});
showGender('woman'); // MAP

var $allTowns = d3.select('#all-towns'),
    $allTownsOuter = $allTowns.select('.outer'),
    $allTownsInner = $allTowns.select('.inner'),
    $allTownsMax = $allTowns.select('.max'),
    $thisYearMarker = $allTowns.select('#this-year-marker'),
    $currentYear = d3.selectAll('.current-year'),
    $townCount = d3.select('#town-count'),
    //allW = 760,
//allH = 60,
uniqueMentionedByYear = [],
    totalMentionedByYear = [],
    numTowns = places.length,
    maxTowns = [],
    townNotes = {}; //POPULATE ARRAYS

for (var _i4 = 0; _i4 < numYears; _i4++) {
  uniqueMentionedByYear.push(0);
  totalMentionedByYear.push(0);
} // GET YEARLY COUNT FOR GRAPH


places.forEach(function (a, i) {
  var mentions = a[1]; // THIS IS TERRIBLE! FIX
  //trimmed = mentions.slice(0, numYears)
  // CHECK EACH YEAR TO SEE MENTIONS

  mentions.forEach(function (b, j) {
    if (b > 0) {
      uniqueMentionedByYear[j]++;
      totalMentionedByYear[j] += b;
    }
  });
});
maxTowns = maxMaxIndex(uniqueMentionedByYear);
$townCount.html(uniqueMentionedByYear[0]);
var trackCurrent = '';
$allTownsInner.append('path').attr('d', createPath(uniqueMentionedByYear, maxTowns[0], 500, 125));
$allTownsMax //.attr('x',(maxTowns[1]/numYears)*100+'%')
.attr('x', "".concat(xScale(maxTowns[1]), "%")).select('text').text(1860 + maxTowns[1]);

function rescaleTowns(k) {
  $towns.each(function () {
    var $node = d3.select(this),
 currentTransforms = $node.attr('transform'),
 newTransforms = currentTransforms.replace(/scale\([\d.]+\)/g, '').trim();
    $node.attr('transform', "".concat(newTransforms, " scale(").concat(1 / k, ")"));
  });
  d3.select('.state').style('stroke-width', 1 / k);
}

function getReadyForReset() {
  if (window.innerWidth > 760) {
    $theMap.call(zoom.transform, d3.zoomIdentity);
    $zoomable.attr('transform', '');
    window.removeEventListener('resize', getReadyForReset);
    mapMode = false;
    rescaleTowns(1);
  }
}

function zoomed() {
  if (window.innerWidth <= 760) {
    var k = d3.event.transform.k;
    $zoomable.attr("transform", d3.event.transform); // only if k changed
    // console.log(k);

    if (
    /*Number.isInteger(k) && */
    k != currentScale
    /*&& k>1*/
    ) {
 rescaleTowns(k);
 currentScale = k;
      }

    if (mapMode == false) {
      window.addEventListener("resize", getReadyForReset);
      mapMode = true;
    }
  }
}

var mapWidth = 700,
    mapHeight = 650,
    mapMode = false,
    //LONG, LAT!!!!
centre = [147.25, -33.25],
    $theMap = d3.select('#the-map').append('svg').attr('width', mapWidth).attr('height', mapHeight),
    zoom = d3.zoom().on("zoom", zoomed),
    currentScale = 1,
    $zoomable = $theMap.append('g'),
    $townsLayer = $zoomable.append('g').attr('class', 'towns'),
    mercatorProj = d3.geoMercator().scale(3250).center(centre).translate([mapWidth / 2, mapHeight / 2]),
    townCounter = 0,
    $selectTowns = d3.select('#select-towns'),
    $selectYourTown = d3.select('#select-your-town'),
    _townsDropdown = ''; //not ipad, fix this!
//if (w < 768){

if (window.innerWidth <= 760) {
  $theMap.call(zoom);
}

$zoomable.selectAll('path').data(NSWGeoJSON.features).enter().append('path').attr('class', 'state').attr('d', d3.geoPath().projection(mercatorProj));
d3.select('#reset').on('click', function () {
  $theMap.transition().duration(333).call(zoom.transform, d3.zoomIdentity);
}); // SYDNEY STUFF

var sydWidth = 305,
    sydHeight = 305,
    sydCentre = [150.95, -33.84],
    sydTopLeft = [150.6, -33.5],
    sydBottomLeft = [150.6, -34.2],
    sydOffset = mercatorProj([151.8, -34.3]),
    $sydneyMap = d3.select('#sydney-map').append('svg'),
    sydProj = d3.geoMercator().scale(20000).center(sydCentre).translate([sydWidth / 2, sydHeight / 2]);

function setStyle(i, yearIndex) {
  var n = places[i][1][yearIndex],
      rate = ratePer100K(n / words[yearIndex]),
      opacity = 0,
      px = 0;

  if (rate > 100) {
    opacity = .85;
    px = 17;
  } else if (rate > 10) {
    opacity = .7;
    px = 14.5;
  } else if (rate > 1) {
    opacity = .55;
    px = 12;
  } else if (rate > .1) {
    opacity = .4;
    px = 9.5;
  } else if (rate > 0) {
    opacity = .25;
    px = 7;
  } // scale ?


  return "opacity:".concat(opacity, ";font-size:").concat(px, "px");
} // INITIAL


places.forEach(function (a, i) {
  var name = a[0],
      counts = a[1],
      //counts = a[1].slice(0, numYears),
  pos = a[2],
      lat = pos[0],
      lng = pos[1],
      cssStr = setStyle(i, 0);
  $townsLayer.append('text').text(name).attr('style', cssStr).attr('data-i', i).attr('transform', 'translate(' + mercatorProj([lng, lat]) + ')'); // SYDNEY ONES 
  // GIVEN NEG, > IS REVERSED!

  if (lat > -34.2 && lat < -33.5 && lng > 150.6) {
    $sydneyMap.append('text').text(name).attr('style', cssStr).attr('data-i', i).attr('transform', 'translate(' + sydProj([lng, lat]) + ')');
  } // MAKE DROPDOWN!  


  _townsDropdown += "<option value=\"".concat(name, "\">").concat(name, "</option>");
});

function getTroveURL(term) {
  return "".concat(troveUrl, "%22").concat(term.replace(/ /g, '%20').replace(/\(s\)/g, ''), "%22");
}

function getPlaceData(name) {
  var i = 0,
      thisPlace;

  for (i; i < numTowns; i++) {
    var place = places[i];

    if (name == place[0]) {
      thisPlace = place;
      break;
    }
  }

  var counts = thisPlace[1],
      ratesPer100k = getRatesPerYear(counts),
      maxVals = maxMaxIndex(ratesPer100k),
      _total = d3.sum(counts),
      _max = maxVals[0],
      _maxIndex = maxVals[1],
      _maxYear = 1860 + _maxIndex,
      pathStr = createPath(ratesPer100k, _max, 500, 125),
      pathStrAbs = createLine(ratesPer100k, absMaxRate, 500, 125),
      xPos = xScale(_maxIndex),
      _avgRatesPer100k = roundTo(d3.sum(ratesPer100k) / numYears, 1),
      obj = {
    'data': thisPlace,
    '_total': _total,
    '_max': maxVals[0],
    '_maxIndex': _maxIndex[1],
    '_maxYear': _maxYear,
    'pathStr': pathStr,
    'pathStrAbs': pathStrAbs,
    'xPos': xPos,
    'ratesPer100k': ratesPer100k,
    '_avgRatesPer100k': _avgRatesPer100k
  };

  return obj;
}

d3.selectAll('.inline[data-place]').each(function () {
  var $node = d3.select(this),
      place = $node.attr('data-place'),
      d = getPlaceData(place),
      str = "<div class=\"graph places\"><svg><svg viewBox=\"0 0 500 125\" preserveAspectRatio=\"none\"> <path d=\"".concat(d.pathStr, "\" /> <path class=\"abs\" d=\"").concat(d.pathStrAbs, "\" /></svg><svg x=\"").concat(d.xPos, "%\" y=\"0\"> <circle r=\"2.5\" cx=\"0\" cy=\"0\" /> <text y=\"-8\">").concat(d._maxYear, "</text>    </svg></svg><h5>").concat(place, "</h5><p><a href=\"").concat(getTroveURL(place), "\">").concat(d._total.toLocaleString(), " mentions</a></p></div>");
  this.innerHTML += str;
}); // FIX

function showTown(name) {
  var d = getPlaceData(name),
      $label = $selectTowns.select('.label'),
      $max = $selectTowns.select('.max');
  $label.html("<a href=\"".concat(getTroveURL(name), "\" target=\"_blank\">").concat(d._total.toLocaleString(), " mentions</a>    <span>Avg. rate: ").concat(d._avgRatesPer100k, "/100K</span>"));
  $selectTowns.transition().duration(333).select('path').attr('d', d.pathStr);
  $selectTowns.transition().duration(333).select('path.abs').attr('d', d.pathStrAbs);
  $max.transition().duration(333).attr('x', "".concat(d.xPos, "%"));
  $max.select('text').html(d._maxYear);
}

$selectYourTown.html("<option>Select a town</option>".concat(_townsDropdown)).on('change', function () {
  var name = this.value,
      i = this.selectedIndex; // first is 'Select a town'

  if (i != 0) {
    //showTown(name, i+1)
    showTown(name);
  }
});
var $towns = d3.selectAll('#maps-wrapper text'),
    debouncer;

function updateTowns(yearIndex) {
  debouncer = setTimeout(function () {
    $towns.each(function () {
      var $node = d3.select(this),
   i = $node.attr('data-i') * 1;
      $node.attr('style', setStyle(i, yearIndex));
    });
  }, 75);
}


d3.select('#slider input').on('input change', function () {
  clearTimeout(debouncer);
  var yearIndex = this.value * 1,
      w = $allTownsOuter.node().getBBox().width,
      chunk = w / (numYears - 1),
      year = 1860 + yearIndex;
  $currentYear.html(year);
  $townCount.html(uniqueMentionedByYear[yearIndex]);
  $thisYearMarker.attr('transform', "translate(".concat(chunk * yearIndex - 0, " 0)"));
  updateTowns(yearIndex);
});


d3.select('#maps-wrapper').attr('class', 'ready');
$selectYourTown.select('option[value="Sydney"]').property('selected', true);
$selectYourTown.dispatch("change");
d3.selectAll('[href^=http]').attr('target', '_blank').attr('title', function () {
  var url = this.href.toString(),
      str = '';

  if (url.indexOf('trove') > 0) {
    str = 'View on Trove';
  }

  return str;
});
d3.select('#msg a.btn').on('click', function () {
  d3.select('#racism').classed('agreed', true);
}); // PAGE SPECIFIC, SWITCH!
// HOME

if (pageId == 'intro') {
  var updateTerm = function updateTerm(opt, term, skipCheck) {
    var data = terms[term],
 counts = data['n'],
 catStr = data['c'],
 ratesPer100k = getRatesPerYear(counts),
 maxVals = maxMaxIndex(ratesPer100k),
 _max = maxVals[0],
 otherOpt = opt == 'a' ? 'b' : 'a'; // CHECK IF MAX

    if (!skipCheck) {
      maxRatesCompare[opt] = _max;
      var tmpMax = Math.max(maxRatesCompare['a'], maxRatesCompare['b']); // CHECK IF  (UP OR DOWN!)

      if (currentMaxRateCompare != tmpMax) {
 currentMaxRateCompare = tmpMax;
 updateTerm(otherOpt, d3.select("#compare .".concat(otherOpt, " select")).property("value"), true);
      }
    }

    var $svg = d3.select("#compare svg.".concat(opt)),
 _maxIndex = maxVals[1],
 _maxYear = 1860 + _maxIndex,
 pathStr = createPath(ratesPer100k, currentMaxRateCompare, 500, 125),
 xPos = xScale(_maxIndex),
 yPos = d3.scaleLinear().domain([currentMaxRateCompare, 0]).range([0, 100])(_max);

    d3.select("#compare path.".concat(opt)).transition().duration(333).attr('d', pathStr).attr('data-type', catStr).attr('data-max', _max);
    $svg.transition().duration(333).attr('x', "".concat(xPos, "%")).attr('y', "".concat(yPos, "%"));
    $svg.select('text').text(_maxYear);
    $svg.select('.t').text(term);
  };

  var setDropdown = function setDropdown($node, value) {
    $node.select("[value=\"".concat(value.trim(), "\"]")).property('selected', true);
    $node.dispatch("change");
  };

  var $compare = d3.select('#compare'),
      $compareDropdowns = $compare.selectAll('select'),
      $dropdownA = $compare.select('.a select'),
      $dropdownB = $compare.select('.b select');
  $dropdownB.html($dropdownA.html());
  $compareDropdowns.on('change', function () {
    var $node = d3.select(this),
 $parent = d3.select(this.parentNode),
 opt = $parent.attr('class') == 'a' ? 'a' : 'b',
 opp = opt == 'a' ? 'b' : 'a',
 $opp = d3.select("#compare .".concat(opp, " select")),
 term = this.value,
 i = this.selectedIndex; // show old in other

    $opp.selectAll(".hide").attr('class', ''); // hide current in other

    $opp.select("option:nth-child(".concat(i + 1, ")")).attr('class', 'hide');
    updateTerm(opt, term);
  });
  $compare.classed('ready', true).selectAll('[data-compare]').on('click', function () {
    var $node = d3.select(this),
 vals = $node.attr('data-compare').split(',');
    setDropdown($dropdownA, vals[0]);
    setDropdown($dropdownB, vals[1]);
  });
  setDropdown($dropdownA, 'public-house');
  setDropdown($dropdownB, 'tobacco');
}