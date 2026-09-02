/* Replace ONLY the time arrays below with the exact times from your current site.
   The schedule architecture/date overrides are kept in one place so the redesign
   does not require changing the rest of the app. */
window.BDHS_SCHEDULES={
  "8PRD-A":[["Period 1","07:30","08:20"],["Period 2","08:25","09:15"],["Period 3","09:20","10:10"],["Period 4","10:15","11:05"],["Lunch A","11:05","11:35"],["Period 5","11:40","12:30"],["Period 6","12:35","13:25"],["Period 7","13:30","14:20"],["Period 8","14:25","15:15"]],
  "8PRD-B":[],"8PRD-C":[],"ODDBLOCK-A":[],"ODDBLOCK-B":[],"ODDBLOCK-C":[],"EVENBLOCK-A":[],"EVENBLOCK-B":[],"EVENBLOCK-C":[],"8PRDWIN-A":[],"8PRDWIN-B":[],"8PRDWIN-C":[],"CM-A":[],"CM-B":[],"CM-C":[]
};
window.BDHS_SCHEDULE_NAMES={"8PRD":"8 Period Day","ODDBLOCK":"Odd Block","EVENBLOCK":"Even Block","8PRDWIN":"Winter 8 Period","CM":"CM Schedule"};
window.BDHS_DATE_OVERRIDES={"04/02":"8PRDWIN","04/03":"noschool","04/06":"noschool","04/08":"8PRD","04/09":"8PRD","05/25":"noschool","05/27":"8PRD","05/28":"8PRD","06/02":"8PRD","06/03":"8PRD"};
window.BDHS_DAY_SCHEDULES={0:"weekend",1:"8PRD",2:"8PRD",3:"ODDBLOCK",4:"EVENBLOCK",5:"8PRD",6:"weekend"};
window.BDHS_SPECIAL={weekend:{title:"Weekend",subtitle:"No regular classes are scheduled today."},noschool:{title:"No School",subtitle:"There are no regular classes today."}};
window.localDateKey=d=>`${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
window.getAutomaticBaseSchedule=d=>BDHS_DATE_OVERRIDES[localDateKey(d)]||BDHS_DAY_SCHEDULES[d.getDay()]||"weekend";
window.getScheduleKey=(b,l)=>b==="weekend"||b==="noschool"?b:`${b}-${l}`;
window.getSchedule=k=>BDHS_SCHEDULES[k]||[];
window.formatTime12=t=>{let[h,m]=t.split(":").map(Number),a=h>=12?"PM":"AM",hh=h%12||12;return `${hh}:${String(m).padStart(2,"0")} ${a}`};
window.minutesFromMidnight=t=>{let[h,m]=t.split(":").map(Number);return h*60+m};
window.getSchoolDaysLeft=t=>{let end=new Date("2026-06-03T23:59:59"),d=new Date(t.getFullYear(),t.getMonth(),t.getDate());if(d>end)return 0;let n=0;while(d<=end){let day=d.getDay();if(day!==0&&day!==6&&BDHS_DATE_OVERRIDES[localDateKey(d)]!=="noschool")n++;d.setDate(d.getDate()+1)}return Math.max(0,n-1)};
