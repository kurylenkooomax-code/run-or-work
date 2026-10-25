/* Біжи або працюй — wardrobe.js
   Гардероб: іконки речей, список одягу з цінами (ITEMS), категорії за статтю (CATS), 3D-модель котика і кішки (buildCat), банти.
   Порядок завантаження: core.js, texts.js, wardrobe.js, world.js, game.js (див. index.html). */
"use strict";
const STYLE_IC={
style_classic:'<svg viewBox="0 0 24 24"><path d="M5 6l4-2 3 3 3-3 4 2 1 15H4z" fill="#24345e"/><path d="M9 4l3 3 3-3v16H9z" fill="#fff"/><path d="M12 8l-1.4 2 1.4 8 1.4-8z" fill="#e53935"/></svg>',
style_sweater:'<svg viewBox="0 0 24 24"><path d="M4 7l4-3h8l4 3 1 13H3z" fill="#7d2338"/><path d="M9 4l3 5 3-5z" fill="#fff"/><path d="M3 18h18v2H3z" fill="#5a1828"/></svg>',
style_hoodie:'<svg viewBox="0 0 24 24"><path d="M7 7a5 5 0 0 1 10 0l3 2 1 12H3l1-12z" fill="#7d8fb3"/><path d="M9 7a3 3 0 0 1 6 0v2H9z" fill="#56658a"/><path d="M10.5 10v4M13.5 10v4" stroke="#fff" stroke-width="1.2"/><rect x="8" y="15" width="8" height="4" rx="1" fill="#56658a"/></svg>',
style_sport:'<svg viewBox="0 0 24 24"><path d="M4 7l4-3h8l4 3 1 13H3z" fill="#2f6fed"/><path d="M11.5 4h1v16h-1z" fill="#fff"/><path d="M4.5 9l-1 10M19.5 9l1 10" stroke="#fff" stroke-width="1.6"/></svg>',
style_tux:'<svg viewBox="0 0 24 24"><path d="M5 6l4-2 3 3 3-3 4 2 1 15H4z" fill="#1d1f26"/><path d="M9 4l3 3 3-3v16H9z" fill="#fff"/><path d="M9 7l3 1.5L9 10zM15 7l-3 1.5 3 1.5z" fill="#e53935"/></svg>',
style_hero:'<svg viewBox="0 0 24 24"><path d="M6 5h12l3 16H3z" fill="#e53935"/><path d="M8 5h8v11H8z" fill="#2f6fed"/><path d="M12 7.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z" fill="#ffc531"/></svg>',
fstyle_dress:'<svg viewBox="0 0 24 24"><path d="M9 3h6l-1 6 6 12H4l6-12z" fill="#ff7fae"/><path d="M10 9h4" stroke="#fff" stroke-width="1.5"/></svg>',
fstyle_blouse:'<svg viewBox="0 0 24 24"><path d="M7 3h10l2 9H5z" fill="#f4f6fb" stroke="#c4cdda"/><path d="M6 12h12l2 9H4z" fill="#7b4bd6"/><circle cx="12" cy="5" r="1.2" fill="#ff5fa2"/></svg>',
fstyle_overalls:'<svg viewBox="0 0 24 24"><path d="M6 4h12v6H6z" fill="#f4f6fb" stroke="#c4cdda"/><path d="M8 4h2v6H8zM14 4h2v6h-2z" fill="#3d7bff"/><path d="M7 10h10v11h-4v-6h-2v6H7z" fill="#3d7bff"/></svg>',
fstyle_sport:'<svg viewBox="0 0 24 24"><path d="M4 7l4-3h8l4 3 1 13H3z" fill="#ff7fae"/><path d="M11.5 4h1v16h-1z" fill="#fff"/><path d="M4.5 9l-1 10M19.5 9l1 10" stroke="#fff" stroke-width="1.6"/></svg>',
fstyle_gown:'<svg viewBox="0 0 24 24"><path d="M10 2h4l1 7 7 13H2l7-13z" fill="#b18cff"/><path d="M9 9h6" stroke="#ff5fa2" stroke-width="1.6"/><circle cx="8" cy="17" r=".8" fill="#fff"/><circle cx="14" cy="15" r=".8" fill="#fff"/><circle cx="16" cy="19" r=".8" fill="#fff"/></svg>',
fstyle_hero:'<svg viewBox="0 0 24 24"><path d="M6 5h12l3 16H3z" fill="#7b4bd6"/><path d="M8 5h8v7l2 4H6l2-4z" fill="#ff5fa2"/><path d="M12 7l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="#ffc531"/></svg>'};
Object.assign(STYLE_IC,{
style_pajama:'<svg viewBox="0 0 24 24"><path d="M5 5l4-2h6l4 2 1 16H4z" fill="#8fc1ff"/><path d="M8 4v17M16 4v17" stroke="#fff" stroke-width="1.3"/><circle cx="12" cy="9" r="1" fill="#2f4f8f"/><circle cx="12" cy="13" r="1" fill="#2f4f8f"/><circle cx="12" cy="17" r="1" fill="#2f4f8f"/></svg>',
style_hawaii:'<svg viewBox="0 0 24 24"><path d="M4 7l4-3h8l4 3 1 13H3z" fill="#ff8a3d"/><path d="M9 4l3 4 3-4" fill="#ffe2c7"/><circle cx="7.5" cy="12" r="1.8" fill="#fff"/><circle cx="15.5" cy="15" r="1.8" fill="#fff"/><circle cx="11" cy="18" r="1.5" fill="#ff4b8a"/><circle cx="17" cy="10" r="1.4" fill="#ff4b8a"/></svg>',
style_chef:'<svg viewBox="0 0 24 24"><path d="M7 4a3 3 0 0 1 5-1 3 3 0 0 1 5 1 3 3 0 0 1-1 5H8a3 3 0 0 1-1-5z" fill="#fff" stroke="#c4cdda"/><path d="M6 10h12l1 11H5z" fill="#fff" stroke="#c4cdda"/><g fill="#1c2445"><circle cx="10" cy="14" r=".9"/><circle cx="14" cy="14" r=".9"/><circle cx="10" cy="18" r=".9"/><circle cx="14" cy="18" r=".9"/></g><path d="M9 10l3 2 3-2" fill="#e53935"/></svg>',
style_coat:'<svg viewBox="0 0 24 24"><path d="M6 4h12l2 18H4z" fill="#8a5a3c"/><path d="M9 4l3 5 3-5" fill="#e53935"/><path d="M12 9v13" stroke="#5e3b26" stroke-width="1.2"/><rect x="5" y="13" width="14" height="2" fill="#5e3b26"/></svg>',
style_robe:'<svg viewBox="0 0 24 24"><path d="M5 5h14l3 17H2z" fill="#c62f3a"/><path d="M4 5h16v3H4z" fill="#fff"/><path d="M11 8h2v14h-2z" fill="#fff"/><circle cx="7" cy="6.5" r=".6"/><circle cx="17" cy="6.5" r=".6"/><circle cx="12" cy="12" r="1.8" fill="#ffc531"/></svg>',
style_astro:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6" fill="#cfefff" stroke="#9aa3bd" stroke-width="1.6"/><path d="M5 15h14l1 7H4z" fill="#f4f6fb" stroke="#9aa3bd"/><rect x="9" y="16.5" width="6" height="3.5" rx="1" fill="#2f6fed"/><circle cx="10.5" cy="18" r=".6" fill="#ff4b3e"/><circle cx="13.5" cy="18" r=".6" fill="#ffc531"/></svg>',
fstyle_pajama:'<svg viewBox="0 0 24 24"><path d="M5 5l4-2h6l4 2 1 16H4z" fill="#ffb3d1"/><path d="M8 4v17M16 4v17" stroke="#fff" stroke-width="1.3"/><circle cx="12" cy="9" r="1" fill="#c2306e"/><circle cx="12" cy="13" r="1" fill="#c2306e"/><circle cx="12" cy="17" r="1" fill="#c2306e"/></svg>',
fstyle_business:'<svg viewBox="0 0 24 24"><path d="M6 3h12l1 9H5z" fill="#5b3a9e"/><path d="M10 3l2 4 2-4z" fill="#fff"/><path d="M7 12h10l1 9H6z" fill="#3e2770"/><circle cx="12" cy="9.5" r=".8" fill="#ffc531"/></svg>',
fstyle_sundress:'<svg viewBox="0 0 24 24"><path d="M9 3v5l-5 13h16L15 8V3" fill="#ffd166"/><circle cx="9" cy="15" r="1.5" fill="#fff"/><circle cx="14.5" cy="17.5" r="1.5" fill="#ff7fae"/><circle cx="13" cy="11.5" r="1.2" fill="#fff"/></svg>',
fstyle_coat:'<svg viewBox="0 0 24 24"><path d="M7 3h10l3 18H4z" fill="#e57a77"/><path d="M10 3l2 4 2-4" fill="#fff"/><rect x="5.5" y="11" width="13" height="2" fill="#a8423f"/><circle cx="12" cy="16" r=".8" fill="#1c2445"/><circle cx="12" cy="19" r=".8" fill="#1c2445"/></svg>',
fstyle_kimono:'<svg viewBox="0 0 24 24"><path d="M2 6l6-3h8l6 3-3 5-2-1v12H7V10l-2 1z" fill="#e53945"/><path d="M9 3l3 6 3-6" fill="#fff"/><rect x="7" y="11" width="10" height="3" fill="#ffc531"/><circle cx="10" cy="18" r="1" fill="#fff"/><circle cx="14" cy="16.5" r="1" fill="#fff"/></svg>',
fstyle_princess:'<svg viewBox="0 0 24 24"><path d="M9 3h6l1 6 6 13H2l6-13z" fill="#ffb3d1"/><path d="M5 17.5l7-2 7 2" fill="none" stroke="#ffc531" stroke-width="1.4"/><path d="M7.5 4.5l1.5 3M16.5 4.5l-1.5 3" stroke="#ffd6e7" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="10" r="1.3" fill="#ffc531"/></svg>',
fstyle_astro:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6" fill="#cfefff" stroke="#9aa3bd" stroke-width="1.6"/><path d="M5 15h14l1 7H4z" fill="#f4f6fb" stroke="#9aa3bd"/><rect x="9" y="16.5" width="6" height="3.5" rx="1" fill="#ff5fa2"/><circle cx="10.5" cy="18" r=".6" fill="#fff"/><circle cx="13.5" cy="18" r=".6" fill="#ffc531"/></svg>'});
const SEX_IC={
m:'<svg viewBox="0 0 24 24" fill="none" stroke="#2f6fed" stroke-width="2.4" stroke-linecap="round"><circle cx="10" cy="14" r="5.5"/><path d="M14 10l6-6M15 4h5v5"/></svg>',
f:'<svg viewBox="0 0 24 24" fill="none" stroke="#e8458b" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V22M8.5 18.5h7"/></svg>'};
const ACC_IC={
none:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="#9aa3bd" stroke-width="2"/><path d="M6.5 17.5l11-11" stroke="#9aa3bd" stroke-width="2"/></svg>',
glasses:'<svg viewBox="0 0 24 24"><circle cx="7" cy="13" r="4" fill="none" stroke="#1c2445" stroke-width="2"/><circle cx="17" cy="13" r="4" fill="none" stroke="#1c2445" stroke-width="2"/><path d="M11 13h2" stroke="#1c2445" stroke-width="2"/></svg>',
tophat:'<svg viewBox="0 0 24 24"><rect x="7" y="4" width="10" height="12" rx="1" fill="#1c2445"/><rect x="7" y="12" width="10" height="2.5" fill="#e53935"/><rect x="3" y="16" width="18" height="3" rx="1.5" fill="#1c2445"/></svg>',
headphones:'<svg viewBox="0 0 24 24"><path d="M4 15v-3a8 8 0 0 1 16 0v3" fill="none" stroke="#1c2445" stroke-width="2.2"/><rect x="3" y="14" width="5" height="7" rx="2" fill="#ff4b3e"/><rect x="16" y="14" width="5" height="7" rx="2" fill="#ff4b3e"/></svg>',
crown:'<svg viewBox="0 0 24 24"><path d="M3 18l1.5-10 5 5L12 6l2.5 7 5-5L21 18z" fill="#ffc531" stroke="#c98600" stroke-width="1.5" stroke-linejoin="round"/></svg>',
sunglasses:'<svg viewBox="0 0 24 24"><rect x="2.5" y="9" width="8" height="6" rx="2.5" fill="#1c2445"/><rect x="13.5" y="9" width="8" height="6" rx="2.5" fill="#1c2445"/><path d="M10.5 11h3" stroke="#1c2445" stroke-width="2"/><path d="M4.5 10.5l2 1" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>',
cap:'<svg viewBox="0 0 24 24"><path d="M4 15a8 7 0 0 1 16 0z" fill="#2f6fed"/><path d="M4 15h17a2 2 0 0 1-2 2H4z" fill="#1d4fb8"/><circle cx="12" cy="7.5" r="1.3" fill="#1d4fb8"/></svg>',
beanie:'<svg viewBox="0 0 24 24"><path d="M5 16a7 8 0 0 1 14 0z" fill="#ff4b3e"/><rect x="4" y="15" width="16" height="4" rx="1.5" fill="#d4231a"/><circle cx="12" cy="6" r="2.5" fill="#fff" stroke="#d4231a"/></svg>',
scarf:'<svg viewBox="0 0 24 24"><path d="M4 8c3 3 13 3 16 0v4c-3 3-13 3-16 0z" fill="#e53935"/><path d="M13 12h4l-1 9h-4z" fill="#e53935"/><path d="M6 9.5v3M10 10.5v3M14 10.5v3M18 9.5v3" stroke="#fff" stroke-width="1.2"/></svg>',
monocle:'<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="5.5" fill="#dff3ff" stroke="#c98600" stroke-width="2"/><path d="M14 14c2 3 3 5 3 8" fill="none" stroke="#c98600" stroke-width="1.4"/></svg>',
flower:'<svg viewBox="0 0 24 24"><g fill="#ff7fae"><circle cx="12" cy="6.5" r="3.5"/><circle cx="17.2" cy="10.3" r="3.5"/><circle cx="15.2" cy="16.4" r="3.5"/><circle cx="8.8" cy="16.4" r="3.5"/><circle cx="6.8" cy="10.3" r="3.5"/></g><circle cx="12" cy="12" r="3" fill="#ffc531"/></svg>',
pearls:'<svg viewBox="0 0 24 24"><g fill="#fff" stroke="#b9c0d8"><circle cx="4" cy="8" r="2"/><circle cx="5.5" cy="12.5" r="2"/><circle cx="8.5" cy="16" r="2"/><circle cx="12" cy="17.5" r="2"/><circle cx="15.5" cy="16" r="2"/><circle cx="18.5" cy="12.5" r="2"/><circle cx="20" cy="8" r="2"/></g></svg>',
beret:'<svg viewBox="0 0 24 24"><ellipse cx="12" cy="13" rx="9" ry="4.5" fill="#e53945" transform="rotate(-10 12 13)"/><rect x="11" y="6" width="2" height="4" rx="1" fill="#b8263a"/></svg>',
sunhat:'<svg viewBox="0 0 24 24"><ellipse cx="12" cy="16" rx="10.5" ry="3.5" fill="#f3d9a4" stroke="#c9a05a"/><path d="M7 15.5a5 6 0 0 1 10 0z" fill="#f3d9a4" stroke="#c9a05a"/><path d="M7.2 13.6h9.6v1.8H7.2z" fill="#ff7fae"/></svg>',
tiara:'<svg viewBox="0 0 24 24"><path d="M3 17c4-2 14-2 18 0" fill="none" stroke="#b9c0d8" stroke-width="2"/><path d="M6 15.5l1-5 2 4 3-7 3 7 2-4 1 5" fill="none" stroke="#b9c0d8" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="1.8" fill="#ff5fa2"/></svg>'};
ACC_IC.headphones=ACC_IC.headphones;
Object.assign(ACC_IC,{
badge:'<svg viewBox="0 0 24 24"><path d="M7 2l5 8 5-8" fill="none" stroke="#2f6fed" stroke-width="2"/><rect x="7" y="10" width="10" height="12" rx="2" fill="#fff" stroke="#9aa3bd"/><circle cx="12" cy="14" r="2" fill="#f29a3c"/><rect x="9" y="17.5" width="6" height="1.5" fill="#9aa3bd"/></svg>',
bandana:'<svg viewBox="0 0 24 24"><path d="M3 13a9 7 0 0 1 18 0z" fill="#e53935"/><g fill="#fff"><circle cx="8" cy="10" r=".9"/><circle cx="12" cy="8" r=".9"/><circle cx="16" cy="10" r=".9"/></g><path d="M19 13l3 4-4-1z" fill="#e53935"/></svg>',
backpack:'<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="17" rx="4" fill="#ff8a3d"/><path d="M9 5a3 3 0 0 1 6 0" fill="none" stroke="#c45e1a" stroke-width="2"/><rect x="8" y="13" width="8" height="6" rx="2" fill="#c45e1a"/></svg>',
fedora:'<svg viewBox="0 0 24 24"><ellipse cx="12" cy="17" rx="10" ry="3" fill="#5a4a40"/><path d="M6 16.5l1-8c2-2 8-2 10 0l1 8z" fill="#5a4a40"/><path d="M6.4 13.5h11.2v2H6.4z" fill="#1c1c24"/></svg>',
viking:'<svg viewBox="0 0 24 24"><path d="M5 16a7 7 0 0 1 14 0z" fill="#9aa3b5"/><rect x="4" y="15" width="16" height="3" rx="1" fill="#a0703d"/><path d="M5.5 13C2 11 2 6 3 4c1 3 3 5 4.5 6.5zM18.5 13c3.5-2 3.5-7 2.5-9-1 3-3 5-4.5 6.5z" fill="#f4ecd8" stroke="#c9b48a"/></svg>',
halo:'<svg viewBox="0 0 24 24"><ellipse cx="12" cy="11" rx="9" ry="4" fill="none" stroke="#ffc531" stroke-width="3"/><ellipse cx="12" cy="11" rx="9" ry="4" fill="none" stroke="#fff3b0" stroke-width="1"/></svg>',
jetpack:'<svg viewBox="0 0 24 24"><rect x="4" y="3" width="7" height="14" rx="3" fill="#9aa3b5"/><rect x="13" y="3" width="7" height="14" rx="3" fill="#9aa3b5"/><rect x="10" y="7" width="4" height="6" fill="#5a6487"/><path d="M5 17h5l-2.5 5zM14 17h5l-2.5 5z" fill="#ff8a3d"/><path d="M6.5 17h2l-1 3zM15.5 17h2l-1 3z" fill="#ffc531"/></svg>',
hairband:'<svg viewBox="0 0 24 24"><path d="M3 18a9 9 0 0 1 18 0" fill="none" stroke="#ff5fa2" stroke-width="3" stroke-linecap="round"/><g fill="#fff"><circle cx="7" cy="10.5" r="1.2"/><circle cx="12" cy="9" r="1.2"/><circle cx="17" cy="10.5" r="1.2"/></g></svg>',
earrings:'<svg viewBox="0 0 24 24"><path d="M7 3v5M17 3v5" stroke="#c98600" stroke-width="1.6"/><circle cx="7" cy="12" r="4" fill="none" stroke="#ffc531" stroke-width="2.4"/><circle cx="17" cy="12" r="4" fill="none" stroke="#ffc531" stroke-width="2.4"/><circle cx="7" cy="17" r="1.6" fill="#ff5fa2"/><circle cx="17" cy="17" r="1.6" fill="#ff5fa2"/></svg>',
cateye:'<svg viewBox="0 0 24 24"><path d="M2 9l8 2-1 5c-3 1-6 0-7-7zM22 9l-8 2 1 5c3 1 6 0 7-7z" fill="#ff5fa2" stroke="#b8264f" stroke-width="1.2"/><path d="M10 12h4" stroke="#b8264f" stroke-width="1.6"/></svg>',
wreath:'<svg viewBox="0 0 24 24"><ellipse cx="12" cy="13" rx="9" ry="4" fill="none" stroke="#3fae5a" stroke-width="2.5"/><circle cx="4" cy="12" r="2" fill="#ff7fae"/><circle cx="9" cy="9.5" r="2" fill="#ffd166"/><circle cx="15" cy="9.5" r="2" fill="#b18cff"/><circle cx="20" cy="12" r="2" fill="#ff7fae"/></svg>',
witch:'<svg viewBox="0 0 24 24"><ellipse cx="12" cy="19" rx="10" ry="3" fill="#3b2a5e"/><path d="M7 18l3-12 7-3-3 5 2 10z" fill="#3b2a5e"/><path d="M7.5 15.5h9v2h-9z" fill="#8a4fff"/><circle cx="12" cy="16.5" r="1" fill="#ffc531"/></svg>',
wings:'<svg viewBox="0 0 24 24"><path d="M12 12C8 3 2 3 2 9c0 3 4 4 10 3zM12 12c4-9 10-9 10-3 0 3-4 4-10 3z" fill="#c7a6ff" stroke="#7b4bd6"/><path d="M12 12c-4 2-8 4-7 8 2 2 5-2 7-8zM12 12c4 2 8 4 7 8-2 2-5-2-7-8z" fill="#ff9fd8" stroke="#c2306e"/><circle cx="6" cy="8" r="1.2" fill="#fff"/><circle cx="18" cy="8" r="1.2" fill="#fff"/></svg>'});


/* ---------------- wardrobe data ---------------- */
const ITEMS={
fur:[{id:"ginger",c:"#f29a3c",p:0},{id:"gray",c:"#9aa3ad",p:150},{id:"cream",c:"#efd9b4",p:150},{id:"peach",c:"#ffb98f",p:150},{id:"brown",c:"#8a5a3c",p:200},{id:"silver",c:"#c9ced8",p:250},{id:"black",c:"#34343e",p:300},{id:"white",c:"#f4f4f6",p:300},{id:"blue",c:"#7d8fb3",p:350},{id:"pink",c:"#ff9ecb",g:20},{id:"lilac",c:"#b79cff",g:25},{id:"mint",c:"#8fe0c2",g:25}],
style:[{id:"classic",p:0},{id:"sweater",p:300},{id:"pajama",p:350},{id:"hoodie",p:400},{id:"sport",p:400},{id:"hawaii",p:450},{id:"chef",p:500},{id:"tux",p:600},{id:"coat",p:700},{id:"robe",p:5000},{id:"hero",g:40},{id:"astro",g:60}],
fstyle:[{id:"dress",p:0},{id:"blouse",p:300},{id:"pajama",p:350},{id:"overalls",p:400},{id:"sport",p:400},{id:"business",p:450},{id:"sundress",p:450},{id:"gown",p:600},{id:"coat",p:700},{id:"kimono",p:900},{id:"princess",p:5000},{id:"hero",g:40},{id:"astro",g:60}],
suit:[{id:"navy",c:"#24345e",p:0},{id:"charcoal",c:"#474a52",p:200},{id:"beige",c:"#c9ae84",p:250},{id:"olive",c:"#5d6b3a",p:250},{id:"black",c:"#1d1f26",p:250},{id:"burgundy",c:"#7d2338",p:300},{id:"teal",c:"#1f7a7a",p:300},{id:"sky",c:"#7fb6e8",p:300},{id:"red",c:"#c62f3a",p:300},{id:"purple",c:"#5b3a9e",p:300},{id:"orange",c:"#ef8a2e",p:300},{id:"mint",c:"#5fcfa8",p:300},{id:"pink",c:"#ff8fb8",p:300},{id:"white",c:"#eef0f4",p:350},{id:"gold",c:"#e3b53c",g:30}],
tie:[{id:"red",c:"#e53935",p:0},{id:"black",c:"#1c1c24",p:60},{id:"blue",c:"#2f6fed",p:80},{id:"green",c:"#22b066",p:80},{id:"yellow",c:"#ffc531",p:80},{id:"white",c:"#f4f4f6",p:100},{id:"pink",c:"#ff6fae",p:100},{id:"orange",c:"#ff8a3d",p:100},{id:"teal",c:"#17a2a2",p:100},{id:"navy",c:"#24345e",p:100},{id:"purple",c:"#8a4fff",p:120},{id:"gold",c:"#f2c14e",g:15}],
sex:[{id:"m",p:0},{id:"f",p:0}],
shoes:[{id:"black",c:"#1d1d24",p:0},{id:"brown",c:"#6b3e22",p:100},{id:"white",c:"#f4f4f6",p:100},{id:"red",c:"#e53935",p:120},{id:"blue",c:"#2f6fed",p:120},{id:"green",c:"#22b066",p:120},{id:"yellow",c:"#ffc531",p:120},{id:"orange",c:"#ff8a3d",p:120},{id:"purple",c:"#8a4fff",p:150},{id:"gold",c:"#e3b53c",g:15}],
fshoes:[{id:"pink",c:"#ff5fa2",p:0},{id:"red",c:"#e53935",p:100},{id:"black",c:"#1d1d24",p:100},{id:"white",c:"#f4f4f6",p:100},{id:"lilac",c:"#a77bff",p:120},{id:"mint",c:"#3ccf9a",p:120},{id:"sky",c:"#7fc1ff",p:120},{id:"yellow",c:"#ffc531",p:120},{id:"coral",c:"#ff6f61",p:120},{id:"navy",c:"#2a3a6e",p:150},{id:"silver",c:"#c9ced8",p:200},{id:"gold",c:"#e3b53c",g:15}],
acc:[{id:"none",p:0},{id:"badge",p:150},{id:"glasses",p:200},{id:"sunglasses",p:250},{id:"cap",p:250},{id:"beanie",p:250},{id:"bandana",p:250},{id:"headphones",p:300},{id:"scarf",p:350},{id:"monocle",p:350},{id:"backpack",p:350},{id:"tophat",p:400},{id:"fedora",p:400},{id:"viking",p:700},{id:"crown",g:50},{id:"halo",g:40},{id:"jetpack",g:70}],
dress:[{id:"rose",c:"#ff7fae",p:0},{id:"lilac",c:"#b18cff",p:200},{id:"mint",c:"#7fdcb7",p:200},{id:"sky",c:"#7fc1ff",p:250},{id:"red",c:"#e53945",p:250},{id:"yellow",c:"#ffd166",p:300},{id:"black",c:"#24252e",p:300},{id:"orange",c:"#ff9a4d",p:250},{id:"coral",c:"#ff6f61",p:250},{id:"teal",c:"#1fa5a0",p:250},{id:"purple",c:"#7b4bd6",p:300},{id:"navy",c:"#2a3a6e",p:300},{id:"white",c:"#f6f3f6",p:350},{id:"gold",c:"#e3b53c",g:30}],
bow:[{id:"pink",c:"#ff5fa2",p:0},{id:"red",c:"#e53935",p:60},{id:"white",c:"#ffffff",p:80},{id:"lilac",c:"#a77bff",p:80},{id:"mint",c:"#3ccf9a",p:80},{id:"black",c:"#1c1c24",p:80},{id:"yellow",c:"#ffc531",p:100},{id:"blue",c:"#2f6fed",p:80},{id:"orange",c:"#ff8a3d",p:80},{id:"teal",c:"#17a2a2",p:80},{id:"coral",c:"#ff6f61",p:80},{id:"gold",c:"#f2c14e",g:15},{id:"dots",c:"#ff5fa2",k:"dots",p:150},{id:"stripes",c:"#2f6fed",k:"stripes",p:150},{id:"big",c:"#e53935",k:"big",p:200},{id:"heart",c:"#ffffff",k:"heart",p:250},{id:"pearl",c:"#24252e",k:"pearl",p:300},{id:"double",c:"#a77bff",k:"double",p:300},{id:"rainbow",c:"#ff4b3e",k:"rainbow",g:25}],
facc:[{id:"none",p:0},{id:"hairband",p:150},{id:"flower",p:200},{id:"earrings",p:200},{id:"pearls",p:250},{id:"sunglasses",p:250},{id:"cateye",p:250},{id:"headphones",p:300},{id:"beret",p:300},{id:"sunhat",p:350},{id:"backpack",p:350},{id:"wreath",p:450},{id:"witch",p:700},{id:"wings",p:8000},{id:"tiara",g:50},{id:"halo",g:40}]};
const CATS=()=>S.eq.sex==="f"?["sex","fur","fstyle","dress","bow","fshoes","facc"]:["sex","fur","style","suit","tie","shoes","acc"];
const colorOf=(cat,id)=>(ITEMS[cat].find(i=>i.id===id)||ITEMS[cat][0]).c;

/* ---------- cat model ---------- */
function shade(c,k){const n=parseInt(c.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return"#"+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1)}
/* flared skirt from waist (rt) to hem (rb), height h, centred at y */
function skirt(g,c,rt,rb,h,y){
  const k=new THREE.Mesh(CG(rt,rb,h,22),M(c));k.position.y=y;g.add(k);const hem=new THREE.Mesh(CG(rb+.012,rb+.012,.05,22),M(shade(c,-.14)));hem.position.y=y-h/2+.025;g.add(hem)}
/* bow: plain or patterned, used for the she-cat's outfit (colour only affects the bow) */
function bowSVG(it){const c=it.c,k=it.k||"",d=shade(c,-.28);
  const W=(p,f)=>`<path d="${p}" fill="${f}" stroke="${d}" stroke-width="1" stroke-linejoin="round"/>`;
  let s='<svg viewBox="0 0 24 24">';
  if(k==="rainbow")s+='<defs><linearGradient id="rbw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4b3e"/><stop offset=".35" stop-color="#ffc531"/><stop offset=".65" stop-color="#22b066"/><stop offset="1" stop-color="#2f6fed"/></linearGradient></defs>';
  if(k==="double")s+=W("M12 12L1 4v16z",shade(c,-.15))+W("M12 12l11-8v16z",shade(c,-.15));
  const f=k==="rainbow"?"url(#rbw)":c;
  s+=k==="big"?W("M12 12L1 4v16z",f)+W("M12 12l11-8v16z",f):W("M12 12L3 6v12z",f)+W("M12 12l9-6v12z",f);
  if(k==="dots")s+='<g fill="#fff"><circle cx="6" cy="10" r="1.2"/><circle cx="7" cy="14.5" r="1.2"/><circle cx="18" cy="10" r="1.2"/><circle cx="17" cy="14.5" r="1.2"/></g>';
  if(k==="stripes")s+='<path d="M6.5 8.5v7M17.5 8.5v7" stroke="#fff" stroke-width="1.6"/>';
  if(k==="heart")s+='<path d="M12 16s-4-2.5-4-5a2 2 0 0 1 4-1 2 2 0 0 1 4 1c0 2.5-4 5-4 5z" fill="#e53935"/>';
  else if(k==="pearl")s+='<circle cx="12" cy="12" r="3" fill="#fff" stroke="#b9c0d8"/>';
  else s+=`<circle cx="12" cy="12" r="2.4" fill="${k==="rainbow"?"#ffc531":c}" stroke="${d}"/>`;
  return s+"</svg>"}
function bow3(par,c,k,x,y,z,s){const b=new THREE.Group();b.position.set(x,y,z);b.scale.setScalar((s||1)*(k==="big"?1.55:1));par.add(b);
  const wing=(sd,col,sc,dz)=>{const w=mesh(GEO.cone,col,.07*sc,.12*sc,.05,sd*.07*sc,0,dz||0);w.rotation.z=sd*Math.PI/2;b.add(w)};
  const fz=x=>-.05*Math.max(0,(Math.abs(x)-.01)/.12)-.006;
  [-1,1].forEach(sd=>{
    if(k==="double")wing(sd,shade(c,-.18),1.35,.015);
    if(k==="rainbow")["#ff4b3e","#ffc531","#22b066","#2f6fed"].forEach((col,i)=>wing(sd,col,1-i*.2,-i*.008));
    else wing(sd,c,1,0);
    if(k==="dots")[[.075,.02],[.105,-.025],[.11,.03]].forEach(([dx,dy])=>b.add(mesh(GEO.sph,"#ffffff",.014,.014,.01,sd*dx,dy,fz(dx))));
    if(k==="stripes")b.add(mesh(GEO.box,"#ffffff",.012,.07,.006,sd*.085,0,fz(.085)));
  });
  if(k==="heart"){[-1,1].forEach(sd=>b.add(mesh(GEO.sph,"#e53935",.026,.026,.02,sd*.02,.012,-.03)));const h=mesh(GEO.cone,"#e53935",.04,.045,.02,0,-.018,-.03);h.rotation.z=Math.PI;b.add(h)}
  else if(k==="pearl")b.add(mesh(GEO.sph,"#fbfbff",.045,.045,.045,0,0,-.02));
  else b.add(mesh(GEO.sph,k==="rainbow"?"#ffc531":c,.035,.035,.035,0,0,-.005));
  return b}
function animExtras(u,t){
  if(u.flames)u.flames.forEach((f,i)=>{f.scale.y=f.userData.h*(.75+Math.abs(Math.sin(t*31+i*1.7))*.5)});
  if(u.wings)u.wings.forEach(w=>{w.rotation.y=-w.userData.s*(.25+Math.sin(t*7)*.3)})}
function buildCat(eq){
  const fem=eq.sex==="f",sty=fem?(eq.fstyle||"dress"):(eq.style||"classic");
  const fur=colorOf("fur",eq.fur),suit=fem?colorOf("dress",eq.dress):colorOf("suit",eq.suit);
  const bowIt=ITEMS.bow.find(i=>i.id===eq.bow)||ITEMS.bow[0];
  const tie=fem?shade(suit,-.3):colorOf("tie",eq.tie);
  const shoeC=fem?colorOf("fshoes",eq.fshoes||"pink"):colorOf("shoes",eq.shoes||"black");
  const pink="#ff9fb5",white="#ffffff",dark="#1d1d24",astroW="#eef1f6";
  const g=new THREE.Group(),u={};
  const fbow=(x,y,z,s)=>bow3(g,bowIt.c,bowIt.k,x,y,z,(s||1)*1.2);
  const acc=fem?eq.facc:eq.acc;
  /* legs */
  const bare=fem&&["dress","blouse","gown","hero","business","sundress","coat","kimono","princess"].includes(sty);
  let legCol=suit,shorts=null;
  if(bare)legCol=fur;else if(sty==="astro")legCol=astroW;
  else if(!fem){legCol={hoodie:"#3d5a8a",tux:"#1d1f26",chef:"#2a2a33",coat:"#2a3048",robe:shade(suit,-.35),hawaii:fur}[sty]||suit;if(sty==="hawaii")shorts="#c9ae84"}
  const shoe=sty==="sport"||(!fem&&sty==="hoodie")?"sneak":(sty==="hero"||sty==="astro")?"boot":sty==="pajama"?"slipper":(sty==="hawaii"||sty==="sundress"||sty==="kimono")?"sandal":fem?"round":"box";
  const lightShoe=shoeC==="#f4f4f6";
  const leg=x=>{const p=new THREE.Group();p.position.set(x,.55,0);const r=fem?.085:.11;
    p.add(mesh(GEO.cyl,legCol,r,.5,r,0,-.25,0));
    if(shorts)p.add(mesh(GEO.cyl,shorts,r+.035,.24,r+.035,0,-.1,0));
    if(sty==="sport")p.add(mesh(GEO.box,fem?white:tie,.03,.46,.03,x<0?-r:r,-.24,0));
    if(sty==="pajama")p.add(mesh(GEO.cyl,white,r+.008,.04,r+.008,0,-.42,0));
    if(shoe==="box")p.add(mesh(GEO.box,shoeC,.2,.12,.32,0,-.5,-.06));
    else if(shoe==="boot"){p.add(mesh(GEO.cyl,shoeC,r+.025,.24,r+.025,0,-.38,0));p.add(mesh(GEO.sph,shoeC,.11,.08,.16,0,-.5,-.05))}
    else if(shoe==="sneak"){p.add(mesh(GEO.sph,shoeC,.11,.08,.17,0,-.5,-.05));p.add(mesh(GEO.box,lightShoe?"#c4cdda":white,.16,.03,.2,0,-.535,-.05))}
    else if(shoe==="slipper"){p.add(mesh(GEO.sph,shoeC,.14,.09,.19,0,-.5,-.06));p.add(mesh(GEO.sph,lightShoe?"#ff9fb5":white,.06,.05,.05,0,-.46,-.21))}
    else if(shoe==="sandal"){p.add(mesh(GEO.sph,fur,r*.95,.06,.13,0,-.5,-.05));p.add(mesh(GEO.box,shoeC,.17,.03,.3,0,-.55,-.05));p.add(mesh(GEO.box,shoeC,.18,.03,.04,0,-.5,-.1))}
    else p.add(mesh(GEO.sph,shoeC,.095,.075,.15,0,-.5,-.05));
    g.add(p);return p};
  u.legL=leg(fem?-.14:-.17);u.legR=leg(fem?.14:.17);
  /* torso */
  let sleeve=suit,short=false,armX=.45,armR=.1,wide=false;
  if(!fem){
    if(sty==="coat")g.add(mesh(GEO.box,suit,.8,.76,.52,0,.92,0));
    else if(sty==="astro")g.add(mesh(GEO.box,astroW,.82,.78,.54,0,.92,0));
    else g.add(mesh(GEO.box,sty==="chef"?"#f7f8fb":suit,.74,.72,.48,0,.92,0));
    if(sty==="classic"){g.add(mesh(GEO.box,white,.24,.46,.02,0,1.02,-.245));g.add(mesh(GEO.box,tie,.09,.38,.03,0,.96,-.26));g.add(mesh(GEO.box,tie,.13,.08,.04,0,1.2,-.26))}
    else if(sty==="tux"){g.add(mesh(GEO.box,white,.3,.6,.02,0,.96,-.245));[-1,1].forEach(s=>{const l=mesh(GEO.box,"#15151c",.1,.5,.025,s*.16,1.0,-.25);l.rotation.z=s*.32;g.add(l)});
      [-1,1].forEach(s=>{const b=mesh(GEO.cone,tie,.07,.12,.05,s*.07,1.21,-.26);b.rotation.z=s*Math.PI/2;g.add(b)});g.add(mesh(GEO.sph,tie,.035,.035,.035,0,1.21,-.27));
      for(let k=0;k<3;k++)g.add(mesh(GEO.sph,"#15151c",.025,.025,.02,0,1.04-k*.13,-.258));g.add(mesh(GEO.box,tie,.1,.06,.02,-.24,1.08,-.25))}
    else if(sty==="sweater"){const v=mesh(GEO.cone,white,.13,.3,.02,0,1.12,-.245);v.rotation.z=Math.PI;g.add(v);g.add(mesh(GEO.box,tie,.07,.22,.03,0,1.08,-.258));
      g.add(mesh(GEO.box,shade(suit,-.18),.76,.1,.5,0,.6,0));for(let k=-2;k<=2;k++)g.add(mesh(GEO.box,shade(suit,-.1),.03,.5,.02,k*.13,.9,-.245))}
    else if(sty==="hoodie"){g.add(mesh(GEO.box,shade(suit,-.15),.48,.2,.02,0,.74,-.245));g.add(mesh(GEO.box,shade(suit,-.15),.76,.1,.5,0,.6,0));
      [-1,1].forEach(s=>{g.add(mesh(GEO.cyl,tie,.018,.26,.018,s*.08,1.08,-.26));g.add(mesh(GEO.sph,tie,.03,.03,.03,s*.08,.94,-.26))});
      const hood=mesh(GEO.sph,suit,.42,.3,.3,0,1.36,.18);g.add(hood);g.add(mesh(GEO.sph,shade(suit,-.2),.34,.22,.2,0,1.36,.14))}
    else if(sty==="sport"){g.add(mesh(GEO.box,white,.03,.68,.02,0,.92,-.245));g.add(mesh(GEO.box,tie,.76,.08,.5,0,1.22,0));g.add(mesh(GEO.box,shade(suit,-.15),.76,.08,.5,0,.6,0))}
    else if(sty==="hero"){const e=mesh(GEO.cyl,"#ffc531",.17,.03,.17,0,1.02,-.25);e.rotation.x=Math.PI/2;g.add(e);const e2=mesh(GEO.cyl,tie,.11,.03,.11,0,1.02,-.27);e2.rotation.x=Math.PI/2;g.add(e2);
      g.add(mesh(GEO.box,"#ffc531",.76,.09,.5,0,.66,0));g.add(mesh(GEO.box,"#e0a800",.12,.1,.02,0,.66,-.255));
      const cape=new THREE.Group();cape.position.set(0,1.25,.25);cape.rotation.x=.18;cape.add(mesh(GEO.box,tie,.78,1.02,.04,0,-.5,0));g.add(cape);u.cape=cape;g.add(mesh(GEO.box,tie,.8,.1,.12,0,1.25,.2))}
    else if(sty==="pajama"){for(let k=-2;k<=2;k++)if(k)g.add(mesh(GEO.box,white,.035,.7,.02,k*.14,.92,-.245));
      [-1,1].forEach(s=>{const c=mesh(GEO.box,tie,.05,.3,.025,s*.08,1.15,-.252);c.rotation.z=s*.6;g.add(c)});
      for(let k=0;k<3;k++)g.add(mesh(GEO.sph,tie,.03,.03,.02,0,1.0-k*.14,-.258));g.add(mesh(GEO.box,shade(suit,-.15),.16,.14,.02,-.2,1.04,-.25))}
    else if(sty==="hawaii"){const v=mesh(GEO.cone,fur,.14,.26,.02,0,1.14,-.245);v.rotation.z=Math.PI;g.add(v);
      [[-.24,1.1],[.2,1.15],[-.06,.93],[.24,.82],[-.22,.72],[.04,.66],[.16,1.0]].forEach(([x,y],i)=>{const c=i%2?white:tie;
        for(let q=0;q<4;q++){const a=q/4*Math.PI*2;g.add(mesh(GEO.sph,c,.03,.03,.012,x+Math.cos(a)*.035,y+Math.sin(a)*.035,-.248))}
        g.add(mesh(GEO.sph,"#ffc531",.02,.02,.012,x,y,-.252));g.add(mesh(GEO.sph,c,.04,.04,.012,x*.9,y,.248))});
      short=true}
    else if(sty==="chef"){for(let k=0;k<3;k++)[-1,1].forEach(s=>g.add(mesh(GEO.sph,suit,.032,.032,.02,s*.12,1.06-k*.16,-.252)));
      g.add(mesh(GEO.box,"#e3e7ee",.05,.66,.02,.03,.92,-.246));
      g.add(mesh(GEO.cyl,tie,.27,.08,.22,0,1.27,-.02));const kn=mesh(GEO.cone,tie,.1,.16,.03,0,1.17,-.25);kn.rotation.z=Math.PI;g.add(kn);
      sleeve="#f7f8fb"}
    else if(sty==="coat"){g.add(mesh(GEO.box,suit,.78,.42,.5,0,.4,0));g.add(mesh(GEO.box,shade(suit,-.28),.82,.08,.54,0,.68,0));g.add(mesh(GEO.box,"#ffc531",.1,.08,.02,0,.68,-.275));
      [-1,1].forEach(s=>{const l=mesh(GEO.box,shade(suit,-.2),.12,.4,.03,s*.17,1.08,-.265);l.rotation.z=s*-.35;g.add(l)});
      for(let k=0;k<2;k++)[-1,1].forEach(s=>{g.add(mesh(GEO.sph,"#1c1c24",.028,.028,.02,s*.1,.9-k*.14,-.27));g.add(mesh(GEO.sph,"#1c1c24",.028,.028,.02,s*.1,.5-k*.14,-.255))});
      const sc=new THREE.Mesh(TG(.3,.075,10,22),M(tie));sc.rotation.x=Math.PI/2;sc.position.y=1.31;g.add(sc);g.add(mesh(GEO.box,tie,.12,.34,.05,-.15,1.12,-.29))}
    else if(sty==="robe"){g.add(mesh(GEO.box,suit,.8,.5,.5,0,.36,0));g.add(mesh(GEO.box,white,.1,1.18,.02,0,.68,-.255));
      for(let k=0;k<5;k++)g.add(mesh(GEO.sph,"#1c1c24",.018,.03,.01,0,1.18-k*.2,-.267));
      g.add(mesh(GEO.cyl,white,.46,.14,.36,0,1.28,0));for(let k=0;k<10;k++){const a=k/10*Math.PI*2;g.add(mesh(GEO.sph,"#1c1c24",.02,.035,.02,Math.sin(a)*.46,1.28,Math.cos(a)*.36))}
      for(let k=-4;k<=4;k++)g.add(mesh(GEO.sph,"#ffc531",.028,.028,.028,k*.05,.98+Math.abs(k)*.06,-.262));
      const md=mesh(GEO.cyl,"#ffc531",.075,.025,.075,0,.93,-.27);md.rotation.x=Math.PI/2;g.add(md);
      const cape=new THREE.Group();cape.position.set(0,1.28,.24);cape.rotation.x=.12;cape.add(mesh(GEO.box,suit,.86,1.3,.05,0,-.62,0));cape.add(mesh(GEO.box,white,.88,.1,.07,0,-1.24,0));g.add(cape);u.cape=cape}
    else if(sty==="astro"){g.add(mesh(GEO.box,tie,.34,.24,.03,0,1.0,-.275));[[-.08,"#ff4b3e"],[0,"#ffc531"],[.08,"#22b066"]].forEach(([x,c])=>g.add(mesh(GEO.sph,c,.03,.03,.02,x,1.03,-.292)));
      g.add(mesh(GEO.box,"#c4cdda",.84,.09,.56,0,.62,0));g.add(mesh(GEO.box,"#c4cdda",.56,.62,.24,0,.98,.37));[-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#9aa3b5",.06,.5,.06,s*.18,1.0,.5)));
      g.add(mesh(GEO.cyl,"#c4cdda",.3,.1,.26,0,1.3,0));sleeve=astroW;armR=.12}
  }else{
    armX=.36;armR=.085;
    const top=c=>g.add(mesh(GEO.cyl,c,.27,.5,.24,0,.95,0));
    if(sty==="dress"){top(suit);skirt(g,suit,.27,.55,.55,.5);g.add(mesh(GEO.cyl,white,.22,.05,.19,0,1.2,-.02));fbow(0,1.12,-.26);short=true}
    else if(sty==="blouse"){g.add(mesh(GEO.cyl,white,.27,.52,.24,0,.95,0));skirt(g,suit,.27,.42,.45,.56);g.add(mesh(GEO.box,shade(suit,-.15),.56,.06,.5,0,.79,0));
      fbow(0,1.16,-.255,.85);for(let k=0;k<3;k++)g.add(mesh(GEO.sph,"#c4cdda",.02,.02,.02,0,1.06-k*.1,-.245));sleeve=white}
    else if(sty==="overalls"){g.add(mesh(GEO.cyl,white,.27,.5,.24,0,.95,0));g.add(mesh(GEO.cyl,suit,.28,.32,.26,0,.66,0));g.add(mesh(GEO.box,suit,.34,.3,.03,0,.92,-.24));
      [-1,1].forEach(s=>{g.add(mesh(GEO.box,suit,.06,.36,.03,s*.13,1.05,-.245));g.add(mesh(GEO.sph,"#ffc531",.035,.035,.02,s*.13,1.0,-.26));g.add(mesh(GEO.box,suit,.06,.42,.03,s*.13,1.0,.24))});
      g.add(mesh(GEO.box,shade(suit,-.15),.14,.1,.02,0,.9,-.258));fbow(0,1.18,-.25,.7);sleeve=white;short=true}
    else if(sty==="sport"){g.add(mesh(GEO.cyl,suit,.28,.56,.25,0,.92,0));g.add(mesh(GEO.box,white,.025,.52,.02,0,.92,-.245));g.add(mesh(GEO.cyl,white,.24,.06,.21,0,1.2,0));g.add(mesh(GEO.cyl,shade(suit,-.15),.29,.07,.26,0,.66,0));fbow(0,1.17,-.25,.7)}
    else if(sty==="gown"){g.add(mesh(GEO.cyl,suit,.26,.48,.23,0,.96,0));skirt(g,suit,.26,.74,.74,.39);g.add(mesh(GEO.cyl,shade(suit,-.25),.275,.08,.245,0,.73,0));
      fbow(.1,.76,-.27,.9);for(let k=0;k<14;k++){const a=k/14*Math.PI*2,h=.12+((k*37)%10)/10*.52;const rr=.74+(.26-.74)*((h-.02)/.74);g.add(mesh(GEO.sph,"#ffffff",.022,.022,.022,Math.sin(a)*(rr+.01),h,Math.cos(a)*(rr+.01)))}
      sleeve=fur;armR=.075}
    else if(sty==="hero"){top(suit);skirt(g,suit,.27,.42,.3,.6);g.add(mesh(GEO.cyl,"#ffc531",.29,.07,.26,0,.73,0));
      const e=mesh(GEO.cyl,white,.12,.02,.12,0,1.0,-.24);e.rotation.x=Math.PI/2;g.add(e);g.add(mesh(GEO.cone,"#ffc531",.07,.11,.02,0,1.0,-.255));
      const cape=new THREE.Group();cape.position.set(0,1.22,.22);cape.rotation.x=.2;cape.add(mesh(GEO.box,tie,.66,1.0,.04,0,-.5,0));g.add(cape);u.cape=cape;g.add(mesh(GEO.box,tie,.62,.1,.1,0,1.22,.18));fbow(0,1.19,-.25,.75)}
    else if(sty==="pajama"){top(suit);[-.14,-.07,.07,.14].forEach(x=>g.add(mesh(GEO.box,white,.025,.48,.01,x,.95,-.24*Math.sqrt(1-(x/.27)*(x/.27))-.006)));
      for(let k=0;k<3;k++)g.add(mesh(GEO.sph,white,.025,.025,.02,0,1.06-k*.11,-.245));g.add(mesh(GEO.cyl,shade(suit,-.15),.28,.06,.25,0,.72,0));fbow(0,1.18,-.25,.75)}
    else if(sty==="business"){top(suit);const v=mesh(GEO.cone,white,.1,.24,.02,0,1.08,-.245);v.rotation.z=Math.PI;g.add(v);
      [-1,1].forEach(s=>{const l=mesh(GEO.box,shade(suit,-.25),.07,.32,.02,s*.09,1.04,-.25);l.rotation.z=s*-.35;g.add(l)});
      for(let k=0;k<2;k++)g.add(mesh(GEO.sph,"#ffc531",.025,.025,.02,0,.88-k*.1,-.245));
      skirt(g,shade(suit,-.22),.27,.25,.4,.52);fbow(0,1.17,-.25,.75)}
    else if(sty==="sundress"){top(suit);skirt(g,suit,.27,.52,.52,.52);sleeve=fur;short=true;fbow(0,1.12,-.26,.85);
      for(let k=0;k<10;k++){const a=k/10*Math.PI*2+.3,y=.36+(k%3)*.12,rr=.27+(.52-.27)*((.78-y)/.52)+.01;
        g.add(mesh(GEO.sph,k%2?white:"#ff7fae",.035,.035,.035,Math.sin(a)*rr,y,Math.cos(a)*rr))}}
    else if(sty==="coat"){top(suit);skirt(g,suit,.28,.4,.5,.5);g.add(mesh(GEO.cyl,shade(suit,-.28),.29,.07,.26,0,.78,0));g.add(mesh(GEO.box,"#ffc531",.09,.07,.02,0,.78,-.27));
      for(let k=0;k<2;k++)[-1,1].forEach(s=>g.add(mesh(GEO.sph,"#1c1c24",.025,.025,.02,s*.08,1.02-k*.12,-.24)));fbow(0,1.19,-.25,.9)}
    else if(sty==="kimono"){top(suit);skirt(g,suit,.28,.34,.66,.42);g.add(mesh(GEO.cyl,"#ffc531",.29,.2,.26,0,.82,0));g.add(mesh(GEO.cyl,shade(suit,-.3),.295,.03,.265,0,.82,0));
      [-1,1].forEach(s=>{const c=mesh(GEO.box,white,.05,.32,.02,s*.05,1.06,-.248);c.rotation.z=s*.5;g.add(c)});
      for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.5,y=.25+(k%2)*.2;g.add(mesh(GEO.sph,white,.03,.03,.03,Math.sin(a)*.33,y,Math.cos(a)*.33))}
      fbow(0,.84,.29,1.5);wide=true}
    else if(sty==="princess"){top(suit);skirt(g,suit,.26,.82,.74,.39);skirt(g,shade(suit,.3),.27,.6,.42,.55);g.add(mesh(GEO.cyl,"#ffc531",.28,.06,.25,0,.76,0));
      for(let k=0;k<9;k++){const a=-1+k*.25;g.add(mesh(GEO.sph,"#ffc531",.022,.022,.022,Math.sin(a)*.2,1.2-Math.cos(a)*.08,-Math.cos(a)*.2))}
      fbow(0,1.06,-.255);sleeve=shade(suit,.3);short=true}
    else if(sty==="astro"){g.add(mesh(GEO.cyl,astroW,.3,.56,.27,0,.93,0));g.add(mesh(GEO.box,"#ff5fa2",.26,.2,.03,0,.98,-.28));[[-.06,white],[.06,"#ffc531"]].forEach(([x,c])=>g.add(mesh(GEO.sph,c,.025,.025,.02,x,1.0,-.298)));
      g.add(mesh(GEO.cyl,"#c4cdda",.31,.08,.28,0,.68,0));g.add(mesh(GEO.box,"#c4cdda",.46,.56,.22,0,.98,.33));[-1,1].forEach(s=>g.add(mesh(GEO.cyl,"#9aa3b5",.05,.44,.05,s*.15,1.0,.46)));
      g.add(mesh(GEO.cyl,"#c4cdda",.27,.1,.24,0,1.24,0));fbow(0,1.17,-.27,.7);sleeve=astroW;armR=.1}
  }
  const hand=sty==="astro"?"#c4cdda":fur;
  const arm=x=>{const p=new THREE.Group();p.position.set(x,1.16,0);
    if(short){p.add(mesh(GEO.sph,sleeve,armR+.05,.12,armR+.05,0,-.04,0));p.add(mesh(GEO.cyl,fur,armR*.85,.4,armR*.85,0,-.28,0))}
    else if(wide){p.add(mesh(GEO.cyl,sleeve,armR,.2,armR,0,-.1,0));const w=new THREE.Mesh(CG(armR*1.1,armR*2.3,.38,14),M(sleeve));w.position.y=-.32;p.add(w)}
    else{p.add(mesh(GEO.cyl,sleeve,armR,.48,armR,0,-.24,0));if(sty==="sport")p.add(mesh(GEO.box,fem?white:tie,.03,.44,.03,x<0?-armR:armR,-.24,0));if(sty==="pajama")p.add(mesh(GEO.cyl,white,armR+.008,.04,armR+.008,0,-.44,0))}
    p.add(mesh(GEO.sph,hand,armR+.01,armR+.01,armR+.01,0,-.5,0));g.add(p);return p};
  u.armL=arm(-armX);u.armR=arm(armX);u.armR.rotation.z=.25;
  const lap=new THREE.Group();lap.position.set(armX+.17,.85,-.02);lap.add(mesh(GEO.box,"#a7b1c2",.07,.44,.58));lap.add(mesh(GEO.box,"#dfe5ee",.02,.12,.12,.045,0,0));g.add(lap);u.laptop=lap;
  const head=new THREE.Group();head.position.set(0,1.64,0);g.add(head);u.head=head;
  head.add(mesh(GEO.sph,fur,.45,.41,.42));
  head.add(mesh(GEO.sph,white,.22,.15,.14,0,-.11,-.33));
  head.add(mesh(GEO.sph,pink,.055,.04,.04,0,-.03,-.43));
  [-1,1].forEach(s=>{head.add(mesh(GEO.sph,"#15151c",.065,.08,.04,s*.16,.06,-.37));head.add(mesh(GEO.sph,white,.02,.02,.02,s*.16+.02,.09,-.405));
    const ear=mesh(GEO.cone,fur,.15,.3,.12,s*.26,.38,0);ear.rotation.z=-s*.35;head.add(ear);
    const ein=mesh(GEO.cone,pink,.08,.18,.05,s*.255,.36,-.06);ein.rotation.z=-s*.35;head.add(ein);
    for(let k=0;k<2;k++){const w=mesh(GEO.box,"#5a4a40",.28,.012,.012,s*.3,-.1-k*.05,-.3);w.rotation.z=s*(.12-k*.18);head.add(w)}});
  const tail=new THREE.Group();tail.position.set(0,.7,.24);g.add(tail);u.tail=tail;
  for(let i=0;i<6;i++){const a=i/5;tail.add(mesh(GEO.sph,fur,.09,.09,.09,0,a*.7,.12+Math.sin(a*1.6)*.3))}
  if(fem){
    [-1,1].forEach(s=>{for(let k=0;k<3;k++){const l=mesh(GEO.box,"#15151c",.012,.06,.012,s*(.12+k*.04),.15,-.37);l.rotation.z=s*(-.5+k*.35);head.add(l)}});
    head.add(mesh(GEO.sph,"#ff7f9f",.07,.035,.02,-.24,-.06,-.36));head.add(mesh(GEO.sph,"#ff7f9f",.07,.035,.02,.24,-.06,-.36));
  }
  const HATS=["tophat","crown","cap","beanie","fedora","viking","bandana","headphones"];
  if(sty==="chef"&&!HATS.includes(acc)){head.add(mesh(GEO.cyl,"#f7f8fb",.3,.26,.3,0,.44,0));[[0,.66,0],[-.16,.62,0],[.16,.62,0],[0,.64,.14],[0,.64,-.14]].forEach(([x,y,z])=>head.add(mesh(GEO.sph,"#f7f8fb",.17,.15,.17,x,y,z)))}
  const bz=fem?.32:.38,fz=fem?-.26:-.258;
  if(acc==="glasses"){[-1,1].forEach(s=>{const r=new THREE.Mesh(TG(.1,.02,8,20),M("#15151c"));r.position.set(s*.16,.06,-.41);head.add(r)});head.add(mesh(GEO.box,"#15151c",.1,.02,.02,0,.07,-.42))}
  if(acc==="tophat"){head.add(mesh(GEO.cyl,"#1c1c24",.38,.03,.38,0,.36,0));head.add(mesh(GEO.cyl,"#1c1c24",.25,.38,.25,0,.55,0));head.add(mesh(GEO.cyl,"#e53935",.255,.07,.255,0,.42,0))}
  if(acc==="headphones"){const b=new THREE.Mesh(TG(.46,.04,8,24,Math.PI),M("#1c2445"));head.add(b);[-1,1].forEach(s=>{const c=mesh(GEO.cyl,"#ff4b3e",.14,.1,.14,s*.46,0,0);c.rotation.z=Math.PI/2;head.add(c)})}
  if(acc==="crown"){head.add(mesh(GEO.cyl,"#ffc531",.24,.14,.24,0,.43,0));for(let i=0;i<6;i++){const a=i/6*Math.PI*2;head.add(mesh(GEO.cone,"#ffc531",.06,.16,.06,Math.cos(a)*.21,.57,Math.sin(a)*.21))}head.add(mesh(GEO.sph,"#ff4b3e",.05,.05,.05,0,.44,-.24))}
  if(acc==="sunglasses"){[-1,1].forEach(s=>head.add(mesh(GEO.box,"#15151c",.17,.1,.03,s*.16,.07,-.41)));head.add(mesh(GEO.box,"#15151c",.1,.02,.02,0,.09,-.42))}
  if(acc==="cap"){head.add(mesh(GEO.sph,"#2f6fed",.44,.25,.43,0,.22,0));head.add(mesh(GEO.box,"#1d4fb8",.42,.03,.3,0,.2,-.44));head.add(mesh(GEO.sph,"#1d4fb8",.05,.05,.05,0,.47,0))}
  if(acc==="beanie"){head.add(mesh(GEO.sph,"#ff4b3e",.46,.3,.44,0,.2,0));head.add(mesh(GEO.cyl,"#d4231a",.465,.1,.445,0,.16,0));head.add(mesh(GEO.sph,"#ffffff",.11,.11,.11,0,.52,0))}
  if(acc==="scarf"){const r=new THREE.Mesh(TG(.3,.08,10,22),M("#e53935"));r.rotation.x=Math.PI/2;r.position.y=1.33;g.add(r);g.add(mesh(GEO.box,"#e53935",.13,.38,.06,.14,1.12,-.27));g.add(mesh(GEO.box,"#ffffff",.135,.04,.065,.14,.98,-.27))}
  if(acc==="monocle"){const r=new THREE.Mesh(TG(.1,.018,8,20),M("#d4a017"));r.position.set(.16,.06,-.41);head.add(r);head.add(mesh(GEO.box,"#d4a017",.01,.3,.01,.24,-.12,-.36))}
  if(acc==="flower"){const f=new THREE.Group();f.position.set(-.28,.3,-.16);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;f.add(mesh(GEO.sph,"#ff7fae",.075,.075,.04,Math.cos(a)*.08,Math.sin(a)*.08,0))}f.add(mesh(GEO.sph,"#ffc531",.05,.05,.05,0,0,-.02));head.add(f)}
  if(acc==="pearls"){for(let i=0;i<16;i++){const a=i/16*Math.PI*2;g.add(mesh(GEO.sph,"#fbfbff",.045,.045,.045,Math.cos(a)*.27,1.3+(Math.sin(a)<0?-.05*-Math.sin(a):0),Math.sin(a)*.22))}}
  if(acc==="beret"){const b=mesh(GEO.sph,"#e53945",.44,.12,.42,.04,.34,0);b.rotation.z=-.22;head.add(b);head.add(mesh(GEO.cyl,"#b8263a",.025,.08,.025,.06,.45,0))}
  if(acc==="sunhat"){head.add(mesh(GEO.cyl,"#f3d9a4",.72,.03,.72,0,.3,0));head.add(mesh(GEO.cyl,"#f3d9a4",.3,.22,.3,0,.42,0));head.add(mesh(GEO.cyl,"#ff7fae",.305,.06,.305,0,.35,0))}
  if(acc==="tiara"){for(let i=-2;i<=2;i++){const a=i*.38;head.add(mesh(GEO.cone,"#dfe5ee",.04,i===0?.18:.12,.04,Math.sin(a)*.3,.4,-Math.cos(a)*.26))}head.add(mesh(GEO.sph,"#ff5fa2",.05,.05,.05,0,.4,-.28))}
  /* new accessories */
  if(acc==="badge"){[-1,1].forEach(s=>{const l=mesh(GEO.box,"#2f6fed",.025,.36,.02,s*.09,1.12,fz);l.rotation.z=s*.28;g.add(l)});g.add(mesh(GEO.box,white,.17,.21,.02,0,.9,fz-.008));g.add(mesh(GEO.sph,"#f29a3c",.035,.035,.01,0,.93,fz-.02));g.add(mesh(GEO.box,"#9aa3bd",.1,.02,.01,0,.85,fz-.02))}
  if(acc==="bandana"){head.add(mesh(HEMI,"#e53935",.46,.33,.44,0,.13,0));[-1,1].forEach(s=>head.add(mesh(GEO.sph,"#e53935",.06,.12,.04,s*.06,.08,.43)));for(let k=0;k<7;k++){const a=k/7*Math.PI*2;head.add(mesh(GEO.sph,white,.03,.03,.03,Math.sin(a)*.38,.3,Math.cos(a)*.36))}}
  if(acc==="backpack"){const w=fem?.42:.48;g.add(mesh(GEO.box,"#ff8a3d",w,.54,.24,0,.96,bz));g.add(mesh(GEO.box,"#c45e1a",w*.72,.22,.06,0,.82,bz+.14));
    [-1,1].forEach(s=>g.add(mesh(GEO.box,"#c45e1a",.06,.5,.03,s*(fem?.13:.16),1.0,fem?-.245:-.252)));const h=new THREE.Mesh(TG(.07,.02,6,14,Math.PI),M("#c45e1a"));h.position.set(0,1.23,bz);g.add(h)}
  if(acc==="fedora"){const f=new THREE.Group();f.rotation.z=.08;f.add(mesh(GEO.cyl,"#5a4a40",.6,.03,.6,0,.33,0));f.add(mesh(GEO.cyl,"#5a4a40",.3,.26,.3,0,.47,0));f.add(mesh(GEO.cyl,"#1c1c24",.305,.07,.305,0,.39,0));f.add(mesh(GEO.box,"#4a3c34",.06,.02,.3,0,.6,0));head.add(f)}
  if(acc==="viking"){head.add(mesh(HEMI,"#9aa3b5",.46,.42,.45,0,.12,0));head.add(mesh(GEO.cyl,"#a0703d",.47,.09,.46,0,.15,0));for(let k=0;k<6;k++){const a=k/6*Math.PI*2;head.add(mesh(GEO.sph,"#ffc531",.025,.025,.025,Math.sin(a)*.47,.15,Math.cos(a)*.46))}
    [-1,1].forEach(s=>{const h=mesh(GEO.cone,"#f4ecd8",.09,.38,.09,s*.52,.42,0);h.rotation.z=-s*.75;head.add(h)})}
  if(acc==="halo"){const h=new THREE.Mesh(TG(.26,.035,8,26),MB("#ffd84a"));h.rotation.x=Math.PI/2;h.position.y=.78;head.add(h)}
  if(acc==="jetpack"){u.flames=[];[-1,1].forEach(s=>{const x=s*.16;g.add(mesh(GEO.cyl,"#9aa3b5",.13,.62,.13,x,1.0,bz));g.add(mesh(GEO.sph,"#9aa3b5",.13,.08,.13,x,1.31,bz));
      const nz=mesh(GEO.cone,"#3a3f52",.1,.12,.1,x,.64,bz);nz.rotation.x=Math.PI;g.add(nz);
      [["#ff8a3d",.09,.34],["#ffd84a",.05,.22]].forEach(([c,r,h])=>{const f=mesh(GEO.cone,MB(c),r,h,r,x,.58-h/2,bz);f.rotation.x=Math.PI;f.userData.h=h;g.add(f);u.flames.push(f)})});
    g.add(mesh(GEO.box,"#5a6487",.18,.36,.1,0,1.0,bz))}
  if(acc==="hairband"){const b=new THREE.Mesh(TG(.44,.035,8,24,Math.PI),M("#ff5fa2"));b.position.z=.02;head.add(b);for(let k=1;k<6;k++){const a=k/6*Math.PI;head.add(mesh(GEO.sph,white,.035,.035,.035,Math.cos(a)*.44,Math.sin(a)*.44,-.03))}}
  if(acc==="earrings"){[-1,1].forEach(s=>{const r=new THREE.Mesh(TG(.065,.016,6,16),M("#ffc531"));r.position.set(s*.33,-.32,-.06);r.rotation.y=Math.PI/2;head.add(r);head.add(mesh(GEO.sph,"#ff5fa2",.04,.04,.04,s*.33,-.4,-.06))})}
  if(acc==="cateye"){[-1,1].forEach(s=>{head.add(mesh(GEO.box,"#ff5fa2",.19,.11,.03,s*.16,.07,-.41));head.add(mesh(GEO.box,"#d8f2ff",.15,.07,.01,s*.16,.07,-.428));const w=mesh(GEO.cone,"#ff5fa2",.04,.1,.03,s*.27,.14,-.405);w.rotation.z=-s*.8;head.add(w)});head.add(mesh(GEO.box,"#ff5fa2",.1,.02,.02,0,.09,-.42))}
  if(acc==="wreath"){const r=new THREE.Mesh(TG(.36,.05,8,24),M("#3fae5a"));r.rotation.x=Math.PI/2;r.position.y=.3;head.add(r);const FC=["#ff7fae","#ffd166","#b18cff","#ffffff"];for(let k=0;k<8;k++){const a=k/8*Math.PI*2;head.add(mesh(GEO.sph,FC[k%4],.07,.07,.07,Math.sin(a)*.36,.33,Math.cos(a)*.36))}}
  if(acc==="witch"){head.add(mesh(GEO.cyl,"#3b2a5e",.62,.03,.62,0,.33,0));const c=mesh(GEO.cone,"#3b2a5e",.3,.72,.3,.03,.7,.04);c.rotation.set(.15,0,-.18);head.add(c);head.add(mesh(GEO.cyl,"#8a4fff",.29,.07,.29,0,.39,0));head.add(mesh(GEO.box,"#ffc531",.09,.07,.02,0,.39,-.3))}
  if(acc==="wings"){u.wings=[-1,1].map(s=>{const w=new THREE.Group();w.position.set(s*.08,1.05,.27);w.userData.s=s;
      const up=mesh(GEO.sph,"#c7a6ff",.38,.3,.025,s*.36,.18,0);up.rotation.z=s*.35;w.add(up);const lo=mesh(GEO.sph,"#ff9fd8",.26,.2,.025,s*.26,-.2,0);lo.rotation.z=-s*.5;w.add(lo);
      w.add(mesh(GEO.sph,white,.06,.06,.035,s*.45,.25,0));w.add(mesh(GEO.sph,white,.04,.04,.035,s*.3,-.22,0));g.add(w);return w})}
  if(sty==="astro"){const hl=new THREE.Mesh(GEO.sph,glassMat);hl.scale.setScalar(.64);hl.position.y=.06;head.add(hl)}
  g.userData=u;return g}
