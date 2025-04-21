(()=>{var e={};e.id=492,e.ids=[492],e.modules={1400:(e,t,n)=>{Promise.resolve().then(n.t.bind(n,47429,23))},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11128:(e,t,n)=>{Promise.resolve().then(n.t.bind(n,79167,23))},18485:(e,t,n)=>{"use strict";n.r(t),n.d(t,{GlobalError:()=>a.a,__next_app__:()=>p,pages:()=>d,routeModule:()=>u,tree:()=>c});var r=n(65239),o=n(48088),i=n(88170),a=n.n(i),s=n(30893),l={};for(let e in s)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>s[e]);n.d(t,l);let c={children:["",{children:["/_not-found",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(n.t.bind(n,57398,23)),"next/dist/client/components/not-found-error"]}]},{}]},{layout:[()=>Promise.resolve().then(n.bind(n,94431)),"/Users/alexalaniz/Downloads/bitape-ui/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(n.t.bind(n,57398,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(n.t.bind(n,89999,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(n.t.bind(n,65284,23)),"next/dist/client/components/unauthorized-error"]}]}.children,d=[],p={require:n,loadChunk:()=>Promise.resolve()},u=new r.AppPageRouteModule({definition:{kind:o.RouteKind.APP_PAGE,page:"/_not-found/page",pathname:"/_not-found",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},19121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{"use strict";e.exports=require("path")},35692:()=>{},62780:(e,t,n)=>{Promise.resolve().then(n.t.bind(n,16444,23)),Promise.resolve().then(n.t.bind(n,16042,23)),Promise.resolve().then(n.t.bind(n,88170,23)),Promise.resolve().then(n.t.bind(n,49477,23)),Promise.resolve().then(n.t.bind(n,29345,23)),Promise.resolve().then(n.t.bind(n,12089,23)),Promise.resolve().then(n.t.bind(n,46577,23)),Promise.resolve().then(n.t.bind(n,31307,23))},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},72508:(e,t,n)=>{Promise.resolve().then(n.t.bind(n,86346,23)),Promise.resolve().then(n.t.bind(n,27924,23)),Promise.resolve().then(n.t.bind(n,35656,23)),Promise.resolve().then(n.t.bind(n,40099,23)),Promise.resolve().then(n.t.bind(n,38243,23)),Promise.resolve().then(n.t.bind(n,28827,23)),Promise.resolve().then(n.t.bind(n,62763,23)),Promise.resolve().then(n.t.bind(n,97173,23))},94431:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>c,metadata:()=>l,viewport:()=>s});var r=n(37413),o=n(7339),i=n.n(o);n(35692);var a=n(36162);let s={width:"device-width",initialScale:1,maximumScale:5,minimumScale:1,userScalable:!0},l={title:"BitApe - A Peer-to-Peer Electronic Ape Cash System",description:"Mine BitApe tokens with your virtual mining facility on ApeChain",manifest:"/manifest.json",themeColor:"#000000",appleWebApp:{capable:!0,statusBarStyle:"black-translucent",title:"BitApe"},icons:{icon:"/bitape.png",apple:"/bitape.png"},openGraph:{title:"BitApe - A Peer-to-Peer Electronic Ape Cash System",description:"Mine BitApe tokens with your virtual mining facility on ApeChain",images:[{url:"/bitape.png",width:800,height:600,alt:"BitApe Logo"}],type:"website"},twitter:{card:"summary_large_image",title:"BitApe - A Peer-to-Peer Electronic Ape Cash System",description:"Mine BitApe tokens with your virtual mining facility on ApeChain",images:["/bitape.png"]}};function c({children:e}){return(0,r.jsxs)("html",{lang:"en-US",suppressHydrationWarning:!0,children:[(0,r.jsx)("head",{children:(0,r.jsx)(a.default,{id:"wallet-connect-fix",strategy:"beforeInteractive",children:`
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                // Try to clean up potentially corrupted WalletConnect data
                try {
                  // More comprehensive wallet data cleanup
                  const walletKeys = [
                    'walletconnect', 'WALLETCONNECT_DEEPLINK_CHOICE',
                    'wc@2:client:0.3', 'wc@2:core:0.3:injected', 'wc@2:core:0.3:2',
                    'wagmi.wallet', 'wagmi.connectors', 'wagmi.connected'
                  ];
                  
                  walletKeys.forEach(key => {
                    try {
                      const value = window.localStorage.getItem(key);
                      if (value) {
                        try {
                          // Try to parse JSON data
                          if (value.startsWith('{') || value.startsWith('[')) {
                            JSON.parse(value);
                          }
                        } catch (e) {
                          console.warn('Found corrupted wallet data: ' + key + ', removing it');
                          window.localStorage.removeItem(key);
                        }
                      }
                    } catch (e) {
                      // If any error occurs while checking, remove the key
                      console.warn('Error checking ' + key + ', removing it');
                      window.localStorage.removeItem(key);
                    }
                  });

                  // Add a connection recovery mechanism
                  window.addEventListener('error', function(event) {
                    // Check if error is related to wallet connection
                    if (event.message && (
                      event.message.includes('walletconnect') || 
                      event.message.includes('Wallet') ||
                      event.message.includes('connect')
                    )) {
                      console.warn('Detected wallet connection error, attempting recovery');
                      // Add a button to attempt recovery
                      if (!document.getElementById('wallet-recovery-btn')) {
                        setTimeout(() => {
                          try {
                            const btn = document.createElement('button');
                            btn.id = 'wallet-recovery-btn';
                            btn.innerText = 'Reconnect Wallet';
                            btn.style.position = 'fixed';
                            btn.style.bottom = '10px';
                            btn.style.right = '10px';
                            btn.style.zIndex = '9999';
                            btn.style.padding = '8px 16px';
                            btn.style.background = '#FFD700';
                            btn.style.color = '#000';
                            btn.style.border = 'none';
                            btn.style.borderRadius = '4px';
                            btn.style.cursor = 'pointer';
                            btn.onclick = function() {
                              // Clear wallet data and reload
                              walletKeys.forEach(k => window.localStorage.removeItem(k));
                              window.location.reload();
                            };
                            document.body.appendChild(btn);
                          } catch (e) {
                            console.error('Failed to add recovery button', e);
                          }
                        }, 2000);
                      }
                    }
                  });
                } catch (e) {
                  console.warn('Error in wallet connection cleanup:', e);
                }
              }
            } catch (e) {
              console.error('Error in cleanup script:', e);
            }
          `})}),(0,r.jsx)("body",{className:`${i().className} bg-royal text-white overflow-x-hidden`,children:e})]})}}};var t=require("../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),r=t.X(0,[158],()=>n(18485));module.exports=r})();