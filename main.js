document.addEventListener('mousedown', mousedown, false);
document.addEventListener('mouseup', mouseup, false);
document.addEventListener('mousemove', mousemove, false);
var XcoordStart,XcoordFinish;
var Checkmousedown=false;
var blockArr = [] ;
//var accelcoef = 1.5;

var VisibleBlock;
var ResultOfSearch;
var currelementwidth = 300;
const maxSize = 320;
const YoutubeSearchPrefix = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&key=AIzaSyBj9fepxKAHCosi4l3mvAVX1IGMXCMXbEY&q=";//позволяет искать 20 результатов за раз на странице
const VideoPrefix = "https://www.youtube.com/watch?v="//далее id Video для ссылки на тытрубу
const VideoDetailsPrefix = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&key=AIzaSyBj9fepxKAHCosi4l3mvAVX1IGMXCMXbEY&id=";//для duration,
var InTheEnd = false;
var startTimeMouse;

///////////////////////////////////////////////////////////////youtube api loading
function onClientLoad() {
    gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}
////////////////////////////////////////////////////////////////
function onYouTubeApiLoad() {
    gapi.client.setApiKey('AIzaSyBj9fepxKAHCosi4l3mvAVX1IGMXCMXbEY');
}
///////////////////////////////////////////////////////////////
function mousedown(evt)
{
	Checkmousedown = true;

}

function mousemove(evt)
{
	 XcoordStart =  evt.screenX;
   var asf = new Date();
   startTimeMouse = asf;
  if (Checkmousedown )
	{
		VisibleBlock.scrollLeft += XcoordFinish-XcoordStart;
    var tospeed = XcoordFinish-XcoordStart;//для некой инерции движения


	}
	XcoordFinish = evt.screenX;
}

function resize(){
    let scrollpoint = VisibleBlock.scrollLeft;
    let curretSeen = Math.floor((scrollpoint+2)/currelementwidth);
    let newWindowSize = document.getElementById('body').clientWidth;
    let targetOnScreen = Math.floor(newWindowSize/maxSize) + 1;//макс кол-во элементов
    let targetBlockArraySize = targetOnScreen*maxSize;
    let targetAndWindowDif = newWindowSize - targetBlockArraySize;
    let sizeCurrection = targetAndWindowDif / targetOnScreen;
    let currectedSize = (maxSize + sizeCurrection - 20)+'px';
    for (var i = 0; i < blockArr.length; i++)
    {
      blockArr[i].style.width = currectedSize;
    }
    currelementwidth = maxSize + sizeCurrection;
    VisibleBlock.scrollLeft = curretSeen*currelementwidth;
}

function mouseup(evt)
{
	Checkmousedown = false;
  let endTimeDate = new Date();
  let intervalMouseUp = endTimeDate-startTimeMouse;
  let accelerate=2*abs(tospeed)/(intervalMouseUp*intervalMouseUp);
  acceleratemouse(accelerate);
}

function acceleratemouse(accelerate){
  if (!(Checkmousedown))
 {

   scrollItem.scrollLeft += tospeed;
   if (abs(tospeed) > accelerate){
     if(tospeed>0){
       tospeed-=accelerate*100/2;
     }
     else {
       tospeed+=accelerate*100/2;
     }
     setTimeOut(function(){ acceleratemouse();},10);
   }
   else{
   if (abs(tospeed) < accelerate){
      tospeed = 0;
    }
    }
    checkEndPage();
  }
}

function checkEndPage()
{
	let WindowSize = document.getElementById('body').clientWidth;
	if ((VisibleBlock.scrollLeft+WindowSize+5 > listBlock.clientWidth) && !(InTheEnd))
	{
		InTheEnd = true;
		NextPageRequest();
	}
	if (VisibleBlock.scrollLeft+WindowSize < listBlock.clientWidth - maxSize*2)
	{
		InTheEnd = false;
	}
}

