import {addLangs} from './langs.mjs';
await import('./preload-css.js');

export default function transformBody(resBody, ct, hostList, hostProxy,xlangs) {
  const hostList_length = hostList.length;
  if (ct.includes('javascript')) {
    for (let i = 0; i < hostList_length; i++) {
      resBody = resBody.replaceAll(hostList[i], hostProxy);
    }
  }


  resBody = resBody.replace('<head>',
    `<head modified>
      <lenguapedia`+
    `   host-list="` + btoa(JSON.stringify(hostList)) +
    `"  host-Proxy="` + btoa(hostProxy) +
    `" xlangs="`+xlangs+`"></lenguapedia>`
      +preloadCSS+                     
      `<script src="/static/link-resolver.v.js?4"></script>
      <script src="/static/inject-langs.js?2"></script>
      <link rel="stylesheet" href="/static/mods.css">
`);

  resBody = resBody
    .replaceAll('rel="nofollow"', '')
    .replaceAll('content="noindex"', '')
    .replaceAll('content="none"', '')
    .replaceAll('noindex', '')
    .replaceAll('content="nosnippet"', '');

  //resBody = addLangs(resBody,xlangs);

  return resBody;
}