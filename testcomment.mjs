import fs from 'node:fs/promises';

const response = await fetch('https://www.youtube.com/youtubei/v1/next?prettyPrint=false', {
  credentials: 'include',
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    Accept: '*/*',
    'Accept-Language': 'en-US',
    'Content-Type': 'application/json',
    'X-Goog-Visitor-Id': 'Cgs3eEVSUEdaT2NEUSj_hMewBjIKCgJDSBIEGgAgUg%3D%3D',
    'X-Youtube-Bootstrap-Logged-In': 'true',
    'X-Youtube-Client-Name': '1',
    'X-Youtube-Client-Version': '2.20240403.07.00',
    Authorization: 'SAPISIDHASH 1712440426_c597eeee05d8e3475f23a6a637b9cc02023f15e1',
    'X-Goog-AuthUser': '0',
    'X-Origin': 'https://www.youtube.com',
    'Alt-Used': 'www.youtube.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'same-origin',
    'Sec-Fetch-Site': 'same-origin',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache'
  },
  referrer: 'https://www.youtube.com/watch?v=Fo-k-Qosy8A',
  body: '{"context":{"client":{"hl":"en","gl":"CH","remoteHost":"2a02:168:820a:0:0:0:0:1f03","deviceMake":"","deviceModel":"","visitorData":"Cgs3eEVSUEdaT2NEUSj_hMewBjIKCgJDSBIEGgAgUg%3D%3D","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0,gzip(gfe)","clientName":"WEB","clientVersion":"2.20240403.07.00","osName":"Windows","osVersion":"10.0","originalUrl":"https://www.youtube.com/watch?v=Fo-k-Qosy8A","screenPixelDensity":1,"platform":"DESKTOP","clientFormFactor":"UNKNOWN_FORM_FACTOR","configInfo":{"appInstallData":"CP-Ex7AGEJP8rwUQlpWwBRCmmrAFEO_NsAUQzMOwBRDynP8SEIjjrwUQzN-uBRDKw7AFEIKi_xIQieiuBRD8hbAFEKO7sAUQiIewBRCDv7AFEOrDrwUQmvCvBRDrk64FENbWsAUQj8SwBRCBpLAFEO6irwUQ57qvBRCJzrAFEPSrsAUQ48qwBRD8sLAFEKiasAUQ0I2wBRDMof8SEKXC_hIQt--vBRDeiP8SELPQsAUQntCwBRDcgrAFEKKBsAUQopKwBRC3q7AFEOHyrwUQ2cmvBRC9mbAFEL-f_xIQ3ej-EhDzobAFEMn3rwUQxsOwBRCVzbAFEL22rgUQxMOwBRCTzbAFEOvo_hIQpbuwBRDbr68FEMjDsAUQ4tSuBRCLz7AFEJeDsAUQvvmvBRDwsrAFENShrwUQjcywBRDGubAFEParsAUQt-r-EhDq0bAFEL6KsAUQof23IhDX6a8FEIPfrwUQu9KvBRCWmf8SEM-osAUQx86wBRDgw7AFEO6zsAUQ1YiwBRChw7AFEPGcsAUQkLKwBRC8-a8FENPhrwUQkf23IhD-oP8SELTKsAUQmMWwBSosQ0FNU0d4VVFvTDJ3RE5Ia0JyTHg5Z3YycHdiWkctcXhCTHZHaXcwZEJ3PT0%3D"},"screenDensityFloat":1.25,"userInterfaceTheme":"USER_INTERFACE_THEME_DARK","timeZone":"Europe/Zurich","browserName":"Firefox","browserVersion":"124.0","acceptHeader":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8","deviceExperimentId":"ChxOek0xTkRnM016VXhPREl3TkRVNU1EUXdNUT09EP-Ex7AGGP-Ex7AG","screenWidthPoints":1531,"screenHeightPoints":1019,"utcOffsetMinutes":120,"mainAppWebInfo":{"graftUrl":"https://www.youtube.com/watch?v=Fo-k-Qosy8A","pwaInstallabilityStatus":"PWA_INSTALLABILITY_STATUS_UNKNOWN","webDisplayMode":"WEB_DISPLAY_MODE_BROWSER","isWebNativeShareAvailable":false}},"user":{"lockedSafetyMode":false},"request":{"useSsl":true,"internalExperimentFlags":[],"consistencyTokenJars":[]},"clickTracking":{"clickTrackingParams":"CAAQg2ciEwiMsMnEya6FAxV850IFHfAWDiI="},"adSignalsInfo":{"params":[{"key":"dt","value":"1712439976537"},{"key":"flash","value":"0"},{"key":"frm","value":"0"},{"key":"u_tz","value":"120"},{"key":"u_his","value":"2"},{"key":"u_h","value":"1152"},{"key":"u_w","value":"2048"},{"key":"u_ah","value":"1104"},{"key":"u_aw","value":"2048"},{"key":"u_cd","value":"24"},{"key":"bc","value":"31"},{"key":"bih","value":"1019"},{"key":"biw","value":"1514"},{"key":"brdim","value":"-2055,-7,-2055,-7,2048,0,2062,1118,1531,1019"},{"key":"vis","value":"1"},{"key":"wgl","value":"true"},{"key":"ca_type","value":"image"}]}},"continuation":"Eg0SC0ZvLWstUW9zeThBGAYy5AQKugRnZXRfcmFua2VkX3N0cmVhbXMtLUN1Y0NDSUFFRlJlMzBUZ2EzQUlLMXdJSTJGOFFnQVFZQnlMTUFvczFERTlJZE44b2dqYnhLTG9qcW8zXy1GT1ZqLU9kd1JxbFIwY1h3UjZ0TmxHRDBzbVYwcE9yd0Noc21pelJIZlI4d244cnRtNE9JWExQRDFEVWRMcFQ0LThHRzlxRUxpTTVoUTd1X2syYTU5ZXFmQm5fNGo5T1d0SF9xcC1KSjM3STJZYnBmTkMwdTdINkdSTDFnbjhtdkRfTjFxWjZRV2E2TkZ1N0RYYjVvWnR0Q2tJLUplLUNPMGhQTnFKYmlYRkNKc0ZsUWw1SFlydElzTU1wbVVONVl6dFNOWl9XcjA0dnBvYzl3amFQSTNJVDB2WF96NXN5dUI0UW5FU3pyOGRGOS1tdl81MlVkU2NfYkhabjR5UDh6NkpnVzhRRlZQclNQeDItajBkU1Q2QS1VUENXaWpZeFI0eHlBVTlHX3F1Z2VyWlVhdE1xZEV1Vl8tSWYzWjVRZU5KQzU1TDhwVWEyTFA0SjFRUGV5WXczNTlPOU94LWFuSHRrX1FlSTNSNFJXYnNFZFo0X2JXVkl2aXI3aWVSZms1S1F5OUF2cG8xNThGczF5aFNGZjBJc1JZRzllN3o5U0JFTkVEd1NCd2lISUJBQkdBQVNCUWlvSUJnQUVnVUlpQ0FZQUJJRkNJa2dHQUFTQndpRUlCQWtHQUVTQndpRklCQWVHQUVZQUEiESILRm8tay1Rb3N5OEEwAHgBKDxCEGNvbW1lbnRzLXNlY3Rpb24%3D"}',
  method: 'POST',
  mode: 'cors'
});

const data = await response.json();

await fs.writeFile('testcomment.json', JSON.stringify(data, null, 2));