function listclear(){
  listBlock = document.getElementById('listBlock');
	blockArr.forEach(function(entry)
	{
    	listBlock.removeChild(entry);
	});
    blockArr = [];
}

function NextPageRequest() {
  let StrRequest = document.getElementById('SearchValue').value;
  var xhr = new XMLHttpRequest();//загрузка данных с сервера
  xhr.open("GET",YoutubeSearchPrefix+ StrRequest + "&pageToken=" + ResultOfSearch.nextPageToken,false);//метод GET,YoutubeApiSearch+StrRequest описано выше
  xhr.send();
  if (xhr.status != 200) {
    //xhr.status запроса,если не 200 то ошибка
     //alert( xhr.status + ': ' + xhr.statusText );
   }
     else
   {
     ResultOfSearch = JSON.parse(xhr.responseText);
     //alert(xhr.responseText);
   }
   loading();
}

function FirstRequest(){
    listclear();//очистка перед новым поиском
   let StrRequest = document.getElementById('SearchValue').value;
   var xhr = new XMLHttpRequest();//загрузка данных с сервера
   xhr.open("GET",YoutubeSearchPrefix+StrRequest,false);//метод GET,YoutubeApiSearch+StrRequest
   xhr.send();
   if (xhr.status != 200) {
     //xhr.status запроса,если не 200 то ошибка
      alert( xhr.status + ': ' + xhr.statusText );
    }
      else
    {
      ResultOfSearch = JSON.parse(xhr.responseText);
      //alert(xhr.responseText);
    }
    loading();
}



function loading()
{
  VisibleBlock = document.getElementById('s');
  listBlock = document.getElementById('list');
  for (let i=0;i<ResultOfSearch.items.length;i++){ //let так как в пределах цикла
      if (!(ResultOfSearch.items[i].id.videoId==null)){
        var element = document.createElement('div');
      	element.className = 'block';
      	listBlock.appendChild(element);
      	blockArr.push(element); 					//сам блок
      	var a = document.createElement('a');		//ссылка
      	a.setAttribute("href", VideoPrefix + ResultOfSearch.items[i].id.videoId);
      	a.setAttribute("target", "_blank");
      	element.appendChild(a);

      	var img = document.createElement('img');  	//image
      	img.setAttribute("src",ResultOfSearch.items[i].snippet.thumbnails.high.url);
      	a.appendChild(img);
   		var h1 = document.createElement('h1');		//videoname
   		var t = document.createTextNode(ResultOfSearch.items[i].snippet.title);
   		h1.appendChild(t);
      	element.appendChild(h1);

      	var h2 = document.createElement('h2');		//channelTitle
   		var t = document.createTextNode("Channel: "+ ResultOfSearch.items[i].snippet.channelTitle);
   		h2.appendChild(t);
      	element.appendChild(h2);

     		var xhr = new XMLHttpRequest();
  		xhr.open("GET", VideoDetailsPrefix + ResultOfSearch.items[i].id.videoId, false); //duration request
  		xhr.send();
  		var statResult = JSON.parse(xhr.responseText);
  		var durationStr = statResult.items[0].contentDetails.duration;
  		durationStr = durationStr.replace(/PT/g,'');//period of time
      durationStr = durationStr.replace(/P/g,'');//period of time
      durationStr = durationStr.replace(/DT/g,'day(s)');//day time
      durationStr = durationStr.replace(/H/g,':');//hours
  		durationStr = durationStr.replace(/M/g,':');//minutes
  		durationStr = durationStr.replace(/S/g,'');
  		var p = document.createElement('p');		//duration
   		var t = document.createTextNode("Duration: " + durationStr);
   		p.appendChild(t);
      	element.appendChild(p);

      	var p = document.createElement('p');		//description
   		var t = document.createTextNode("Decsription: "+ResultOfSearch.items[i].snippet.description);
   		p.appendChild(t);
      	element.appendChild(p);
      	}
  	}
  	resize();


}
