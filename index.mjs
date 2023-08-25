import fetch from 'node-fetch';
import http from 'http';
import transformBody from './modules/body-transform.mjs';
import addCorsHeaders from './modules/cors-headers.mjs';
import {normalizeRequest,mapResHeaders} from './modules/http-fetch.mjs';
import {csscalc} from './modules/csscalc.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import maintain from './modules/auto-maintain.mjs';
import {availReq,availRes} from './modules/availability.mjs';
import './modules/x.mjs';
import './modules/vercel-caches.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let path_join = path.join;

let server = http.createServer(availReq(onRequest));

server.listen(3000);
maintain(server);

async function onRequest(req, res) {
    
  req.socket.setNoDelay();
  res.socket.setNoDelay();
  
 res=availRes(res);
  let hostList = [];
  const defaultHostProxy='lenguapedia.org';
  let hostProxy = defaultHostProxy;

  let hostTarget = '-m-wikipedia-org.translate.goog';
  let hostIncubator = 'incubator-wikimedia-org.translate.goog/wiki/Wp/';
  let hostWiki = '.m.wikipedia.org';
  let hostEn = 'lenguapedia-en.vercel.app';
  hostList.push(hostEn);
  let localhost=req.headers['host'];
  hostProxy = req.headers['host-proxy']||hostProxy;
  let wikiPrefix = req.headers['wiki-prefix']||'en';
  let langFrom = req.headers['lang-from']||'auto';
  let langTo = req.headers['lang-to']||'en';
  let xlangs = 'en.en';

  if(hostProxy.toLowerCase()=='host'){hostProxy=defaultHostProxy;}
  if(wikiPrefix.toLowerCase()=='host'){wikiPrefix='en';}
  if(langTo.toLowerCase()=='host'){langTo='en';}
  if(langFrom.toLowerCase()=='host'){langFrom='auto';}
  
  if((langFrom.toLowerCase()=='auto') || (wikiPrefix==langFrom)){

      xlangs = wikiPrefix+'.'+langTo;
       
  }else{

      xlangs = wikiPrefix+'2'+langFrom+'.'+langTo;
    
  }
  

  let bkcolor = csscalc(wikiPrefix) + csscalc(langFrom) + csscalc(langTo);
  hostTarget = wikiPrefix + hostTarget;
  hostWiki = wikiPrefix + hostWiki;
  hostIncubator = hostIncubator+wikiPrefix;
  hostList.push(hostWiki);
  hostList.push(hostTarget);
  hostList.push(hostIncubator);
  let hashWord = unhache(req.url.toString());
  let hash = '';
  if (wikiPrefix == 'en') {
    hostTarget = 'lenguapedia--en-vercel-app.translate.goog';
    hostIncubator = 'incubator-wikimedia-org.translate.goog';
    hostWiki = 'en.m.wikipedia.org';
    hostList.push(hostWiki);
    hostList.push(hostTarget);
    hash=hache(hashWord);
  }



  let translator = '_x_tr_sl=' + langFrom + '&_x_tr_tl=' + langTo + '&_x_tr_hl=en&_x_tr_pto=wapp';


  let path = removeHache(req.url.replaceAll('*', ''));
  let pat = path.split('?')[0].split('#')[0];



  /*respond to ping from uptime robot*/
  if (path == '/ping') {
    res.statusCode = 200;
    return res.endAvail();
  }
  if ((pat == '/static/link-resolver.v.js')||(pat == '/static/inject-langs.js')){
    let resp=await fetch('https://files-servleteer.vercel.app/lenguapedia/default'+pat.replace('/static',''));
    res.setHeader('Content-Type', 'text/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 200;
    return res.endAvail(await resp.text());
  }


  if (pat == '/static/mods.css') {


    let resp=await fetch('https://files-servleteer.vercel.app/lenguapedia/default/mods.css');
    let file = (await resp.text()).replaceAll('cce9ff',bkcolor);
    res.setHeader('Content-Type',resp.headers.get('Content-Type'));
   
    return res.endAvail(file);
  }

  if (pat == '/robots.txt') {
    res.statusCode = 200;
    return res.endAvail(
      `User-agent: *
      Allow: /`
    );
  }

  req.headers.host = hostTarget;
  req.headers.referer = hostTarget;

  let reqDTO = await normalizeRequest(req);

    /* fetch from your desired target */


let char='?';
  if(path.includes('?')){char='&';}
  if(!path.includes('wapp')){path=path+char+translator;}
  let response = await tryURLs([hostTarget,hostIncubator,hostWiki,hostEn],path,hash,reqDTO);
  response = response||new Response();
    /* copy over response headers */
   Q(U=>{res = mapResHeaders(res,response);})

    res = addCorsHeaders(res);

    /* check to see if the response is not a text format */
    let ct = response.headers.get('content-type');
    res.setHeader('content-type', ct);
    res.setHeader('Cloudflare-CDN-Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    res.setHeader('Vercel-CDN-Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    res.setHeader('CDN-Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    res.setHeader('Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    res.setHeader('Surrogate-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');

    if ((ct) && (!ct.includes('image')) && (!ct.includes('video')) && (!ct.includes('audio'))) {
     /* if (!path.includes('wapp')||!path.includes('langs=')) {
     
       let langs='&langs='+xlangs;
        res.setHeader('location', 'https://' + hostProxy + pat + '?'+translator+langs);
        res.statusCode = 301;
        return res.endAvail();

      }*/

      /* Copy over target response and return */
      let resBody = await response.text();



      return res.endAvail(transformBody(resBody, ct, hostList, hostProxy,xlangs,bkcolor));


    } else {
    let resBody = Buffer.from(await(response).arrayBuffer());
    res.setHeader('Content-Type',ct);

    return res.endAvail(resBody);

    }



}


async function tryURLs(urlList,path,hash,reqDTO){
  const urlList_length=urlList.length;    
  for(let i=0;i<urlList_length;i++){try {
    
    let response = await fetch('https://' + urlList[i] + path + hash, reqDTO);
    if(response.status<400){
      return response;
    }
    
    } catch (e) {continue;}}

return;
  
}